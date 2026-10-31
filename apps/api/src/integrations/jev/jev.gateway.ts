import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';
import { EMPTY, Subject, catchError, defer, exhaustMap, finalize, tap } from 'rxjs';
import { randomUUID } from 'node:crypto';
import { JEV_CONFIG } from './jev.config.js';

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
    defer(() => this.perform(job.body)).pipe(
      tap(value => job.resolve(value)),
      catchError(error => { job.reject(error); return EMPTY; }),
      finalize(() => { this.busy = false; }),
    ),
  )).subscribe();

  request(payload: Readonly<Record<string, unknown>>): Promise<unknown> {
    if (!JEV_CONFIG.apiKey) return Promise.reject(new Error('Jev API key is not configured.'));
    if (this.shutdown.signal.aborted) return Promise.reject(new Error('Jev gateway is shut down.'));
    // No unbounded queue: loops receive an error, not thousands of deferred calls.
    if (this.busy) return Promise.reject(new Error('Jev gateway already has an active request.'));
    let body: string;
    try { body = JSON.stringify({ ...payload, model: JEV_CONFIG.model }); }
    catch { return Promise.reject(new Error('Jev payload must be JSON serializable.')); }
    if (Buffer.byteLength(body) > JEV_CONFIG.limits.maxRequestBytes) return Promise.reject(new Error('Jev request exceeds the local size limit.'));
    this.busy = true;
    return new Promise((resolve, reject) => this.jobs.next({ body, resolve, reject }));
  }

  private async perform(body: string): Promise<unknown> {
    const config = JEV_CONFIG, limits = config.limits;
    const client = createClient({ url: config.redisUrl,
      socket: { connectTimeout: 3000, reconnectStrategy: false }, disableOfflineQueue: true });
    client.on('error', () => {}); // Never log connection strings or request contents.
    const token = randomUUID();
    const keys = [`${config.budgetKey}:total`, `${config.budgetKey}:minute`, `${config.budgetKey}:lock`];
    let admitted = false;
    try {
      await client.connect();
      const decision = await client.eval(RESERVE, { keys,
        arguments: [String(limits.totalRequests), String(limits.requestsPerMinute), token, String(limits.lockMs)] });
      if (decision !== 'ok') throw new Error(`Jev local spending guard blocked request (${String(decision)}).`);
      admitted = true;
      const response = await fetch(config.url, {
        method: 'POST', redirect: 'error',
        headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' }, body,
        signal: AbortSignal.any([this.shutdown.signal, AbortSignal.timeout(limits.timeoutMs)]),
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`Jev HTTP ${response.status}; no automatic retry.`);
      }
      if (!response.body) throw new Error('Jev returned an empty response body.');
      const reader = response.body.getReader(), chunks: Uint8Array[] = [];
      let bytes = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > limits.maxResponseBytes) { await reader.cancel(); throw new Error('Jev response exceeds the local size limit.'); }
          chunks.push(chunk.value);
        }
      } finally { reader.releaseLock(); }
      return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
    } finally {
      // Redis admission errors fail closed. Never refund uncertain/failed calls.
      if (admitted && client.isReady) {
        await client.eval(RELEASE, { keys: [keys[2]], arguments: [token] }).catch(() => {});
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
