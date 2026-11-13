import { test } from 'node:test';
import { deepEqual, equal, rejects, ok } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { buildCvRequest } from '@recruitment/domain';
import { CvAttemptCoordinator } from '../dist/processing/cv-attempts.js';
import { CvAttemptRepository } from '../dist/processing/cv-attempt.repository.js';
import { CvResponseMemoryCache, prepareCvRequest } from '../dist/processing/cv-memory-cache.js';
import { JevGatewayFailure } from '../dist/integrations/jev/jev-failure.js';

// Shared fake durable storage survives coordinator/cache reconstruction. These
// source-model tests are NOT PostgreSQL lock/race or real gateway evidence.
class MemoryAttempts {
  guards = new Map(); closed = new Set(); events = []; clock = 0;
  key(mode, hash) { return `${mode}:${hash}`; }
  async assertActive(owner) { if (this.closed.has(owner.token)) throw new Error('closed'); }
  async reserve(owner, mode, requestHash) {
    await this.assertActive(owner);
    const key = this.key(mode, requestHash), old = this.guards.get(key);
    if (old) {
      if (old.state === 'succeeded') return { acquired: false, reason: 'prior_success_without_cache' };
      if (['uncertain', 'terminal'].includes(old.state)) return { acquired: false, reason: old.state };
      if (old.state === 'send_started') return { acquired: false, reason: this.closed.has(old.ticket.owner.token) ? 'uncertain' : 'in_flight' };
      if (old.state === 'prepared' && !this.closed.has(old.ticket.owner.token)) return { acquired: false, reason: 'in_flight' };
      if (old.after > this.clock) return { acquired: false, reason: 'delayed' };
    }
    const ticket = { attemptId: randomUUID(), requestHash, mode, owner };
    this.guards.set(key, { ticket, state: 'prepared' }); this.events.push('prepared');
    return { acquired: true, ticket };
  }
  async markSending(ticket) {
    await this.assertActive(ticket.owner);
    const row = this.guards.get(this.key(ticket.mode, ticket.requestHash));
    if (row.ticket.attemptId !== ticket.attemptId || row.state !== 'prepared') throw new Error('stale');
    row.state = 'send_started'; this.events.push('send_started');
  }
  async settle(ticket, state) {
    const row = this.guards.get(this.key(ticket.mode, ticket.requestHash));
    if (row.ticket.attemptId !== ticket.attemptId || row.state !== 'send_started') throw new Error('stale');
    row.state = state; row.after = state === 'retryable_unsent' ? this.clock + 12 * 60 * 60 * 1000 : undefined;
    this.events.push(state);
  }
}
const owner = () => ({ applicationId: randomUUID(), taskId: 'cv_extract', token: randomUUID() });
const prepared = () => prepareCvRequest(buildCvRequest({ questions: [{ id: 'Cert', type: 'certification', certification: 'AWS' }] }, '# Synthetic', '2026-11-12', 'jev-1.14.0'), 'jev-1.14.0', 60000);
const response = () => ({ model: 'jev-1.14.0', answers: { Cert: { type: 'choice', choice: 'present', probabilities: { present: 1, not_mentioned: 0 }, confidence: 1 } }, usage: { input_tokens: 10, output_tokens: 10 } });
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }

test('duplicate workers sharing request identity never both send; same-process success cache reuses original attempt', async () => {
  const store = new MemoryAttempts(), entered = deferred(), finish = deferred(); let sends = 0;
  const client = { async requestPrepared() { sends++; deepEqual(store.events, ['prepared', 'send_started']); entered.resolve(); await finish.promise; return response(); } };
  const first = new CvAttemptCoordinator(store, client, new CvResponseMemoryCache());
  const other = new CvAttemptCoordinator(store, client, new CvResponseMemoryCache());
  const request = prepared();
  const running = first.execute(owner(), 'fixture', request); await entered.promise;
  await rejects(other.execute(owner(), 'fixture', request), /in_flight/); equal(sends, 1);
  finish.resolve(); const result = await running;
  const hit = await first.execute(owner(), 'fixture', request);
  equal(hit.cacheHit, true); equal(hit.attemptId, result.attemptId); equal(sends, 1);
  // Another process/restart lost memory; durable success metadata is NOT a
  // response cache and must not cause a second provider request.
  await rejects(other.execute(owner(), 'fixture', request), /prior_success_without_cache/); equal(sends, 1);
});

test('interrupted/ambiguous sends stay blocked after worker and memory-cache loss', async () => {
  for (const error of [new TypeError('simulated crash/connection loss'), new JevGatewayFailure('timeout', 'uncertain', 'transport')]) {
    const store = new MemoryAttempts(); let sends = 0;
    const client = { async requestPrepared() { sends++; throw error; } };
    await rejects(new CvAttemptCoordinator(store, client, new CvResponseMemoryCache()).execute(owner(), 'fixture', prepared()), e => e.category === 'uncertain' && !e.retryable);
    await rejects(new CvAttemptCoordinator(store, client, new CvResponseMemoryCache()).execute(owner(), 'fixture', prepared()), /uncertain/);
    equal(sends, 1);
  }
});

