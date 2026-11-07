import { denied, permitted } from '../auth/action-policy.js';
import type { ReviewReadiness } from '@recruitment/domain';

// Completion or a committed screening decision makes correction data read-only.
export const reviewEditable = (required: boolean, stage = 'received', status = 'pending', readiness?: ReviewReadiness) => !required
  ? denied(400, 'Extraction review is not required for this application.')
  : !['received','review_ready'].includes(stage) || status === 'completed'
    ? denied(409, 'Review is read-only after completion or screening.')
    : !readiness || !['ready','released'].includes(readiness.state)
      ? denied(409, readiness?.reason ?? 'Review is not ready.') : permitted;

export const reviewReleasable = (readiness: ReviewReadiness) => readiness.state === 'not_required'
  ? denied(400, 'Extraction review is not required for this application.')
  : readiness.state === 'locked' ? denied(409, 'Review is read-only after completion or screening.')
    : readiness.state === 'ready' ? denied(409, 'Processing has already settled; review is ready.')
      : readiness.state === 'released' ? denied(409, 'Processing has already been released.') : permitted;
