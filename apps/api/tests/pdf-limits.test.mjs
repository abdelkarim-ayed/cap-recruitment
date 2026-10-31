import { test } from 'node:test';
import { equal, rejects, throws } from 'node:assert/strict';
import { PdfTextReader } from '../dist/processing/pdf-reader.js';
import { syntheticPdf, syntheticPdfPages } from './pdf-fixture.mjs';

const context = {
  applicationId: '11111111-1111-4111-8111-111111111111',
  documentId: '22222222-2222-4222-8222-222222222222',
  taskId: 'skills', sourceHash: '', args: { skills: ['SQL'] },
};
const reader = new PdfTextReader();
const bounded = { timeout: 15000 };

test('PDF reader preserves page order and separates pages, including a blank middle page', bounded, async () => {
  const pages = ['First (SQL) \\ projects', '', 'Third TypeScript projects'];
  equal(await reader.read(syntheticPdfPages(pages), context), pages.join('\n\n'));
});

test('PDF reader decodes explicitly WinAnsi-encoded French accents', bounded, async () => {
  const text = 'Expérience : ingénieur français, compétences évaluées à Noël';
  equal(await reader.read(syntheticPdfPages([text]), context), text);
  throws(() => syntheticPdfPages(['Unsupported: \u{1f600}']), /Latin-1 only/);
});

test('PDF reader accepts 20 pages and rejects 21 pages', bounded, async () => {
  const pages = Array.from({ length: 20 }, (_, index) => `Page ${index + 1}`);
  equal(await reader.read(syntheticPdfPages(pages), context), pages.join('\n\n'));
  await rejects(reader.read(syntheticPdfPages([...pages, 'Page 21']), context), /20-page extraction limit/);
});

test('PDF reader accepts 60000 text characters and rejects 60001', bounded, async () => {
  const text = 'A'.repeat(60000);
  equal(await reader.read(syntheticPdfPages([text]), context), text);
  await rejects(reader.read(syntheticPdfPages([`${text}A`]), context), /60000-character extraction limit/);
});

test('PDF reader enforces the character limit across pages, not just per page', bounded, async () => {
  await rejects(reader.read(syntheticPdfPages(['A'.repeat(30000), 'B'.repeat(30001)]), context), /60000-character extraction limit/);
});

test('PDF reader rejects empty and whitespace-only text across multiple pages', bounded, async () => {
  for (const pages of [['', ''], ['   ', '     ']]) {
    await rejects(reader.read(syntheticPdfPages(pages), context), /no readable text/);
  }
});

test('PDF reader rejects PDF sources larger than 10 MiB', bounded, async () => {
  const oversized = Buffer.alloc(10 * 1024 * 1024 + 1);
  syntheticPdf().copy(oversized);
  await rejects(reader.read(oversized, context), /Only PDF documents up to 10 MiB/);
});

test('PDF reader cancels an in-flight child and remains usable afterward', bounded, async () => {
  const controller = new AbortController();
  // read() launches and sends input to the real child before returning its promise.
  // No timing-based assertion that PDF.js has started parsing is made here.
  const pending = reader.read(syntheticPdfPages(['SQL']), { ...context, signal: controller.signal });
  const rejected = rejects(pending, /cancelled/);
  controller.abort();
  await rejected;
  equal(await reader.read(syntheticPdf(), context), 'SQL and TypeScript projects');
});
