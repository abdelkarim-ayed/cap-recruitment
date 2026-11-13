export const JEV_KEY_MAX_BYTES = 4096;
export function validJevKey(key: unknown): key is string {
  // Header-safe opaque token, not vendor-prefix validation or a provider call.
  return typeof key === 'string' && key.length <= JEV_KEY_MAX_BYTES && /^[\x21-\x7e]+$/.test(key);
}
