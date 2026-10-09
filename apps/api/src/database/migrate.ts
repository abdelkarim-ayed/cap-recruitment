import { createHash } from 'node:crypto';
import { Pool } from 'pg';
import { databaseUrl } from '../configuration/environment.js';
import { withTransaction } from './database.service.js';
import { applicationMigrations } from './migrations.js';

const database = new Pool({ connectionString: databaseUrl(), connectionTimeoutMillis: 3000 });
try {
  await withTransaction(database, async client => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('recruitment_application_migrations'))");
    await client.query('CREATE TABLE IF NOT EXISTS application_migrations (id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const migration of applicationMigrations) {
      const checksum = createHash('sha256').update(migration.sql).digest('hex');
      const previous = await client.query('SELECT checksum FROM application_migrations WHERE id=$1', [migration.id]);
      if (previous.rowCount) {
        if (previous.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${migration.id}`);
        continue;
      }
      await client.query(migration.sql);
      await client.query('INSERT INTO application_migrations (id,checksum) VALUES ($1,$2)', [migration.id, checksum]);
      console.log(`Applied application migration ${migration.id}.`);
    }
  });
  console.log('Application schema is up to date.');
} finally { await database.end(); }
