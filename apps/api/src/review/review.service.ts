import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import type { Vacancy } from '@recruitment/domain/vacancies';
import { extractorRegistry, type ReviewTask } from '@recruitment/domain';
import { DatabaseService } from '../database/database.service.js';
import type { AuthenticatedRequest } from '../auth/access.js';
import { availability, firstDenied, requirePolicy, rolePolicy } from '../auth/action-policy.js';
import { reviewEditable, reviewReleasable } from './review.policy.js';
import { reviewReadiness, processingClosed, reviewReadinessSql } from './review-readiness.js';
import type { ReviewView } from '@recruitment/domain';
import { screeningExportSchema } from '../applications/application-filters.js';
import { applicationWorkSql,recruitmentStatusSql } from '../applications/application-work.js';
import { RUNTIME_CONFIG, type RuntimeConfig } from '../configuration/runtime-config.js';
import { decisionHeaders, decisionValues } from './decision-export.js';

const patchSchema = z.strictObject({ expectedRevision: z.number().int().positive(), status: z.enum(['pending','in_review','completed']).optional(), corrections: z.array(z.strictObject({ taskId: z.string().min(1).max(64), questionId: z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/), value: z.union([z.string(),z.boolean(),z.number().int().nonnegative()]).nullable(), remove: z.boolean().optional() })).max(100).optional() }).refine(value => value.status !== undefined || (value.corrections?.length ?? 0) > 0, 'Supply status or corrections.');
const releaseSchema = z.strictObject({ expectedRevision: z.number().int().positive() });
function csvCell(value: unknown) {
  let text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g,'""')}"`;
}
export function csvRow(values: unknown[]) { return values.map(csvCell).join(',')+'\r\n'; }
@Injectable()
export class ReviewService {
  constructor(private readonly database: DatabaseService,@Inject(RUNTIME_CONFIG) private readonly settings:Pick<RuntimeConfig,'webOrigin'>) {}
  private async read(client: PoolClient, id: string, lock = 'FOR SHARE') {
    const result = await client.query(`SELECT * FROM applications WHERE id=$1 ${lock}`, [id]);
    const application = result.rows[0]; if (!application) throw new NotFoundException('Application not found.');
    const editor=application.reviewed_by?(await client.query('SELECT id,name,email FROM "user" WHERE id=$1',[application.reviewed_by])).rows[0]??null:null;
    application.review_editor=editor;
    application.release_actor=application.processing_released_by?(await client.query('SELECT id,name,email FROM "user" WHERE id=$1',[application.processing_released_by])).rows[0]??null:null;
    const tasks = await client.query('SELECT * FROM application_tasks WHERE application_id=$1', [id]);
    const corrections = await client.query(`SELECT c.*,u.name AS corrected_name,u.email AS corrected_email FROM extraction_field_corrections c LEFT JOIN "user" u ON u.id=c.corrected_by WHERE c.application_id=$1`, [id]);
    const vacancy: Vacancy = application.vacancy_snapshot;
    if (vacancy.processingDefinition.tasks.length && (vacancy.processingDefinition.version !== 2 || !vacancy.extractionReferenceDate)) throw new ConflictException('This legacy extraction dataset needs recreation; frozen results are not migrated.');
    return { application, tasks: vacancy.processingDefinition.tasks.map(definition => {
      const row = tasks.rows.find(task => task.task_id === definition.id);
      const result = row?.result ?? { status: row?.status ?? 'pending', value: null };
      const saved = corrections.rows.filter(c => c.task_id === definition.id);
      const fields = extractorRegistry[definition.type].project(definition.args, definition.outputKey, vacancy.extractionReferenceDate!, result.status === 'completed' ? result.value.fields : null, saved.map(c => ({questionId:c.question_id,value:c.value}))).map(field => {
        const correction = saved.find(c => c.question_id === field.questionId);
        return {...field,correction:correction?.value??null,correctedBy:correction?.corrected_by??null,correctedAt:correction?.corrected_at?new Date(correction.corrected_at).toISOString():null,
          corrector:correction?.corrected_email?{id:correction.corrected_by,name:correction.corrected_name,email:correction.corrected_email}:null};
      });
      return { taskId: definition.id, sourceInputId: definition.sourceInputId, outputKey: definition.outputKey, status: row?.status ?? 'pending', attempts: row?.attempts ?? 0, retryable: row?.retryable ?? false,
        failureCategory: row?.failure_category ?? null, result, fields, provenance: row?.provenance ?? null, hasCorrection: fields.some(f=>f.hasCorrection), effectiveValue:Object.fromEntries(fields.map(f=>[f.questionId,f.effective])) };
    }) as ReviewTask[] };
  }
  private projection(view: Awaited<ReturnType<ReviewService['read']>>,actor:AuthenticatedRequest['actor']):ReviewView {
    const { application: row, tasks } = view;
    const readiness = reviewReadiness(row,tasks);
    return { applicationId: row.id, answers: row.answers, formDefinition: row.vacancy_snapshot.formDefinition,
      processingState: row.processing_state, processingClosed:processingClosed(row),readiness,
      release:row.processing_released_at?{at:new Date(row.processing_released_at).toISOString(),actor:row.release_actor}:null,
      review: { required:tasks.length>0,status: row.review_status, revision: row.review_revision, reviewedBy: row.reviewed_by, reviewedAt: row.reviewed_at, updatedAt:row.review_updated_at??null, editor:row.review_editor }, tasks,
      actions:{edit:availability(firstDenied(rolePolicy(actor,'review.edit'),reviewEditable(tasks.length>0,row.stage,row.review_status,readiness)),true),
        release:availability(firstDenied(rolePolicy(actor,'review.release'),reviewReleasable(readiness)),true)} };
  }
  get(id: string,actor:AuthenticatedRequest['actor']) { requirePolicy(rolePolicy(actor,'review.read'));return this.database.transaction(async client => this.projection(await this.read(client,id),actor)); }
  release(id: string,actor:AuthenticatedRequest['actor'],raw:unknown) {
    requirePolicy(rolePolicy(actor,'review.release'));
    const parsed=releaseSchema.safeParse(raw);
    if(!parsed.success)throw new BadRequestException('Invalid release request.');
    return this.database.transaction(async client=>{
      const view=await this.read(client,id,'FOR UPDATE');
      const readiness=reviewReadiness(view.application,view.tasks);
      // Current-revision duplicate is an unchanged response; closed/no-task
      // requests still deny, and stale duplicates never bypass concurrency.
      if(readiness.state!=='released')requirePolicy(reviewReleasable(readiness));
      if(view.application.review_revision!==parsed.data.expectedRevision)throw new ConflictException('Review changed; reload before releasing.');
      if(readiness.state==='released')return this.projection(view,actor);
      await client.query(`UPDATE applications SET processing_released_at=now(),processing_released_by=$2,
        processing_token=NULL,processing_lease_until=NULL,processing_next_at=NULL,review_revision=review_revision+1 WHERE id=$1`,[id,actor.id]);
      return this.projection(await this.read(client,id),actor);
    });
  }
  patch(id: string, actor: AuthenticatedRequest['actor'], raw: unknown) {
    requirePolicy(rolePolicy(actor,'review.edit'));
    const parsed = patchSchema.safeParse(raw);
    if (!parsed.success) throw new BadRequestException('Invalid review patch.');
    const value = parsed.data;
    if (new Set(value.corrections?.map(c => `${c.taskId}:${c.questionId}`)).size !== (value.corrections?.length ?? 0)) throw new BadRequestException('Duplicate correction field.');
    return this.database.transaction(async client => {
      const view = await this.read(client,id,'FOR UPDATE');
      requirePolicy(reviewEditable(view.tasks.length>0,view.application.stage,view.application.review_status,reviewReadiness(view.application,view.tasks)));
      if (view.application.review_revision !== value.expectedRevision) throw new ConflictException('Review changed; reload before retrying.');
      // Validate the entire set before any write or unchanged return. A no-op
      // never bypasses authority/readiness, stale revision or input validation.
      const changes=[];
      for (const correction of value.corrections ?? []) {
        const definition = (view.application.vacancy_snapshot as Vacancy).processingDefinition.tasks.find(task => task.id === correction.taskId);
        if (!definition) throw new BadRequestException('Unknown correction task.');
        if (correction.remove && correction.value !== null) throw new BadRequestException('Invalid correction removal.');
        try { extractorRegistry[definition.type].parseCorrection(definition.args, correction.questionId, correction.value); } catch { throw new BadRequestException('Invalid field/value for this extractor.'); }
        const current=view.tasks.find(task=>task.taskId===correction.taskId)!.fields.find(field=>field.questionId===correction.questionId)!;
        if(correction.remove ? current.hasCorrection : !current.hasCorrection||current.correction!==correction.value)changes.push({correction,definition});
      }
      const status = value.status ?? (changes.length ? 'in_review' : view.application.review_status);
      if(!changes.length&&status===view.application.review_status)return this.projection(view,actor);
      for(const {correction,definition} of changes){
        // Removing a known override already has its FK task; no synthetic task
        // initialization is needed for an absent removal or status-only save.
        if(correction.remove){await client.query('DELETE FROM extraction_field_corrections WHERE application_id=$1 AND task_id=$2 AND question_id=$3',[id,correction.taskId,correction.questionId]);continue;}
        await client.query(`INSERT INTO application_tasks(application_id,task_id,source_input_id,output_key,args) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, [id,definition.id,definition.sourceInputId,definition.outputKey,JSON.stringify(definition.args)]);
        await client.query(`INSERT INTO extraction_field_corrections(application_id,task_id,question_id,value,corrected_by) VALUES($1,$2,$3,$4,$5) ON CONFLICT(application_id,task_id,question_id) DO UPDATE SET value=excluded.value,corrected_by=excluded.corrected_by,corrected_at=now()`, [id,correction.taskId,correction.questionId,JSON.stringify(correction.value),actor.id]);
      }
      await client.query(`UPDATE applications SET review_status=$2,review_revision=review_revision+1,reviewed_by=$3,review_updated_at=now(),reviewed_at=CASE WHEN $2='completed' THEN now() ELSE NULL END WHERE id=$1`,[id,status,actor.id]);
      if(status==='completed')await client.query('UPDATE applications SET processing_token=NULL,processing_lease_until=NULL,processing_next_at=NULL WHERE id=$1',[id]);
      return this.projection(await this.read(client,id),actor);
    });
  }
  export(vacancyId: string,screeningQuery?:unknown) {
    const parsed=screeningQuery===undefined?undefined:screeningExportSchema.safeParse(screeningQuery);
    if(parsed&&!parsed.success)throw new BadRequestException('Invalid screening export filters.');
    const filters=parsed?.success?parsed.data:undefined;
    return this.database.transaction(async client => {
      // Repeatable snapshot prevents mixing answers/review/results from different moments.
      await client.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
      const vacancy = await client.query('SELECT * FROM vacancies WHERE id=$1',[vacancyId]);
      if (!vacancy.rows[0]) throw new NotFoundException('Vacancy not found.');
      const form: Vacancy['formDefinition'] = vacancy.rows[0].form_definition;
      const definition: Vacancy['processingDefinition'] = vacancy.rows[0].processing_definition;
      if(definition.version!==2)throw new ConflictException('This legacy vacancy needs recreation before CV export; original data is not converted.');
      const inputs = form.inputs.filter(input => input.type !== 'separator');
       const headers = filters?decisionHeaders(form,definition):['application_id','candidate_name','candidate_email','submitted_at','review_status','reviewed_by','reviewed_at',...inputs.map(input => `answer.${input.name}`),...definition.tasks.flatMap(task => [`${task.outputKey}.status`,`${task.outputKey}.reason`,`${task.outputKey}.raw_response`,`${task.outputKey}.provenance`, ...extractorRegistry[task.type].fieldIds(task.args).flatMap(id => [`${task.outputKey}.question.${id}.original`,`${task.outputKey}.question.${id}.effective`,`${task.outputKey}.question.${id}.source`,`${task.outputKey}.question.${id}.has_correction`,`${task.outputKey}.question.${id}.corrected_by`,`${task.outputKey}.question.${id}.corrected_at`])])];
      const applications = filters?await client.query(`SELECT id FROM applications WHERE vacancy_id=$1 AND stage IN ('received','review_ready')
        AND ($2::text IS NULL OR processing_state=$2) AND ($3::text IS NULL OR (jsonb_array_length(vacancy_snapshot->'processingDefinition'->'tasks')>0 AND review_status=$3))
        AND ($4::timestamptz IS NULL OR submitted_at >= $4) AND ($5::timestamptz IS NULL OR submitted_at < $5)
         AND ($6::text IS NULL OR (${reviewReadinessSql})=$6) AND ($7::text IS NULL OR (${applicationWorkSql})=$7) AND ($8::text IS NULL OR (${recruitmentStatusSql})=$8)
         ORDER BY submitted_at,id LIMIT 1001`,[vacancyId,filters.processing??null,filters.review??null,filters.from?`${filters.from}T00:00:00Z`:null,filters.before?`${filters.before}T00:00:00Z`:null,filters.readiness??null,filters.work??null,filters.recruitmentStatus??null])
        :await client.query('SELECT id FROM applications WHERE vacancy_id=$1 ORDER BY submitted_at,id LIMIT 1001',[vacancyId]);
      if (applications.rows.length > 1000) throw new BadRequestException('Export capped at 1000 applications for this checkpoint.');
      let csv = csvRow(headers), bytes = Buffer.byteLength(csv);
      for (const { id } of applications.rows) {
        const view = await this.read(client,id,'');
        const docs = await client.query('SELECT id,input_id FROM application_documents WHERE application_id=$1',[id]);
        const row = view.application;
        const line = csvRow(filters?decisionValues({id,vacancyId,title:vacancy.rows[0].title,webOrigin:this.settings.webOrigin,form,view,documents:docs.rows}):[id,row.candidate_identity.name,row.candidate_identity.email,new Date(row.submitted_at).toISOString(),row.review_status,row.reviewed_by,row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null,
          ...inputs.map(input => input.type === 'document' ? docs.rows.find(doc => doc.input_id === input.id)?.id ?? null : row.answers[input.id]),
          ...view.tasks.flatMap(task => [task.status,task.result.reason??null,task.result.value?.rawResponse??task.result.rawResponse??null,task.provenance,...task.fields.flatMap(field=>[field.original,field.effective,field.source,field.hasCorrection,field.correctedBy,field.correctedAt])])]);
        bytes += Buffer.byteLength(line); if (bytes > 10*1024*1024) throw new BadRequestException('Export exceeds 10 MiB checkpoint cap.');
        csv += line;
      }
      return csv;
    });
  }
}
