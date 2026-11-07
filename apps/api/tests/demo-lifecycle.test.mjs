import {test} from 'node:test';
import {deepEqual,equal,ok,rejects,throws} from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lifecycleCatalog,lifecycleId,lifecycleMode,lifecycleSafety} from '../dist/demo/lifecycle-catalog.js';
import {lifecycleInterviews,lifecycleTaskFixture,seedLifecycle} from '../dist/demo/lifecycle-store.js';
import {samplePdf} from '../dist/demo/sample-pdf.js';
import {FixtureRegistry} from '../dist/processing/execution.js';
import {validateSubmission} from '@recruitment/domain/applications';
import {reviewReadiness} from '../dist/review/review-readiness.js';

const baseline=new Date('2026-11-07T12:17:00Z');
const catalog=lifecycleCatalog(baseline);
const tableNames=['user','account','vacancies','interview_steps','applications','stored_files','application_documents','application_tasks','extraction_corrections','interviews','screening_notifications','inbox_notifications'];
// Offline transaction/SQL-call model only. It is deliberately not a PostgreSQL,
// auth/HTTP, filesystem or migration test.
function model({missingMigration=false,failInsert,ambiguousCommit=false,lookupFails=false}={}) {
  let state=Object.fromEntries(tableNames.map(name=>[name,[]]));
  const queries=[],bytes=new Map();let puts=0,removes=0;
  const storage={async put(value){const ref=`test:${++puts}`;bytes.set(ref,Buffer.from(value));return ref;},async read(ref){if(!bytes.has(ref))throw Error('Missing bytes');return bytes.get(ref);},async remove(ref){removes++;bytes.delete(ref);}};
  const result=rows=>({rows:structuredClone(rows),rowCount:rows.length});
  async function query(sql,args=[]) {
    queries.push({sql,args:structuredClone(args)});
    if(sql.includes('to_regclass'))return result([{name:'application_migrations'}]);
    if(sql.startsWith('SELECT id FROM application_migrations'))return result(missingMigration?[]:[{id:'007_screening_decisions'},{id:'008_review_release'}]);
    if(sql.includes('pg_advisory_xact_lock'))return result([]);
    if(sql.startsWith('SELECT id,owner_id FROM vacancies'))return result(state.vacancies.filter(row=>args[0].includes(row.id)));
    if(sql.startsWith('SELECT id,vacancy_id,candidate_id'))return result(state.applications.filter(row=>args[0].includes(row.vacancy_id)||args[1].includes(row.id)));
    if(sql.startsWith('SELECT id,application_id,stored_file_id'))return result(state.application_documents.filter(row=>args[0].includes(row.application_id)||args[1].includes(row.stored_file_id)));
    if(sql.startsWith('SELECT application_id FROM application_tasks'))return result(state.application_tasks.filter(row=>args[0].includes(row.application_id)&&row.attempts>0&&(!row.provenance||JSON.parse(row.provenance).mode!=='fixture')));
    if(sql.startsWith('SELECT id,email,role FROM "user"'))return result(state.user.filter(row=>row.id===args[0]||row.email===args[1]));
    if(sql.startsWith('SELECT storage_ref,content_hash'))return result(state.stored_files.filter(row=>row.id===args[0]));
    if(sql.startsWith('SELECT id FROM stored_files WHERE storage_ref')){if(lookupFails)throw Error('Unknown commit');return result(state.stored_files.filter(row=>row.storage_ref===args[0]));}
    if(sql.startsWith('INSERT INTO account')){
      if(!state.account.some(row=>row.userId===args[1]))state.account.push({id:args[0],userId:args[1],password:args[2]});return result([]);
    }
    if(sql.startsWith('INSERT INTO')) {
      const [,quoted,columns,values]=sql.match(/^INSERT INTO (\w+|"user")\(([^)]+)\)\s+VALUES\(([^)]+)\)/);
      const table=quoted.replaceAll('"','');
      if(table===failInsert)throw Error('Injected write failure');
      const tokens=values.split(',').map(value=>value.trim());
      const row=Object.fromEntries(columns.split(',').map((column,index)=>{
        const token=tokens[index];
        const value=token.startsWith('$')?args[Number(token.slice(1))-1]:token==='true'?true:token==='false'?false:/^\d+$/.test(token)?Number(token):token.slice(1,-1);
        return [column.trim().replaceAll('"',''),value];
      }));
      if(table==='user'&&state.user.some(old=>old.id===row.id))return result([]);
      // Catch SQL NULL vs jsonb 'null' mistakes in the interview fixture writer.
      if(table==='interviews')equal(row.cancellation_cause!==null,row.status==='cancelled');
      state[table].push(row);return result([]);
    }
    if(sql.startsWith('DELETE FROM')){
      const table=sql.match(/^DELETE FROM (\w+)/)[1];
      const ids=args[0];
      const retired=table==='stored_files'?state.stored_files.filter(row=>ids.includes(row.id)):[];
      if(table==='inbox_notifications')state[table]=state[table].filter(row=>!state.interviews.some(interview=>ids.includes(interview.vacancy_id)&&interview.id===row.interview_id));
      else {
        const key=['screening_notifications','application_documents'].includes(table)?'application_id':['interviews','interview_steps'].includes(table)?'vacancy_id':'id';
        if(table==='applications'){
          state.application_tasks=state.application_tasks.filter(row=>!ids.includes(row.application_id));
          state.extraction_corrections=state.extraction_corrections.filter(row=>!ids.includes(row.application_id));
        }
        state[table]=state[table].filter(row=>!ids.includes(row[key]));
      }
      return result(retired);
    }
    throw Error(`Unexpected model query: ${sql}`);
  }
  const database={query,async transaction(work){const before=structuredClone(state);let committed=false;try{const value=await work({query});committed=true;if(ambiguousCommit)throw Error('Lost commit acknowledgement');return value;}catch(error){if(!committed)state=before;throw error;}}};
  return {database,storage,queries,bytes,get state(){return state;},get puts(){return puts;},get removes(){return removes;}};
}

