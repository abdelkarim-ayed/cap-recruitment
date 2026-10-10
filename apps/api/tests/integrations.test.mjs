import 'reflect-metadata';
import { deepEqual, equal, rejects, throws, ok } from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { Test } from '@nestjs/testing';
import { MemoryMailSender } from '../dist/integrations/mail/memory-mail-sender.js';
import { FileMailSender, readCapturedMail } from '../dist/integrations/mail/file-mail-sender.js';
import { DisabledExtractionProvider, FixtureExtractionProvider } from '../dist/integrations/extraction/fixture-extraction-provider.js';
import { IntegrationsModule } from '../dist/integrations/integrations.module.js';
import { MAIL_SENDER } from '../dist/integrations/mail/mail-sender.js';
import { EXTRACTION_PROVIDER } from '../dist/integrations/extraction/extraction-provider.js';
import { RUNTIME_CONFIG, readRuntimeConfig } from '../dist/configuration/runtime-config.js';
import { withTransaction } from '../dist/database/database.service.js';
import { HealthController } from '../dist/health.controller.js';
import { RedisConnectivityProbe } from '../dist/infrastructure/redis-connectivity.js';

const baseEnv = { BETTER_AUTH_SECRET: 'fixture-only-secret-with-at-least-thirty-two-characters' };

test('memory mail captures messages without transport and isolates caller mutations', async () => {
  const sender = new MemoryMailSender();
  const message = { to: 'fixture@example.test', subject: 'Fixture', text: 'Not real mail.' };
  await sender.send(message);
  message.text = 'Changed';
  equal(sender.messages[0].text, 'Not real mail.');
});

