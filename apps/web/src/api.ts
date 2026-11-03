import type { Role } from '@recruitment/domain';
export interface Actor { id: string; name: string; email: string; role: Role }
export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/${path}`, { credentials: 'include', ...init, headers: { ...(typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...init.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = body.issues?.map((issue: {path: string; message: string}) => `${issue.path}: ${issue.message}`).join('\n');
    const message = details || (Array.isArray(body.message) ? body.message.join(', ') : body.message) || `Request failed (${response.status}).`;
    const retryAfter=response.headers.get('X-Retry-After')||response.headers.get('Retry-After');
    throw new Error(response.status === 401 && !path.startsWith('auth/') ? 'Please sign in again to continue.' : response.status===429?`${message} ${retryAfter?`Try again in ${retryAfter} seconds.`:'Wait a minute before retrying.'}`:message);
  }
  return body;
}
export const post = <T = any>(path: string, body: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(body) });
export async function download(path: string, filename: string) {
  const response = await fetch(`/api/${path}`, { credentials: 'include' });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || `Download failed (${response.status}).`); }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function go(path: string) { window.location.hash = path; }
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong. Please retry.'; }
