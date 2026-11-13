import type { CvChoiceResponse } from './cv-response.js';
import { validateCvResponse } from './cv-response.js';
import { assertPreparedCvRequest, CvResponseMemoryCache, type CvExecutionMode, type PreparedCvRequest } from './cv-memory-cache.js';
import { JevGatewayFailure } from '../integrations/jev/jev-failure.js';
import { ProcessingFailure } from './processing-failure.js';

export interface CvAttemptOwner { applicationId: string; taskId: string; token: string }
export interface CvAttemptTicket { attemptId: string; requestHash: string; mode: CvExecutionMode; owner: CvAttemptOwner }
export type CvAttemptState = 'prepared' | 'send_started' | 'succeeded' | 'retryable_unsent' | 'terminal' | 'uncertain';
export type CvAttemptReservation = { acquired: true; ticket: CvAttemptTicket } | { acquired: false; reason: 'in_flight' | 'uncertain' | 'prior_success_without_cache' | 'terminal' | 'delayed' };
export interface CvAttemptStore {
  assertActive(owner: CvAttemptOwner): Promise<void>;
  reserve(owner: CvAttemptOwner, mode: CvExecutionMode, requestHash: string): Promise<CvAttemptReservation>;
  markSending(ticket: CvAttemptTicket): Promise<void>;
  settle(ticket: CvAttemptTicket, state: Extract<CvAttemptState, 'succeeded' | 'retryable_unsent' | 'terminal' | 'uncertain'>): Promise<void>;
}
export interface CvPreparedDecisionClient { requestPrepared(request: PreparedCvRequest, signal?: AbortSignal): Promise<unknown> }
export interface CvAttemptResult { response: CvChoiceResponse; requestHash: string; attemptId: string; cacheHit: boolean; mode: CvExecutionMode }
export class CvInvalidResponseFailure extends ProcessingFailure {
  readonly rawResponse: unknown;
  constructor(raw: unknown) {
    super('CV provider returned an invalid complete response.', false, 'operational');
    // Private diagnostic only, never a successful field map/cache entry. The
    // gateway bounds JSON response bytes; later persistence must stay staff-only.
    this.rawResponse = structuredClone(raw);
  }
}
export class CvProviderAttemptFailure extends ProcessingFailure {
  readonly stopRun = true;
  constructor(retryable:boolean, category:'uncertain'|'operational', code?:string) {
    super(code==='budget'?'Jev spending allowance blocked extraction; automatic work stopped.':category==='uncertain'?'CV provider completion is uncertain; automatic retry is blocked.':'CV provider attempt failed; automatic work stopped and original fields are unavailable.',retryable,category);
  }
}

/** Whole-request coordination only; not a scheduler, question worker or live
 * activation switch. Repository fences and durable guards are mandatory even
 * when the response cache was lost on restart. No retries inside execute().
 */
export class CvAttemptCoordinator {
  constructor(private readonly store: CvAttemptStore, private readonly client: CvPreparedDecisionClient, private readonly cache: CvResponseMemoryCache) {}
  async execute(owner: CvAttemptOwner, mode: CvExecutionMode, prepared: PreparedCvRequest, signal?: AbortSignal): Promise<CvAttemptResult> {
    assertPreparedCvRequest(prepared);
    await this.store.assertActive(owner);
    if (signal?.aborted) throw new ProcessingFailure('CV extraction cancelled before send.', false, 'operational');
    const hit = this.cache.get(mode, prepared);
    if (hit) {
      await this.store.assertActive(owner);
      return { response: hit.response, requestHash: prepared.hash, attemptId: hit.attemptId, cacheHit: true, mode };
    }
    const reserved = await this.store.reserve(owner, mode, prepared.hash);
    if (!reserved.acquired) throw new ProcessingFailure(`CV request blocked (${reserved.reason}).`, false, reserved.reason === 'uncertain' ? 'uncertain' : 'operational');
    const { ticket } = reserved;
    // Unknown COMMIT acknowledgements are terminal for this invocation. No send
    // happens unless the durable boundary is confirmed; future recovery uses
    // the guard state, not process memory or expired task leases.
    try { await this.store.markSending(ticket); }
    catch { throw new ProcessingFailure('CV send boundary was not confirmed; automatic retry is blocked.', false, 'uncertain'); }
    let raw: unknown;
    try {
      if (signal?.aborted) throw new JevGatewayFailure('Jev request cancelled before send.', 'unsent', 'cancelled');
      raw = await this.client.requestPrepared(prepared, signal);
    } catch (error) {
      const unsent = error instanceof JevGatewayFailure && error.stage === 'unsent';
      // Budget/config/size/cancelled are stop conditions, not an automatic loop.
      const retryable = unsent && error instanceof JevGatewayFailure && ['busy', 'rate', 'redis_unavailable'].includes(error.code);
      const state = retryable ? 'retryable_unsent' : unsent || error instanceof JevGatewayFailure && error.stage === 'response' ? 'terminal' : 'uncertain';
      await this.settle(ticket, state);
      throw new CvProviderAttemptFailure(retryable, state === 'uncertain' ? 'uncertain' : 'operational',error instanceof JevGatewayFailure?error.code:undefined);
    }
    let response: CvChoiceResponse;
    try { response = validateCvResponse(prepared.request, raw); }
    catch {
      await this.settle(ticket, 'terminal');
      throw new CvInvalidResponseFailure(raw);
    }
    await this.settle(ticket, 'succeeded');
    this.cache.set(mode, prepared, response, ticket.attemptId);
    await this.store.assertActive(owner);
    return { response, requestHash: prepared.hash, attemptId: ticket.attemptId, cacheHit: false, mode };
  }
  private async settle(ticket: CvAttemptTicket, state: Extract<CvAttemptState, 'succeeded' | 'retryable_unsent' | 'terminal' | 'uncertain'>) {
    try { await this.store.settle(ticket, state); }
    catch { throw new ProcessingFailure('CV attempt settlement was not confirmed; automatic retry is blocked.', false, 'uncertain'); }
  }
}
