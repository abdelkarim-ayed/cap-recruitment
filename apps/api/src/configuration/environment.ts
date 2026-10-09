import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const projectRoot = fileURLToPath(new URL('../../../../', import.meta.url));
config({ path: join(projectRoot, '.env'), quiet: true });

export function databaseUrl() {
  return process.env.DATABASE_URL ?? 'postgresql://recruitment:recruitment_local@127.0.0.1:55437/recruitment';
}
