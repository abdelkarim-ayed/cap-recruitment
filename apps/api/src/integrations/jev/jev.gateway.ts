import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';
import { EMPTY, Subject, catchError, defer, exhaustMap, finalize, tap } from 'rxjs';
import { randomUUID } from 'node:crypto';
import { JEV_CONFIG } from './jev.config.js';
import { assertSerializedJevRequest, serializeJevRequest, type SerializedJevRequest } from './jev-request.js';
import { JevGatewayFailure } from './jev-failure.js';
import { JevCredentials } from './jev-credentials.js';

// One atomic admission check for all processes sharing Redis. Total allowance
// has no TTL: process restarts do not renew it. Failed attempts consume it too.
const RESERVE = `
local clock = redis.call('TIME')
local now = clock[1] * 1000 + math.floor(clock[2] / 1000)
redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', now - 60000)
if redis.call('EXISTS', KEYS[3]) == 1 then return 'busy' end
if tonumber(redis.call('GET', KEYS[1]) or '0') >= tonumber(ARGV[1]) then return 'budget' end
if redis.call('ZCARD', KEYS[2]) >= tonumber(ARGV[2]) then return 'rate' end
redis.call('INCR', KEYS[1])
redis.call('ZADD', KEYS[2], now, ARGV[3])
redis.call('PEXPIRE', KEYS[2], 120000)
redis.call('SET', KEYS[3], ARGV[3], 'PX', ARGV[4])
return 'ok'`;
const RELEASE = `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0`;

interface Job {
  body: string;
  key: string;
  signal?: AbortSignal;
  resolve(value: unknown): void;
  reject(reason: unknown): void;
}

/** Transport/spending boundary only. Callers own prompts, inputs and validation.
 * No public HTTP endpoint, automatic retries, extraction or background polling.
 */
@Injectable()
export class JevGateway implements OnModuleDestroy {
  private readonly jobs = new Subject<Job>();
  private readonly shutdown = new AbortController();
  private busy = false;
  private readonly subscription = this.jobs.pipe(exhaustMap(job =>
    defer(() => this.perform(job.body, job.key, job.signal)).pipe(
      tap(value => job.resolve(value)),
      catchError(error => { job.reject(error); return EMPTY; }),
      finalize(() => { this.busy = false; }),
    ),
  )).subscribe();

  constructor(private readonly credentials: JevCredentials) {}

  isConfigured() { return this.credentials.status().configured; }
  waitUntilConfigured(signal:AbortSignal) { return this.credentials.waitUntilConfigured(AbortSignal.any([this.shutdown.signal,signal])); }

  request(payload: Readonly<Record<string, unknown>>, signal?: AbortSignal): Promise<unknown> {
    try { return this.requestPrepared(serializeJevRequest(payload, JEV_CONFIG.model, JEV_CONFIG.limits.maxRequestBytes), signal); }
    catch { return Promise.reject(new JevGatewayFailure('Jev payload cannot be serialized within the local limit.', 'unsent', 'payload')); }
  }

  requestPrepared(prepared: SerializedJevRequest, signal?: AbortSignal): Promise<unknown> {
    if (signal?.aborted) return Promise.reject(new JevGatewayFailure('Jev request cancelled.', 'unsent', 'cancelled'));
    const key = this.credentials.captureForGateway();
    if (key === undefined) return Promise.reject(new JevGatewayFailure('Jev key is not loaded in this process; use local credential control.', 'unsent', 'disabled'));
    if (this.shutdown.signal.aborted) return Promise.reject(new JevGatewayFailure('Jev gateway is shut down.', 'unsent', 'shutdown'));
    // No unbounded queue: loops receive an error, not thousands of deferred calls.
    if (this.busy) return Promise.reject(new JevGatewayFailure('Jev gateway already has an active request.', 'unsent', 'busy'));
    try {
      assertSerializedJevRequest(prepared, JEV_CONFIG.model, JEV_CONFIG.limits.maxRequestBytes);
    } catch { return Promise.reject(new JevGatewayFailure('Jev prepared request is invalid or exceeds the local limit.', 'unsent', 'payload')); }
    this.busy = true;
    return new Promise((resolve, reject) => this.jobs.next({ body: prepared.body, key, signal, resolve, reject }));
  }

