import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { PdfTextReader } from './pdf-reader.js';
import { JevTaskExecutor } from './jev-executor.js';

// Standalone, no Nest/database/environment-file loading. Real calls require explicit opt-in.
const [file, ...skills] = process.argv.slice(2);
if (!file) throw new Error('Usage: extraction:probe PDF_PATH [SKILL ...]. No skills = parse only; skills = paid Jev call requiring TYPESAFE_API_KEY and EXTRACTION_LIVE_CONSENT=synthetic.');
const bytes = await readFile(file);
const context = { applicationId: 'standalone-probe', documentId: 'standalone-probe', taskId: 'skills', sourceHash: createHash('sha256').update(bytes).digest('hex'), args: { skills, evidence: true } };
const start = performance.now();
const text = await new PdfTextReader().read(bytes, context);
console.log(JSON.stringify({ parser: 'pdfjs-dist@6.4.299', characters: text.length, textHash: createHash('sha256').update(text).digest('hex'), elapsedMs: Math.round(performance.now() - start) }));
if (skills.length) {
  if (!process.env.TYPESAFE_API_KEY || process.env.EXTRACTION_LIVE_CONSENT !== 'synthetic') throw new Error('Live call blocked: set TYPESAFE_API_KEY and EXTRACTION_LIVE_CONSENT=synthetic; use synthetic documents only.');
  console.log(JSON.stringify(await new JevTaskExecutor(process.env.TYPESAFE_API_KEY, process.env.TYPESAFE_MODEL).execute(text, context)));
}
