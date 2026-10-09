import { accessSync, constants } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const localCompose = join(homedir(), '.local', 'bin', 'podman-compose');
const env = { ...process.env };
if (!env.PODMAN_COMPOSE_PROVIDER) {
  try { accessSync(localCompose, constants.X_OK); env.PODMAN_COMPOSE_PROVIDER = localCompose; }
  catch { /* Let podman compose discover its provider. */ }
}
const child = spawn('podman', [
  'compose', '-p', 'recruitment', '-f', 'compose.yaml', ...process.argv.slice(2),
], { stdio: 'inherit', cwd: new URL('..', import.meta.url), env });
child.on('error', error => { console.error(`Cannot start compose: ${error.message}`); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