test('file mail captures privately and latest message replaces the previous capture', async () => {
  const directory = await mkdtemp(join(existsSync('/tmp/opencode') ? '/tmp/opencode' : tmpdir(), 'mail-fixture-'));
  try {
    const sender = new FileMailSender(directory);
    await sender.send({ to: 'fixture@example.test', subject: 'Fixture', text: 'First fixture' });
    await sender.send({ to: 'FIXTURE@example.test', subject: 'Fixture', text: 'Latest fixture' });
    const capture = await readCapturedMail(directory, 'fixture@example.test');
    equal(capture.delivery, 'development-capture');
    equal(capture.message.text, 'Latest fixture');
    if (process.platform !== 'win32') {
      equal((await stat(directory)).mode & 0o777, 0o700);
      const [file] = await readdir(directory);
      equal((await stat(join(directory, file))).mode & 0o777, 0o600);
    }
    await rejects(readCapturedMail(directory, 'other@example.test'), { code: 'ENOENT' });
    await sender.send({to:'other@example.test',subject:'Second mailbox',text:'Other account fixture'});
    equal((await readCapturedMail(directory,'other@example.test')).message.text,'Other account fixture');
    equal((await readCapturedMail(directory,'fixture@example.test')).message.text,'Latest fixture');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('configuration rejects unknown drivers, incomplete SMTP credentials, and production fixtures', () => {
  throws(() => readRuntimeConfig({ ...baseEnv, MAIL_DRIVER: 'magic' }), /MAIL_DRIVER/);
  throws(() => readRuntimeConfig({ ...baseEnv, EXTRACTION_DRIVER: 'live' }), /no live provider/);
  throws(() => readRuntimeConfig({ ...baseEnv, SMTP_USER: 'fixture' }), /both SMTP_USER/);
  throws(() => readRuntimeConfig({ ...baseEnv, SMTP_PORT: 'NaN' }), /SMTP_PORT/);
  throws(() => readRuntimeConfig({ ...baseEnv, SMTP_SECURE: 'yes' }), /SMTP_SECURE/);
  throws(() => readRuntimeConfig({ ...baseEnv, NODE_ENV: 'production', MAIL_DRIVER: 'file' }), /forbidden in production/);
  throws(() => readRuntimeConfig({ ...baseEnv, NODE_ENV: 'production', EXTRACTION_DRIVER: 'fixture' }), /forbidden in production/);
  equal(readRuntimeConfig(baseEnv).extractionDriver, 'disabled');
  equal(readRuntimeConfig({ ...baseEnv, MAIL_DRIVER: 'file', SMTP_USER: 'irrelevant', SMTP_PORT: 'invalid-but-unused' }).mail.driver, 'file');
});

test('fixture extraction never masquerades as live analysis and preserves false/empty values', async () => {
  const fixtures = { sample: { id: 'sample-v1', result: { status: 'completed', value: { answer: false, skills: [] }, evidence: [] } } };
  const provider = new FixtureExtractionProvider(fixtures);
  fixtures.sample.result.value.answer = true;
  const response = await provider.extract({ taskKey: 'sample', sourceText: 'Ignored fixture input' });
  deepEqual(response.provenance, { mode: 'fixture', fixtureId: 'sample-v1' });
  deepEqual(response.result.value, { answer: false, skills: [] });
  response.result.value.answer = true;
  equal((await provider.extract({ taskKey: 'sample', sourceText: '' })).result.value.answer, false);
  const missing = await provider.extract({ taskKey: 'missing', sourceText: '' });
  equal(missing.result.status, 'failed'); equal(missing.result.value, null);
  equal((await provider.extract({ taskKey: '__proto__', sourceText: '' })).result.status, 'failed');
});

test('disabled extraction fails explicitly instead of fabricating an AI result', async () => {
  const response = await new DisabledExtractionProvider().extract({ taskKey: 'anything', sourceText: '' });
  equal(response.provenance.mode, 'disabled'); equal(response.result.status, 'failed'); equal(response.result.value, null);
});

test('integration module selects file/fixture adapters and accepts a mail test override', async () => {
  const module = await Test.createTestingModule({ imports: [IntegrationsModule] })
    .overrideProvider(RUNTIME_CONFIG).useValue(readRuntimeConfig({ ...baseEnv, MAIL_DRIVER: 'file', EXTRACTION_DRIVER: 'fixture' })).compile();
  try {
    ok(module.get(MAIL_SENDER) instanceof FileMailSender);
    equal((await module.get(EXTRACTION_PROVIDER).extract({ taskKey: 'demo-skills', sourceText: '' })).provenance.mode, 'fixture');
  } finally { await module.close(); }
  const mail = new MemoryMailSender();
  const overridden = await Test.createTestingModule({ imports: [IntegrationsModule] })
    .overrideProvider(RUNTIME_CONFIG).useValue(readRuntimeConfig(baseEnv))
    .overrideProvider(MAIL_SENDER).useValue(mail).compile();
  try { equal(overridden.get(MAIL_SENDER), mail); } finally { await overridden.close(); }
});

test('transaction commits on success and always releases the connection', async () => {
  const calls = [];
  const client = { async query(sql) { calls.push(sql); }, release() { calls.push('release'); } };
  const value = await withTransaction({ async connect() { return client; } }, async transaction => { await transaction.query('work'); return 42; });
  equal(value, 42); deepEqual(calls, ['BEGIN', 'work', 'COMMIT', 'release']);
});

test('transaction rolls back on failure and preserves the original error', async () => {
  const calls = [];
  const failure = new Error('fixture transaction failure');
  const client = { async query(sql) { calls.push(sql); if (sql === 'ROLLBACK') throw new Error('fixture rollback failure'); }, release() { calls.push('release'); } };
  await rejects(withTransaction({ async connect() { return client; } }, async () => { throw failure; }), error => error === failure);
  deepEqual(calls, ['BEGIN', 'ROLLBACK', 'release']);
});

test('readiness can use fake protocol probes and hides their error details', async () => {
  const success = { async check() {} };
  const failure = { async check() { throw new Error('fixture secret never returned'); } };
  deepEqual(await new HealthController(success, success).ready(), { status: 'ready', database: 'ok', redis: 'ok' });
  for (const [database, redis, expected] of [
    [failure, success, { database: 'unavailable', redis: 'ok' }],
    [success, failure, { database: 'ok', redis: 'unavailable' }],
    [failure, failure, { database: 'unavailable', redis: 'unavailable' }],
  ]) {
    await rejects(new HealthController(database, redis).ready(), error => {
      equal(error.getStatus(), 503); deepEqual(error.getResponse(), expected); return true;
    });
  }
});

test('Redis adapter times out and closes a connected socket that never speaks Redis', async () => {
  const sockets = new Set();
  const server = createServer(socket => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const probe = new RedisConnectivityProbe(`redis://127.0.0.1:${server.address().port}`, 100);
    await rejects(probe.check(), /timed out/);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise(resolve => server.close(resolve));
  }
});
