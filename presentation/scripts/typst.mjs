import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const local = resolve(root, '../.local/tools/typst-0.15.1/typst');
const binary = process.env.TYPST_BIN || (existsSync(local) ? local : 'typst');
mkdirSync(resolve(root, 'dist'), { recursive: true });
const result = spawnSync(binary, process.argv.slice(2), { cwd: root, stdio: 'inherit' });
if (result.error) {
  console.error('Typst unavailable. Install the official compiler locally or set TYPST_BIN; see presentation/README.md.');
  process.exitCode = 1;
} else process.exitCode = result.status ?? 1;
