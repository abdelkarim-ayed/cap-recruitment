import { denied, permitted } from '../auth/action-policy.js';

// Completion or a committed screening decision makes correction data read-only.
export const reviewEditable = (required: boolean, stage = 'received', status = 'pending') => !required
  ? denied(400, 'Extraction review is not required for this application.')
  : !['received','review_ready'].includes(stage) || status === 'completed'
    ? denied(409, 'Review is read-only after completion or screening.') : permitted;
