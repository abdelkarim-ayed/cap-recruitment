import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { PdfTextReader } from './pdf-reader.js';

// Parse-only: this standalone tool cannot make provider calls or bypass JevGateway.
const [file, ...skills] = process.argv.slice(2);
if (!file || skills.length) throw new Error('Usage: extraction:probe PDF_PATH. Parse only; live calls require the guarded processing CLI and explicit approval.');
const bytes = await readFile(file);
const context = { applicationId: 'standalone-probe', documentId: 'standalone-probe', taskId: 'skills', sourceHash: createHash('sha256').update(bytes).digest('hex'), args: { skills, evidence: true } };
const start = performance.now();
const text = await new PdfTextReader().read(bytes, context);
console.log(JSON.stringify({ parser: 'pdfjs-dist@6.4.299', characters: text.length, textHash: createHash('sha256').update(text).digest('hex'), elapsedMs: Math.round(performance.now() - start) }));
