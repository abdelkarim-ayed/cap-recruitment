import 'reflect-metadata';
import { test } from 'node:test';
import { equal, deepEqual, rejects, ok } from 'node:assert/strict';
import { VacancyService } from '../dist/vacancies/vacancy.service.js';
import { VacancyRepository } from '../dist/vacancies/vacancy.repository.js';
import { InterviewService } from '../dist/interviews/interview.service.js';

const id='11111111-1111-4111-8111-111111111111';
const owner={id:'owner',role:'recruiter'};
const publication={expectedRevision:1,expectedInterviewRevision:1};
const entry={id:'saved-entry',position:0,name:'Technical',instructions:'Prepare questions.'};
function fixture({status='draft',revision=1,interviewRevision=1,entries=[],scheduled=false,form}={}) {
  let state={vacancy:{id,owner_id:owner.id,owner_name:'Synthetic owner',owner_email:'owner@example.test',status,revision,interview_revision:interviewRevision,title:'Synthetic vacancy',description:'Synthetic only',location:null,created_at:'2026-11-07T00:00:00Z',updated_at:'2026-11-07T00:00:00Z',form_definition:form??{version:1,inputs:[{id:'name',name:'name',label:'Name',type:'text',required:true,args:{}}]},processing_definition:{version:1,tasks:[]}},entries:structuredClone(entries)};
  let tail=Promise.resolve();const queries=[];
  const client={async query(sql,args=[]) {
    queries.push(sql);
    if(sql.startsWith('SELECT v.*'))return {rows:[structuredClone(state.vacancy)]};
    if(sql.startsWith('SELECT EXISTS'))return {rows:[{frozen:scheduled}]};
    if(sql.startsWith('SELECT id FROM interviews'))return {rows:scheduled?[{id:'appointment'}]:[]};
    if(sql.startsWith('SELECT position,name,instructions'))return {rows:state.entries.map(({position,name,instructions})=>({position,name,instructions}))};
    if(sql.startsWith('SELECT name,instructions'))return {rows:state.entries.map(({name,instructions})=>({name,instructions}))};
    if(sql.startsWith('SELECT id,name,instructions,position'))return {rows:structuredClone(state.entries)};
    if(sql.startsWith('DELETE FROM interview_steps')){state.entries=[];return {rowCount:1};}
    if(sql.startsWith('INSERT INTO interview_steps')){state.entries.push({id:args[0],position:args[2],name:args[3],instructions:args[4]});return {rowCount:1};}
    if(sql.startsWith('UPDATE vacancies SET interview_revision')){state.vacancy.interview_revision++;return {rowCount:1};}
    if(sql.startsWith('UPDATE vacancies SET status')){state.vacancy.status=args[1];state.vacancy.revision++;return {rows:[structuredClone(state.vacancy)]};}
    throw new Error(`Unexpected fake SQL: ${sql}`);
  }};
  const database={transaction(work){const task=tail.then(async()=>{const previous=structuredClone(state);try{return await work(client);}catch(e){state=previous;throw e;}});tail=task.catch(()=>{});return task;}};
  return {vacancies:new VacancyService(new VacancyRepository(database)),interviews:new InterviewService(database),queries,get state(){return state;}};
}
const status=expected=>error=>error.getStatus()===expected;
test('publish validates an empty plan under the vacancy lock without adding an interview or incrementing its revision',async()=>{
  const f=fixture();const result=await f.vacancies.transition(id,owner.id,'published',publication);
  equal(result.status,'published');equal(result.revision,2);equal(f.state.vacancy.interview_revision,1);equal(f.state.entries.length,0);
  ok(f.queries[0].includes('FOR UPDATE OF v'));
  const view=await f.interviews.pipeline(id,owner);equal(view.frozen,true);equal(view.editable,false);equal(view.actions.edit.allowed,false);
});
test('publication rejects stale vacancy or interview counters before persisting anything',async()=>{
  for(const request of [{...publication,expectedRevision:2},{...publication,expectedInterviewRevision:2}]){
    const f=fixture();await rejects(f.vacancies.transition(id,owner.id,'published',request),status(409));equal(f.state.vacancy.status,'draft');equal(f.state.vacancy.revision,1);
  }
});
test('invalid stored plan or empty intake prevents publication; no ownership override',async()=>{
  for(const options of [{entries:[{...entry,name:' '}]},{entries:[{...entry,position:2}]},{form:{version:1,inputs:[]}}]){
    const f=fixture(options);await rejects(f.vacancies.transition(id,owner.id,'published',publication),status(400));equal(f.state.vacancy.status,'draft');
  }
  const f=fixture();await rejects(f.vacancies.transition(id,'another-admin','published',publication),status(403));equal(f.queries.some(sql=>sql.startsWith('SELECT position')),false);
});
test('published and closed plans reject even identical owner saves without replacing IDs',async()=>{
  for(const state of ['published','closed']){
    const f=fixture({status:state,entries:[entry]});await rejects(f.interviews.savePipeline(id,owner,{expectedRevision:1,steps:[{name:entry.name,instructions:entry.instructions}]}),status(409));
    deepEqual(f.state.entries,[entry]);equal(f.state.vacancy.interview_revision,1);equal(f.queries.some(sql=>sql.startsWith('DELETE')),false);
  }
});
test('draft no-op saves still preserve IDs and counters; real edits only increment interview revision',async()=>{
  const f=fixture({entries:[entry]});await f.interviews.savePipeline(id,owner,{expectedRevision:1,steps:[{name:' Technical ',instructions:' Prepare questions. '}]});
  deepEqual(f.state.entries,[entry]);equal(f.state.vacancy.interview_revision,1);
  await f.interviews.savePipeline(id,owner,{expectedRevision:1,steps:[]});equal(f.state.entries.length,0);equal(f.state.vacancy.interview_revision,2);equal(f.state.vacancy.revision,1);
});
test('same-state owner publish remains idempotent despite stale counters; nonowners remain denied',async()=>{
  const f=fixture({status:'published',revision:7,interviewRevision:3});
  const result=await f.vacancies.transition(id,owner.id,'published',publication);equal(result.revision,7);equal(f.queries.some(sql=>sql.startsWith('SELECT position')),false);
  await rejects(f.vacancies.transition(id,'other','published',publication),status(403));
});
test('serialized publish/edit model: publication winner freezes later plan edits',async()=>{
  const f=fixture();const results=await Promise.allSettled([f.vacancies.transition(id,owner.id,'published',publication),f.interviews.savePipeline(id,owner,{expectedRevision:1,steps:[{name:'New interview'}]})]);
  equal(results[0].status,'fulfilled');equal(results[1].status,'rejected');equal(f.state.vacancy.status,'published');equal(f.state.entries.length,0);
});
test('serialized publish/edit model: plan-edit winner makes the older publication conflict',async()=>{
  const f=fixture();const results=await Promise.allSettled([f.interviews.savePipeline(id,owner,{expectedRevision:1,steps:[{name:'New interview'}]}),f.vacancies.transition(id,owner.id,'published',publication)]);
  equal(results[0].status,'fulfilled');equal(results[1].status,'rejected');equal(f.state.vacancy.status,'draft');equal(f.state.vacancy.interview_revision,2);
});
test('draft with legacy appointments stays frozen defensively; authority and revisions remain separate',async()=>{
  const f=fixture({scheduled:true});equal((await f.interviews.pipeline(id,owner)).frozen,true);
  await rejects(f.interviews.savePipeline(id,{id:'other',role:'admin'},{expectedRevision:1,steps:[]}),status(403));
  await rejects(f.interviews.savePipeline(id,owner,{expectedRevision:2,steps:[]}),status(409));
  await rejects(f.interviews.savePipeline(id,owner,{expectedRevision:1,steps:[]}),status(409));
});
