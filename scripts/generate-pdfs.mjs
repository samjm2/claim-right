import { generateSamplePDFs } from '../lib/pdf-generator.ts';

console.log('Generating sample PDFs...');
await generateSamplePDFs();
console.log('✓ Sample PDFs generated in public/sample-pdfs/');
