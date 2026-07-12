'use server';
import { GeneratedAppeal } from '@/lib/appeal/generate';
// @ts-expect-error no types available
import PDFDocument from 'pdfkit';

// renders the generated appeal into a real letter-formatted pdf. returns base64 so the
// client can turn it into a download without us needing a file route.
export async function exportAppealPdf(appeal: GeneratedAppeal, caseName: string): Promise<string> {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 72, bottom: 72, left: 72, right: 72 } });

  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.fontSize(10).fillColor('#7a8a93').text(today, { align: 'right' });
  doc.moveDown(1.5);

  doc.fontSize(11).fillColor('#0a3a4a').text(appeal.greeting);
  doc.moveDown();

  for (const para of appeal.paragraphs) {
    doc.fontSize(11).fillColor('#0a3a4a').text(para, { align: 'left', lineGap: 3 });
    doc.moveDown();
  }

  doc.moveDown(0.5);
  for (const line of appeal.signoff) {
    doc.fontSize(11).fillColor('#0a3a4a').text(line);
  }

  // attachments start on their own page so the letter reads clean
  if (appeal.attachments.length) {
    doc.addPage();
    doc.fontSize(14).fillColor('#0a3a4a').text('Enclosed documents', { underline: true });
    doc.moveDown();
    appeal.attachments.forEach((att, i) => {
      doc.fontSize(11).fillColor('#0a3a4a').text(`${i + 1}. ${att}`);
      doc.moveDown(0.3);
    });
  }

  doc.end();
  const buffer = await done;
  return buffer.toString('base64');
}
