import { z } from 'zod';
import { JEV_KEY_MAX_BYTES, validJevKey } from './jev-key-value.js';

export const JEV_KEY_MESSAGE_BYTES = 16 * 1024;
export const JEV_KEY_REPLY_BYTES = 2048;
export const JEV_KEY_CONTROL_TIMEOUT_MS = 5000;
const expected = { instanceId: z.uuid(), expectedRevision: z.number().int().nonnegative() };
export const jevKeyCommandSchema = z.discriminatedUnion('op', [
  z.strictObject({ version: z.literal(1), op: z.literal('status') }),
  z.strictObject({ version: z.literal(1), op: z.literal('set'), ...expected, key: z.string().max(JEV_KEY_MAX_BYTES).refine(validJevKey) }),
  z.strictObject({ version: z.literal(1), op: z.literal('clear'), ...expected }),
]);
export type JevKeyCommand = z.infer<typeof jevKeyCommandSchema>;
export const jevKeyReplySchema = z.discriminatedUnion('ok', [
  z.strictObject({ ok: z.literal(true), instanceId: z.uuid(), revision: z.number().int().nonnegative(), configured: z.boolean(), pid: z.number().int().positive() }),
  z.strictObject({ ok: z.literal(false), error: z.enum(['invalid_command','state_changed','control_unavailable']) }),
]);
export type JevKeyReply = z.infer<typeof jevKeyReplySchema>;
