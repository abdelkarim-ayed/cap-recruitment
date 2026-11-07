import { test } from 'node:test';
import { equal, deepEqual, rejects, ok } from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { roleAllows } from '@recruitment/domain';
import { reviewReadiness } from '../dist/review/review-readiness.js';
import { ReviewService } from '../dist/review/review.service.js';
import { ProcessingRepository } from '../dist/processing/processing.repository.js';
import { ProcessingService } from '../dist/processing/processing.service.js';
import { ProcessingFailure } from '../dist/processing/processing-failure.js';
import { FixtureRegistry, ContextTaskExecutor, ContextTextReader, DisabledTaskExecutor, DisabledTextReader } from '../dist/processing/execution.js';
import { ApplicationService } from '../dist/applications/application.service.js';
import { commitScreening } from '../dist/interviews/screening-command.js';

const id='11111111-1111-4111-8111-111111111111', actor={id:'hr',role:'recruiter'};
const definition={id:'skills',sourceInputId:'cv',outputKey:'skills',type:'extractSkills',args:{skills:['SQL'],evidence:false}};
const task=(changes={})=>({application_id:id,task_id:'skills',source_input_id:'cv',output_key:'skills',args:definition.args,status:'pending',attempts:0,retryable:false,failure_category:null,result:null,...changes});
const row=(changes={})=>({id,vacancy_id:'vacancy',candidate_id:'candidate',candidate_identity:{name:'Synthetic',email:'candidate@example.test'},stage:'received',flow_revision:1,processing_state:'pending',processing_token:'token',processing_lease_until:'2999-01-01',processing_next_at:null,processing_released_at:null,processing_released_by:null,review_status:'pending',review_revision:1,reviewed_by:null,reviewed_at:null,review_updated_at:null,submitted_at:'2026-11-07T00:00:00Z',answers:{cv:'immutable'},vacancy_snapshot:{id:'vacancy',title:'Synthetic',formDefinition:{inputs:[]},processingDefinition:{tasks:[definition]}},...changes});
const status=code=>error=>error.getStatus()===code;
// Serialized transaction model with rollback. This is not PostgreSQL/HTTP proof.
function setup(application=row(),tasks=[]) {
  let state={application:structuredClone(application),tasks:structuredClone(tasks),notices:[]};
  let tail=Promise.resolve(); const queries=[];
  const client={async query(sql,args=[]) {
    queries.push(sql); const a=state.application;
    if(sql.startsWith('SELECT id,name,email'))return {rows:[{id:args[0],name:'Synthetic HR',email:'hr@example.test'}]};
    if(sql.startsWith('SELECT')&&sql.includes('FROM application_documents'))return {rows:[]};
    if(sql.startsWith('SELECT')&&sql.includes('FROM applications')) {
      if(sql.includes('processing_token=$2')&&(a.processing_token!==args[1]||a.processing_released_at||!['received','review_ready'].includes(a.stage)||a.review_status==='completed'))return {rows:[],rowCount:0};
      if(sql.includes('SKIP LOCKED')&&(a.processing_released_at||!['received','review_ready'].includes(a.stage)||a.review_status==='completed'))return {rows:[],rowCount:0};
      return {rows:[structuredClone(a)],rowCount:1};
    }
    if(sql.startsWith('SELECT')&&sql.includes('FROM application_tasks'))return {rows:structuredClone(state.tasks)};
    if(sql.startsWith('UPDATE application_tasks SET status=$3')) {
      const t=state.tasks.find(t=>t.task_id===args[1]); Object.assign(t,{status:args[2],result:JSON.parse(args[3]),provenance:JSON.parse(args[4]),reason:args[5],retryable:args[6],failure_category:args[7]});return {rowCount:1};
    }
    if(sql.startsWith('UPDATE application_tasks SET status=\'processing\'')) {
      const t=state.tasks.find(t=>t.task_id===args[1]);
      if(!t||t.attempts>=3||!(t.status==='pending'||t.status==='failed'&&t.retryable))return {rows:[],rowCount:0};
      t.status='processing';t.attempts++;t.failure_category=null;return {rows:[structuredClone(t)],rowCount:1};
    }
    if(sql.startsWith('UPDATE applications')) {
      if(sql.includes('processing_released_at=now()')) {a.processing_released_at='2026-11-07T12:00:00Z';a.processing_released_by=args[1];a.processing_token=null;a.processing_lease_until=null;a.processing_next_at=null;a.review_revision++;}
      else if(sql.includes('screening_decision=$3')) {a.stage=args[1];a.flow_revision++;a.processing_token=null;a.processing_lease_until=null;a.processing_next_at=null;}
      else if(sql.includes('SET review_status=$2')) {a.review_status=args[1];a.review_revision++;a.reviewed_by=args[2];a.review_updated_at='2026-11-07T12:01:00Z';a.reviewed_at=args[1]==='completed'?'2026-11-07T12:01:00Z':null;}
      else if(sql.includes('processing_state=CASE')) {a.processing_state=state.tasks.every(t=>t.status==='completed')?'completed':'completed_with_errors';a.processing_token=null;a.processing_lease_until=null;a.review_revision++;}
      else if(sql.includes('review_revision=review_revision+1'))a.review_revision++;
      else if(sql.includes('SET processing_token=NULL')){a.processing_token=null;a.processing_lease_until=null;a.processing_next_at=null;}
      else if(!sql.includes('SET processing_lease_until='))throw new Error(`Unexpected update: ${sql}`);
      return {rowCount:1};
    }
    if(sql.startsWith('INSERT INTO screening_notifications')) {state.notices.push(args);return {rowCount:1};}
    throw new Error(`Unexpected model SQL: ${sql}`);
  }};
  const database={query:client.query,transaction(work) {const op=tail.then(async()=>{const before=structuredClone(state);try{return await work(client);}catch(error){state=before;throw error;}});tail=op.catch(()=>{});return op;}};
  return {database,queries,service:new ReviewService(database),repository:new ProcessingRepository(database),get state(){return state;}};
}
const outcome=(status='completed',failureCategory=null,retryable=false)=>({status,failureCategory,retryable});
test('whole-application matrix: all tasks settle normally; retry exhaustion/unknowns do not',()=>{
  const a=row({processing_state:'completed_with_errors'});
  for(const [tasks,expected] of [
    [[], 'not_required'],[[outcome()], 'ready'],[[outcome(),outcome('failed','ordinary_terminal')],'ready'],
    [[outcome(),outcome('pending')],'waiting'],[[outcome('processing')],'waiting'],
    [[outcome('failed','ordinary_terminal',true)],'blocked'],
    ...['operational','uncertain','unclassified',null].map(category=>[[{...outcome('failed',category),attempts:3}],'blocked']),
  ])equal(reviewReadiness(a,tasks).state,expected);
  equal(reviewReadiness({...a,processing_state:'processing'},[outcome()]).state,'waiting');
});
test('release opens unfinished review; screening/completion and no-task applicability take precedence',()=>{
  const a=row({processing_released_at:'2026-11-07'});
  equal(reviewReadiness(a,[outcome('pending')]).state,'released');
  for(const changed of [{stage:'preselected'},{stage:'not_selected'},{review_status:'completed'}])equal(reviewReadiness({...a,...changed},[outcome('pending')]).state,'locked');
  equal(reviewReadiness(a,[]).state,'not_required');
});
test('missing frozen tasks appear pending; view is available but edits/completion are denied',async()=>{
  const f=setup();const view=await f.service.get(id,actor);
  equal(view.tasks[0].status,'pending');equal(view.readiness.state,'waiting');equal(view.actions.edit.allowed,false);equal(view.actions.release.allowed,true);
  for(const body of [{status:'in_review'},{status:'completed'},{corrections:[{taskId:'skills',value:null}]}])await rejects(f.service.patch(id,actor,{expectedRevision:1,...body}),status(409));
  equal(f.state.application.review_revision,1);
});
test('release active work changes only durable closure and revision, not evidence or human review',async()=>{
  const original=task({status:'processing',attempts:1,result:{status:'failed',value:null,reason:'Previous unavailable',retryable:true},has_correction:true,correction:null});
  const f=setup(row({processing_state:'processing'}),[original]);
  const view=await f.service.release(id,actor,{expectedRevision:1});
  equal(view.readiness.state,'released');equal(view.actions.edit.allowed,true);equal(view.processingClosed,true);equal(view.review.status,'pending');equal(view.review.reviewedBy,null);equal(view.review.reviewedAt,null);
  equal(view.release.actor.id,'hr');equal(view.review.revision,2);equal(f.state.application.processing_token,null);
  deepEqual(f.state.tasks,[original]);deepEqual(f.state.application.answers,{cv:'immutable'});equal(f.state.application.stage,'received');equal(f.state.application.flow_revision,1);equal(f.state.notices.length,0);
  const duplicate=await f.service.release(id,actor,{expectedRevision:2});deepEqual(duplicate,view);
  await rejects(f.service.release(id,actor,{expectedRevision:1}),status(409));
});
test('release enforces role, applicability, lock, request shape and revision without writes',async()=>{
  for(const role of ['candidate','interviewer']) {
    const f=setup();equal(roleAllows(role,'review.release'),false);
    for(const op of [()=>f.service.get(id,{id:'x',role}),()=>f.service.release(id,{id:'x',role},{expectedRevision:1}),()=>f.service.patch(id,{id:'x',role},{expectedRevision:1,status:'completed'})])await rejects(async()=>op(),status(403));
    equal(f.queries.length,0);
  }
  for(const [application,tasks,code] of [
    [row({vacancy_snapshot:{formDefinition:{inputs:[]},processingDefinition:{tasks:[]}}}),[],400],
    [row({stage:'preselected'}),[],409],[row({review_status:'completed'}),[],409],
    [row({processing_state:'completed'}),[task({status:'completed'})],409],
    [row({review_revision:2}),[],409],
  ]){const f=setup(application,tasks);await rejects(f.service.release(id,actor,{expectedRevision:1}),status(code));equal(f.queries.some(sql=>sql.startsWith('UPDATE')),false);}
  for(const body of [{},{expectedRevision:0},{expectedRevision:1,force:true}])await rejects(async()=>setup().service.release(id,actor,body),status(400));
});
test('ordinary terminal failures permit partial completion while operational/legacy failures do not',async()=>{
  for(const category of ['ordinary_terminal','operational',null]) {
    const f=setup(row({processing_state:'completed_with_errors'}),[task({status:'failed',failure_category:category,result:{status:'failed',value:null,reason:'Unavailable',retryable:false}})]);
    if(category!=='ordinary_terminal') {await rejects(f.service.patch(id,actor,{expectedRevision:1,status:'completed'}),status(409));continue;}
    const view=await f.service.patch(id,actor,{expectedRevision:1,status:'completed'});
    equal(view.review.status,'completed');equal(view.tasks[0].effectiveValue,null);equal(view.tasks[0].hasCorrection,false);equal(view.readiness.state,'locked');
  }
});
test('released pending work can be human-completed without fabricating task success',async()=>{
  const f=setup(row(),[task()]);await f.service.release(id,actor,{expectedRevision:1});
  const view=await f.service.patch(id,actor,{expectedRevision:2,status:'completed'});
  equal(view.review.reviewedBy,'hr');equal(view.tasks[0].status,'pending');equal(view.tasks[0].result.value,null);equal(view.tasks[0].hasCorrection,false);
  await rejects(f.service.patch(id,actor,{expectedRevision:3,status:'in_review'}),status(409));
});
test('concurrent HR releases have one winner/attribution in serialized model',async()=>{
  const f=setup();const results=await Promise.allSettled([f.service.release(id,actor,{expectedRevision:1}),f.service.release(id,{id:'other',role:'admin'},{expectedRevision:1})]);
  equal(results.filter(r=>r.status==='fulfilled').length,1);equal(f.state.application.review_revision,2);equal(f.state.application.processing_released_by,'hr');
});
const success={result:{status:'completed',value:{skills:['SQL']},evidence:[]},provenance:{mode:'fixture',fixtureId:'synthetic'}};
test('save-first invalidates release snapshot; release-first fences late save/start/finish/assert/bind/claim',async()=>{
  const f=setup(row({processing_state:'processing'}),[task({status:'processing'})]);
  await f.repository.save(id,'token','skills',success);await rejects(f.service.release(id,actor,{expectedRevision:1}),status(409));
  await f.service.release(id,actor,{expectedRevision:2});const before=structuredClone(f.state);
  for(const op of [()=>f.repository.save(id,'token','skills',success),()=>f.repository.start(id,'token','skills'),()=>f.repository.finish(id,'token'),()=>f.repository.assertActive(id,'token')])await rejects(op(),/lease lost/);
  await rejects(f.repository.bind([{applicationId:id}]),/closed/);equal(await f.repository.claim(id),undefined);deepEqual(f.state,before);
  ok(f.queries.some(sql=>sql.includes('processing_released_at IS NULL')&&sql.includes('FOR UPDATE')));
});
test('task start and finish invalidate release evidence snapshots without changing workflow revision',async()=>{
  const f=setup(row({processing_state:'processing'}),[task()]);
  await f.repository.start(id,'token','skills');equal(f.state.application.review_revision,2);
  await rejects(f.service.release(id,actor,{expectedRevision:1}),status(409));
  await f.repository.save(id,'token','skills',success);await f.repository.finish(id,'token');
  equal(f.state.application.review_revision,4);equal((await f.service.get(id,actor)).readiness.state,'ready');equal(f.state.application.flow_revision,1);
});
test('screening and release serialize without completing review or duplicating candidate effects',async()=>{
  for(const screeningFirst of [true,false]) {
    const f=setup();
    const screen=()=>f.database.transaction(client=>commitScreening(client,f.state.application,actor,'preselected'));
    if(screeningFirst){await screen();await rejects(f.service.release(id,actor,{expectedRevision:1}),status(409));}
    else {await f.service.release(id,actor,{expectedRevision:1});await screen();}
    const view=await f.service.get(id,actor);equal(view.readiness.state,'locked');equal(view.review.status,'pending');equal(f.state.notices.length,1);
  }
});
test('application projection exposes closure only to HR, not candidate or assigned interviewer',async()=>{
  const f=setup(row({processing_released_at:'2026-11-07',processing_released_by:'hr'}));
  const service=new ApplicationService(f.database,{});
  equal((await service.get(id,actor)).processingClosed,true);
  const candidate=await service.get(id,{id:'candidate',role:'candidate'});
  for(const key of ['processingClosed','release','readiness','review','actions'])equal(Object.hasOwn(candidate,key),false);
  const interviewerDatabase={async query(sql){if(sql.includes('FROM interviews'))return {rows:[{id:'assigned'}]};return f.database.query(sql);}};
  const interviewer=await new ApplicationService(interviewerDatabase,{}).get(id,{id:'assigned',role:'interviewer'});
  for(const key of ['processingClosed','release','readiness','review','actions'])equal(Object.hasOwn(interviewer,key),false);
});
test('fixture-only execution persists deliberate terminal failure distinctly from setup/infrastructure failures',async()=>{
  const bytes=Buffer.from('SYNTHETIC DOCUMENT'), source={id:'22222222-2222-4222-8222-222222222222',storage_ref:'synthetic',content_hash:createHash('sha256').update(bytes).digest('hex'),byte_count:bytes.length};
  const registry=new FixtureRegistry();registry.load([{fixtureKey:'synthetic',applicationId:id,documentId:source.id,sourceHash:source.content_hash,taskId:'skills',args:definition.args,text:'FIXTURE ONLY',result:{status:'failed',value:null,reason:'FIXTURE ONLY: unavailable',retryable:false}}]);
  const executor=new ContextTaskExecutor(new DisabledTaskExecutor(),registry);
  const reader=new ContextTextReader(new DisabledTextReader(),registry);
  for(const [fixtureKey,expected] of [['synthetic','ordinary_terminal'],['missing','operational']]){
    const saved=[];const repository={async claim(){return {id,token:'token',tasks:[{...task(),type:'extractSkills',fixture_key:fixtureKey}]};},async start(){return true;},async source(){return source;},async assertActive(){},async save(_id,_token,_task,value){saved.push(value);},async finish(){}};
    await new ProcessingService(repository,{async read(){return bytes;}},reader,executor).processOne(id);
    equal(saved[0].result.failureCategory,expected);equal(saved[0].provenance.mode,'fixture');
  }
});
test('service classifies missing/domain/storage/unexpected failures without inferring from message spelling',async()=>{
  const bytes=Buffer.from('SYNTHETIC'),source={id:'doc',storage_ref:'synthetic',content_hash:createHash('sha256').update(bytes).digest('hex'),byte_count:bytes.length};
  for(const [where,failure,category,retryable] of [
    ['source',null,'ordinary_terminal',false],
    ['reader',new ProcessingFailure('Unsupported source.',false,'ordinary_terminal'),'ordinary_terminal',false],
    ['reader',new ProcessingFailure('Any message.',true),'operational',true],
    ['storage',Object.assign(new Error('Any message.'),{code:'EIO'}),'operational',true],
    ['reader',new Error('PDF is corrupt.'),'unclassified',false],
  ]){
    const saved=[];const repository={async claim(){return {id,token:'token',tasks:[{...task(),type:'extractSkills',fixture_key:null}]};},async start(){return true;},async source(){return where==='source'?undefined:source;},async assertActive(){},async save(_id,_token,_task,value){saved.push(value);},async finish(){}};
    const service=new ProcessingService(repository,{async read(){if(where==='storage')throw failure;return bytes;}},{async read(){throw failure;}},new DisabledTaskExecutor());
    await service.processOne(id);equal(saved[0].result.failureCategory,category);equal(saved[0].result.retryable,retryable);
    equal(reviewReadiness(row({processing_state:'completed_with_errors'}),[outcome('failed',category,retryable)]).state,category==='ordinary_terminal'?'ready':'blocked');
  }
});
test('claim source fences release and labels recovered interruptions uncertain, without changing retry safety policy',async()=>{
  const queries=[];
  const client={async query(sql){queries.push(sql);if(sql.startsWith('SELECT * FROM applications'))return {rows:[row({processing_state:'processing'})],rowCount:1};if(sql.startsWith('SELECT * FROM application_tasks'))return {rows:[task({status:'failed',failure_category:'uncertain',retryable:true})]};return {rows:[],rowCount:1};}};
  const repository=new ProcessingRepository({transaction:work=>work(client)});
  await repository.claim(id);
  ok(queries[0].includes('processing_released_at IS NULL'));
  ok(queries.some(sql=>sql.includes("failure_category='uncertain'")&&sql.includes('retryable=true')));
  ok(queries.some(sql=>sql.includes("processing_state='processing'")&&sql.includes('review_revision=review_revision+1')));
});