test('catalog has stable distinct identities, current relative dates and valid immutable submissions',()=>{
  equal(catalog.jobs.length,5);equal(catalog.applications.length,25);
  equal(catalog.baseline,'2026-11-07T12:00:00.000Z');
  const later=lifecycleCatalog(new Date('2027-03-28T01:42:00Z'));
  deepEqual(later.applications.map(row=>row.id),catalog.applications.map(row=>row.id));
  const ids=[...catalog.actors.map(row=>row.id),...catalog.jobs.flatMap(row=>[row.vacancy.id,...row.steps.map(step=>step.id)]),...catalog.applications.flatMap(row=>[row.id,row.documentId,row.fileId,...lifecycleInterviews(row).map(interview=>interview.id)])];
  equal(new Set(ids).size,ids.length);
  for(const application of catalog.applications){
    ok(application.candidate.createdAt<application.job.vacancy.createdAt);
    ok(application.job.publishedAt<application.submittedAt);
    ok(application.submittedAt<application.processedAt&&application.processedAt<application.reviewedAt&&application.reviewedAt<application.screenedAt);
    const checked=validateSubmission(application.job.vacancy.formDefinition,{name:application.candidate.name,motivation:'Synthetic'},[{inputId:'cv',filename:'cv.pdf',byteCount:samplePdf(application.lines).length}]);
    deepEqual(checked.issues,[]);
  }
});
test('historical/future interviews are coherent, non-overlapping and respect configured plan cardinality',()=>{
  const appointments=catalog.applications.flatMap(application=>lifecycleInterviews(application).map(interview=>({...interview,application})));
  for(const appointment of appointments){
    equal(new Date(appointment.startsAt).getUTCMinutes()%30,0);
    if(appointment.status==='completed'){ok(appointment.startsAt<appointment.submittedAt);ok(appointment.submittedAt<catalog.baseline);ok(appointment.application.screenedAt<appointment.startsAt);}
    if(appointment.status==='scheduled'&&appointment.application.scenario.journey!=='feedback-due')ok(appointment.startsAt>catalog.baseline);
  }
  const scheduled=appointments.filter(row=>row.status==='scheduled');
  for(const a of scheduled)for(const b of scheduled)if(a.id!==b.id&&a.interviewerId===b.interviewerId)ok(Math.abs(new Date(a.startsAt)-new Date(b.startsAt))>=1800000);
  for(const application of catalog.applications.filter(row=>['offer','hired'].includes(row.stage)&&row.job.steps.length)){
    const interviews=lifecycleInterviews(application);equal(interviews.length,application.job.steps.length);ok(interviews.every(row=>row.outcome==='pass'));
  }
  const failed=appointments.filter(row=>row.application.scenario.key==='interview-failed');
  equal(failed[0].outcome,'fail');equal(failed[1].status,'cancelled');equal(failed[1].cancellationCause.interviewId,failed[0].id);
});
test('declared extraction fixtures share the trusted schema, actual bytes/hash and visible provenance',()=>{
  for(const application of catalog.applications){
    const fixture=lifecycleTaskFixture(application);if(!fixture)continue;
    const registry=new FixtureRegistry();registry.load([fixture]);
    const context={...fixture,args:fixture.args};
    const text=registry.text(samplePdf(application.lines),context);
    const result=registry.result(text,context);equal(result.provenance.mode,'fixture');
    equal(createHash('sha256').update(samplePdf(application.lines)).digest('hex'),fixture.sourceHash);
    if(application.scenario.processing==='empty')deepEqual(result.result.value.skills,[]);
  }
});
test('CLI mode and environment refuse accidental reset flags, production and live processing',()=>{
  equal(lifecycleMode(['plan']),'plan');equal(lifecycleMode(['reset']),'reset');
  for(const args of [[],['seed','--reset'],['wipe'],['reset','all']])throws(()=>lifecycleMode(args));
  lifecycleSafety({NODE_ENV:'development'});lifecycleSafety({NODE_ENV:'test',PROCESSING_EXECUTOR:'disabled'});
  for(const env of [{},{NODE_ENV:'production'},{NODE_ENV:'development',PROCESSING_EXECUTOR:'jev'},{NODE_ENV:'development',PROCESSING_READER:'pdf'}])throws(()=>lifecycleSafety(env));
});
test('offline plan CLI needs no project secrets, valid DB URL or enabled runtime ports',()=>{
  const output=execFileSync(process.execPath,[new URL('../dist/demo/lifecycle.js',import.meta.url).pathname,'plan'],{encoding:'utf8',env:{PATH:process.env.PATH,NODE_ENV:'production',PROCESSING_EXECUTOR:'jev',DATABASE_URL:'not-a-database'}});
  const plan=JSON.parse(output);equal(plan.scenarios.length,25);equal(plan.vacancies.length,5);
});
test('seed model writes complete declared snapshots without unscoped deletes or workflow/provider calls',async()=>{
  const m=model();equal((await seedLifecycle(m.database,m.storage,catalog,false,'hashed-demo')).status,'seeded');
  equal(m.state.applications.length,25);equal(m.state.vacancies.length,5);equal(m.puts,25);
  equal(m.queries.filter(row=>row.sql.startsWith('DELETE')).length,0);
  const correction=m.state.extraction_corrections[0];deepEqual(JSON.parse(correction.value),{skills:['SQL'],unavailableSkills:['Python']});
  for(const application of m.state.applications){
    const snapshot=JSON.parse(application.vacancy_snapshot);equal(snapshot.status,'published');
    if(!snapshot.processingDefinition.tasks.length){equal(application.reviewed_by,null);equal(application.reviewed_at,null);equal(application.review_status,'completed');}
  }
  ok(m.state.application_tasks.every(row=>JSON.parse(row.provenance).mode==='fixture'));
  for(const row of m.state.interviews)equal(row.status==='completed',row.outcome!==null);
});
test('declared persistence snapshots map to the intended current readiness policy',async()=>{
  const m=model();await seedLifecycle(m.database,m.storage,catalog,false,'hash');
  const expected={'pending':'waiting','ready':'ready','empty':'ready','ordinary-failure':'ready','operational-block':'blocked','uncertain-block':'blocked','released':'released','corrected':'ready','reviewed':'locked','screened-pending':'locked','screening-rejected':'locked'};
  for(const row of m.state.applications){
    const application=catalog.applications.find(application=>application.id===row.id);
    const tasks=application.job.vacancy.processingDefinition.tasks.map(definition=>{
      const task=m.state.application_tasks.find(task=>task.application_id===row.id&&task.task_id===definition.id);
      return {status:task?.status??'pending',retryable:task?.retryable??false,failureCategory:task?.failure_category??null};
    });
    const state=reviewReadiness(row,tasks).state;
    equal(state,expected[application.scenario.key]??(tasks.length?'locked':'not_required'));
  }
});
test('ordinary seed preserves dates/edits/passwords and reset reuses immutable bytes without accumulating files',async()=>{
  const m=model();await seedLifecycle(m.database,m.storage,catalog,false,'original-hash');
  m.state.account[0].password='user-changed-hash';m.state.vacancies[0].title='Manual demo edit';
  const before=structuredClone(m.state),later=lifecycleCatalog(new Date('2026-12-01T16:00:00Z'));
  equal((await seedLifecycle(m.database,m.storage,later,false,'another-hash')).status,'preserved');deepEqual(m.state,before);
  await seedLifecycle(m.database,m.storage,later,true,'another-hash');
  equal(m.puts,25);equal(m.removes,0);equal(m.state.stored_files.length,25);equal(m.state.applications.length,25);
  equal(m.state.account[0].password,'user-changed-hash');equal(m.state.applications[0].submitted_at,later.applications[0].submittedAt);
  ok(m.state.vacancies.every(row=>row.title.startsWith('[DEMO lifecycle]')));
});
test('reset refuses unowned submissions, identity/document collisions and active or expired leases before deleting',async()=>{
  const changes=[
    m=>m.state.applications.push({id:'manual-application',vacancy_id:catalog.jobs[1].vacancy.id,candidate_id:'manual-user'}),
    m=>m.state.applications[0].candidate_id='another-user',
    m=>m.state.vacancies[0].owner_id='another-owner',
    m=>m.state.application_documents[0].stored_file_id='another-file',
    m=>m.state.applications[0].processing_state='processing',
    m=>m.state.applications[0].processing_lease_until='2000-01-01',
    m=>m.state.application_tasks[0].provenance=JSON.stringify({mode:'live'}),
    m=>m.state.application_tasks[0].provenance=null,
  ];
  for(const change of changes){const m=model();await seedLifecycle(m.database,m.storage,catalog,false,'hash');change(m);const before=structuredClone(m.state);m.queries.length=0;await rejects(()=>seedLifecycle(m.database,m.storage,catalog,true,'hash'));deepEqual(m.state,before);equal(m.queries.filter(row=>row.sql.startsWith('DELETE')).length,0);}
});
test('reset preserves unrelated records and rolls back scoped deletes on corrupted PDF',async()=>{
  const m=model();await seedLifecycle(m.database,m.storage,catalog,false,'hash');
  m.state.vacancies.push({id:'unrelated-job',owner_id:'unrelated-owner'});m.state.applications.push({id:'unrelated-app',vacancy_id:'unrelated-job',candidate_id:'manual'});
  m.state.applications.push({id:'demo-candidate-outside-scope',vacancy_id:'unrelated-job',candidate_id:lifecycleId('actor:candidate')});
  await seedLifecycle(m.database,m.storage,catalog,true,'hash');
  ok(m.state.vacancies.some(row=>row.id==='unrelated-job'));ok(m.state.applications.some(row=>row.id==='unrelated-app'));
  ok(m.state.applications.some(row=>row.id==='demo-candidate-outside-scope'));
  const before=structuredClone(m.state);m.bytes.set(m.state.stored_files[0].storage_ref,Buffer.from('corrupt'));
  await rejects(()=>seedLifecycle(m.database,m.storage,catalog,true,'hash'),/collision or corruption/);deepEqual(m.state,before);
});
test('new demo-account submissions in demo vacancies are disposable, including their private objects',async()=>{
  const m=model();await seedLifecycle(m.database,m.storage,catalog,false,'hash');
  const ref=await m.storage.put(Buffer.from('manual demo upload'));
  m.state.applications.push({id:'new-demo-app',vacancy_id:catalog.jobs[1].vacancy.id,candidate_id:lifecycleId('actor:candidate')});
  m.state.application_documents.push({id:'new-demo-doc',application_id:'new-demo-app',stored_file_id:'new-demo-file'});
  m.state.stored_files.push({id:'new-demo-file',storage_ref:ref});
  const before=structuredClone(m.state);
  equal((await seedLifecycle(m.database,m.storage,catalog,false,'hash')).status,'preserved');deepEqual(m.state,before);
  const result=await seedLifecycle(m.database,m.storage,catalog,true,'hash');
  equal(result.cleanupPending,0);equal(m.state.applications.length,25);equal(m.state.stored_files.length,25);equal(m.bytes.size,25);equal(m.removes,1);
  ok(!m.state.application_documents.some(row=>row.id==='new-demo-doc'));
  const retainedRef=await m.storage.put(Buffer.from('another manual demo upload'));
  m.state.applications.push({id:'new-demo-app',vacancy_id:catalog.jobs[1].vacancy.id,candidate_id:lifecycleId('actor:candidate')});
  m.state.application_documents.push({id:'new-demo-doc',application_id:'new-demo-app',stored_file_id:'new-demo-file'});
  m.state.stored_files.push({id:'new-demo-file',storage_ref:retainedRef});
  m.storage.remove=async()=>{throw Error('Synthetic unlink failure');};
  equal((await seedLifecycle(m.database,m.storage,catalog,true,'hash')).cleanupPending,1);
  equal(m.state.applications.length,25);ok(m.bytes.has(retainedRef));
});
test('missing migrations/account collisions fail transactionally before document creation',async()=>{
  const missing=model({missingMigration:true});await rejects(()=>seedLifecycle(missing.database,missing.storage,catalog,false,'hash'),/007\/008/);equal(missing.puts,0);
  const collision=model();collision.state.user.push({id:lifecycleId('actor:hr'),email:'unrelated@example.test',role:'recruiter'});
  await rejects(()=>seedLifecycle(collision.database,collision.storage,catalog,false,'hash'),/account collision/);equal(collision.puts,0);
});
test('failed writes remove only proven uncommitted new bytes; ambiguous COMMIT preserves documents',async()=>{
  const failed=model({failInsert:'screening_notifications'});await rejects(()=>seedLifecycle(failed.database,failed.storage,catalog,false,'hash'),/Injected/);equal(failed.state.applications.length,0);equal(failed.bytes.size,0);ok(failed.removes>0);
  const committed=model({ambiguousCommit:true});await rejects(()=>seedLifecycle(committed.database,committed.storage,catalog,false,'hash'),/Lost commit/);equal(committed.state.applications.length,25);equal(committed.bytes.size,25);equal(committed.removes,0);
  const unknown=model({failInsert:'screening_notifications',lookupFails:true});await rejects(()=>seedLifecycle(unknown.database,unknown.storage,catalog,false,'hash'));equal(unknown.removes,0);ok(unknown.bytes.size>0);
});
