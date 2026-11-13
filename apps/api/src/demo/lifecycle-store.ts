import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { DatabaseService } from '../database/database.service.js';
import type { DocumentStorage } from '../documents/document-storage.js';
import { FixtureRegistry, type TaskFixture } from '../processing/execution.js';
import { lifecycleId, type LifecycleCatalog } from './lifecycle-catalog.js';
import { profilePdf, profileMarkdown, profileResponse } from './offline-profiles.js';
import { buildCvRequest } from '@recruitment/domain';
import { normalizeCvResponse } from '../processing/cv-response.js';

type Application = LifecycleCatalog['applications'][number];
const json = JSON.stringify;
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

export async function lifecycleTaskFixture(application: Application): Promise<TaskFixture | undefined> {
  const {scenario,job,id,documentId} = application;
  const task = job.vacancy.processingDefinition.tasks[0];
  if (!task) return;
  const category = scenario.processing === 'ordinary' ? 'ordinary_terminal' : scenario.processing === 'uncertain' ? 'uncertain' : 'operational';
  const referenceDate=job.vacancy.extractionReferenceDate!;
  const markdown = await profileMarkdown(application.profile);
  return {fixtureKey:`lifecycle-v3-${scenario.key}`,applicationId:id,documentId,sourceHash:hash(await profilePdf(application.profile)),taskId:task.id,args:task.args,referenceDate,
    markdown,result:['ordinary','operational','uncertain'].includes(scenario.processing)
      ? {status:'failed',value:null,reason:category==='uncertain'?'The automated reading could not be confirmed.':category==='operational'?'The document service did not respond in time.':'The document could not be read reliably.',retryable:false,failureCategory:category}
      : {status:'completed',response:profileResponse(application.profile,task.args,markdown,referenceDate)}};
}

async function prerequisites(client: PoolClient) {
  const table = await client.query("SELECT to_regclass('application_migrations') AS name");
  if (!table.rows[0]?.name) throw new Error('Application migrations are required; lifecycle seed never applies them.');
  const migrations = await client.query("SELECT id FROM application_migrations WHERE id IN ('007_screening_decisions','008_review_release','009_cv_request_attempts','010_cv_fields_publication')");
  if (migrations.rowCount !== 4) throw new Error('Migrations through 010 are required; apply only in a separately approved operation.');
}

