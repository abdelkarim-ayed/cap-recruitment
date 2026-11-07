import type { ProcessingFailureCategory, ReviewReadiness } from '@recruitment/domain';
import type { ProcessingBoundary } from '../processing/processing-policy.js';

interface TaskOutcome { status: string; retryable: boolean; failureCategory?: ProcessingFailureCategory | null }
// Callers supply every frozen definition, including a pending placeholder for
// task rows that have not been initialized. Retry exhaustion is not settlement.
export function reviewReadiness(row: ProcessingBoundary & { processing_state: string }, tasks: readonly TaskOutcome[]): ReviewReadiness {
  if (!tasks.length) return { state: 'not_required', reason: 'Extraction review is not required for this application.' };
  if (!['received','review_ready'].includes(row.stage) || row.review_status === 'completed') return { state: 'locked', reason: 'Review is read-only after completion or screening.' };
  if (row.processing_released_at != null) return { state: 'released', reason: null };
  if (tasks.some(task => task.status === 'failed' && (task.retryable || task.failureCategory !== 'ordinary_terminal'))) return { state: 'blocked', reason: 'Processing has unresolved failures; release to review to stop waiting.' };
  if (row.processing_state === 'processing' || tasks.some(task => !['completed','failed'].includes(task.status))) return { state: 'waiting', reason: 'Wait for all processing to finish or release to review.' };
  return { state: 'ready', reason: null };
}
export { processingClosed } from '../processing/processing-policy.js';
