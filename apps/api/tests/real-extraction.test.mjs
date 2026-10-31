import { test } from 'node:test';
import { equal, deepEqual, rejects } from 'node:assert/strict';
import { PdfTextReader } from '../dist/processing/pdf-reader.js';
import { JevTaskExecutor } from '../dist/processing/jev-executor.js';
import { ContextTextReader, ContextTaskExecutor, FixtureRegistry, DisabledTaskExecutor } from '../dist/processing/execution.js';
import { createHash } from 'node:crypto';
import { syntheticPdf } from './pdf-fixture.mjs';
import { processingSettings } from '../dist/processing/settings.js';
import { taskRegistry } from '../dist/processing/task-registry.js';
import { throws } from 'node:assert/strict';

const context = { applicationId: '11111111-1111-4111-8111-111111111111', documentId: '22222222-2222-4222-8222-222222222222', taskId: 'skills', sourceHash: '', args: { skills: ['SQL', 'Rust'], evidence: true } };
test('real isolated PDF parser extracts text; rejects unsupported/corrupt/empty/cancelled sources', async () => {
  const reader = new PdfTextReader();
  equal(await reader.read(syntheticPdf(), context), 'SQL and TypeScript projects');
  await rejects(reader.read(Buffer.from('not PDF'), context), /Only PDF/);
  await rejects(reader.read(Buffer.from('%PDF-broken'), context), /corrupt/);
  await rejects(reader.read(syntheticPdf(''), context), /no readable text/);
  await rejects(reader.read(syntheticPdf(), { ...context, signal: AbortSignal.abort() }));
});
test('actual PDF preparation can feed trusted fixture interpretation without replacing source text', async () => {
  const bytes = syntheticPdf(), registry = new FixtureRegistry();
  const bound = { ...context, fixtureKey: 'real-reader', sourceHash: createHash('sha256').update(bytes).digest('hex') };
  registry.load([{ ...bound, reader: 'pdf', text: 'SQL and TypeScript projects', result: { status: 'completed', value: { skills: ['SQL'] }, evidence: ['SQL and TypeScript projects'] } }]);
  const text = await new ContextTextReader(new PdfTextReader(), registry).read(bytes, bound);
  const result = await new ContextTaskExecutor(new DisabledTaskExecutor(), registry).execute(text, bound);
  equal(result.provenance.mode, 'fixture'); deepEqual(result.result.value.skills, ['SQL']);
});
function response(answers) { return new Response(JSON.stringify({ model: 'jev-1.14.0', usage: { input_tokens: 500, output_tokens: 20 }, answers })); }
const choice = value => ({ type: 'choice', choice: value, confidence: .9, probabilities: { not_found: .1, s0: .9 } });
test('Jev batches skills in one request and maps only actual excerpts to evidence', async () => {
  let calls = 0;
  const executor = new JevTaskExecutor('fixture-key', undefined, async (url, options) => {
    calls++; equal(url, 'https://api.typesafe.ai/v1/systemone');
    const body = JSON.parse(options.body); equal(Object.keys(body.questions).length, 2);
    equal(body.state.excerpts.s0, 'Used SQL');
    equal(body.questions.q0.criteria.s0, 'The source excerpt s0 in state.excerpts');
    return response({ q0: choice('s0'), q1: choice('not_found') });
  });
  const outcome = await executor.execute('Used SQL', context);
  equal(calls, 1); deepEqual(outcome.result, { status: 'completed', value: { skills: ['SQL'] }, evidence: ['Used SQL'] });
  equal(outcome.provenance.usage.input_tokens, 500);
});
test('Jev invalid/missing excerpts fail; 429 retries; credentials/provider errors never echo', async () => {
  for (const answers of [{}, { q0: choice('invented'), q1: choice('not_found') }]) {
    const result = await new JevTaskExecutor('secret', undefined, async () => response(answers)).execute('Used SQL', context);
    equal(result.result.status, 'failed'); equal(result.result.retryable, false);
  }
  const failed = await new JevTaskExecutor('secret', undefined, async () => new Response('secret candidate data', { status: 429 })).execute('Used SQL', context);
  equal(failed.result.retryable, true); equal(JSON.stringify(failed).includes('secret'), false);
});
test('live configuration is opt-in and the bounded task registry rejects unconfigured output', () => {
  equal(processingSettings({}).executor, 'disabled');
  throws(() => processingSettings({ PROCESSING_EXECUTOR: 'jev' }), /requires/);
  throws(() => processingSettings({ PROCESSING_READER: 'docx' }), /must be/);
  equal(processingSettings({ PROCESSING_READER: 'pdf', PROCESSING_EXECUTOR: 'jev', TYPESAFE_API_KEY: 'test', EXTRACTION_LIVE_CONSENT: 'synthetic' }).executor, 'jev');
  throws(() => taskRegistry.extractSkills.validateResult({ status: 'completed', value: { skills: ['invented'] }, evidence: [] }, context.args), /unconfigured/);
});
test('Jev no-match result is successful empty; evidence=false suppresses source excerpts', async () => {
  const none = await new JevTaskExecutor('test', undefined, async () => response({ q0: choice('not_found'), q1: choice('not_found') })).execute('Used SQL', context);
  deepEqual(none.result, { status: 'completed', value: { skills: [] }, evidence: [] });
  const result = await new JevTaskExecutor('test', undefined, async () => response({ q0: choice('s0'), q1: choice('not_found') })).execute('Used SQL', { ...context, args: { ...context.args, evidence: false } });
  deepEqual(result.result.evidence, []);
});
