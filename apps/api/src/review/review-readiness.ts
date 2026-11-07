import type { ProcessingFailureCategory, ReviewReadiness } from '@recruitment/domain';
import type { ProcessingBoundary } from '../processing/processing-policy.js';

interface TaskOutcome { status: string; retryable: boolean; failureCategory?: ProcessingFailureCategory | null }
export function readinessView(state: ReviewReadiness['state']): ReviewReadiness {
  return { state, reason: ({not_required:'Extraction review is not required for this application.',waiting:'Wait for all processing to finish or release to review.',blocked:'Processing has unresolved failures; release to review to stop waiting.',locked:'Review is read-only after completion or screening.',ready:null,released:null})[state] };
}
// Callers supply every frozen definition, including a pending placeholder for
// task rows that have not been initialized. Retry exhaustion is not settlement.
export function reviewReadiness(row: ProcessingBoundary & { processing_state: string }, tasks: readonly TaskOutcome[]): ReviewReadiness {
  if (!tasks.length) return readinessView('not_required');
  if (!['received','review_ready'].includes(row.stage) || row.review_status === 'completed') return readinessView('locked');
  if (row.processing_released_at != null) return readinessView('released');
  if (tasks.some(task => task.status === 'failed' && (task.retryable || task.failureCategory !== 'ordinary_terminal'))) return readinessView('blocked');
  if (row.processing_state === 'processing' || tasks.some(task => !['completed','failed'].includes(task.status))) return readinessView('waiting');
  return readinessView('ready');
}
// Same precedence and frozen-definition coverage as reviewReadiness above. SQL
// projection/filtering happens before count/pagination in one statement. No
// caller-supplied identifiers or values are interpolated into this expression.
export const reviewReadinessSql = `CASE
  WHEN jsonb_array_length(applications.vacancy_snapshot->'processingDefinition'->'tasks')=0 THEN 'not_required'
  WHEN applications.stage NOT IN ('received','review_ready') OR applications.review_status='completed' THEN 'locked'
  WHEN applications.processing_released_at IS NOT NULL THEN 'released'
  WHEN EXISTS(SELECT 1 FROM jsonb_array_elements(applications.vacancy_snapshot->'processingDefinition'->'tasks') definition
    LEFT JOIN application_tasks t ON t.application_id=applications.id AND t.task_id=definition->>'id'
    WHERE t.status='failed' AND (t.retryable OR t.failure_category IS DISTINCT FROM 'ordinary_terminal')) THEN 'blocked'
  WHEN applications.processing_state='processing' OR EXISTS(SELECT 1 FROM jsonb_array_elements(applications.vacancy_snapshot->'processingDefinition'->'tasks') definition
    LEFT JOIN application_tasks t ON t.application_id=applications.id AND t.task_id=definition->>'id'
    WHERE t.status IS NULL OR t.status NOT IN ('completed','failed')) THEN 'waiting'
  ELSE 'ready' END`;
export { processingClosed } from '../processing/processing-policy.js';
