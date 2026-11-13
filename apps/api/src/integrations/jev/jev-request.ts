import { createHash } from 'node:crypto';

export interface SerializedJevRequest { body: string; hash: string }

/** Single effective serialization used by transport and request-cache identity.
 * Do not sort criteria/questions or hash the unhydrated preview/template.
 * Callers persist only in authorized private result storage, never logs.
 */
export function serializeJevRequest(payload: Readonly<Record<string, unknown>>, model: string, maxRequestBytes: number) {
  let body: string;
  try { body = JSON.stringify({ ...payload, model }); }
  catch { throw new Error('Jev payload must be JSON serializable.'); }
  if (Buffer.byteLength(body) > maxRequestBytes) throw new Error('Jev request exceeds the local size limit.');
  return { body, hash: createHash('sha256').update(body).digest('hex') };
}

export function assertSerializedJevRequest(prepared: SerializedJevRequest, model: string, maxRequestBytes: number) {
  if (Buffer.byteLength(prepared.body) > maxRequestBytes) throw new Error('Jev request exceeds the local size limit.');
  const checked = serializeJevRequest(JSON.parse(prepared.body), model, maxRequestBytes);
  if (checked.body !== prepared.body || checked.hash !== prepared.hash) throw new Error('Jev prepared request bytes/hash/model mismatch.');
}
