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
    content: `United Healthcare Claims Department
July 14, 2024

RE: Claim Denial - Maya Rodriguez
Policy Number: UH-789456-01
Claim Number: CLM-2024-556789

Dear Ms. Rodriguez,

Your claim for services rendered on July 2, 2024 has been reviewed and denied.

SERVICE DETAILS:
- Provider: Lakeshore Imaging Center
- Service: Knee MRI
- Service Date: July 2, 2024
- Amount Billed: $4,800.00

DENIAL REASON:
No prior authorization was received for this service. Our records indicate no authorization PA-48391 approval in our system.

You have 60 days from this notice to file an appeal. To appeal this decision, please submit any additional documentation to our Appeals Department.

Sincerely,
United Healthcare Claims Department`,
  },
  {
    filename: 'eob.pdf',
    title: 'Explanation of Benefits',
    content: `EXPLANATION OF BENEFITS (EOB)
Member: Maya Rodriguez
Member ID: UH-789456-01
Date of Service: July 2, 2024

Service: Knee MRI
Provider: Lakeshore Imaging Center
Amount Charged: $4,800.00
Insurance Responsibility: $0.00
Patient Responsibility: $4,800.00
Status: DENIED - No Prior Authorization

Claim Number: CLM-2024-556789
Claim Received: July 10, 2024
Processed: July 14, 2024

This service was not approved and does not meet medical necessity criteria without prior authorization.`,
  },
  {
    filename: 'physician-referral.pdf',
    title: 'Physician Referral Form',
    content: `PHYSICIAN REFERRAL FOR MRI

Patient: Maya Rodriguez
Date of Request: June 18, 2024
Physician: Dr. Samuel Chen, MD

CLINICAL INDICATION:
Patient presents with chronic left knee pain following a sports injury. Physical examination reveals effusion and possible meniscal tear. MRI needed to evaluate soft tissue damage.

RECOMMENDED SERVICE:
MRI of left knee with and without contrast

AUTHORIZATION REQUESTED FOR:
Service Date: July 2, 2024
Expected Cost: $4,800

Signature: Dr. Samuel Chen, MD
License Number: IL-456789
Date: June 18, 2024`,
  },
  {
    filename: 'authorization.pdf',
    title: 'Prior Authorization Confirmation',
    content: `PRIOR AUTHORIZATION CONFIRMATION

Authorization Number: PA-48391
Date Issued: June 20, 2024
Valid From: June 20, 2024
Valid To: July 20, 2024

PATIENT: Maya Rodriguez
MEMBER ID: UH-789456-01
PROVIDER: Lakeshore Imaging Center

APPROVED SERVICE:
MRI of left knee
Frequency: One time
Cost: $4,800.00

AUTHORIZATION STATUS: APPROVED

This authorization is valid for services rendered between the dates specified above. Services outside this authorization window or from non-network providers may not be covered.

Authorized By: Claims Review Unit
Confirmation Code: UH-PA-2024-48391-MRI`,
  },
  {
    filename: 'medical-bill.pdf',
    title: 'Medical Bill',
    content: `LAKESHORE IMAGING CENTER
Invoice for Professional Services

Bill To: Maya Rodriguez
Date of Service: July 2, 2024
Invoice Date: July 8, 2024
Invoice Number: LIC-2024-78945

SERVICES PROVIDED:
MRI Knee (Left) - 2D/3D imaging with contrast
Technical Component: $2,400.00
Professional Interpretation: $1,600.00
Facility Fee: $800.00

TOTAL CHARGES: $4,800.00

Prior Authorization: PA-48391 (Submitted to Insurer)
Expected Insurance Payment: $4,000.00
Patient Responsibility: $800.00

Please contact our billing department with questions.
Lakeshore Imaging Center
Phone: (555) 234-5678`,
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
