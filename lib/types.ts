// alright all the types here, this should cover everything for now

export type FactStatus = "verified" | "inferred" | "unclear";

export type DocumentType =
  | "denial_letter"
  | "eob"
  | "physician_referral"
  | "authorization_confirmation"
  | "medical_bill";

export type DocumentStatus =
  | "uploading"
  | "reading"
  | "extracting"
  | "verified"
  | "needs_review";

export interface CaseInfo {
  id: string;
  name: string;
  state: string;
  insuranceType: string;
  treatmentOccurred: boolean;
  urgentCare: boolean;
  createdAt: string;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  filename: string;
  documentType: DocumentType;
  status: DocumentStatus;
  pageCount: number;
}

export interface ExtractedFact {
  id: string;
  documentId: string;
  fieldName: string;
  value: string;
  page: number;
  evidenceText: string;
  confidence: number;
  status: FactStatus;
  userConfirmed: boolean;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  date: string;
  event: string;
  sourceDocumentId: string;
}
//there we go i got this!!!

export interface Discrepancy {
  id: string;
  caseId: string;
  type: string;
  severity: "low" | "medium" | "high";
  summary: string;
  requiresReview: boolean;
}

// points back at the exact fact + page a check relied on, so nothing is asserted without a citation
export interface FactRef {
  factId: string;
  documentType: DocumentType;
  page: number;
  evidenceText: string;
}

// one deterministic comparison the engine ran (patient matches, date in range, etc.)
export interface DiscrepancyCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  evidence: FactRef[];
}

// richer than Discrepancy — carries the checks and the two facts that actually conflict
export interface DiscrepancyResult {
  id: string;
  caseId: string;
  type: string;
  severity: "low" | "medium" | "high";
  summary: string;
  requiresReview: boolean;
  confidence: number;
  checks: DiscrepancyCheck[];
  statement: FactRef;
  counterEvidence: FactRef;
}

export interface AppealDraft {
  id: string;
  caseId: string;
  content: string;
  createdAt: string;
}
