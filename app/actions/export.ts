'use server';
// @ts-expect-error no types available
import PDFDocument from 'pdfkit';

// renders the final letter text into a real letter-formatted pdf. takes raw text (not the
// structured appeal) so whatever the user edited on screen is exactly what downloads.
export async function exportAppealPdf(letterText: string, attachments: string[], _caseName: string): Promise<string> {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 72, bottom: 72, left: 72, right: 72 } });

  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.fontSize(10).fillColor('#7a8a93').text(today, { align: 'right' });
  doc.moveDown(1.5);

  // pdfkit respects the newlines already in the letter, so one call lays out the whole body
  doc.fontSize(11).fillColor('#0a3a4a').text(letterText, { align: 'left', lineGap: 3 });

  // attachments start on their own page so the letter reads clean
  if (attachments.length) {
    doc.addPage();
    doc.fontSize(14).fillColor('#0a3a4a').text('Enclosed documents', { underline: true });
    doc.moveDown();
    attachments.forEach((att, i) => {
      doc.fontSize(11).fillColor('#0a3a4a').text(`${i + 1}. ${att}`);
      doc.moveDown(0.3);
    });
  }

  doc.end();
  const buffer = await done;
  return buffer.toString('base64');
}
