import 'reflect-metadata';
import { test } from 'node:test';
import { equal, rejects, ok } from 'node:assert/strict';
import { InterviewService } from '../dist/interviews/interview.service.js';
import { workflowActions } from '../dist/interviews/interview.policy.js';

const owner={id:'owner',role:'recruiter'},id='11111111-1111-4111-8111-111111111111';
const status=expected=>error=>error.getStatus()===expected;
function fixture({stage='preselected',total=0,passed=0}={}) {
  let state={id,stage,flow_revision:1,vacancy_id:'vacancy',candidate_id:'candidate',screeningNotices:0};
  let tail=Promise.resolve();const queries=[];
  const client={async query(sql,args=[]){
    queries.push(sql);
    if(sql.startsWith('SELECT vacancy_id'))return {rows:[{vacancy_id:state.vacancy_id}]};
    if(sql.startsWith('SELECT v.*'))return {rows:[{id:'vacancy',owner_id:'owner',owner_name:'Synthetic owner',owner_email:'owner@example.test'}]};
    if(sql.startsWith('SELECT * FROM applications'))return {rows:[{...state}]};
    if(sql.startsWith('SELECT count(*)::integer AS total'))return {rows:[{total,passed}]};
    if(sql.startsWith('UPDATE applications SET stage')){state.stage=args[1];state.flow_revision++;return {rowCount:1};}
    if(sql.startsWith('INSERT INTO screening_notifications')){state.screeningNotices++;return {rowCount:1};}
    throw new Error(`Unexpected fake SQL: ${sql}`);
  }};
  const database={transaction(work){const task=tail.then(async()=>{const previous={...state};try{return await work(client);}catch(e){state=previous;throw e;}});tail=task.catch(()=>{});return task;}};
  const service=new InterviewService(database);
  // The ordinary post-commit read is outside this command/transaction model.
  service.application=async()=>({stage:state.stage,revision:state.flow_revision});
  return {service,queries,get state(){return state;}};
}
test('availability matrix grants empty-plan Offer only to HR owner after preselection; Hired separately requires Offer',()=>{
  for(const role of ['admin','recruiter','interviewer','candidate'])for(const actorId of ['owner','other'])for(const stage of ['received','review_ready','preselected','interview','offer','hired','not_selected'])for(const total of [0,2])for(const passed of total?[0,1,2]:[0]){
    const actions=workflowActions({id:actorId,role},{ownerId:'owner',stage,total,passed});
    const authorized=['admin','recruiter'].includes(role)&&actorId==='owner';
    equal(actions.offer.allowed,authorized&&(total===0?stage==='preselected':stage==='interview'&&passed===total),`${role}/${actorId}/${stage}/${total}/${passed}`);
    equal(actions.hire.allowed,authorized&&stage==='offer');
  }
});
test('empty-plan owner explicitly records Offer, then separately Hired; no interview or automatic candidate notice',async()=>{
  const f=fixture();equal(f.state.stage,'preselected');
  const offered=await f.service.stage(id,owner,{expectedRevision:1,stage:'offer'});equal(offered.stage,'offer');equal(f.state.flow_revision,2);
  equal(f.state.screeningNotices,0);equal(f.queries.some(sql=>sql.startsWith('INSERT')),false);
  const hired=await f.service.stage(id,owner,{expectedRevision:2,stage:'hired'});equal(hired.stage,'hired');equal(f.state.flow_revision,3);
  ok(f.queries.some(sql=>sql.includes('FOR SHARE OF v')));ok(f.queries.some(sql=>sql.includes('FOR UPDATE')));
});
test('preselection with no interviews does not automatically record Offer',async()=>{
  const f=fixture({stage:'received'});await f.service.stage(id,owner,{expectedRevision:1,stage:'preselected'});
  equal(f.state.stage,'preselected');equal(f.state.flow_revision,2);equal(f.state.screeningNotices,1);
});
test('nonowner HR/admin and non-HR actors cannot finalize, including direct requests',async()=>{
  for(const actor of [{id:'other',role:'admin'},{id:'other',role:'recruiter'},{id:'owner',role:'interviewer'},{id:'owner',role:'candidate'}]){
    for(const stage of ['offer','hired']){const f=fixture({stage:stage==='hired'?'offer':'preselected'});await rejects(f.service.stage(id,actor,{expectedRevision:1,stage}),status(403));equal(f.state.flow_revision,1);}
  }
});
test('zero-interview Offer cannot skip preselection and Hired cannot skip Offer',async()=>{
  for(const stage of ['received','review_ready','interview','offer','hired','not_selected']){
    const f=fixture({stage});await rejects(f.service.stage(id,owner,{expectedRevision:1,stage:'offer'}),status(409));equal(f.state.flow_revision,1);
  }
  const f=fixture();await rejects(f.service.stage(id,owner,{expectedRevision:1,stage:'hired'}),status(409));equal(f.state.stage,'preselected');
});
test('nonempty plans still require interview stage and every configured interview passed',async()=>{
  for(const [stage,passed] of [['preselected',0],['preselected',2],['interview',0],['interview',1]]){
    const f=fixture({stage,total:2,passed});await rejects(f.service.stage(id,owner,{expectedRevision:1,stage:'offer'}),status(409));equal(f.state.flow_revision,1);
  }
  const f=fixture({stage:'interview',total:2,passed:2});await f.service.stage(id,owner,{expectedRevision:1,stage:'offer'});equal(f.state.stage,'offer');
  ok(f.queries.some(sql=>sql.includes("i.status='completed' AND i.outcome='pass'")));
});
test('stale finalization and serialized duplicate confirmations cannot increment twice',async()=>{
  const f=fixture();await rejects(f.service.stage(id,owner,{expectedRevision:2,stage:'offer'}),status(409));
  const results=await Promise.allSettled([f.service.stage(id,owner,{expectedRevision:1,stage:'offer'}),f.service.stage(id,owner,{expectedRevision:1,stage:'offer'})]);
  equal(results.filter(result=>result.status==='fulfilled').length,1);equal(f.state.flow_revision,2);equal(f.state.stage,'offer');
});
