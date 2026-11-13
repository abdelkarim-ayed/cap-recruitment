export * from './actions.js';
export * from './interview-plans.js';
export * from './screening.js';
export * from './workflow-views.js';
export * from './cv-extractor.js';
export * from './extractors.js';

export const applicationStages = [
  'received', 'review_ready', 'preselected', 'interview', 'offer', 'hired', 'not_selected',
] as const;
export type ApplicationStage = (typeof applicationStages)[number];

// Business-configurable limits. Transport/storage safety limits are separate.
export type DocumentLimit =
  | { kind: 'NO_LIMIT' }
  | { kind: 'MAX_BYTES'; bytes: number };

export type ExtractionResult<T> =
  | { status: 'pending'; value: null }
  | { status: 'processing'; value: null }
  | { status: 'completed'; value: T; evidence: string[] }
  | { status: 'failed'; value: null; reason: string; retryable: boolean };

export function extractionValue<T>(result: ExtractionResult<T>): T | null {
  switch (result.status) {
    case 'pending':
    case 'processing':
    case 'failed': return null;
    case 'completed': return result.value;
    default: return assertNever(result);
  }
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(value)}`);
}
