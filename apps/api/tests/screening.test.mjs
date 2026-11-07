import { test } from 'node:test';
import { equal, deepEqual, rejects, ok } from 'node:assert/strict';
import { ScreeningService } from '../dist/interviews/screening.service.js';
import { commitScreening } from '../dist/interviews/screening-command.js';
import { ProcessingRepository } from '../dist/processing/processing.repository.js';
import { reviewEditable } from '../dist/review/review.policy.js';

const vacancy='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const id='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
const actor={id:'hr',role:'recruiter'};
const item=(applicationId=id)=>({applicationId,email:'person@example.test',decision:'rejected',expectedRevision:1});
const record=(applicationId=id)=>({id:applicationId,stage:'received',flow_revision:1,candidate_id:'candidate',candidate_identity:{name:'Synthetic',email:'person@example.test'},review_status:'pending',processing_state:'processing',processing_token:'old'});
function setup(records=[record()],failNotice=false){
  let state={records:structuredClone(records),notifications:[]};let tail=Promise.resolve();const queries=[];
  const client={async query(sql,args=[]){
    queries.push(sql);
    if(sql.startsWith('SELECT id FROM vacancies'))return {rowCount:1,rows:[{id:vacancy}]};
    if(sql.startsWith('SELECT'))return {rows:state.records.filter(row=>args[1].includes(row.id)).map(row=>({...row}))};
    if(sql.startsWith('UPDATE applications')){
      const row=state.records.find(row=>row.id===args[0]);row.stage=args[1];row.flow_revision++;row.processing_token=null;row.screening_decision=args[2];row.screening_reason=args[3];return {rowCount:1};
    }
    if(sql.includes('INSERT INTO screening_notifications')){if(failNotice)throw new Error('simulated notification failure');state.notifications.push({applicationId:args[0],decision:args[1],body:args[3]});return {rowCount:1};}
    throw new Error(`Unexpected fake SQL: ${sql}`);
  }};
  const database={transaction(work){const operation=tail.then(async()=>{const before=structuredClone(state);try{return await work(client);}catch(e){state=before;throw e;}});tail=operation.catch(()=>{});return operation;}};
  return {service:new ScreeningService(database),database,queries,get state(){return state;}};
}
test('preview validates stored email and vacancy scope; marks already-decided separately without mutations',async()=>{
  const f=setup([record(),{...record(other),stage:'preselected'}]);
  const result=await f.service.preview(vacancy,actor,`application_id,candidate_email,decision,extra\n${id},person@example.test,rejected,ignored\n${other},person@example.test,preselected,ignored\n33333333-3333-4333-8333-333333333333,person@example.test,rejected,ignored`);
  deepEqual(result.rows.map(row=>row.state),['valid','decided','invalid']);equal(result.rows[2].candidate,null);
  equal(f.state.notifications.length,0);
});
test('non-HR cannot preview/apply, and email mismatch never exposes stored identity',async()=>{
  const f=setup();
  for(const role of ['candidate','interviewer']){await rejects(f.service.preview(vacancy,{id:'x',role},''),e=>e.getStatus()===403);await rejects(f.service.apply(vacancy,{id:'x',role},{rows:[item()]}),e=>e.getStatus()===403);}
  const result=await f.service.preview(vacancy,actor,`application_id,candidate_email,decision\n${id},wrong@example.test,rejected`);
  equal(result.rows[0].state,'invalid');equal(result.rows[0].candidate,null);
});
test('one conflict rejects the entire set before writes, with safe row information',async()=>{
  const f=setup([record(),{...record(other),stage:'preselected',flow_revision:2}]);
  await rejects(f.service.apply(vacancy,actor,{rows:[item(),item(other)]}),e=>{equal(e.getStatus(),409);equal(e.getResponse().conflicts[0].state,'decided');return true;});
  equal(f.state.records[0].stage,'received');equal(f.state.notifications.length,0);
  ok(f.queries.some(sql=>sql.includes('ORDER BY id FOR UPDATE')));
});
test('confirmation records optional reason, fences work and does not put internal text in candidate notice',async()=>{
  const f=setup();
  const result=await f.service.apply(vacancy,actor,{rows:[{...item(),reason:'Internal explanation'}]});
  equal(result.applied,1);equal(f.state.records[0].processing_token,null);equal(f.state.records[0].screening_reason,'Internal explanation');
  equal(f.state.notifications[0].body.includes('Internal explanation'),false);
  await rejects(f.service.apply(vacancy,actor,{rows:[item()]}),e=>e.getStatus()===409);
  equal(f.state.records[0].flow_revision,2);equal(f.state.notifications.length,1);
});
test('notification failure rolls back changes in the transaction model',async()=>{
  const f=setup([record(),record(other)],true);
  await rejects(f.service.apply(vacancy,actor,{rows:[item(),item(other)]}),/notification failure/);
  equal(f.state.records[0].stage,'received');equal(f.state.notifications.length,0);
});
test('overlapping confirmations in the serialized transaction model have one winner',async()=>{
  const f=setup();const results=await Promise.allSettled([f.service.apply(vacancy,actor,{rows:[item()]}),f.service.apply(vacancy,actor,{rows:[{...item(),decision:'preselected'}]})]);
  equal(results.filter(result=>result.status==='fulfilled').length,1);equal(f.state.notifications.length,1);
});
test('duplicate IDs, stale revisions and supplied identities are checked on direct apply',async()=>{
  for(const rows of [[item(),item()],[{...item(),expectedRevision:2}],[{...item(),email:'wrong@example.test'}]]){const f=setup();await rejects(f.service.apply(vacancy,actor,{rows}));equal(f.state.records[0].stage,'received');}
});
test('closed processing operations cannot start/save/finish or mutate task data',async()=>{
  const queries=[];const client={async query(sql){queries.push(sql);return {rowCount:0,rows:[]};}};
  const repository=new ProcessingRepository({transaction:work=>work(client)});
  for(const run of [()=>repository.start(id,'token','task'),()=>repository.save(id,'token','task',{}),()=>repository.finish(id,'token'),()=>repository.assertActive(id,'token')])await rejects(run(),/lease lost/);
  ok(queries.every(sql=>sql.includes("stage IN ('received','review_ready')")&&sql.includes("review_status<>'completed'")&&sql.includes('FOR UPDATE')));
  equal(reviewEditable(true,'preselected','pending').allowed,false);equal(reviewEditable(true,'received','completed').allowed,false);
});
test('common screening operation refuses a second outcome before any writes',async()=>{
  await rejects(commitScreening({query(){throw new Error('must not write');}},{...record(),stage:'preselected'},actor,'rejected'),e=>e.getStatus()===409);
});
