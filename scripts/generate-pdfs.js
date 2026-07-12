/* eslint-disable @typescript-eslint/no-require-imports */
// standalone node script, run manually to (re)generate the sample pdfs. commonjs on purpose.
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/sample-pdfs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pdfs = [
  {
    filename: 'denial-letter.pdf',
    title: 'Claim Denial Notice',
    content: `Lakeshore Regional Health Plan
Date of Notice: July 14, 2026

Patient: Maya Rodriguez
Member ID: M-772910
Claim Number: CLM-2026-48822
Provider: Lakeshore Imaging Center
Service: Knee MRI
Date of Service: July 2, 2026
Denied Amount: $4,800.00
Denial Code: CO-197

Reason for Denial: No prior authorization was received for this service.

Appeal Deadline: You must submit an appeal by September 8, 2026.
Mail appeals to: PO Box 6210, Springfield, IL 62701
You may request your complete claim record by contacting member services.`,
  },
  {
    filename: 'eob.pdf',
    title: 'Explanation of Benefits',
    content: `Explanation of Benefits (this is not a bill)

Patient: Maya Rodriguez
Member ID: M-772910
Provider: Lakeshore Imaging Center
Service: MRI, Left Knee
Service Date: 07/02/2026
Claim #: CLM-2026-48822
Billed Amount: $4,800.00
Plan Paid: $0.00
Patient Responsibility: $4,800.00
Claim Status: Denied`,
  },
  {
    filename: 'physician-referral.pdf',
    title: 'Physician Referral',
    content: `Physician Referral for Imaging

Patient: Maya Rodriguez
Order: MRI, left knee
Reason: Persistent left knee pain, suspected meniscus injury
Order Date: June 18, 2026
Ordering Physician: Dr. Anthony Weiss`,
  },
  {
    filename: 'authorization.pdf',
    title: 'Prior Authorization Confirmation',
    content: `Prior Authorization Confirmation

Patient: Maya Rodriguez
Authorization Number: PA-48391
Approved Service: MRI, Left Knee
Provider: Lakeshore Imaging Center
Approval Date: June 20, 2026
Valid From: June 20, 2026
Valid Until: July 20, 2026
Status: Approved`,
  },
  {
    filename: 'medical-bill.pdf',
    title: 'Medical Bill',
    content: `Lakeshore Imaging Center
Account Number: LIC-2026-78945

Patient: Maya Rodriguez
Provider: Lakeshore Imaging Center
Service: Knee MRI
Date of Service: July 2, 2026
Total Charges: $4,800.00
Balance Due: $4,800.00`,
  },
];


async function generatePDFs() {
  for (const pdf of pdfs) {
    const doc = new PDFDocument();
    const filepath = path.join(outputDir, pdf.filename);
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);
    doc.fontSize(14).text(pdf.title, { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(pdf.content);
    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log(`✓ Generated ${pdf.filename}`);
  }
}

generatePDFs()
  .then(() => console.log('\n✓ All sample PDFs generated in public/sample-pdfs/'))
  .catch(err => console.error('Error generating PDFs:', err));
