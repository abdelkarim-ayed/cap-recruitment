import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import { ProcessingFailure } from './processing-failure.js';
import type { CvExecutionMode } from './cv-memory-cache.js';
import type { CvAttemptOwner, CvAttemptReservation, CvAttemptState, CvAttemptStore, CvAttemptTicket } from './cv-attempts.js';

// This is request-attempt metadata, not a durable response/Markdown cache.
// A lost success cache never resets the guard or proves no paid send happened.
@Injectable()
export class CvAttemptRepository implements CvAttemptStore {
  constructor(private readonly database: DatabaseService) {}
  private async active(client: PoolClient, owner: CvAttemptOwner) {
    const row = await client.query(`SELECT id FROM applications WHERE id=$1 AND processing_token=$2 AND processing_lease_until>now()
      AND processing_state='processing' AND stage IN ('received','review_ready') AND review_status<>'completed'
      AND processing_released_at IS NULL AND EXISTS(SELECT 1 FROM application_tasks t WHERE t.application_id=applications.id AND t.task_id=$3 AND t.status='processing') FOR UPDATE`, [owner.applicationId, owner.token, owner.taskId]);
    if (!row.rowCount) throw new ProcessingFailure('CV extraction is closed or its processing lease was lost.', false, 'operational');
  }
  assertActive(owner: CvAttemptOwner) { return this.database.transaction(client => this.active(client, owner)); }
  reserve(owner: CvAttemptOwner, mode: CvExecutionMode, requestHash: string): Promise<CvAttemptReservation> {
    if (!/^[a-f0-9]{64}$/.test(requestHash)) throw new Error('Invalid request hash.');
    return this.database.transaction(async client => {
      await this.active(client, owner);
      const attemptId = randomUUID();
      await client.query(`INSERT INTO cv_request_attempts(mode,request_hash,attempt_id,application_id,task_id,processing_token,state,attempts)
        VALUES($1,$2,$3,$4,$5,$6,'prepared',0) ON CONFLICT DO NOTHING`, [mode, requestHash, attemptId, owner.applicationId, owner.taskId, owner.token]);
      const result = await client.query(`SELECT g.*,retry_after>now() AS delayed,
        EXISTS(SELECT 1 FROM applications a WHERE a.id=g.application_id AND a.processing_token=g.processing_token
          AND a.processing_lease_until>now() AND a.processing_state='processing' AND a.stage IN ('received','review_ready')
          AND a.review_status<>'completed' AND a.processing_released_at IS NULL) AS owner_active
        FROM cv_request_attempts g WHERE mode=$1 AND request_hash=$2 FOR UPDATE OF g`, [mode, requestHash]);
      const guard = result.rows[0];
      if (guard.attempt_id === attemptId) return { acquired: true, ticket: { attemptId, requestHash, mode, owner } };
      if (guard.state === 'succeeded') return { acquired: false, reason: 'prior_success_without_cache' };
      if (guard.state === 'uncertain') return { acquired: false, reason: 'uncertain' };
      if (guard.state === 'send_started') {
        if (guard.owner_active) return { acquired: false, reason: 'in_flight' };
        await client.query("UPDATE cv_request_attempts SET state='uncertain',updated_at=now() WHERE mode=$1 AND request_hash=$2", [mode, requestHash]);
        return { acquired: false, reason: 'uncertain' };
      }
      if (guard.state === 'terminal' || guard.attempts >= 3) return { acquired: false, reason: 'terminal' };
      if (guard.state === 'prepared' && guard.owner_active) return { acquired: false, reason: 'in_flight' };
      if (guard.delayed) return { acquired: false, reason: 'delayed' };
      // An expired *prepared* owner never crossed send_started. Reclaim is safe
      // because markSending also requires both its application token and guard
      // attempt identity; stale owners cannot subsequently send.
      await client.query(`UPDATE cv_request_attempts SET attempt_id=$3,application_id=$4,task_id=$5,processing_token=$6,
        state='prepared',retry_after=NULL,updated_at=now() WHERE mode=$1 AND request_hash=$2`, [mode, requestHash, attemptId, owner.applicationId, owner.taskId, owner.token]);
      return { acquired: true, ticket: { attemptId, requestHash, mode, owner } };
    });
  }
  markSending(ticket: CvAttemptTicket) {
    return this.database.transaction(async client => {
      await this.active(client, ticket.owner);
      const result = await client.query(`UPDATE cv_request_attempts SET state='send_started',attempts=attempts+1,updated_at=now()
        WHERE mode=$1 AND request_hash=$2 AND attempt_id=$3 AND state='prepared' AND application_id=$4 AND task_id=$5 AND processing_token=$6`,
      [ticket.mode, ticket.requestHash, ticket.attemptId, ticket.owner.applicationId, ticket.owner.taskId, ticket.owner.token]);
      if (!result.rowCount) throw new ProcessingFailure('CV request attempt ownership was lost.', false, 'uncertain');
    });
  }
  async settle(ticket: CvAttemptTicket, state: Extract<CvAttemptState, 'succeeded' | 'retryable_unsent' | 'terminal' | 'uncertain'>) {
    // Settle transport knowledge even after HR release. This writes no original
    // result/correction/application state and cannot reopen closed work.
    const result = await this.database.query(`UPDATE cv_request_attempts SET state=$4,
      retry_after=CASE WHEN $4='retryable_unsent' THEN now()+interval '12 hours' ELSE NULL END,updated_at=now()
      WHERE mode=$1 AND request_hash=$2 AND attempt_id=$3 AND state='send_started'`, [ticket.mode, ticket.requestHash, ticket.attemptId, state]);
    if (!result.rowCount) throw new ProcessingFailure('CV request settlement was not confirmed.', false, 'uncertain');
  }
}