  private async perform(body: string, key: string, signal?: AbortSignal): Promise<unknown> {
    const config = JEV_CONFIG, limits = config.limits;
    const client = createClient({ url: config.redisUrl,
      socket: { connectTimeout: 3000, reconnectStrategy: false }, disableOfflineQueue: true });
    client.on('error', () => {}); // Never log connection strings or request contents.
    const token = randomUUID();
    const keys = [`${config.budgetKey}:total`, `${config.budgetKey}:minute`, `${config.budgetKey}:lock`];
    let admitted = false, sendStarted = false;
    // Match the existing 3s connect bound for commands too. Timeout/disconnect
    // may consume admission, but never authorizes a send/refund/retry here.
    const redisOperation = async <T>(operation: () => Promise<T>): Promise<T> => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([operation(), new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            if (client.isOpen) client.destroy();
            reject(new JevGatewayFailure('Jev spending guard unavailable.', 'unsent', 'redis_unavailable'));
          }, 3000);
        })]);
      } finally { clearTimeout(timer); }
    };
    try {
      await redisOperation(() => client.connect());
      signal?.throwIfAborted();
      const decision = await redisOperation(() => client.eval(RESERVE, { keys,
        arguments: [String(limits.totalRequests), String(limits.requestsPerMinute), token, String(limits.lockMs)] }));
      if (decision !== 'ok') throw new JevGatewayFailure(`Jev local spending guard blocked request (${String(decision)}).`, 'unsent', typeof decision === 'string' && ['busy', 'rate', 'budget'].includes(decision) ? decision : 'guard');
      admitted = true;
      signal?.throwIfAborted();
      if (this.shutdown.signal.aborted) throw new JevGatewayFailure('Jev gateway is shut down.', 'unsent', 'shutdown');
      sendStarted = true;
      const response = await fetch(config.url, {
        method: 'POST', redirect: 'error',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body,
        signal: AbortSignal.any([this.shutdown.signal, AbortSignal.timeout(limits.timeoutMs), ...(signal ? [signal] : [])]),
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new JevGatewayFailure(`Jev HTTP ${response.status}; no automatic retry.`, 'response', 'http', response.status);
      }
      if (!response.body) throw new JevGatewayFailure('Jev returned an empty response body.', 'response', 'empty_response');
      const reader = response.body.getReader(), chunks: Uint8Array[] = [];
      let bytes = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > limits.maxResponseBytes) { await reader.cancel(); throw new JevGatewayFailure('Jev response exceeds the local size limit.', 'response', 'response_size'); }
          chunks.push(chunk.value);
        }
      } finally { reader.releaseLock(); }
      try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown; }
      catch { throw new JevGatewayFailure('Jev returned invalid JSON.', 'response', 'invalid_response'); }
    } catch (error) {
      if (error instanceof JevGatewayFailure) throw error;
      throw new JevGatewayFailure(sendStarted ? 'Jev send completion is uncertain.' : 'Jev spending guard unavailable or request cancelled.', sendStarted ? 'uncertain' : 'unsent', sendStarted ? 'transport' : signal?.aborted ? 'cancelled' : 'redis_unavailable');
    } finally {
      // Redis admission errors fail closed. Never refund uncertain/failed calls.
      if (admitted && client.isReady) {
        await redisOperation(() => client.eval(RELEASE, { keys: [keys[2]], arguments: [token] })).catch(() => {});
      }
      if (client.isOpen) client.destroy();
    }
  }

  onModuleDestroy() {
    this.shutdown.abort();
    this.jobs.complete();
    // Keep the active subscription until its aborted request rejects its caller.
    if (!this.busy) this.subscription.unsubscribe();
  }
}
