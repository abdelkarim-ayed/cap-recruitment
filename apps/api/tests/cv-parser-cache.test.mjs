import { test } from 'node:test';
import { deepEqual, equal, rejects, throws, ok } from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildCvRequest } from '@recruitment/domain';
import { CvPdfReader } from '../dist/processing/cv-pdf-reader.js';
import { CV_PARSER } from '../dist/processing/cv-parser-contract.js';
import { BoundedMemoryCache, CvParserMemoryCache, CvCachedMarkdownReader, CvResponseMemoryCache, prepareCvRequest, cvParserCacheKey } from '../dist/processing/cv-memory-cache.js';
import { syntheticPdf, syntheticPdfPages } from './pdf-fixture.mjs';

const snapshot = new URL('../../../research/cv-extraction-lab/snapshot/', import.meta.url);
const parsedRoot = new URL('parser-evaluation/outputs/pdf-inspector/corpus-native-001/', snapshot);
const sha = value => createHash('sha256').update(value).digest('hex');
const diagnostics = { pdfType: 'TextBased', pageCount: 1, pagesNeedingOcr: [], hasEncodingIssues: false, pagesWithColumns: [], pagesWithTables: [], ocrReasonsByPage: [], cmapGaps: [] };
const document = bytes => ({ markdown: '# Synthetic', markdownHash: sha('# Synthetic'), sourceHash: sha(bytes), parser: CV_PARSER, diagnostics });
const prepared = () => prepareCvRequest(buildCvRequest({ questions: [{ id: 'Cert', type: 'certification', certification: 'AWS' }] }, '# Synthetic', '2026-11-12', 'preview'), 'jev-1.14.0', 60000);
const response = () => ({ model: 'jev-1.14.0', answers: { Cert: { type: 'choice', choice: 'not_mentioned', probabilities: { present: 0, not_mentioned: 1 }, confidence: 1 } }, usage: { input_tokens: 10, output_tokens: 10 } });

for (const [family, stem] of [['cobalt-cv', 'precv-001-cobalt-cv'], ['jsume', 'precv-003-jsume'], ['vercanard', 'precv-003-vercanard']]) {
  test(`native Node feasibility against recorded Python output: ${stem}`, async t => {
    const bytes = readFileSync(new URL(`template-based/outputs/${family}/${stem}.pdf`, snapshot));
    const expected = JSON.parse(readFileSync(new URL(`${stem}-summary.json`, parsedRoot), 'utf8'));
    const actual = await new CvPdfReader().read(bytes);
    equal(actual.sourceHash, expected.pdf_sha256);
    equal(actual.diagnostics.pageCount, expected.page_count);
    equal(actual.diagnostics.hasEncodingIssues, expected.has_encoding_issues);
    deepEqual(actual.diagnostics.pagesNeedingOcr, expected.pages_needing_ocr);
    deepEqual(actual.diagnostics.pagesWithColumns, expected.pages_with_columns);
    deepEqual(actual.diagnostics.pagesWithTables, expected.pages_with_tables);
    ok(actual.markdown.trim());
    t.diagnostic(JSON.stringify({ source: stem, markdownByteParity: actual.markdownHash === expected.markdown_sha256, pythonBytes: expected.markdown_bytes, nodeBytes: Buffer.byteLength(actual.markdown), encodingWarning: actual.diagnostics.hasEncodingIssues }));
  });
}

test('native parser rejects invalid, empty, oversized/page-heavy input explicitly without OCR fallback', async () => {
  const reader = new CvPdfReader();
  for (const bytes of [Buffer.from('not PDF'), Buffer.from('%PDF-broken'), syntheticPdf(''), syntheticPdfPages(Array(21).fill('Synthetic text'))]) {
    await rejects(reader.read(bytes), error => error.category === 'ordinary_terminal' && error.retryable === false);
  }
  await rejects(reader.read(Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(10 * 1024 * 1024)])), /10 MiB/);
});

