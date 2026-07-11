import { CaseDocument, DiscrepancyResult, DiscrepancyCheck, ExtractedFact, FactRef } from "@/lib/types";
import { namesMatch, providersMatch, servicesMatch, parseDate, dateInRange, formatDate } from "./normalize";

// the whole product hinges on this file: given the facts we pulled off the documents,
// derive contradictions deterministically. no AI, no guessing — the same facts always
// produce the same finding, and every finding cites the facts that triggered it.

export function detectDiscrepancies(facts: ExtractedFact[], docs: CaseDocument[]): DiscrepancyResult[] {
  const lookup = new FactIndex(facts, docs);
  const results: DiscrepancyResult[] = [];

  const authConflict = authorizationConflictRule(lookup);
  if (authConflict) results.push(authConflict);

  return results;
}

// lets rules ask "give me the provider on the authorization" without caring about doc ids
class FactIndex {
  private docType = new Map<string, CaseDocument["documentType"]>();

  constructor(private facts: ExtractedFact[], docs: CaseDocument[]) {
    for (const d of docs) this.docType.set(d.id, d.documentType);
  }

  get(documentType: CaseDocument["documentType"], fieldName: string): ExtractedFact | undefined {
    return this.facts.find((f) => this.docType.get(f.documentId) === documentType && f.fieldName === fieldName);
  }

  ref(fact: ExtractedFact): FactRef {
    return {
      factId: fact.id,
      documentType: this.docType.get(fact.documentId)!,
      page: fact.page,
      evidenceText: fact.evidenceText,
    };
  }
}

// denial says "no prior authorization" while an approved authorization for the same
// patient/provider/service exists and covers the service date.
function authorizationConflictRule(idx: FactIndex): DiscrepancyResult | null {
  const denialReason = idx.get("denial_letter", "denialReason");
  const denialCode = idx.get("denial_letter", "denialCode");
  const authStatus = idx.get("authorization_confirmation", "authorizationStatus");

  // the rule only applies if the denial is actually an authorization denial
  const reasonText = `${denialReason?.value ?? ""} ${denialReason?.evidenceText ?? ""}`;
  const claimsMissingAuth =
    /\bno (prior )?authorization\b|authorization was not|missing authorization|without authorization|not authorized/i.test(reasonText) ||
    denialCode?.value.replace(/[^a-z0-9]/gi, "").toUpperCase() === "CO197";

  // ...and only fires if there's an approved authorization to contradict it
  const hasApprovedAuth = !!authStatus && authStatus.value.trim().toLowerCase() === "approved";

  if (!claimsMissingAuth || !hasApprovedAuth || !denialReason) return null;

  // now cross-check the two documents actually describe the same episode of care
  const checks: DiscrepancyCheck[] = [];

  const denialPatient = idx.get("denial_letter", "patientName");
  const authPatient = idx.get("authorization_confirmation", "patientName");
  if (denialPatient && authPatient) {
    checks.push({
      id: "patient-match",
      label: "Patient matches",
      passed: namesMatch(denialPatient.value, authPatient.value),
      detail: `${denialPatient.value} on denial vs ${authPatient.value} on authorization`,
      evidence: [idx.ref(denialPatient), idx.ref(authPatient)],
    });
  }

  const denialProvider = idx.get("denial_letter", "provider") ?? idx.get("eob", "provider");
  const authProvider = idx.get("authorization_confirmation", "provider");
  if (denialProvider && authProvider) {
    checks.push({
      id: "provider-match",
      label: "Provider matches",
      passed: providersMatch(denialProvider.value, authProvider.value),
      detail: `${denialProvider.value} vs ${authProvider.value}`,
      evidence: [idx.ref(denialProvider), idx.ref(authProvider)],
    });
  }

  // service can come off the EOB or the referral; auth has its own approved-service line
  const claimService = idx.get("eob", "service") ?? idx.get("physician_referral", "orderedService");
  const authService = idx.get("authorization_confirmation", "approvedService");
  if (claimService && authService) {
    checks.push({
      id: "service-match",
      label: "Service matches",
      passed: servicesMatch(claimService.value, authService.value),
      detail: `${claimService.value} vs ${authService.value}`,
      evidence: [idx.ref(claimService), idx.ref(authService)],
    });
  }

  // the crux: was the service performed inside the authorization's validity window?
  const serviceDate = idx.get("eob", "serviceDate") ?? idx.get("denial_letter", "serviceDate");
  const validFrom = idx.get("authorization_confirmation", "validFrom");
  const validUntil = idx.get("authorization_confirmation", "validUntil");
  if (serviceDate && validFrom && validUntil) {
    const sd = parseDate(serviceDate.value);
    const vf = parseDate(validFrom.value);
    const vu = parseDate(validUntil.value);
    const passed = !!sd && !!vf && !!vu && dateInRange(sd, vf, vu);
    checks.push({
      id: "date-in-validity",
      label: "Service date within validity period",
      passed,
      detail: `${serviceDate.value} within ${validFrom.value} – ${validUntil.value}`,
      evidence: [idx.ref(serviceDate), idx.ref(validFrom), idx.ref(validUntil)],
    });
  }

  // approval status itself is a check the reviewer should see
  checks.push({
    id: "auth-approved",
    label: "Authorization status approved",
    passed: true,
    detail: `Authorization ${authStatus!.value}`,
    evidence: [idx.ref(authStatus!)],
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const identityChecks = checks.filter((c) => ["patient-match", "provider-match", "service-match", "date-in-validity"].includes(c.id));
  const identityHolds = identityChecks.length > 0 && identityChecks.every((c) => c.passed);

  // a contradiction only matters if the two documents describe the same episode.
  // if identity checks fail, the "approved auth" is for something else — downgrade it.
  const severity: DiscrepancyResult["severity"] = identityHolds ? "high" : passedCount >= 3 ? "medium" : "low";

  // confidence blends how many checks held with how sure we were of the facts underneath them.
  // a check built on a 0.6-confidence extraction can't make us more sure than that extraction.
  const backingFacts = [denialReason, authStatus!, denialPatient, authPatient, denialProvider, authProvider, claimService, authService, serviceDate, validFrom, validUntil].filter(Boolean) as ExtractedFact[];
  const avgFactConfidence = backingFacts.reduce((sum, f) => sum + f.confidence, 0) / backingFacts.length;
  const confidence = Number(((passedCount / checks.length) * 0.6 + avgFactConfidence * 0.4).toFixed(2));

  const authNumber = idx.get("authorization_confirmation", "authorizationNumber");
  const summary =
    `The denial states "${denialReason.value}." However, authorization ${authNumber?.value ?? "on file"} ` +
    `approves the same service for ${authPatient?.value ?? "this patient"} at ${authProvider?.value ?? "this provider"}` +
    (validFrom && validUntil ? `, valid ${formatDate(validFrom.value)} through ${formatDate(validUntil.value)}` : "") +
    (serviceDate ? `, covering the service date of ${formatDate(serviceDate.value)}.` : ".");

  return {
    id: "disc-auth-conflict",
    caseId: "",
    type: "authorization_conflict",
    severity,
    summary,
    requiresReview: true,
    confidence,
    checks,
    statement: idx.ref(denialReason),
    counterEvidence: idx.ref(authStatus!),
  };
}
