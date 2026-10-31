import { test } from 'node:test';
import { equal, deepEqual, rejects, throws } from 'node:assert/strict';
import { PdfTextReader } from '../dist/processing/pdf-reader.js';
import { JevTaskExecutor } from '../dist/processing/jev-executor.js';
import { ContextTextReader, ContextTaskExecutor, FixtureRegistry, DisabledTaskExecutor } from '../dist/processing/execution.js';
import { createHash } from 'node:crypto';
import { syntheticPdf } from './pdf-fixture.mjs';
import { processingSettings } from '../dist/processing/settings.js';
import { taskRegistry } from '../dist/processing/task-registry.js';

// All Jev tests below use a business-port stub. No JevGateway.request, Redis,
// spending-limit tests, credentials or network requests are exercised here.
const context = { applicationId: '11111111-1111-4111-8111-111111111111', documentId: '22222222-2222-4222-8222-222222222222', taskId: 'skills', sourceHash: '', args: { skills: ['SQL', 'Rust'], evidence: true } };
const answer = value => ({ type: 'choice', choice: value, confidence: .9, probabilities: { not_found: .1, s0: .9 } });
const response = answers => ({ model: 'jev-1.14.0', usage: { input_tokens: 500, output_tokens: 20 }, answers });
test('real isolated PDF parser extracts text and rejects unsupported/corrupt/empty/cancelled sources', async () => {
  const reader = new PdfTextReader();
  equal(await reader.read(syntheticPdf(), context), 'SQL and TypeScript projects');
  await rejects(reader.read(Buffer.from('not PDF'), context), /Only PDF/);
  await rejects(reader.read(Buffer.from('%PDF-broken'), context), /corrupt/);
  await rejects(reader.read(syntheticPdf(''), context), /no readable text/);
  await rejects(reader.read(syntheticPdf(), { ...context, signal: AbortSignal.abort() }));
});
test('actual PDF preparation feeds trusted fixture interpretation without replacing source text', async () => {
  const bytes = syntheticPdf(), registry = new FixtureRegistry();
  const bound = { ...context, fixtureKey: 'real-reader', sourceHash: createHash('sha256').update(bytes).digest('hex') };
  registry.load([{ ...bound, reader: 'pdf', text: 'SQL and TypeScript projects', result: { status: 'completed', value: { skills: ['SQL'] }, evidence: ['SQL and TypeScript projects'] } }]);
  const text = await new ContextTextReader(new PdfTextReader(), registry).read(bytes, bound);
  const result = await new ContextTaskExecutor(new DisabledTaskExecutor(), registry).execute(text, bound);
  equal(result.provenance.mode, 'fixture'); deepEqual(result.result.value.skills, ['SQL']);
});
test('skills adapter batches questions, passes cancellation and maps actual excerpts', async () => {
  let calls = 0; const signal = new AbortController().signal;
  const executor = new JevTaskExecutor({ async request(payload, receivedSignal) {
    calls++; equal(receivedSignal, signal);
    equal(Object.keys(payload.questions).length, 2); equal(payload.state.excerpts.s0, 'Used SQL');
    equal(payload.questions.q0.criteria.s0, 'The source excerpt s0 in state.excerpts');
    equal(Object.hasOwn(payload, 'model'), false); // gateway exclusively owns model selection
    return response({ q0: answer('s0'), q1: answer('not_found') });
  } });
  const outcome = await executor.execute('Used SQL', { ...context, signal });
  equal(calls, 1); deepEqual(outcome.result, { status: 'completed', value: { skills: ['SQL'] }, evidence: ['Used SQL'] });
  equal(outcome.provenance.usage.input_tokens, 500);
});
test('invalid/missing excerpts fail with available usage retained', async () => {
  for (const answers of [{}, { q0: answer('invented'), q1: answer('not_found') }]) {
    const result = await new JevTaskExecutor({ async request() { return response(answers); } }).execute('Used SQL', context);
    equal(result.result.status, 'failed'); equal(result.result.retryable, false); equal(result.provenance.usage.input_tokens, 500);
  }
});
test('live selection is explicit; bounded registry rejects unconfigured output', () => {
  equal(processingSettings({}).executor, 'disabled');
  throws(() => processingSettings({ PROCESSING_EXECUTOR: 'jev' }), /requires/);
  throws(() => processingSettings({ PROCESSING_READER: 'docx' }), /must be/);
  equal(processingSettings({ PROCESSING_READER: 'pdf', PROCESSING_EXECUTOR: 'jev', EXTRACTION_LIVE_CONSENT: 'synthetic' }).executor, 'jev');
  throws(() => taskRegistry.extractSkills.validateResult({ status: 'completed', value: { skills: ['invented'] }, evidence: [] }, context.args), /unconfigured/);
});
test('empty success and evidence=false retain their distinct meanings', async () => {
  const none = await new JevTaskExecutor({ async request() { return response({ q0: answer('not_found'), q1: answer('not_found') }); } }).execute('Used SQL', context);
  deepEqual(none.result, { status: 'completed', value: { skills: [] }, evidence: [] });
  const result = await new JevTaskExecutor({ async request() { return response({ q0: answer('s0'), q1: answer('not_found') }); } }).execute('Used SQL', { ...context, args: { ...context.args, evidence: false } });
  deepEqual(result.result.evidence, []);
});
test('business input limits fail before invoking even the stubbed decision client', async () => {
  let calls = 0;
  const executor = new JevTaskExecutor({ async request() { calls++; throw new Error('must not call'); } });
  for (const [text, input] of [['a'.repeat(12001), context], [Array.from({length:41},()=> 'SQL').join('\n'), context], ['SQL', {...context,args:{skills:Array.from({length:21},(_,i)=>`skill${i}`),evidence:true}}]]) equal((await executor.execute(text,input)).result.status,'failed');
  equal(calls,0);
});
test('any decision-client failure is terminal; business layer never retries it', async () => {
  for (const error of [new Error('Jev local spending guard blocked request (budget).'), new Error('Jev HTTP 429; no automatic retry.'), new TypeError('network detail'), new DOMException('timeout detail','TimeoutError')]) {
    let calls=0;
    const result=await new JevTaskExecutor({ async request() { calls++; throw error; } }).execute('SQL',context);
    equal(calls,1); equal(result.result.retryable,false); equal(result.result.status,'failed');
  }
});
