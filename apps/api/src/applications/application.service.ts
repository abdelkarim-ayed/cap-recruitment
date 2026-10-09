import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { validateSubmission, uploadLimits } from '@recruitment/domain/applications';
import { vacancyListSchema, type Vacancy } from '@recruitment/domain/vacancies';
import { DatabaseService } from '../database/database.service.js';
import { DOCUMENT_STORAGE, type DocumentStorage } from '../documents/document-storage.js';
import type { AuthenticatedRequest } from '../auth/access.js';

type Actor = AuthenticatedRequest['actor'];
interface ApplicationRow {
  id: string; vacancy_id: string; candidate_id: string; candidate_identity: { name: string; email: string };
  vacancy_snapshot: Vacancy; answers: Record<string, unknown>; stage: string; processing_state: string; submitted_at: Date;
}
interface DocumentRow { id: string; input_id: string; filename: string; byte_count: number; media_type: string; storage_ref: string; content_hash: string }
function document(row: DocumentRow) { return { id: row.id, inputId: row.input_id, filename: row.filename, byteCount: row.byte_count, mediaType: row.media_type }; }
function visible(row: ApplicationRow, actor: Actor) {
  const vacancy = row.vacancy_snapshot;
  return { id: row.id, vacancyId: row.vacancy_id, candidateId: row.candidate_id, candidate: row.candidate_identity,
    vacancy: { id: vacancy.id, title: vacancy.title, description: vacancy.description, ...(vacancy.location === undefined ? {} : { location: vacancy.location }), revision: vacancy.revision, formDefinition: vacancy.formDefinition,
      ...(actor.role === 'candidate' ? {} : { processingDefinition: vacancy.processingDefinition }) },
    answers: row.answers, stage: row.stage, processingState: row.processing_state, submittedAt: new Date(row.submitted_at).toISOString() };
}
@Injectable()
export class ApplicationService {
  constructor(private readonly database: DatabaseService, @Inject(DOCUMENT_STORAGE) private readonly storage: DocumentStorage) {}
  private authorize(actor: Actor, candidateId: string) {
    if (!['candidate', 'admin', 'recruiter'].includes(actor.role) || (actor.role === 'candidate' && actor.id !== candidateId)) throw new NotFoundException('Application not found.');
  }
  async submit(vacancyId: string, actor: Actor, body: unknown, files: Express.Multer.File[]) {
    if (actor.role !== 'candidate') throw new ForbiddenException('Only candidates can submit applications.');
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
        await client.query(`INSERT INTO applications(id,vacancy_id,candidate_id,candidate_identity,vacancy_snapshot,answers,processing_state)
          VALUES ($1,$2,$3,$4,$5,$6,$7)`, [id, vacancyId, actor.id, JSON.stringify({ name: actor.name, email: actor.email }), JSON.stringify(snapshot), JSON.stringify(checked.answers), snapshot.processingDefinition.tasks.length ? 'pending' : 'not_requested']);
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
  async get(id: string, actor: Actor) {
    const result = await this.database.query<ApplicationRow>('SELECT * FROM applications WHERE id=$1', [id]);
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Application not found.');
    this.authorize(actor, row.candidate_id);
    const refs = await this.database.query<DocumentRow>(`SELECT d.id,d.input_id,f.filename,f.byte_count,f.media_type FROM application_documents d JOIN stored_files f ON f.id=d.stored_file_id WHERE d.application_id=$1 ORDER BY d.input_id`, [id]);
    return { ...visible(row, actor), documents: refs.rows.map(document) };
  }
  async list(actor: Actor, query: unknown, vacancyId?: string) {
    if (!['candidate', 'admin', 'recruiter'].includes(actor.role) || (vacancyId && actor.role === 'candidate')) throw new ForbiddenException('Staff access required.');
    const parsed = vacancyListSchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException('Invalid pagination.');
    const { limit, offset } = parsed.data;
    const result = await this.database.query(`WITH visible AS (SELECT id,vacancy_id,candidate_id,candidate_identity,stage,processing_state,submitted_at,vacancy_snapshot->>'title' AS title FROM applications
      WHERE ($1::text IS NULL OR candidate_id=$1) AND ($2::uuid IS NULL OR vacancy_id=$2)),
      page AS (SELECT * FROM visible ORDER BY submitted_at DESC,id DESC LIMIT $3 OFFSET $4)
      SELECT (SELECT count(*)::integer FROM visible) AS total,coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY submitted_at DESC,id DESC) FROM page),'[]') AS items`, [actor.role === 'candidate' ? actor.id : null, vacancyId ?? null, limit, offset]);
    return { items: result.rows[0].items.map((row: Record<string, any>) => ({ id: row.id, vacancyId: row.vacancy_id, vacancyTitle: row.title, candidateId: row.candidate_id, candidate: row.candidate_identity, stage: row.stage, processingState: row.processing_state, submittedAt: new Date(row.submitted_at).toISOString() })), total: result.rows[0].total, limit, offset };
  }
  async download(applicationId: string, documentId: string, actor: Actor) {
    const owner = await this.database.query<ApplicationRow>('SELECT * FROM applications WHERE id=$1', [applicationId]);
    if (!owner.rows[0]) throw new NotFoundException('Document not found.');
    this.authorize(actor, owner.rows[0].candidate_id);
    const result = await this.database.query<DocumentRow>(`SELECT d.id,d.input_id,f.filename,f.byte_count,f.media_type,f.storage_ref,f.content_hash FROM application_documents d JOIN stored_files f ON f.id=d.stored_file_id WHERE d.application_id=$1 AND d.id=$2`, [applicationId, documentId]);
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Document not found.');
    let bytes: Buffer;
    try { bytes = await this.storage.read(row.storage_ref); } catch { throw new ServiceUnavailableException('Document storage unavailable.'); }
    if (bytes.length !== row.byte_count || createHash('sha256').update(bytes).digest('hex') !== row.content_hash) throw new ServiceUnavailableException('Document integrity check failed.');
    return { bytes, filename: row.filename };
  }
}
