// Machine-readable transport outcome, never inferred from display-message text.
// Unsent may still have consumed Redis admission; nothing refunds allowance.
export type JevFailureStage = 'unsent' | 'response' | 'uncertain';
export class JevGatewayFailure extends Error {
  constructor(message: string, readonly stage: JevFailureStage, readonly code: string, readonly httpStatus?: number) { super(message); }
}
