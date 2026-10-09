import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient, QueryResultRow } from 'pg';
import type { CreateVacancy, FormDefinition, ProcessingDefinition, Vacancy } from '@recruitment/domain/vacancies';
import { DatabaseService } from '../database/database.service.js';

interface VacancyRow extends QueryResultRow {
  id: string; owner_id: string; status: Vacancy['status']; revision: number;
  title: string; description: string; location: string | null;
  form_definition: FormDefinition; processing_definition: ProcessingDefinition;
  created_at: Date | string; updated_at: Date | string;
}
type SummaryRow = Pick<VacancyRow, 'id' | 'owner_id' | 'status' | 'revision' | 'title' | 'location' | 'created_at' | 'updated_at'>;
interface PageRow extends QueryResultRow { total: number; items: SummaryRow[] }

function record(row: VacancyRow): Vacancy {
  return { id: row.id, ownerId: row.owner_id, status: row.status, revision: row.revision, title: row.title, description: row.description,
    ...(row.location === null ? {} : { location: row.location }), formDefinition: row.form_definition, processingDefinition: row.processing_definition,
    createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() };
}
@Injectable()
export class VacancyRepository {
  constructor(private readonly database: DatabaseService) {}
  async create(ownerId: string, value: CreateVacancy) {
    const result = await this.database.query<VacancyRow>(`INSERT INTO vacancies (id,owner_id,title,description,location,form_definition,processing_definition)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [randomUUID(), ownerId, value.title, value.description, value.location ?? null, JSON.stringify(value.formDefinition), JSON.stringify(value.processingDefinition)]);
    return record(result.rows[0]);
  }
  async get(id: string, publicOnly = false) {
    const result = await this.database.query<VacancyRow>('SELECT * FROM vacancies WHERE id=$1 AND ($2::boolean=false OR status=\'published\')', [id, publicOnly]);
    return result.rows[0] ? record(result.rows[0]) : undefined;
  }
  async list(publicOnly: boolean, limit: number, offset: number) {
    // One statement gives a consistent total/page even when the page is empty.
    const result = await this.database.query<PageRow>(`WITH visible AS (
      SELECT id,owner_id,title,location,status,revision,created_at,updated_at FROM vacancies WHERE ($1::boolean=false OR status='published')
    ), page AS (SELECT * FROM visible ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3)
    SELECT (SELECT count(*)::integer FROM visible) AS total, coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY created_at DESC,id DESC) FROM page),'[]'::jsonb) AS items`, [publicOnly, limit, offset]);
    const items = result.rows[0].items.map(row => ({ id: row.id, title: row.title, ...(row.location === null ? {} : { location: row.location }),
      ...(publicOnly ? {} : { ownerId: row.owner_id, status: row.status, revision: row.revision, createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() }) }));
    return { items, total: result.rows[0].total, limit, offset };
  }
  async change(id: string, operation: (current: Vacancy) => Vacancy) {
    return this.database.transaction(async client => {
      const result = await client.query<VacancyRow>('SELECT * FROM vacancies WHERE id=$1 FOR UPDATE', [id]);
      if (!result.rows[0]) return undefined;
      const current = record(result.rows[0]);
      const next = operation(current);
      if (next === current) return current;
      return this.save(client, next);
    });
  }
  private async save(client: PoolClient, next: Vacancy) {
    const result = await client.query<VacancyRow>(`UPDATE vacancies SET status=$2,revision=revision+1,title=$3,description=$4,location=$5,
      form_definition=$6,processing_definition=$7,updated_at=now() WHERE id=$1 RETURNING *`,
    [next.id, next.status, next.title, next.description, next.location ?? null, JSON.stringify(next.formDefinition), JSON.stringify(next.processingDefinition)]);
    return record(result.rows[0]);
  }
}
