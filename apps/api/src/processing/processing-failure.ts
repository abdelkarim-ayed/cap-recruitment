import type { ProcessingFailureCategory } from '@recruitment/domain';

// Local error classification; retry policy must not depend on display-message spelling.
export class ProcessingFailure extends Error {
  constructor(message: string, readonly retryable: boolean, readonly category: ProcessingFailureCategory = 'operational') { super(message); }
}
