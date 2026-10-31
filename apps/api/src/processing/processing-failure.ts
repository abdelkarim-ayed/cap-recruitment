// Local error classification; retry policy must not depend on display-message spelling.
export class ProcessingFailure extends Error {
  constructor(message: string, readonly retryable: boolean) { super(message); }
}
