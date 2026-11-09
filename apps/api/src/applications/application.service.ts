import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { validateSubmission, uploadLimits } from '@recruitment/domain/applications';
import { vacancyListSchema, type Vacancy } from '@recruitment/domain/vacancies';
import { z } from 'zod';
import { DatabaseService } from '../database/database.service.js';
import { DOCUMENT_STORAGE, type DocumentStorage } from '../documents/document-storage.js';
import type { AuthenticatedRequest } from '../auth/access.js';
import { roleAllows, type ApplicationView, type ReviewMetadata } from '@recruitment/domain';
import { applicationActions, canReadApplication } from './application.policy.js';
import { applicationFilterShape } from './application-filters.js';
import { processingClosed, type ProcessingBoundary } from '../processing/processing-policy.js';
import { readinessView, reviewReadinessSql } from '../review/review-readiness.js';
import { applicationWorkSql,recruitmentStatusSql } from './application-work.js';
import { candidateStage } from './candidate-stage.js';

type Actor = AuthenticatedRequest['actor'];
const applicationListSchema=vacancyListSchema.pick({limit:true,offset:true}).extend({
  ...applicationFilterShape,
  sort: z.enum(['newest','oldest','candidate','position']).optional().default('newest'),
});
interface ApplicationRow {
  id: string; vacancy_id: string; candidate_id: string; candidate_identity: { name: string; email: string };
  vacancy_snapshot: Vacancy; answers: Record<string, unknown>; stage: string; processing_state: string; submitted_at: Date;
  review_status: ReviewMetadata['status']; review_revision: number; reviewed_by: string | null; reviewed_at: Date | null;
  processing_released_at: Date | null;
}
interface DocumentRow { id: string; input_id: string; filename: string; byte_count: number; media_type: string; storage_ref: string; content_hash: string }
function document(row: DocumentRow) { return { id: row.id, inputId: row.input_id, filename: row.filename, byteCount: row.byte_count, mediaType: row.media_type }; }
function visible(row: ApplicationRow, actor: Actor):Omit<ApplicationView,'documents'> {
  const vacancy = row.vacancy_snapshot;
  return { id: row.id, vacancyId: row.vacancy_id, candidateId: row.candidate_id, candidate: row.candidate_identity,
    vacancy: { id: vacancy.id, title: vacancy.title, description: vacancy.description, ...(vacancy.location === undefined ? {} : { location: vacancy.location }), revision: vacancy.revision, formDefinition: vacancy.formDefinition,
      ...(roleAllows(actor.role,'review.read') ? { processingDefinition: vacancy.processingDefinition } : {}) },
    answers: row.answers, stage: actor.role==='candidate'?candidateStage(row.stage):row.stage, processingState: row.processing_state, submittedAt: new Date(row.submitted_at).toISOString(),
    ...(roleAllows(actor.role,'review.read') ? { processingClosed:processingClosed(row),review: { required:vacancy.processingDefinition.tasks.length>0,status: row.review_status,revision: row.review_revision,reviewedBy: row.reviewed_by,reviewedAt: row.reviewed_at?new Date(row.reviewed_at).toISOString():null }, actions:applicationActions(actor) } : {}) };
}
@Injectable()
export class ApplicationService {
  constructor(private readonly database: DatabaseService, @Inject(DOCUMENT_STORAGE) private readonly storage: DocumentStorage) {}
  private async authorize(actor: Actor, candidateId: string, applicationId:string) {
    let hasAssignment=false;
    if(actor.role==='interviewer') {
      const result=await this.database.query("SELECT id FROM interviews WHERE application_id=$1 AND interviewer_id=$2 AND status IN ('scheduled','completed') LIMIT 1",[applicationId,actor.id]);
      hasAssignment=result.rows.length>0;
    }
    if (!canReadApplication(actor,candidateId,hasAssignment)) throw new NotFoundException('Application not found.');
  }
  async submit(vacancyId: string, actor: Actor, body: unknown, files: Express.Multer.File[]) {
    if (!roleAllows(actor.role,'application.submit')) throw new ForbiddenException('Only candidates can submit applications.');
    if (!body || typeof body !== 'object' || Object.keys(body).length !== 1 || !Object.hasOwn(body, 'answers') || typeof (body as { answers: unknown }).answers !== 'string') throw new BadRequestException('Multipart body requires only an answers JSON field.');
    const text = (body as { answers: string }).answers;
    if (Buffer.byteLength(text) > uploadLimits.answersBytes) throw new BadRequestException('Answers exceed the 256 KiB limit.');
    let rawAnswers: unknown;
    try { rawAnswers = JSON.parse(text); } catch { throw new BadRequestException('Answers must contain valid JSON.'); }
    const id = randomUUID(), stored: string[] = [];
    try {
      const result = await this.database.transaction(async client => {
        // Serializes duplicate attempts, including independent API instances.
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))', [actor.id, vacancyId]);
        const existing = await client.query<ApplicationRow>('SELECT * FROM applications WHERE candidate_id=$1 AND vacancy_id=$2', [actor.id, vacancyId]);
        if (existing.rows[0]) return { created: false, id: existing.rows[0].id };
        // Close and submit cannot both act on an outdated published state.
        const vacancyResult = await client.query('SELECT * FROM vacancies WHERE id=$1 FOR SHARE', [vacancyId]);
        const row = vacancyResult.rows[0];
        if (!row) throw new NotFoundException('Vacancy not found.');
        if (row.status !== 'published') throw new ConflictException('Vacancy is not open for applications.');
        const snapshot: Vacancy = { id: row.id, ownerId: row.owner_id, title: row.title, description: row.description, ...(row.location === null ? {} : { location: row.location }), status: row.status, revision: row.revision,
          formDefinition: row.form_definition, processingDefinition: row.processing_definition, createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() };
        const normalized = files.map(file => ({ ...file, originalname: file.originalname.replace(/[\\/]/g, '_').replace(/[\x00-\x1f\x7f]/g, '_').slice(0, 200) }));
        const checked = validateSubmission(snapshot.formDefinition, rawAnswers, normalized.map(file => ({ inputId: file.fieldname, filename: file.originalname, byteCount: file.size })));
        if (checked.issues.length) throw new BadRequestException({ statusCode: 400, error: 'Bad Request', message: 'Invalid application submission.', issues: checked.issues });
        const needsExtraction=snapshot.processingDefinition.tasks.length>0;
        await client.query(`INSERT INTO applications(id,vacancy_id,candidate_id,candidate_identity,vacancy_snapshot,answers,processing_state,review_status)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [id, vacancyId, actor.id, JSON.stringify({ name: actor.name, email: actor.email }), JSON.stringify(snapshot), JSON.stringify(checked.answers), needsExtraction ? 'pending' : 'not_requested',needsExtraction?'pending':'completed']);
        for (const file of normalized) {
          const storageRef = await this.storage.put(file.buffer); stored.push(storageRef);
          const fileId = randomUUID();
          // Files are untrusted: no supplied MIME type is accepted, no inline serving.
          await client.query('INSERT INTO stored_files(id,storage_ref,content_hash,byte_count,filename,media_type) VALUES ($1,$2,$3,$4,$5,$6)', [fileId, storageRef, createHash('sha256').update(file.buffer).digest('hex'), file.size, file.originalname, 'application/octet-stream']);
          await client.query('INSERT INTO application_documents(id,application_id,input_id,stored_file_id) VALUES ($1,$2,$3,$4)', [randomUUID(), id, file.fieldname, fileId]);
        }
        return { created: true, id };
      });
      return { created: result.created, application: await this.get(result.id, actor) };
    } catch (error) {
      // COMMIT/connection failures can have ambiguous outcomes. Never delete bytes
      // if a committed application exists or its existence cannot be checked.
      const persisted = await this.database.query('SELECT id FROM applications WHERE id=$1', [id]).then(result => !!result.rowCount).catch(() => true);
      if (!persisted) for (const ref of stored) await this.storage.remove(ref).catch(() => { /* Orphan retained for reconciliation; never public. */ });
      throw error;
    }
  }
  async get(id: string, actor: Actor):Promise<ApplicationView> {
    const result = await this.database.query<ApplicationRow>('SELECT * FROM applications WHERE id=$1', [id]);
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Application not found.');
    await this.authorize(actor, row.candidate_id,id);
    const refs = await this.database.query<DocumentRow>(`SELECT d.id,d.input_id,f.filename,f.byte_count,f.media_type FROM application_documents d JOIN stored_files f ON f.id=d.stored_file_id WHERE d.application_id=$1 ORDER BY d.input_id`, [id]);
    return { ...visible(row, actor), documents: refs.rows.map(document) };
  }
  async ownForVacancy(vacancyId:string,actor:Actor){
    if(actor.role!=='candidate')throw new ForbiddenException('Candidate account required.');
    const result=await this.database.query<{id:string}>('SELECT id FROM applications WHERE vacancy_id=$1 AND candidate_id=$2',[vacancyId,actor.id]);
    return {applicationId:result.rows[0]?.id??null};
  }
  async list(actor: Actor, query: unknown, vacancyId?: string) {
    if (!roleAllows(actor.role,vacancyId?'application.listVacancy':'application.list')) throw new ForbiddenException('Staff access required.');
    const parsed = applicationListSchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException('Invalid pagination.');
    const { limit, offset,processing,review,readiness,sort,undecided,from,before,work,recruitmentStatus } = parsed.data;
    if((work||recruitmentStatus)&&!roleAllows(actor.role,'review.read'))throw new ForbiddenException('Work/status filters require staff access.');
    if(from&&before&&from>=before)throw new BadRequestException('Submitted before must be after submitted from.');
    if((undecided||from||before)&&!roleAllows(actor.role,'workflow.read'))throw new ForbiddenException('Screening filters require staff access.');
    if((review||readiness)&&!roleAllows(actor.role,'review.read'))throw new ForbiddenException('Review filters require staff access.');
    const order=sort==='candidate'?"lower(candidate_identity->>'name'),id":sort==='position'?'lower(title),id':sort==='oldest'?'submitted_at,id':'submitted_at DESC,id DESC';
    const hr=roleAllows(actor.role,'review.read');
    const result = await this.database.query(`WITH scoped AS (SELECT id,vacancy_id,candidate_id,candidate_identity,stage,processing_state,submitted_at,review_status,review_revision,reviewed_by,reviewed_at,processing_released_at,${hr?applicationWorkSql:'NULL::text'} AS work_item,${recruitmentStatusSql} AS recruitment_status,${hr?reviewReadinessSql:'NULL::text'} AS readiness,vacancy_snapshot->>'title' AS title,jsonb_array_length(vacancy_snapshot->'processingDefinition'->'tasks')>0 AS review_required,
      EXISTS(SELECT 1 FROM extraction_corrections c WHERE c.application_id=applications.id) AS has_corrections FROM applications
      WHERE ($1::text IS NULL OR candidate_id=$1) AND ($2::uuid IS NULL OR vacancy_id=$2)),
       visible AS (SELECT * FROM scoped WHERE ($5::text IS NULL OR processing_state=$5) AND ($6::text IS NULL OR (review_required AND review_status=$6))
           AND (NOT $7::boolean OR stage IN ('received','review_ready')) AND ($8::timestamptz IS NULL OR submitted_at >= $8) AND ($9::timestamptz IS NULL OR submitted_at < $9) AND ($10::text IS NULL OR readiness=$10)
           AND ($11::text IS NULL OR work_item=$11) AND ($12::text IS NULL OR recruitment_status=$12)),
      page AS (SELECT * FROM visible ORDER BY ${order} LIMIT $3 OFFSET $4)
        SELECT (SELECT count(*)::integer FROM visible) AS total,coalesce((SELECT bool_or(review_required) FROM scoped),false) AS review_required,coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY ${order}) FROM page),'[]') AS items`, [actor.role === 'candidate' ? actor.id : null, vacancyId ?? null, limit, offset,processing??null,review??null,undecided==='true',from?`${from}T00:00:00Z`:null,before?`${before}T00:00:00Z`:null,readiness??null,work??null,recruitmentStatus??null]);
    return { items: result.rows[0].items.map((row: Record<string, any> & ProcessingBoundary) => ({ id: row.id, vacancyId: row.vacancy_id, vacancyTitle: row.title, candidateId: row.candidate_id, candidate: row.candidate_identity, stage: actor.role==='candidate'?candidateStage(row.stage):row.stage, processingState: row.processing_state, submittedAt: new Date(row.submitted_at).toISOString(), ...(hr ? { workItem:row.work_item,readiness:readinessView(row.readiness),processingClosed:processingClosed(row),review: { required:row.review_required,hasCorrections:row.has_corrections,status: row.review_status,revision: row.review_revision,reviewedBy: row.reviewed_by,reviewedAt: row.reviewed_at } } : {}) })), total: result.rows[0].total, limit, offset,...(hr?{workFiltersSupported:true,reviewRequired:result.rows[0].review_required}:{}) };
  }
  async download(applicationId: string, documentId: string, actor: Actor) {
    const owner = await this.database.query<ApplicationRow>('SELECT * FROM applications WHERE id=$1', [applicationId]);
    if (!owner.rows[0]) throw new NotFoundException('Document not found.');
    await this.authorize(actor, owner.rows[0].candidate_id,applicationId);
    const result = await this.database.query<DocumentRow>(`SELECT d.id,d.input_id,f.filename,f.byte_count,f.media_type,f.storage_ref,f.content_hash FROM application_documents d JOIN stored_files f ON f.id=d.stored_file_id WHERE d.application_id=$1 AND d.id=$2`, [applicationId, documentId]);
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Document not found.');
    let bytes: Buffer;
    try { bytes = await this.storage.read(row.storage_ref); } catch { throw new ServiceUnavailableException('Document storage unavailable.'); }
    if (bytes.length !== row.byte_count || createHash('sha256').update(bytes).digest('hex') !== row.content_hash) throw new ServiceUnavailableException('Document integrity check failed.');
    return { bytes, filename: row.filename };
  }
}
