import { getMigrations } from 'better-auth/db/migration';
import { Pool } from 'pg';
import { createAuth } from './auth.config.js';
import { databaseUrl } from '../configuration/environment.js';
import { readRuntimeConfig } from '../configuration/runtime-config.js';
import { MemoryMailSender } from '../integrations/mail/memory-mail-sender.js';

const database = new Pool({ connectionString: databaseUrl(), connectionTimeoutMillis: 3000 });
try {
  const auth = createAuth(database, new MemoryMailSender(), readRuntimeConfig());
  const plan = await getMigrations(auth.options);
  if (plan.schemaProblems.length) throw new Error(plan.schemaProblems.join('\n'));
  await plan.runMigrations();
  console.log('Auth schema migrated using Better Auth migration tooling.');
} finally { await database.end(); }
