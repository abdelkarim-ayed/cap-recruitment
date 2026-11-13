import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import '../configuration/environment.js';
import { lifecycleSafety } from './lifecycle-catalog.js';

const [mode, ...extra] = process.argv.slice(2);
if (extra.length || !['seed', 'reset'].includes(mode ?? '')) throw new Error('Usage: demo:setup seed|reset. Reset recreates only the reserved lifecycle dataset; normal API startup never resets data.');
lifecycleSafety(process.env);
// No AppModule, credentials, Redis, provider, mail or worker initialization.
// Each existing command owns its transaction, schema checks and reset guards.
async function run(relative: string, args: string[] = []) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [fileURLToPath(new URL(relative, import.meta.url)), ...args], { env: process.env, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Demo setup stopped at ${relative}; earlier committed steps remain applied. No automatic retry/reset.`)));
  });
}
await run('../auth/migrate.js');
await run('../database/migrate.js');
await run('./lifecycle.js', [mode!]);
console.log('Offline demo schema/dataset setup complete. No services or provider requests started; passwords/spending state/request ledger preserved.');
