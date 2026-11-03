import { denied, permitted } from '../auth/action-policy.js';

// Current workflow only: completion/selection do not yet lock review editing.
export const reviewEditable = (required: boolean) => required
  ? permitted : denied(400, 'Extraction review is not required for this application.');