test('parser subprocess is credential-free and killable on timeout/cancellation', async () => {
  const envReader = new CvPdfReader(new URL('./fixtures/cv-environment-worker.mjs', import.meta.url));
  equal((await envReader.read(syntheticPdf())).markdown, 'NODE_ENV');
  const stalled = new CvPdfReader(new URL('./fixtures/cv-stalled-worker.mjs', import.meta.url), 100);
  await rejects(stalled.read(syntheticPdf()), error => /timed out/.test(error.message) && error.retryable);
  const abort = new AbortController();
  const parsing = stalled.read(syntheticPdf(), abort.signal); abort.abort();
  await rejects(parsing, /cancelled/);
  await rejects(stalled.read(syntheticPdf(), abort.signal), /cancelled/);
});

test('memory LRU enforces entry/byte limits, avoids mutable aliases, and has no restart persistence', () => {
  const cache = new BoundedMemoryCache(2, 1000);
  const original = { text: 'one' }; cache.set('a', original); original.text = 'mutated';
  cache.set('b', { text: 'two' });
  const hit = cache.get('a'); equal(hit.text, 'one'); hit.text = 'changed';
  cache.set('c', { text: 'three' }); equal(cache.get('b'), undefined); equal(cache.get('a').text, 'one');
  equal(cache.size, 2); ok(cache.byteSize <= 1000);
  equal(cache.set('large', { text: 'x'.repeat(1000) }), false);
  equal(new BoundedMemoryCache(2, 1000).get('a'), undefined);
  throws(() => new BoundedMemoryCache(0, 1000));
  const tiny = new BoundedMemoryCache(10, 25); tiny.set('a', { v: '1234' }); tiny.set('b', { v: '5678' });
  ok(tiny.byteSize <= 25); equal(tiny.get('a'), undefined);
});

test('parser cache keys separate bytes/version/options and reuse only intact successful Markdown', async () => {
  const bytes = Buffer.from('%PDF-synthetic');
  const cache = new CvParserMemoryCache(); let reads = 0;
  const reader = new CvCachedMarkdownReader({ async read(b) { reads++; return document(b); } }, cache);
  const first = await reader.read(bytes); first.markdown = 'caller changed it';
  equal((await reader.read(bytes)).markdown, '# Synthetic'); equal(reads, 1);
  await reader.read(Buffer.from('%PDF-different')); equal(reads, 2);
  equal(cache.get(sha(bytes), { ...CV_PARSER, version: 'other' }), undefined);
  equal(cache.get(sha(bytes), { ...CV_PARSER, options: { ...CV_PARSER.options, method: 'different' } }), undefined);
  throws(() => cache.set({ ...document(bytes), markdownHash: 'wrong' }));
  throws(() => cache.set({ ...document(bytes), markdown: '' }));
  throws(() => cache.set({ ...document(bytes), diagnostics: { ...diagnostics, pagesNeedingOcr: [1] } }));
  throws(() => cvParserCacheKey('invalid', CV_PARSER));
});

test('response cache is success-only, mode-separated, exact-byte checked and capacity bounded', () => {
  const cache = new CvResponseMemoryCache(); const request = prepared();
  throws(() => cache.set('fixture', request, { ...response(), answers: {} }, 'bad'));
  equal(cache.get('fixture', request), undefined);
  equal(cache.set('fixture', request, response(), 'original-attempt'), true);
  equal(cache.get('live', request), undefined);
  const hit = cache.get('fixture', request); equal(hit.attemptId, 'original-attempt');
  hit.response.answers.Cert.confidence = 0;
  equal(cache.get('fixture', request).response.answers.Cert.confidence, 1);
  throws(() => cache.get('fixture', { ...request, body: `${request.body} ` }));
  equal(new CvResponseMemoryCache().get('fixture', request), undefined);
  equal(new CvResponseMemoryCache(1, 20).set('fixture', request, response(), 'attempt'), false);
});
