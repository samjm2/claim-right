'use server';
import { CaseDocument, DocumentStatus, DocumentType as CaseDocType, ExtractedFact, DiscrepancyResult } from '@/lib/types';
import { detectDiscrepancies } from '@/lib/rule-engine/engine';
// @ts-expect-error no types available
import pdfParse from 'pdf-parse';

// returns docs + facts + whatever the rule engine derives from them
export async function processUploadedFiles(
  files: FormData,
  caseId: string
): Promise<{ docs: CaseDocument[]; facts: ExtractedFact[]; discrepancies: DiscrepancyResult[] }> {
  const docs: CaseDocument[] = [];
  const facts: ExtractedFact[] = [];

  for (const [, value] of files) {
    if (!(value instanceof File)) continue;

    const file = value as File;
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    let pageCount = 1;
    let status: DocumentStatus = 'verified';

    try {
      const pdfData = await pdfParse(uint8Array);
      pageCount = pdfData.numpages;
    } catch (e) {
      // corrupt or scanned pdf, mark for review instead of silently failing
      status = 'needs_review';
    }

    const documentType = guessDocumentType(file.name);

    const doc: CaseDocument = {
      id: docId,
      caseId,
      filename: file.name,
      documentType,
      status,
      pageCount,
    };

    docs.push(doc);

    // no facts to extract if we couldn't even read the doc
    if (status === 'verified') {
      facts.push(...hardcodedFactsFor(documentType, docId));
    }
  }

  const discrepancies = detectDiscrepancies(facts, docs).map((d) => ({ ...d, caseId }));

  return { docs, facts, discrepancies };
}

// hardcoded fact templates per doc type, standing in for the real AI extraction
function hardcodedFactsFor(documentType: CaseDocType, documentId: string): ExtractedFact[] {
  const templates = FACT_TEMPLATES[documentType] ?? [];
  return templates.map((t, i) => ({
    id: `fact-${documentId}-${i}`,
    documentId,
    ...t,
    userConfirmed: false,
  }));
}

type FactTemplate = Omit<ExtractedFact, 'id' | 'documentId' | 'userConfirmed'>;

const FACT_TEMPLATES: Record<CaseDocType, FactTemplate[]> = {
  denial_letter: [
    { fieldName: 'patientName', value: 'Maya Rodriguez', page: 1, evidenceText: 'Patient: Maya Rodriguez', confidence: 0.99, status: 'verified' },
    { fieldName: 'serviceDate', value: '2026-07-02', page: 1, evidenceText: 'Date of Service: July 2, 2026', confidence: 0.97, status: 'verified' },
    { fieldName: 'provider', value: 'Lakeshore Imaging Center', page: 1, evidenceText: 'Provider: Lakeshore Imaging Center', confidence: 0.98, status: 'verified' },
    { fieldName: 'deniedAmount', value: '4800', page: 1, evidenceText: 'Denied Amount: $4,800.00', confidence: 0.98, status: 'verified' },
    { fieldName: 'denialReason', value: 'No prior authorization was received', page: 1, evidenceText: 'Reason for Denial: No prior authorization was received for this service.', confidence: 0.97, status: 'verified' },
    { fieldName: 'appealDeadline', value: '2026-09-08', page: 1, evidenceText: 'You must submit an appeal by September 8, 2026.', confidence: 0.6, status: 'unclear' },
  ],
  eob: [
    { fieldName: 'service', value: 'Knee MRI', page: 1, evidenceText: 'Service: MRI, Left Knee', confidence: 0.96, status: 'verified' },
    { fieldName: 'billedAmount', value: '4800', page: 1, evidenceText: 'Billed Amount: $4,800.00', confidence: 0.98, status: 'verified' },
    { fieldName: 'claimStatus', value: 'denied', page: 1, evidenceText: 'Claim Status: Denied', confidence: 0.98, status: 'verified' },
  ],
  physician_referral: [
    { fieldName: 'orderedService', value: 'Knee MRI', page: 1, evidenceText: 'Order: MRI, left knee', confidence: 0.95, status: 'verified' },
    { fieldName: 'orderDate', value: '2026-06-18', page: 1, evidenceText: 'Order Date: June 18, 2026', confidence: 0.96, status: 'verified' },
    { fieldName: 'physicianName', value: 'Dr. Anthony Weiss', page: 1, evidenceText: 'Ordering Physician: Dr. Anthony Weiss', confidence: 0.55, status: 'unclear' },
  ],
  authorization_confirmation: [
    { fieldName: 'patientName', value: 'Maya Rodriguez', page: 1, evidenceText: 'Patient: Maya Rodriguez', confidence: 0.99, status: 'verified' },
    { fieldName: 'authorizationNumber', value: 'PA-48391', page: 1, evidenceText: 'Authorization Number: PA-48391', confidence: 0.97, status: 'verified' },
    { fieldName: 'authorizationStatus', value: 'approved', page: 1, evidenceText: 'Authorization Status: Approved', confidence: 0.97, status: 'verified' },
  ],
  medical_bill: [
    { fieldName: 'totalCharges', value: '4800', page: 1, evidenceText: 'Total Charges: $4,800.00', confidence: 0.95, status: 'verified' },
  ],
};

function guessDocumentType(filename: string): CaseDocType {
  const lower = filename.toLowerCase();
  if (lower.includes('denial')) return 'denial_letter';
  if (lower.includes('eob') || lower.includes('explanation')) return 'eob';
  if (lower.includes('referral') || lower.includes('physician')) return 'physician_referral';
  if (lower.includes('auth') || lower.includes('authorization')) return 'authorization_confirmation';
  if (lower.includes('bill') || lower.includes('invoice')) return 'medical_bill';
  // fallback — in real version, classify from content or ask user to confirm
  return 'medical_bill';
}
