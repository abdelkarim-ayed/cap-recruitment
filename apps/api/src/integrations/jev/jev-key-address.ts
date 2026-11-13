import { createHash } from 'node:crypto';
import { lstat, mkdir } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// No environment/config import: the CLI never loads .env or an old API key.
// Path/hash identify a project and OS user, not credentials or paid allowance.
const root = fileURLToPath(new URL('../../../../../', import.meta.url));
const scope = createHash('sha256').update(`${root}\0${homedir()}`).digest('hex').slice(0, 20);
export function jevKeyAddress(pid: number) {
  if (!Number.isSafeInteger(pid) || pid < 1) throw new Error('A positive backend PID is required.');
  if (process.platform === 'win32') return { path: `\\\\.\\pipe\\recruitment-jev-${scope}-${pid}`, directory: undefined };
  const directory = join(tmpdir(), `rec-jev-${process.getuid!()}-${scope}`);
  const path = join(directory, `${pid}.sock`);
  if (Buffer.byteLength(path) > 100) throw new Error('Local credential socket path is too long.');
  return { path, directory };
}
export async function requirePrivateJevDirectory(directory: string, create = false) {
  if (create) {
    try { await mkdir(directory, { mode: 0o700 }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw new Error('Cannot create local credential control directory.'); }
  }
  const stat = await lstat(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.uid !== process.getuid!() || (stat.mode & 0o777) !== 0o700) throw new Error('Credential control directory must be owned by the current user with mode 0700.');
}
export async function requirePrivateJevSocket(path: string) {
  const stat = await lstat(path);
  if (!stat.isSocket() || stat.isSymbolicLink() || stat.uid !== process.getuid!() || (stat.mode & 0o777) !== 0o600) throw new Error('Credential socket must be owned by the current user with mode 0600.');
}
