import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { databaseUrl } from '../configuration/environment.js';
import { withTransaction } from '../database/database.service.js';

const [email, role, name] = process.argv.slice(2);
if (!email || !['admin', 'recruiter', 'interviewer'].includes(role ?? '') || !name) {
  throw new Error('Usage: pnpm staff:provision email role "Name" (admin/recruiter/interviewer).');
}
const database = new Pool({ connectionString: databaseUrl(), connectionTimeoutMillis: 3000 });
try {
  await withTransaction(database, async client => {
    await client.query(`INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
    VALUES ($1,$2,$3,false,now(),now(),$4)
    ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, "updatedAt" = now()`,
    [randomUUID(), name, email.trim().toLowerCase(), role]);
    await client.query('DELETE FROM session WHERE "userId" = (SELECT id FROM "user" WHERE email = $1)', [email.trim().toLowerCase()]);
  });
  console.log('Staff account provisioned; email verification is still required to sign in.');
} finally { await database.end(); }
