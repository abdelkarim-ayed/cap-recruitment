import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const sourceRoot = fileURLToPath(new URL('../../../../', import.meta.url));
// Bounded worktree launches may reuse the existing private runtime directory
// without copying/printing environment secrets or changing infrastructure.
export const projectRoot = process.env.RECRUITMENT_RUNTIME_ROOT ?? sourceRoot;
config({ path: join(projectRoot, '.env'), quiet: true });

export function databaseUrl() {
  return process.env.DATABASE_URL ?? 'postgresql://recruitment:recruitment_local@127.0.0.1:55437/recruitment';
}
