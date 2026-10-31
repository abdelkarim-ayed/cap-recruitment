import { test } from 'node:test';
import { equal } from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ProcessingService } from '../dist/processing/processing.service.js';
import { ProcessingFailure } from '../dist/processing/processing-failure.js';

const bytes = Buffer.from('source');
function setup(reader, executor, count = 1) {
  const saved = [];
  const tasks = Array.from({ length: count }, (_, i) => ({ task_id: `t${i}`, type: 'extractSkills', source_input_id: 'cv', fixture_key: null, args: { skills: ['SQL'], evidence: true } }));
  const repository = { async claim() { return { id: 'app', token: 'token', tasks }; }, async start() { return true; }, async source() { return { id: 'doc', storage_ref: 'private', content_hash: createHash('sha256').update(bytes).digest('hex'), byte_count: bytes.length }; }, async save(_id, _token, _task, result) { saved.push(result); }, async finish() {} };
  return { saved, service: new ProcessingService(repository, { async read() { return bytes; } }, reader, executor) };
}
test('typed parser timeout is retryable but ordinary invalid PDF failure is not', async () => {
  for (const [failure, retryable] of [[new ProcessingFailure('PDF preparation timed out.', true), true], [new Error('PDF is corrupt.'), false]]) {
    const { saved, service } = setup({ async read() { throw failure; } }, { async execute() { throw new Error('must not execute'); } });
    await service.processOne('app'); equal(saved[0].result.retryable, retryable);
  }
});
test('live provenance survives invalid result validation and executor exceptions', async () => {
  const provenance = { mode: 'live', provider: 'typesafe', model: 'jev-test', usage: { input_tokens: 25, output_tokens: 5 } };
  for (const executor of [{ describe() { return provenance; }, async execute() { throw new ProcessingFailure('Processing unit timed out.', true); } }, { async execute() { return { provenance, result: { status: 'completed', value: { skills: ['Unconfigured'] }, evidence: [] } }; } }]) {
    const { saved, service } = setup({ async read() { return 'SQL'; } }, executor);
    await service.processOne('app'); equal(saved[0].result.status, 'failed'); equal(saved[0].result.retryable, false); equal(saved[0].provenance.mode, 'live'); equal(saved[0].provenance.usage.input_tokens, 25);
  }
});
test('normal tasks sharing a document prepare it once per application invocation', async () => {
  let reads = 0, executions = 0;
  const { service } = setup({ async read() { reads++; return 'SQL'; } }, { async execute() { executions++; return { provenance: { mode: 'live' }, result: { status: 'completed', value: { skills: ['SQL'] }, evidence: ['SQL'] } }; } }, 2);
  await service.processOne('app'); equal(reads, 1); equal(executions, 2);
});