test('unknown send-boundary or settlement acknowledgements never trigger another send', async () => {
  for (const boundary of ['markSending', 'settle']) {
    const store = new MemoryAttempts(); let sends = 0;
    const original = store[boundary].bind(store);
    store[boundary] = async (...args) => { await original(...args); throw new Error('simulated lost COMMIT acknowledgement'); };
    const client = { async requestPrepared() { sends++; return response(); } };
    await rejects(new CvAttemptCoordinator(store, client, new CvResponseMemoryCache()).execute(owner(), 'fixture', prepared()), e => e.category === 'uncertain' && !e.retryable);
    store[boundary] = original;
    await rejects(new CvAttemptCoordinator(store, client, new CvResponseMemoryCache()).execute(owner(), 'fixture', prepared()), /in_flight|prior_success_without_cache/);
    equal(sends, boundary === 'markSending' ? 0 : 1);
  }
});

test('only provably unsent transient failures can schedule whole-task delayed retry, without internal retries', async () => {
  for (const code of ['busy', 'rate', 'redis_unavailable']) {
    const store = new MemoryAttempts(); let calls = 0;
    const coordinator = new CvAttemptCoordinator(store, { async requestPrepared() { calls++; if (calls === 1) throw new JevGatewayFailure('unsent', 'unsent', code); return response(); } }, new CvResponseMemoryCache());
    await rejects(coordinator.execute(owner(), 'fixture', prepared()), e => e.retryable && e.category === 'operational');
    equal(calls, 1);
    await rejects(coordinator.execute(owner(), 'fixture', prepared()), /delayed/); equal(calls, 1);
    store.clock += 12 * 60 * 60 * 1000;
    equal((await coordinator.execute(owner(), 'fixture', prepared())).cacheHit, false); equal(calls, 2);
  }
});

test('budget/config/content failures and known provider 429 do not automatically loop or become negative answers', async () => {
  for (const error of [new JevGatewayFailure('budget', 'unsent', 'budget'), new JevGatewayFailure('disabled', 'unsent', 'disabled'), new JevGatewayFailure('payload', 'unsent', 'payload'), new JevGatewayFailure('HTTP 429', 'response', 'http', 429)]) {
    const store = new MemoryAttempts(); let calls = 0;
    const coordinator = new CvAttemptCoordinator(store, { async requestPrepared() { calls++; throw error; } }, new CvResponseMemoryCache());
    await rejects(coordinator.execute(owner(), 'fixture', prepared()), e => !e.retryable && e.category === 'operational');
    await rejects(coordinator.execute(owner(), 'fixture', prepared()), /terminal/); equal(calls, 1);
  }
  const store = new MemoryAttempts(); let calls = 0;
  const coordinator = new CvAttemptCoordinator(store, { async requestPrepared() { calls++; return { ...response(), answers: {} }; } }, new CvResponseMemoryCache());
  await rejects(coordinator.execute(owner(), 'fixture', prepared()), error => {
    deepEqual(error.rawResponse, { ...response(), answers: {} });
    return /invalid complete response/.test(error.message) && !error.retryable;
  });
  await rejects(coordinator.execute(owner(), 'fixture', prepared()), /terminal/); equal(calls, 1);
});

test('cache hits and fresh sends cannot reopen closed work; closure after send preserves guard knowledge only', async () => {
  const store = new MemoryAttempts(), cache = new CvResponseMemoryCache(); let calls = 0;
  const coordinator = new CvAttemptCoordinator(store, { async requestPrepared() { calls++; return response(); } }, cache);
  await coordinator.execute(owner(), 'fixture', prepared());
  const closed = owner(); store.closed.add(closed.token);
  await rejects(coordinator.execute(closed, 'fixture', prepared()), /closed/); equal(calls, 1);
  const next = owner(); const during = new MemoryAttempts();
  const closingClient = { async requestPrepared() { during.closed.add(next.token); return response(); } };
  await rejects(new CvAttemptCoordinator(during, closingClient, new CvResponseMemoryCache()).execute(next, 'fixture', prepared()), /closed/);
  equal([...during.guards.values()][0].state, 'succeeded');
});

test('expired prepared attempts can be reclaimed, but stale owners cannot later cross the send boundary', async () => {
  const store = new MemoryAttempts(), request = prepared(), oldOwner = owner();
  const old = await store.reserve(oldOwner, 'fixture', request.hash); store.closed.add(oldOwner.token);
  const next = await store.reserve(owner(), 'fixture', request.hash); ok(next.acquired);
  await rejects(store.markSending(old.ticket), /closed|stale/);
  await store.markSending(next.ticket); equal([...store.guards.values()][0].state, 'send_started');
});

test('production repository source branches conservatively classify expired sending even at final attempt', async () => {
  for (const [state, attempts, active, expected] of [
    ['send_started', 3, false, 'uncertain'], ['send_started', 1, true, 'in_flight'],
    ['succeeded', 1, false, 'prior_success_without_cache'], ['uncertain', 1, false, 'uncertain'],
    ['retryable_unsent', 3, false, 'terminal'], ['prepared', 0, true, 'in_flight'],
  ]) {
    const queries = [];
    const client = { async query(sql) {
      queries.push(sql);
      if (sql.includes('SELECT g.*')) return { rows: [{ state, attempts, owner_active: active, attempt_id: 'old', delayed: false }] };
      return { rowCount: 1, rows: [{ id: 'application' }] };
    } };
    const repository = new CvAttemptRepository({ async transaction(work) { return work(client); } });
    const result = await repository.reserve(owner(), 'fixture', prepared().hash);
    deepEqual(result, { acquired: false, reason: expected });
    ok(queries[0].includes('processing_released_at IS NULL'));
    ok(queries[0].includes("review_status<>'completed'"));
    ok(queries.some(q => q.includes('FOR UPDATE OF g')));
  }
});
