import { CaseDocument, DocumentType, ExtractedFact, FactStatus } from "@/lib/types";
import { formatDate, parseDate } from "@/lib/rule-engine/normalize";

// pulls real field values out of the text we parsed off each PDF. this is deliberately simple
// (labelled-line regexes, not an LLM) so it's deterministic and you can see exactly why every
// fact came out the way it did. a field that doesn't match just doesn't get produced.

interface FieldSpec {
  fieldName: string;
  // capture group 1 is the value; the whole match becomes the cited evidence snippet
  regex: RegExp;
  confidence: number;
  status?: FactStatus;
  clean?: (raw: string) => string;
}

const toISO = (raw: string): string => {
  const d = parseDate(raw.trim());
  return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : raw.trim();
};
const money = (raw: string): string => raw.replace(/[^0-9.]/g, "").replace(/\.00$/, "");
const trim = (raw: string): string => raw.trim();

const SPECS: Record<DocumentType, FieldSpec[]> = {
  denial_letter: [
    { fieldName: "patientName", regex: /Patient:\s*(.+)/, confidence: 0.99, clean: trim },
    { fieldName: "memberId", regex: /Member ID:\s*(\S+)/, confidence: 0.98, clean: trim },
    { fieldName: "claimNumber", regex: /Claim Number:\s*(\S+)/, confidence: 0.98, clean: trim },
    { fieldName: "provider", regex: /Provider:\s*(.+)/, confidence: 0.98, clean: trim },
    { fieldName: "serviceDate", regex: /Date of Service:\s*(.+)/, confidence: 0.97, clean: toISO },
    { fieldName: "deniedAmount", regex: /Denied Amount:\s*(\$[\d,]+\.?\d*)/, confidence: 0.98, clean: money },
    { fieldName: "denialCode", regex: /Denial Code:\s*(\S+)/, confidence: 0.95, clean: trim },
    { fieldName: "denialReason", regex: /Reason for Denial:\s*(.+)/, confidence: 0.97, clean: trim },
    { fieldName: "appealDeadline", regex: /appeal by ([A-Za-z]+ \d{1,2}, \d{4})/, confidence: 0.94, clean: toISO },
  ],
  eob: [
    { fieldName: "service", regex: /Service:\s*(.+)/, confidence: 0.96, clean: trim },
    { fieldName: "serviceDate", regex: /Service Date:\s*(.+)/, confidence: 0.97, clean: toISO },
    { fieldName: "claimNumber", regex: /Claim #:\s*(\S+)/, confidence: 0.98, clean: trim },
    { fieldName: "billedAmount", regex: /Billed Amount:\s*(\$[\d,]+\.?\d*)/, confidence: 0.98, clean: money },
    { fieldName: "claimStatus", regex: /Claim Status:\s*(\w+)/, confidence: 0.98, clean: (r) => r.trim().toLowerCase() },
  ],
  physician_referral: [
    { fieldName: "orderedService", regex: /Order:\s*(.+)/, confidence: 0.95, clean: trim },
    { fieldName: "orderDate", regex: /Order Date:\s*(.+)/, confidence: 0.96, clean: toISO },
    { fieldName: "physicianName", regex: /Ordering Physician:\s*(.+)/, confidence: 0.9, clean: trim },
    // clinical reason is free-text and genuinely harder to trust, so it comes out as needs-review
    { fieldName: "medicalReason", regex: /Reason:\s*(.+)/, confidence: 0.55, status: "unclear", clean: trim },
  ],
  authorization_confirmation: [
    { fieldName: "patientName", regex: /Patient:\s*(.+)/, confidence: 0.99, clean: trim },
    { fieldName: "authorizationNumber", regex: /Authorization Number:\s*(\S+)/, confidence: 0.98, clean: trim },
    { fieldName: "approvedService", regex: /Approved Service:\s*(.+)/, confidence: 0.96, clean: trim },
    { fieldName: "provider", regex: /Provider:\s*(.+)/, confidence: 0.98, clean: trim },
    { fieldName: "validFrom", regex: /Valid From:\s*(.+)/, confidence: 0.96, clean: toISO },
    { fieldName: "validUntil", regex: /Valid Until:\s*(.+)/, confidence: 0.96, clean: toISO },
    { fieldName: "authorizationStatus", regex: /Status:\s*(\w+)/, confidence: 0.98, clean: (r) => r.trim().toLowerCase() },
  ],
  medical_bill: [
    { fieldName: "provider", regex: /Provider:\s*(.+)/, confidence: 0.97, clean: trim },
    { fieldName: "service", regex: /Service:\s*(.+)/, confidence: 0.95, clean: trim },
    { fieldName: "totalCharges", regex: /Total Charges:\s*(\$[\d,]+\.?\d*)/, confidence: 0.95, clean: money },
  ],
};

export function extractFacts(documentType: DocumentType, documentId: string, text: string, page = 1): ExtractedFact[] {
  const facts: ExtractedFact[] = [];

  SPECS[documentType].forEach((spec, i) => {
    const match = text.match(spec.regex);
    if (!match) return; // field genuinely not found — we don't fabricate it

    facts.push({
      id: `fact-${documentId}-${i}`,
      documentId,
      fieldName: spec.fieldName,
      value: spec.clean ? spec.clean(match[1]) : match[1].trim(),
      page,
      evidenceText: match[0].trim(),
      confidence: spec.confidence,
      status: spec.status ?? "verified",
      userConfirmed: false,
    });
  });

  return facts;
}

// dates read back nicely for the UI without callers re-importing the formatter
export { formatDate };
