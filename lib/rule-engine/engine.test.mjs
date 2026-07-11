// quick sanity harness — run with: npx tsx lib/rule-engine/engine.test.mjs
import { detectDiscrepancies } from "./engine.ts";
import sample from "../../data/sample-case.json" with { type: "json" };

function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) process.exitCode = 1;
}

// 1. the real sample case should surface exactly one high-severity auth conflict
const found = detectDiscrepancies(sample.facts, sample.documents);
check("detects one discrepancy on the sample case", found.length === 1);
check("it's an authorization conflict", found[0]?.type === "authorization_conflict");
check("severity is high (all identity checks hold)", found[0]?.severity === "high");
check("all five checks passed", found[0]?.checks.every((c) => c.passed));
check("summary cites the real auth number PA-48391", found[0]?.summary.includes("PA-48391"));
check("statement cites the denial letter", found[0]?.statement.documentType === "denial_letter");
check("counter-evidence cites the authorization", found[0]?.counterEvidence.documentType === "authorization_confirmation");
console.log("\nsummary:\n ", found[0]?.summary);
console.log("confidence:", found[0]?.confidence, "\n");

// 2. if the service happened AFTER the auth expired, the date check must fail and severity drop
const expired = structuredClone(sample);
for (const f of expired.facts) {
  if (f.documentId === "doc-authorization" && f.fieldName === "validUntil") f.value = "2026-06-25";
}
const expiredResult = detectDiscrepancies(expired.facts, expired.documents);
check("expired auth: date-in-validity check fails", expiredResult[0]?.checks.find((c) => c.id === "date-in-validity")?.passed === false);
check("expired auth: severity downgraded from high", expiredResult[0]?.severity !== "high");

// 3. if the authorization was for a different patient, identity breaks
const otherPatient = structuredClone(sample);
for (const f of otherPatient.facts) {
  if (f.documentId === "doc-authorization" && f.fieldName === "patientName") f.value = "James Halvorsen";
}
const otherResult = detectDiscrepancies(otherPatient.facts, otherPatient.documents);
check("different patient: patient-match check fails", otherResult[0]?.checks.find((c) => c.id === "patient-match")?.passed === false);

// 4. no approved authorization at all → rule must NOT fire (no false positive)
const noAuth = structuredClone(sample);
noAuth.facts = noAuth.facts.filter((f) => !(f.documentId === "doc-authorization" && f.fieldName === "authorizationStatus"));
check("no approved auth: engine reports nothing", detectDiscrepancies(noAuth.facts, noAuth.documents).length === 0);

// 5. denial for a real medical-necessity reason (not auth) → rule must NOT fire
const otherReason = structuredClone(sample);
for (const f of otherReason.facts) {
  if (f.documentId === "doc-denial-letter" && f.fieldName === "denialReason") {
    f.value = "Service not medically necessary";
    f.evidenceText = "Reason for Denial: The requested service was determined not medically necessary.";
  }
  if (f.documentId === "doc-denial-letter" && f.fieldName === "denialCode") f.value = "CO-50";
}
check("non-auth denial reason: engine reports nothing", detectDiscrepancies(otherReason.facts, otherReason.documents).length === 0);

// 6. service worded completely differently still matches ("Knee MRI" vs "MRI, Left Knee")
check("service matching is fuzzy, not exact", found[0]?.checks.find((c) => c.id === "service-match")?.passed === true);
