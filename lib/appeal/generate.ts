import { CaseDocument, DiscrepancyResult, DocumentType, ExtractedFact, TimelineEvent } from "@/lib/types";
import { parseDate } from "@/lib/rule-engine/normalize";

// builds the appeal letter from the facts we actually verified. the hard rule: an unclear
// fact never makes it into the letter — we'd rather leave a blank than assert something the
// documents don't clearly support. that's what makes the draft safe to send.

// one clickable source under a paragraph, so every claim in the letter traces to a document
export interface AppealSource {
  label: string;
  documentType: DocumentType;
  fieldName: string;
}

export interface AppealParagraph {
  id: string;
  text: string;
  sources: AppealSource[];
  optional: boolean; // optional paragraphs can be toggled off without breaking the letter
}

export interface GeneratedAppeal {
  greeting: string;
  paragraphs: AppealParagraph[];
  signoff: string[];
  attachments: string[];
  omitted: string[]; // fields we left out because they were unclear — surfaced so the user knows
}

export function generateAppeal(
  facts: ExtractedFact[],
  docs: CaseDocument[],
  discrepancy: DiscrepancyResult | undefined,
  timeline: TimelineEvent[]
): GeneratedAppeal {
  const docType = new Map(docs.map((d) => [d.id, d.documentType]));
  const verified = facts.filter((f) => f.status === "verified");

  // only ever reads verified facts
  const get = (type: DocumentType, field: string): string | undefined =>
    verified.find((f) => docType.get(f.documentId) === type && f.fieldName === field)?.value;

  const patient = get("denial_letter", "patientName") ?? get("authorization_confirmation", "patientName");
  const memberId = get("denial_letter", "memberId");
  const claimNumber = get("denial_letter", "claimNumber") ?? get("eob", "claimNumber");
  const service = get("eob", "service") ?? get("physician_referral", "orderedService");
  const provider = get("denial_letter", "provider") ?? get("eob", "provider");
  const serviceDate = get("eob", "serviceDate") ?? get("denial_letter", "serviceDate");
  const amount = get("denial_letter", "deniedAmount") ?? get("eob", "billedAmount");
  const authNumber = get("authorization_confirmation", "authorizationNumber");
  const validFrom = get("authorization_confirmation", "validFrom");
  const validUntil = get("authorization_confirmation", "validUntil");

  const src = (label: string, documentType: DocumentType, fieldName: string): AppealSource => ({ label, documentType, fieldName });
  const paragraphs: AppealParagraph[] = [];

  // 1. what this letter is about
  paragraphs.push({
    id: "intro",
    optional: false,
    text:
      `I am writing to request an internal review of the denial of my claim for a ${lc(service)} ` +
      `performed on ${fmt(serviceDate)} at ${provider}. My claim number is ${claimNumber} and my member ID is ${memberId}.`,
    sources: [
      src("Service", "eob", "service"),
      src("Date of service", "eob", "serviceDate"),
      src("Provider", "denial_letter", "provider"),
    ],
  });

  // 2. the contradiction, in plain terms — lifted from what the engine actually found
  if (discrepancy) {
    paragraphs.push({
      id: "contradiction",
      optional: false,
      text: discrepancy.summary,
      sources: [
        src("Denial reason", "denial_letter", "denialReason"),
        src("Authorization status", "authorization_confirmation", "authorizationStatus"),
      ],
    });
  }

  // 3. the timeline, so the reviewer can see the sequence at a glance
  if (timeline.length) {
    const lines = timeline.map((t) => `• ${fmt(t.date)}: ${t.event}`).join("\n");
    paragraphs.push({
      id: "timeline",
      optional: true,
      text: `The sequence of events was as follows:\n${lines}`,
      sources: [src("Order date", "physician_referral", "orderDate"), src("Service date", "eob", "serviceDate")],
    });
  }

  // 4. the specific reasoning — the service fell inside the authorization window
  if (authNumber && validFrom && validUntil && serviceDate) {
    paragraphs.push({
      id: "validity",
      optional: true,
      text:
        `Authorization ${authNumber} was valid from ${fmt(validFrom)} through ${fmt(validUntil)}. ` +
        `The service was performed on ${fmt(serviceDate)}, which falls within that period.`,
      sources: [
        src("Valid from", "authorization_confirmation", "validFrom"),
        src("Valid until", "authorization_confirmation", "validUntil"),
      ],
    });
  }

  // 5. the ask
  paragraphs.push({
    id: "ask",
    optional: false,
    text:
      `I respectfully request that you reverse this denial and process the claim in accordance with my plan benefits` +
      (amount ? `, in the amount of ${money(amount)}.` : ".") +
      ` Please contact me if any additional documentation would help.`,
    sources: amount ? [src("Amount denied", "denial_letter", "deniedAmount")] : [],
  });

  // fields we wanted but couldn't verify — named so the user can fill them in before sending
  const wanted: [string, string | undefined][] = [
    ["claim number", claimNumber],
    ["member ID", memberId],
    ["service date", serviceDate],
    ["denied amount", amount],
  ];
  const omitted = wanted.filter(([, v]) => !v).map(([label]) => label);

  return {
    greeting: "Dear Appeals Department,",
    paragraphs,
    signoff: ["Sincerely,", patient ?? "[Your name]", memberId ? `Member ID: ${memberId}` : ""].filter(Boolean),
    attachments: buildAttachments(docs),
    omitted,
  };
}

// attachments listed in the order that helps the appeal: the authorization is the strongest
// evidence, so it leads. only documents actually in the case are listed.
const ATTACHMENT_ORDER: CaseDocument["documentType"][] = [
  "authorization_confirmation",
  "eob",
  "medical_bill",
  "physician_referral",
  "denial_letter",
];

const ATTACHMENT_LABELS: Record<CaseDocument["documentType"], string> = {
  authorization_confirmation: "Authorization Confirmation",
  eob: "Explanation of Benefits",
  medical_bill: "Medical Bill",
  physician_referral: "Physician Referral",
  denial_letter: "Denial Letter",
};

function buildAttachments(docs: CaseDocument[]): string[] {
  const present = new Set(docs.map((d) => d.documentType));
  return ATTACHMENT_ORDER.filter((t) => present.has(t)).map((t) => ATTACHMENT_LABELS[t]);
}

function fmt(iso: string | undefined): string {
  if (!iso) return "[date]";
  const d = parseDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function money(v: string): string {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return `$${n.toLocaleString("en-US")}`;
}

// lowercase for mid-sentence use, but leave acronyms like MRI / CT / EOB alone
function lc(s: string | undefined): string {
  if (!s) return "service";
  return s
    .split(" ")
    .map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase()))
    .join(" ");
}
