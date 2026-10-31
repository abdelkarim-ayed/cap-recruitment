import { performance } from 'node:perf_hooks';
import { PdfTextReader } from '../dist/processing/pdf-reader.js';
import { syntheticPdf } from './pdf-fixture.mjs';

const durations = [];
for (let i = 0; i < 5; i++) {
  const start = performance.now();
  const text = await new PdfTextReader().read(syntheticPdf(), {});
  durations.push(Math.round(performance.now() - start));
  if (text !== 'SQL and TypeScript projects') throw new Error('Synthetic parser relay mismatch.');
}
console.log(JSON.stringify({ benchmark: 'synthetic-one-page-pdf-child-start-and-text', runs: durations.length, milliseconds: durations, liveRequests: 0, note: 'Local parser latency only; not extraction quality or provider latency.' }));
