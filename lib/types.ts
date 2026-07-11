//okay this is good i think i can just use this file to define all the types for the project.

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

export interface AppealDraft {
  id: string;
  caseId: string;
  content: string;
  createdAt: string;
}
