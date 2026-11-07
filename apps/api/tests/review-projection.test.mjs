import {test} from 'node:test';
import {equal,deepEqual,ok,rejects} from 'node:assert/strict';
import {reviewReadinessStates} from '@recruitment/domain';
import {ApplicationService} from '../dist/applications/application.service.js';
import {ReviewService} from '../dist/review/review.service.js';
import {reviewReadinessSql,readinessView} from '../dist/review/review-readiness.js';
import {screeningExportSchema} from '../dist/applications/application-filters.js';

const actor={id:'hr',role:'recruiter'};
function fixture(state){return {id:state,vacancy_id:'vac',candidate_id:'candidate',candidate_identity:{name:'Synthetic',email:'candidate@example.test'},title:'Synthetic',stage:state==='locked'?'preselected':'received',processing_state:'pending',submitted_at:'2026-11-07T00:00:00Z',review_status:state==='not_required'?'completed':'pending',review_revision:1,reviewed_by:null,reviewed_at:null,review_required:state!=='not_required',processing_released_at:state==='released'?'2026-11-07':null,readiness:state,has_corrections:false};}
test('staff list projects readiness and release-aware closure without relabelling execution/review',async()=>{
  const calls=[];const service=new ApplicationService({async query(sql,args){calls.push({sql,args});return {rows:[{items:reviewReadinessStates.map(fixture),total:6,review_required:true}]};}},{});
  const page=await service.list(actor,{readiness:'released',limit:'2',offset:'2'},'vac');
  for(const item of page.items){deepEqual(item.readiness,readinessView(item.id));equal(item.processingState,'pending');equal(item.review.status,item.id==='not_required'?'completed':'pending');equal(item.processingClosed,['not_required','released','locked'].includes(item.id));}
  equal(calls[0].args[9],'released');equal(calls[0].args[1],'vac');
  ok(calls[0].sql.includes(reviewReadinessSql));
  ok(calls[0].sql.indexOf('readiness=$10')<calls[0].sql.indexOf('LIMIT $3'));
  ok(calls[0].sql.includes('count(*)::integer FROM visible'));
});
test('candidate cannot request any readiness filter and receives no HR metadata even from a polluted fake row',async()=>{
  let calls=0;let query;const service=new ApplicationService({async query(sql){calls++;query=sql;return {rows:[{items:[{...fixture('released'),release:{actor:'internal'}}],total:1,review_required:true}]};}},{});
  for(const readiness of reviewReadinessStates)await rejects(service.list({id:'candidate',role:'candidate'},{readiness}),e=>e.getStatus()===403);
  equal(calls,0);
  const page=await service.list({id:'candidate',role:'candidate'},{});equal(page.items[0].stage,'received');
  for(const key of ['reviewRequired','release','readiness','processingClosed','review']){equal(Object.hasOwn(page,key),false);equal(Object.hasOwn(page.items[0],key),false);}
  equal(query.includes('jsonb_array_elements'),false);
  await rejects(service.list({id:'interviewer',role:'interviewer'},{readiness:'ready'}),e=>e.getStatus()===403);
});
test('readiness filter accepts only factual states; SQL covers missing definitions and conservative failures',()=>{
  for(const readiness of reviewReadinessStates)equal(screeningExportSchema.safeParse({readiness}).success,true);
  for(const readiness of ['preselection_ready','completed_with_errors','',"ready' OR true"])equal(screeningExportSchema.safeParse({readiness}).success,false);
  ok(reviewReadinessSql.indexOf("THEN 'not_required'")<reviewReadinessSql.indexOf("THEN 'locked'"));
  ok(reviewReadinessSql.indexOf("THEN 'locked'")<reviewReadinessSql.indexOf("THEN 'released'"));
  ok(reviewReadinessSql.includes('LEFT JOIN application_tasks'));
  ok(reviewReadinessSql.includes('t.status IS NULL'));
  ok(reviewReadinessSql.includes("t.failure_category IS DISTINCT FROM 'ordinary_terminal'"));
  equal(reviewReadinessSql.includes('attempts'),false);
});
test('screening export uses the identical readiness expression in a repeatable snapshot and preserves diagnostic columns',async()=>{
  const calls=[];
  const vacancy={formDefinition:{inputs:[]},processingDefinition:{tasks:[{id:'skills',sourceInputId:'cv',outputKey:'skills',args:{skills:['SQL'],evidence:false}}]}};
  const application={...fixture('released'),vacancy_snapshot:vacancy,answers:{},processing_state:'completed_with_errors',processing_released_by:null,processing_released_at:'2026-11-07'};
  const database={transaction:work=>work({async query(sql,args){calls.push({sql,args});
    if(sql.startsWith('SET TRANSACTION'))return {};
    if(sql.includes('FROM vacancies'))return {rows:[{form_definition:vacancy.formDefinition,processing_definition:vacancy.processingDefinition}]};
    if(sql.startsWith('SELECT id FROM applications'))return {rows:[{id:'released'}]};
    if(sql.startsWith('SELECT * FROM applications'))return {rows:[application]};
    if(sql.includes('FROM application_tasks')||sql.includes('FROM application_documents'))return {rows:[]};
    throw new Error(`Unexpected offline SQL: ${sql}`);
  }})};
  const service=new ReviewService(database);
  const csv=await service.export('vac',{readiness:'released'});
  ok(csv.split('\r\n')[0].includes('"review_readiness"'));ok(csv.includes('"released"'));
  const selection=calls.find(call=>call.sql.startsWith('SELECT id FROM applications'));
  ok(selection.sql.includes(reviewReadinessSql));equal(selection.args[5],'released');ok(selection.sql.includes("stage IN ('received','review_ready')"));
  ok(calls[0].sql.includes('REPEATABLE READ'));
  calls.length=0;const diagnostic=await service.export('vac');equal(diagnostic.split('\r\n')[0].includes('review_readiness'),false);equal(calls.find(call=>call.sql.startsWith('SELECT id FROM applications')).sql.includes(reviewReadinessSql),false);
});
