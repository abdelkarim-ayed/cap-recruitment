import { ConflictException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import type { ActorReference, ScreeningDecision } from '@recruitment/domain';

export const undecided = (stage: string) => ['received', 'review_ready'].includes(stage);

// Caller owns the vacancy/application locks and transaction. Both entry points
// use this operation; no commits, provider calls or post-commit reads here.
export async function commitScreening(client: PoolClient, row: { id: string; stage: string; candidate_id: string },
  actor: ActorReference, decision: ScreeningDecision, reason?: string) {
  if (!undecided(row.stage)) throw new ConflictException('Screening decision already recorded.');
  await client.query(`UPDATE applications SET stage=$2,flow_revision=flow_revision+1,
    screening_decision=$3,screening_reason=$4,screening_by=$5,screening_at=now(),
    processing_token=NULL,processing_lease_until=NULL,processing_next_at=NULL WHERE id=$1`,
  [row.id, decision === 'rejected' ? 'not_selected' : 'preselected', decision, decision==='rejected'?(reason||null):null, actor.id]);
  // Application-scoped candidate effect, not an interview cancellation or actor copy.
  await client.query(`INSERT INTO screening_notifications(application_id,recipient_id,decision,title,body)
    SELECT a.id,a.candidate_id,$2,$3,$4 || ' — ' || (a.vacancy_snapshot->>'title') FROM applications a WHERE a.id=$1`,
  [row.id, decision, decision === 'rejected' ? 'Application not selected' : 'Application preselected',
    decision === 'rejected' ? 'Your application was not selected.' : 'Your application has been preselected.']);
}