// Exact reserved IDs plus parent/identity checks. Never identify reset targets by title/email prefix alone.
export async function inspectLifecycleOwnership(client: PoolClient, catalog: LifecycleCatalog) {
  const jobIds = catalog.jobs.map(job => job.vacancy.id);
  const applications = catalog.applications;
  const jobs = await client.query('SELECT id,owner_id,processing_definition FROM vacancies WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[jobIds]);
  for (const row of jobs.rows) {
    if (catalog.jobs.find(job => job.vacancy.id===row.id)?.owner.id !== row.owner_id) throw new Error('Lifecycle vacancy ownership collision; refusing reset.');
  }
  const rows = await client.query('SELECT id,vacancy_id,candidate_id,processing_state,processing_lease_until FROM applications WHERE vacancy_id=ANY($1::uuid[]) OR id=ANY($2::uuid[]) ORDER BY id FOR UPDATE',[jobIds,applications.map(application=>application.id)]);
  const candidateIds = catalog.actors.filter(actor=>actor.role==='candidate').map(actor=>actor.id);
  for (const row of rows.rows) {
    const expected = applications.find(application => application.id===row.id);
    if (expected ? expected.job.vacancy.id!==row.vacancy_id || expected.candidate.id!==row.candidate_id
      : !jobIds.includes(row.vacancy_id) || !candidateIds.includes(row.candidate_id)) {
      throw new Error('Unowned application inside lifecycle scope; preserve it before resetting.');
    }
    // Do not race a worker/admitted request. No recovery or lease clearing here.
    if (row.processing_state==='processing' || row.processing_lease_until) throw new Error('Lifecycle processing is active or leased; reset refused.');
  }
  const applicationIds = rows.rows.map(row=>row.id);
  const extraApplicationIds = applicationIds.filter(id=>!applications.some(application=>application.id===id));
  const files = await client.query('SELECT id,application_id,stored_file_id FROM application_documents WHERE application_id=ANY($1::uuid[]) OR stored_file_id=ANY($2::uuid[])',[applicationIds,applications.map(application=>application.fileId)]);
  for (const row of files.rows) {
    const expected = applications.find(application=>application.documentId===row.id);
    const canonicalFile = applications.some(application=>application.fileId===row.stored_file_id);
    if (expected ? expected.id!==row.application_id || expected.fileId!==row.stored_file_id
      : canonicalFile || !extraApplicationIds.includes(row.application_id)) throw new Error('Unowned document reference; reset refused.');
  }
  const nonFixture = await client.query("SELECT application_id FROM application_tasks WHERE application_id=ANY($1::uuid[]) AND attempts>0 AND provenance->>'mode' IS DISTINCT FROM 'fixture'",[applicationIds]);
  if (nonFixture.rowCount) throw new Error('Non-fixture or uncertain executor history exists; reset refused. Preserve and review it separately.');
  const guarded = await client.query("SELECT request_hash FROM cv_request_attempts WHERE application_id=ANY($1::uuid[]) AND mode='live'",[applicationIds]);
  if(guarded.rowCount)throw new Error('Durable live request history exists; fixture reset refused. The request ledger is never cleared by demo reset.');
  return {jobs:jobs.rows.length,legacyDefinition:jobs.rows.some(row=>row.processing_definition?.version!==2),applications:rows.rows.length,applicationIds,extraFileIds:files.rows.filter(row=>extraApplicationIds.includes(row.application_id)).map(row=>row.stored_file_id)};
}

async function accounts(client: PoolClient, catalog: LifecycleCatalog, passwordHash: string) {
  for (const actor of catalog.actors) {
    const rows = await client.query('SELECT id,email,role FROM "user" WHERE id=$1 OR email=$2 FOR UPDATE',[actor.id,actor.email]);
    if (rows.rows.some(row=>row.id!==actor.id||row.email!==actor.email||row.role!==actor.role)) throw new Error(`Lifecycle account collision: ${actor.key}.`);
    await client.query('INSERT INTO "user"(id,name,email,"emailVerified",role,"createdAt","updatedAt") VALUES($1,$2,$3,true,$4,$5,$5) ON CONFLICT(id) DO NOTHING',[actor.id,actor.name,actor.email,actor.role,actor.createdAt]);
    await client.query(`INSERT INTO account(id,"accountId","providerId","userId",password,"createdAt","updatedAt")
      SELECT $1,$2,'credential',$2,$3,$4,$4 WHERE NOT EXISTS(SELECT 1 FROM account WHERE "userId"=$2 AND "providerId"='credential')`,[lifecycleId(`credential:${actor.key}`),actor.id,passwordHash,actor.createdAt]);
  }
}

async function clearDataset(client: PoolClient, catalog: LifecycleCatalog, owned: Awaited<ReturnType<typeof inspectLifecycleOwnership>>) {
  const jobs = catalog.jobs.map(job=>job.vacancy.id), applications = owned.applicationIds;
  await client.query('DELETE FROM inbox_notifications WHERE interview_id IN (SELECT id FROM interviews WHERE vacancy_id=ANY($1::uuid[]))',[jobs]);
  await client.query('DELETE FROM screening_notifications WHERE application_id=ANY($1::uuid[])',[applications]);
  await client.query('DELETE FROM interviews WHERE vacancy_id=ANY($1::uuid[])',[jobs]);
  await client.query('DELETE FROM application_documents WHERE application_id=ANY($1::uuid[])',[applications]);
  await client.query('DELETE FROM applications WHERE id=ANY($1::uuid[])',[applications]);
  await client.query('DELETE FROM interview_steps WHERE vacancy_id=ANY($1::uuid[])',[jobs]);
  await client.query('DELETE FROM vacancies WHERE id=ANY($1::uuid[])',[jobs]);
  const removed = await client.query('DELETE FROM stored_files WHERE id=ANY($1::uuid[]) AND NOT EXISTS(SELECT 1 FROM application_documents d WHERE d.stored_file_id=stored_files.id) RETURNING storage_ref',[[...owned.extraFileIds,...catalog.applications.map(application=>application.fileId)]]);
  // Explicit dataset recreation retires only its now-unreferenced objects; new
  // immutable PDF objects are inserted, never overwritten. Passwords survive.
  return removed.rows.map(row=>row.storage_ref as string);
}

async function insertApplication(client: PoolClient, application: Application, storage: DocumentStorage, created: {id:string;ref:string}[]) {
  const {scenario,job,candidate,id} = application;
  const bytes = await profilePdf(application.profile), contentHash = hash(bytes);
  const previous = (await client.query('SELECT storage_ref,content_hash FROM stored_files WHERE id=$1 FOR UPDATE',[application.fileId])).rows[0];
  let ref: string;
  if (previous) {
    if (previous.content_hash!==contentHash || hash(await storage.read(previous.storage_ref))!==contentHash) throw new Error('Lifecycle PDF collision or corruption; refusing overwrite.');
    ref = previous.storage_ref;
  } else {
    ref = await storage.put(bytes);
    created.push({id:application.fileId,ref});
    await client.query('INSERT INTO stored_files(id,storage_ref,content_hash,byte_count,filename,media_type,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[application.fileId,ref,contentHash,bytes.length,`${candidate.name.replaceAll(' ','-').toLowerCase()}-cv.pdf`,'application/octet-stream',application.submittedAt]);
  }
  const reviewed = ['corrected','reviewed'].includes(scenario.processing);
  const released = scenario.processing==='released';
  // Closed vacancy's immutable submission snapshot predates closure.
  const snapshot = {...job.vacancy,status:'published',revision:2,updatedAt:job.publishedAt};
  const interviews = lifecycleInterviews(application);
  const flowRevision = 1 + Number(application.screened) + interviews.length + interviews.filter(interview=>interview.status==='completed').length
    + Number(['offer','hired'].includes(scenario.journey)) + Number(scenario.journey==='hired');
  await client.query(`INSERT INTO applications(id,vacancy_id,candidate_id,candidate_identity,vacancy_snapshot,answers,stage,processing_state,submitted_at,
    review_status,review_revision,reviewed_by,review_updated_at,reviewed_at,flow_revision,processing_released_at,processing_released_by,
    screening_decision,screening_by,screening_at,screening_reason)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,[
    id,job.vacancy.id,candidate.id,json({name:candidate.name,email:candidate.email}),json(snapshot),json({name:candidate.name,motivation:'I would like to contribute to this team and grow with the role.'}),
    application.stage,application.processingState,application.submittedAt,application.reviewStatus,
    reviewed?3:released?2:1,reviewed?catalogStaff('hr2'):null,reviewed?application.reviewedAt:null,scenario.processing==='reviewed'?application.reviewedAt:null,
    flowRevision,released?application.reviewedAt:null,released?catalogStaff('hr2'):null,
    application.screened?(application.rejected?'rejected':'preselected'):null,application.screened?catalogStaff('hr'):null,application.screened?application.screenedAt:null,
    application.rejected?'Profile does not match the requirements for this role.':null,
  ]);
  await client.query('INSERT INTO application_documents(id,application_id,input_id,stored_file_id) VALUES($1,$2,\'cv\',$3)',[application.documentId,id,application.fileId]);
  const fixture = await lifecycleTaskFixture(application);
  if (fixture && !['pending','released'].includes(scenario.processing)) {
    // Validate fixtures using the same trusted fixture schema as demo:process.
    new FixtureRegistry().load([fixture]);
    const task = job.vacancy.processingDefinition.tasks[0];
    const failure = fixture.result.status==='failed' ? fixture.result : undefined;
    const original = fixture.result.status==='completed'?{status:'completed',value:normalizeCvResponse(task.args,buildCvRequest(task.args,fixture.markdown,fixture.referenceDate,'jev-1.14.0'),fixture.result.response)}:fixture.result;
    await client.query(`INSERT INTO application_tasks(application_id,task_id,source_input_id,output_key,args,fixture_key,status,attempts,retryable,result,provenance,reason,failure_category,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,1,false,$8,$9,$10,$11,$12)`,[id,task.id,task.sourceInputId,task.outputKey,json(task.args),fixture.fixtureKey,fixture.result.status,json(original),json({mode:'fixture',fixtureId:fixture.fixtureKey,method:'declared-lifecycle-snapshot',referenceDate:fixture.referenceDate}),failure?.reason??null,failure?.failureCategory??null,application.processedAt]);
    if (scenario.processing==='corrected') for(const [question,value] of [['SQL','used_professionally'],['Coverage',null]] as const) await client.query('INSERT INTO extraction_field_corrections(application_id,task_id,question_id,value,corrected_by,corrected_at) VALUES($1,$2,$3,$4,$5,$6)',[id,task.id,question,json(value),catalogStaff('hr2'),application.reviewedAt]);
  }
  if (application.screened) await client.query('INSERT INTO screening_notifications(id,application_id,recipient_id,decision,title,body,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[
    lifecycleId(`screening:${scenario.key}`),id,candidate.id,application.rejected?'rejected':'preselected',application.rejected?'Application outcome':'Application preselected',
    `${job.vacancy.title}. Your application was ${application.rejected?'not selected':'preselected'}.`,application.screenedAt]);
}
const catalogStaff = (key: string) => lifecycleId(`actor:${key}`);

export function lifecycleInterviews(application: Application) {
  if (application.job.key!=='interviews' || application.scenario.journey==='preselected') return [];
  const {journey,key} = application.scenario;
  const both = ['partial-pass','all-passed','interview-failed','offer','hired'].includes(journey);
  const allPassed = ['all-passed','offer','hired'].includes(journey);
  return application.job.steps.slice(0,both?2:1).map((step,index) => {
    const failed = journey==='interview-failed' && index===0;
    const completed = failed || allPassed || journey==='partial-pass'&&index===0;
    const cancelled = journey==='cancelled' || journey==='interview-failed'&&index===1;
    const past = completed || journey==='feedback-due';
    return {id:lifecycleId(`interview:${key}:${index}`),step,index,interviewerId:catalogStaff(index?'interviewer2':'interviewer'),
      status:completed?'completed':cancelled?'cancelled':'scheduled',outcome:completed?(failed?'fail':'pass'):null,
      startsAt:past?(index?application.pastSecondStart:application.pastStart):(index?application.futureSecondStart:application.futureStart),
      submittedAt:completed?new Date(new Date(index?application.pastSecondStart:application.pastStart).getTime()+3600000).toISOString():null,
      issue:journey==='reschedule'?'Could you propose another slot?':null,
      cancellationCause:cancelled?(journey==='interview-failed'?{type:'interview_failed',actorId:catalogStaff('interviewer'),interviewId:lifecycleId(`interview:${key}:0`),stepName:application.job.steps[0].name}:{type:'hr_cancelled',actorId:catalogStaff('hr'),reason:'Appointment cancelled.'}):null,
    };
  });
}

async function insertInterviews(client: PoolClient, application: Application) {
  for (const interview of lifecycleInterviews(application)) {
    const cause = interview.cancellationCause ?? {type:interview.status==='completed'?'feedback_submitted':interview.issue?'reschedule_requested':'hr_scheduled',actorId:interview.status==='completed'||interview.issue?interview.interviewerId:catalogStaff('hr')};
    const updatedAt = interview.submittedAt ?? (application.scenario.journey==='interview-failed'
      ? new Date(new Date(application.pastStart).getTime()+3600000).toISOString() : application.screenedAt);
    await client.query(`INSERT INTO interviews(id,vacancy_id,application_id,step_id,interviewer_id,created_by,updated_by,starts_at,duration_minutes,timezone,meeting,
      status,notes,score,outcome,submitted_at,cancellation_cause,change_cause,scheduling_issue,issue_at,created_at,updated_at,revision)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,30,'UTC',$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,[
      interview.id,application.job.vacancy.id,application.id,interview.step.id,interview.interviewerId,catalogStaff('hr'),cause.actorId,interview.startsAt,
      'Meeting room 2 / https://meet.example.test/interview',interview.status,interview.status==='completed'?'Clear understanding of the stack. Good communication and relevant examples.':null,
      interview.status==='completed'?interview.outcome==='pass'?7:3:null,interview.outcome,interview.submittedAt,interview.cancellationCause?json(interview.cancellationCause):null,json(cause),interview.issue,interview.issue?updatedAt:null,application.screenedAt,updatedAt,interview.status==='scheduled'?1:2,
    ]);
    // Fixture notices are declared snapshots, not evidence of command delivery/deduplication.
    await client.query('INSERT INTO inbox_notifications(id,recipient_id,interview_id,kind,title,body,cause,created_at,read_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[
      lifecycleId(`notice:${application.scenario.key}:${interview.index}`),interview.status==='completed'||interview.issue?catalogStaff('hr'):interview.interviewerId,interview.id,
      interview.status==='completed'?'feedback':interview.issue?'scheduling_issue':interview.status==='cancelled'?'cancelled':'assigned',
      `${interview.step.name} · ${application.candidate.name}`,interview.status==='completed'?'Assessment submitted.':interview.status==='cancelled'?'Appointment cancelled.':'Appointment scheduled.',json(cause),updatedAt,
      application.scenario.journey==='all-passed'?updatedAt:null,
    ]);
  }
}

