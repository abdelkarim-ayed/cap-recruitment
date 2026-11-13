import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient, QueryResultRow } from 'pg';
import type { CreateVacancy, FormDefinition, ProcessingDefinition, Vacancy } from '@recruitment/domain/vacancies';
import { DatabaseService } from '../database/database.service.js';

interface VacancyRow extends QueryResultRow {
  id: string; owner_id: string; status: Vacancy['status']; revision: number;
  interview_revision: number;
  extraction_reference_date: string | null;
  title: string; description: string; location: string | null;
  form_definition: FormDefinition; processing_definition: ProcessingDefinition;
  created_at: Date | string; updated_at: Date | string;
  owner_name?: string; owner_email?: string;
}
type SummaryRow = Pick<VacancyRow, 'id' | 'owner_id' | 'owner_name' | 'owner_email' | 'status' | 'revision' | 'title' | 'location' | 'created_at' | 'updated_at'>;
interface PageRow extends QueryResultRow { total: number; items: SummaryRow[] }
interface CandidatePageRow extends QueryResultRow {total:number;items:Pick<SummaryRow,'id'|'title'|'location'|'created_at'>[]}
export interface PublicationPlan {
  revision: number;
  entries: { position: number; name: string; instructions: string }[];
}

function record(row: VacancyRow): Vacancy {
  if (row.processing_definition.version !== 2) throw new ConflictException('This disposable legacy vacancy needs recreation for the CV extractor schema; no historical conversion is performed.');
  return { id: row.id, ownerId: row.owner_id, status: row.status, revision: row.revision, title: row.title, description: row.description,
    ...(row.location === null ? {} : { location: row.location }), formDefinition: row.form_definition, processingDefinition: row.processing_definition,
    extractionReferenceDate: row.extraction_reference_date ?? null,
    createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString(), ...(row.owner_email?{owner:{name:row.owner_name??'',email:row.owner_email}}:{}) };
}
@Injectable()
export class VacancyRepository {
  constructor(private readonly database: DatabaseService) {}
  async create(ownerId: string, value: CreateVacancy) {
    const result = await this.database.query<VacancyRow>(`INSERT INTO vacancies (id,owner_id,title,description,location,form_definition,processing_definition)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *, extraction_reference_date::text AS extraction_reference_date, (SELECT name FROM "user" WHERE id=owner_id) AS owner_name, (SELECT email FROM "user" WHERE id=owner_id) AS owner_email`, [randomUUID(), ownerId, value.title, value.description, value.location ?? null, JSON.stringify(value.formDefinition), JSON.stringify(value.processingDefinition)]);
    return record(result.rows[0]);
  }
  async get(id: string, publicOnly = false) {
    const result = await this.database.query<VacancyRow>('SELECT v.*,v.extraction_reference_date::text AS extraction_reference_date,u.name AS owner_name,u.email AS owner_email FROM vacancies v JOIN "user" u ON u.id=v.owner_id WHERE v.id=$1 AND ($2::boolean=false OR v.status=\'published\')', [id, publicOnly]);
    return result.rows[0] ? record(result.rows[0]) : undefined;
  }
  async owners(){
    const result=await this.database.query<{id:string;name:string;email:string}>(`SELECT u.id,u.name,u.email FROM "user" u
      WHERE EXISTS(SELECT 1 FROM vacancies v WHERE v.owner_id=u.id) ORDER BY lower(u.name),u.email,u.id`);
    return {items:result.rows};
  }
  async list(publicOnly: boolean, limit: number, offset: number, status?: Vacancy['status'], sort='newest',ownerId?:string) {
    const order = sort==='title'?'lower(title),id':sort==='oldest'?'created_at,id':'created_at DESC,id DESC';
    // One statement gives a consistent total/page even when the page is empty.
    const result = await this.database.query<PageRow>(`WITH visible AS (
      SELECT v.id,owner_id,u.name AS owner_name,u.email AS owner_email,title,location,status,revision,created_at,updated_at FROM vacancies v JOIN "user" u ON u.id=v.owner_id WHERE ($1::boolean=false OR status='published') AND ($4::text IS NULL OR status=$4) AND ($5::text IS NULL OR owner_id=$5)
    ), page AS (SELECT * FROM visible ORDER BY ${order} LIMIT $2 OFFSET $3)
    SELECT (SELECT count(*)::integer FROM visible) AS total, coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY ${order}) FROM page),'[]'::jsonb) AS items`, [publicOnly, limit, offset, status??null,ownerId??null]);
    const items = result.rows[0].items.map(row => ({ id: row.id, title: row.title, ...(row.location === null ? {} : { location: row.location }),
      ...(publicOnly ? {} : { ownerId: row.owner_id, owner:{name:row.owner_name??'',email:row.owner_email??''}, status: row.status, revision: row.revision, createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() }) }));
    return { items, total: result.rows[0].total, limit, offset };
  }
  async change(id: string, operation: (current: Vacancy, readPlan: () => Promise<PublicationPlan>) => Vacancy | Promise<Vacancy>) {
    return this.database.transaction(async client => {
      const result = await client.query<VacancyRow>('SELECT v.*,v.extraction_reference_date::text AS extraction_reference_date,u.name AS owner_name,u.email AS owner_email FROM vacancies v JOIN "user" u ON u.id=v.owner_id WHERE v.id=$1 FOR UPDATE OF v', [id]);
      if (!result.rows[0]) return undefined;
      const current = record(result.rows[0]);
      // Read only when publication needs it, using the same locked transaction.
      const next = await operation(current, async () => ({
        revision: result.rows[0].interview_revision,
        entries: (await client.query<PublicationPlan['entries'][number]>('SELECT position,name,instructions FROM interview_steps WHERE vacancy_id=$1 ORDER BY position', [id])).rows,
      }));
      if (next === current) return current;
      return this.save(client, next);
    });
  }
  async listForCandidate(candidateId:string,limit:number,offset:number,sort:string,notApplied:boolean){
    const order=sort==='title'?'lower(title),id':sort==='oldest'?'created_at,id':'created_at DESC,id DESC';
    const result=await this.database.query<CandidatePageRow>(`WITH visible AS (
      SELECT v.id,v.title,v.location,v.created_at FROM vacancies v WHERE v.status='published'
      AND (NOT $1::boolean OR NOT EXISTS(SELECT 1 FROM applications a WHERE a.vacancy_id=v.id AND a.candidate_id=$2))
    ), page AS (SELECT * FROM visible ORDER BY ${order} LIMIT $3 OFFSET $4)
    SELECT (SELECT count(*)::integer FROM visible) AS total,coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY ${order}) FROM page),'[]'::jsonb) AS items`,[notApplied,candidateId,limit,offset]);
    return {items:result.rows[0].items.map(row=>({id:row.id,title:row.title,...(row.location===null?{}:{location:row.location})})),total:result.rows[0].total,limit,offset};
  }
  private async save(client: PoolClient, next: Vacancy) {
    const result = await client.query<VacancyRow>(`UPDATE vacancies SET status=$2,revision=revision+1,title=$3,description=$4,location=$5,
      form_definition=$6,processing_definition=$7,updated_at=now(),
      extraction_reference_date=CASE WHEN status='draft' AND $2='published' AND extraction_reference_date IS NULL THEN (statement_timestamp() AT TIME ZONE 'UTC')::date ELSE extraction_reference_date END
      WHERE id=$1 RETURNING *, extraction_reference_date::text AS extraction_reference_date, (SELECT name FROM "user" WHERE id=owner_id) AS owner_name, (SELECT email FROM "user" WHERE id=owner_id) AS owner_email`,
    [next.id, next.status, next.title, next.description, next.location ?? null, JSON.stringify(next.formDefinition), JSON.stringify(next.processingDefinition)]);
    return record(result.rows[0]);
  }
}
