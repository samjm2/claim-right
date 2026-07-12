'use server';
// @ts-expect-error no types available
import PDFDocument from 'pdfkit';

// the full appeal packet a reviewer would expect: cover, case summary, timeline, the letter,
// and an evidence index. built from what's on screen so it matches exactly.
export interface AppealPacket {
  caseName: string;
  patient: string;
  letterText: string;
  attachments: string[];
  summary: { label: string; value: string }[];
  timeline: { date: string; event: string }[];
  discrepancy?: { summary: string; severity: string };
}

const INK = '#0a3a4a';
const MUTED = '#7a8a93';

export async function exportAppealPdf(packet: AppealPacket): Promise<string> {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 72, bottom: 72, left: 72, right: 72 } });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // --- cover page ---
  doc.moveDown(6);
  doc.fontSize(30).fillColor(INK).text('Appeal Packet', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor(MUTED).text(packet.caseName);
  doc.moveDown(3);
  doc.fontSize(11).fillColor(INK).text(`Prepared for: ${packet.patient}`);
  doc.fontSize(11).fillColor(INK).text(`Prepared on: ${today}`);
  doc.moveDown(2);
  doc.fontSize(9).fillColor(MUTED).text('Prepared with ClaimRight. For your review before sending. Not legal or medical advice. Confirm all details against your original documents.', { width: 360 });

  // --- case summary ---
  doc.addPage();
  section(doc, 'Case summary');
  packet.summary.forEach((row) => {
    const y = doc.y;
    doc.fontSize(10).fillColor(MUTED).text(row.label, 72, y, { width: 150 });
    doc.fontSize(11).fillColor(INK).text(row.value, 230, y, { width: 290 });
    doc.moveDown(0.6);
  });
  if (packet.discrepancy) {
    doc.moveDown(1);
    doc.fontSize(11).fillColor('#a33a3a').text(`Finding (${packet.discrepancy.severity} severity):`, { continued: false });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor(INK).text(packet.discrepancy.summary, { lineGap: 2 });
  }

  // --- timeline ---
  if (packet.timeline.length) {
    doc.addPage();
    section(doc, 'Timeline');
    packet.timeline.forEach((t) => {
      const y = doc.y;
      doc.fontSize(10).fillColor(MUTED).text(t.date, 72, y, { width: 120 });
      doc.fontSize(11).fillColor(INK).text(t.event, 200, y, { width: 320 });
      doc.moveDown(0.6);
    });
  }

  // --- the letter ---
  doc.addPage();
  section(doc, 'Appeal letter');
  doc.fontSize(11).fillColor(INK).text(packet.letterText, { align: 'left', lineGap: 3 });

  // --- evidence index ---
  if (packet.attachments.length) {
    doc.addPage();
    section(doc, 'Evidence index');
    packet.attachments.forEach((att, i) => {
      doc.fontSize(11).fillColor(INK).text(`${i + 1}. ${att}`);
      doc.moveDown(0.3);
    });
  }

  doc.end();
  const buffer = await done;
  return buffer.toString('base64');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- pdfkit ships no types
function section(doc: any, title: string) {
  doc.fontSize(18).fillColor(INK).text(title);
  doc.moveTo(72, doc.y + 4).lineTo(540, doc.y + 4).strokeColor('#dce7ec').stroke();
  doc.moveDown(1);
}
