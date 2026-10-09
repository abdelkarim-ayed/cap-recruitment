import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { RUNTIME_CONFIG, type RuntimeConfig } from '../configuration/runtime-config.js';

export async function withTransaction<T>(pool: Pick<Pool, 'connect'>, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* Preserve the original failure. */ }
    throw error;
  } finally { client.release(); }
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool: Pool;
  constructor(@Inject(RUNTIME_CONFIG) settings: RuntimeConfig) {
    this.pool = new Pool({ connectionString: settings.databaseUrl, connectionTimeoutMillis: 3000, query_timeout: 3000 });
  }
  query<T extends QueryResultRow>(text: string, values?: unknown[]) { return this.pool.query<T>(text, values); }
  transaction<T>(work: (client: PoolClient) => Promise<T>) { return withTransaction(this.pool, work); }
  async check() { await this.pool.query('SELECT 1'); }
  async onModuleDestroy() { await this.pool.end(); }
}