export async function seedLifecycle(database: Pick<DatabaseService,'transaction'|'query'>, storage: DocumentStorage, catalog: LifecycleCatalog, reset: boolean, passwordHash: string) {
  const created: {id:string;ref:string}[] = [];
  try {
    const result = await database.transaction(async client => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext('recruitment-lifecycle-v1'))");
      await prerequisites(client);
      const existing = await inspectLifecycleOwnership(client,catalog);
      if (existing.jobs || existing.applications) {
        if (!reset) {
          if(existing.legacyDefinition)throw new Error('Existing lifecycle data uses the legacy extraction schema; explicit separately authorized reset is required.');
          if (existing.jobs!==catalog.jobs.length || !catalog.applications.every(application=>existing.applicationIds.includes(application.id))) throw new Error('Partial lifecycle dataset; explicit reset required.');
          return {status:'preserved' as const,removed:[] as string[]};
        }
      }
      await accounts(client,catalog,passwordHash);
      const removed = reset ? await clearDataset(client,catalog,existing) : [];
      for (const {vacancy,steps,interviewRevision} of catalog.jobs) {
        await client.query(`INSERT INTO vacancies(id,owner_id,status,revision,interview_revision,title,description,location,form_definition,processing_definition,created_at,updated_at,extraction_reference_date)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,[vacancy.id,vacancy.ownerId,vacancy.status,vacancy.revision,interviewRevision,vacancy.title,vacancy.description,vacancy.location??null,json(vacancy.formDefinition),json(vacancy.processingDefinition),vacancy.createdAt,vacancy.updatedAt,vacancy.extractionReferenceDate??null]);
        for (const step of steps) await client.query('INSERT INTO interview_steps(id,vacancy_id,position,name,instructions) VALUES($1,$2,$3,$4,$5)',[step.id,vacancy.id,step.position,step.name,step.instructions]);
      }
      for (const application of catalog.applications) {
        await insertApplication(client,application,storage,created);
        await insertInterviews(client,application);
      }
      return {status:'seeded' as const,removed};
    });
    let cleanupPending = 0;
    for (const ref of result.removed) {
      // Only manual demo-submission objects are retired. Verify the committed
      // deletion before unlinking; uncertain lookup preserves bytes.
      const persisted = await database.query('SELECT id FROM stored_files WHERE storage_ref=$1',[ref]).then(row=>!!row.rowCount).catch(()=>true);
      if (persisted) { cleanupPending++; continue; }
      try { await storage.remove(ref); } catch { cleanupPending++; }
    }
    return {status:result.status,cleanupPending};
  } catch (error) {
    // A lost COMMIT acknowledgement is not proof of rollback. Preserve bytes unless
    // a fresh query proves this exact storage reference was not committed.
    for (const file of created) {
      const persisted = await database.query('SELECT id FROM stored_files WHERE storage_ref=$1',[file.ref]).then(result=>!!result.rowCount).catch(()=>true);
      if (!persisted) await storage.remove(file.ref).catch(()=>{ /* Orphan retained; never risk committed documents. */ });
    }
    throw error;
  }
}
