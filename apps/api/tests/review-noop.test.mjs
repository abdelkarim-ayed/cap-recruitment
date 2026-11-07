import {test} from 'node:test';
import {equal,deepEqual,ok,rejects} from 'node:assert/strict';
import {ReviewService} from '../dist/review/review.service.js';
import {sameSkillCorrection} from '../dist/review/review-noop.js';

const id='11111111-1111-4111-8111-111111111111',actor={id:'second',role:'recruiter'};
const oldTime='2026-11-07T08:00:00Z',newTime='2026-11-07T09:00:00Z';
const definitions=['skills','extra'].map(taskId=>({id:taskId,sourceInputId:'cv',outputKey:taskId,type:'extractSkills',args:{skills:['sql','rust'],evidence:false}}));
const original={status:'completed',value:{skills:['SQL']},evidence:['FIXTURE ONLY']};
const correction=(value={skills:['SQL'],unavailableSkills:['rust']})=>({value,corrected_by:'first',corrected_at:oldTime});
const patch=(changes={})=>({expectedRevision:7,...changes});
const update=(value,taskId='skills')=>({taskId,value});
const hasStatus=code=>error=>error.getStatus()===code;
// Offline serialized transaction model; no PostgreSQL, HTTP or provider calls.
function setup({application={},corrections={skills:correction()},tasks,failWrite=false}={}) {
  let state={application:{id,stage:'received',flow_revision:11,processing_state:'completed',processing_released_at:null,processing_released_by:null,processing_token:'token',processing_lease_until:'2999-01-01',processing_next_at:null,review_status:'in_review',review_revision:7,reviewed_by:'first',review_updated_at:oldTime,reviewed_at:null,answers:{answer:'Immutable'},vacancy_snapshot:{formDefinition:{inputs:[]},processingDefinition:{tasks:definitions}},...application},tasks:tasks??definitions.map(task=>({task_id:task.id,status:'completed',attempts:1,retryable:false,result:structuredClone(original),provenance:{mode:'fixture',fixtureId:'SYNTHETIC ONLY'}})),corrections:structuredClone(corrections)};
  let tail=Promise.resolve();const queries=[];
  const client={async query(sql,args=[]){
    queries.push({sql,args:structuredClone(args)});
    if(sql.startsWith('SELECT * FROM applications'))return {rows:[structuredClone(state.application)]};
    if(sql.startsWith('SELECT id,name,email'))return {rows:[{id:args[0],name:`Synthetic ${args[0]}`,email:`${args[0]}@example.test`}]};
    if(sql.includes('SELECT t.*'))return {rows:state.tasks.map(task=>{const c=state.corrections[task.task_id];return {...structuredClone(task),has_correction:!!c,correction:c?.value??null,corrected_by:c?.corrected_by??null,corrected_at:c?.corrected_at??null,corrected_name:c?`Synthetic ${c.corrected_by}`:null,corrected_email:c?`${c.corrected_by}@example.test`:null};})};
    if(sql.startsWith('INSERT INTO application_tasks')){if(!state.tasks.some(task=>task.task_id===args[1]))state.tasks.push({task_id:args[1],status:'pending',attempts:0,retryable:false});return {rowCount:1};}
    if(sql.startsWith('INSERT INTO extraction_corrections')){state.corrections[args[1]]={value:JSON.parse(args[2]),corrected_by:args[3],corrected_at:newTime};return {rowCount:1};}
    if(sql.startsWith('DELETE FROM extraction_corrections')){delete state.corrections[args[1]];return {rowCount:1};}
    if(sql.startsWith('UPDATE applications SET review_status')){
      Object.assign(state.application,{review_status:args[1],review_revision:state.application.review_revision+1,reviewed_by:args[2],review_updated_at:newTime,reviewed_at:args[1]==='completed'?newTime:null});
      if(failWrite)throw new Error('Simulated write failure');return {rowCount:1};
    }
    if(sql.startsWith('UPDATE applications SET processing_token')){Object.assign(state.application,{processing_token:null,processing_lease_until:null,processing_next_at:null});return {rowCount:1};}
    throw new Error(`Unexpected offline SQL: ${sql}`);
  }};
  const database={transaction(work){const op=tail.then(async()=>{const before=structuredClone(state);try{return await work(client);}catch(error){state=before;throw error;}});tail=op.catch(()=>{});return op;}};
  return {service:new ReviewService(database),queries,get state(){return state;},writes:()=>queries.filter(({sql})=>/^(INSERT|UPDATE|DELETE)/.test(sql))};
}
test('skill equality follows normalized membership, preserves unknowns and does not equate null/empty',()=>{
  equal(sameSkillCorrection({skills:[' SQL ','rust','sql']},{skills:['RUST','sql'],unavailableSkills:[]}),true);
  equal(sameSkillCorrection({skills:['sql'],unavailableSkills:['rust']},{unavailableSkills:[' RUST ','rust'],skills:['SQL']}),true);
  equal(sameSkillCorrection({skills:[]},null),false);
  equal(sameSkillCorrection({skills:[]},{skills:[],unavailableSkills:['rust']}),false);
  equal(sameSkillCorrection(null,null),true);
  equal(sameSkillCorrection({skills:['sql'],invalid:true},{skills:['sql']}),false);
});
test('current-identical status returns the full current projection with zero writes/reattribution',async()=>{
  const f=setup();const before=structuredClone(f.state),view=await f.service.get(id,actor);
  const result=await f.service.patch(id,actor,patch({status:'in_review'}));deepEqual(result,view);deepEqual(f.state,before);equal(f.writes().length,0);
  ok(f.queries.some(({sql})=>sql.endsWith('FOR UPDATE')));equal(result.review.editor.id,'first');equal(result.tasks[0].corrector.id,'first');
});
test('normalized identical correction preserves stored spelling/order, task/application metadata and omitted override',async()=>{
  const f=setup({corrections:{skills:correction(),extra:correction({skills:[]})}});const before=structuredClone(f.state);
  await f.service.patch(id,actor,patch({corrections:[update({unavailableSkills:[' RUST ','rust'],skills:[' sql ','SQL']})]}));
  deepEqual(f.state,before);equal(f.writes().length,0);
});
test('identical correction or absent removal does not implicitly start pending review',async()=>{
  for(const corrections of [[update({skills:['sql'],unavailableSkills:['rust']})],[{taskId:'extra',value:null,remove:true}]]){
    const f=setup({application:{review_status:'pending'}});const before=structuredClone(f.state);await f.service.patch(id,actor,patch({corrections}));deepEqual(f.state,before);equal(f.writes().length,0);
  }
});
test('explicit status change writes once but does not reattribute an unchanged task correction',async()=>{
  const f=setup({application:{review_status:'pending'}}),before=structuredClone(f.state.corrections);
  const result=await f.service.patch(id,actor,patch({status:'in_review',corrections:[update({skills:['sql'],unavailableSkills:['rust']})]}));
  equal(result.review.revision,8);equal(result.review.editor.id,'second');deepEqual(f.state.corrections,before);equal(f.writes().length,1);
});
test('absent override is distinct from explicit null, and repeated null is unchanged',async()=>{
  const f=setup({corrections:{}});let result=await f.service.patch(id,actor,patch({corrections:[update(null)]}));
  equal(result.tasks[0].hasCorrection,true);equal(result.tasks[0].correction,null);equal(result.review.revision,8);
  const before=structuredClone(f.state),writes=f.writes().length;result=await f.service.patch(id,actor,{expectedRevision:8,corrections:[update(null)]});deepEqual(f.state,before);equal(f.writes().length,writes);equal(result.tasks[0].corrector.id,'second');
});
test('creating an override equal to original extraction is a genuine attributed correction',async()=>{
  const f=setup({corrections:{}}),before=await f.service.get(id,actor);
  const result=await f.service.patch(id,actor,patch({corrections:[update({skills:['SQL']})]}));
  deepEqual(result.tasks[0].effectiveValue,before.tasks[0].effectiveValue);equal(result.tasks[0].hasCorrection,true);equal(result.tasks[0].corrector.id,'second');equal(result.review.revision,8);
});
test('removing an existing override is real even when the displayed value matches the original',async()=>{
  const f=setup({corrections:{skills:correction({skills:['SQL']})}});const before=await f.service.get(id,actor);
  const result=await f.service.patch(id,actor,patch({corrections:[{taskId:'skills',value:null,remove:true}]}));
  deepEqual(result.tasks[0].effectiveValue,before.tasks[0].effectiveValue);equal(result.tasks[0].hasCorrection,false);equal(result.review.revision,8);equal(f.writes().filter(({sql})=>sql.startsWith('DELETE')).length,1);equal(f.writes().filter(({sql})=>sql.startsWith('INSERT')).length,0);
});
test('removing explicit null with unavailable original still changes override presence',async()=>{
  const tasks=definitions.map(task=>({task_id:task.id,status:'failed',attempts:1,retryable:false,failure_category:'ordinary_terminal',result:{status:'failed',value:null,reason:'FIXTURE',retryable:false}}));
  const f=setup({tasks,corrections:{skills:correction(null)}});const result=await f.service.patch(id,actor,patch({corrections:[{taskId:'skills',value:null,remove:true}]}));
  equal(result.tasks[0].effectiveValue,null);equal(result.tasks[0].hasCorrection,false);equal(result.review.revision,8);
});
test('mixed batch writes only changed overrides and increments application revision once',async()=>{
  const f=setup();const originalCorrection=structuredClone(f.state.corrections.skills),originalTasks=structuredClone(f.state.tasks);
  const result=await f.service.patch(id,actor,patch({corrections:[update({skills:['sql'],unavailableSkills:['rust']}),update({skills:['rust']},'extra')]}));
  equal(result.review.revision,8);deepEqual(f.state.corrections.skills,originalCorrection);equal(f.state.corrections.extra.corrected_by,'second');deepEqual(f.state.tasks,originalTasks);equal(f.state.application.flow_revision,11);
  equal(f.writes().filter(({sql})=>sql.startsWith('INSERT INTO extraction_corrections')).length,1);equal(f.writes().filter(({sql})=>sql.startsWith('UPDATE applications SET review_status')).length,1);
});
test('stale-identical and permission/readiness/lock failures precede no-op comparison',async()=>{
  for(const [application,expected] of [[{review_revision:8},409],[{stage:'preselected'},409],[{stage:'not_selected'},409],[{review_status:'completed',reviewed_at:oldTime},409],[{processing_state:'processing'},409],[{vacancy_snapshot:{formDefinition:{inputs:[]},processingDefinition:{tasks:[]}}},400]]){
    const f=setup({application});const before=structuredClone(f.state);await rejects(f.service.patch(id,actor,patch({status:application.review_status??'in_review'})),hasStatus(expected));deepEqual(f.state,before);equal(f.writes().length,0);
  }
  for(const role of ['candidate','interviewer']){const f=setup();await rejects(async()=>f.service.patch(id,{id:'x',role},patch({status:'in_review'})),hasStatus(403));equal(f.queries.length,0);}
});
test('validate all submitted rows before any writes or unchanged return',async()=>{
  for(const corrections of [[update({skills:['sql'],unavailableSkills:['rust']}),update(null,'missing')],[update({skills:['sql']}),update(null)],[update({skills:['outside'],unavailableSkills:[]})],[{taskId:'extra',remove:true,value:{skills:['outside'],unavailableSkills:[]}}]]){
    const f=setup();const before=structuredClone(f.state);await rejects(async()=>f.service.patch(id,actor,patch({corrections})),hasStatus(400));deepEqual(f.state,before);equal(f.writes().length,0);
  }
});
test('completion remains a real status change and repeated completion cannot refresh its timestamp',async()=>{
  const f=setup();const before=structuredClone(f.state.corrections);const result=await f.service.patch(id,actor,patch({status:'completed'}));
  equal(result.review.revision,8);equal(result.review.reviewedAt,newTime);equal(f.state.application.processing_token,null);deepEqual(f.state.corrections,before);
  await rejects(f.service.patch(id,actor,{expectedRevision:8,status:'completed'}),hasStatus(409));equal(f.state.application.reviewed_at,newTime);
});
test('released uninitialized task removal is a no-op with no synthetic task rows',async()=>{
  const f=setup({tasks:[],corrections:{},application:{processing_released_at:oldTime,processing_state:'pending',review_status:'pending'}});
  const before=structuredClone(f.state);await f.service.patch(id,actor,patch({corrections:[{taskId:'skills',value:null,remove:true}]}));deepEqual(f.state,before);equal(f.writes().length,0);
});
test('serialized no-op/real edit order preserves concurrency: no-op never consumes the revision',async()=>{
  for(const realFirst of [true,false]){
    const f=setup(),same=()=>f.service.patch(id,actor,patch({status:'in_review'})),real=()=>f.service.patch(id,actor,patch({corrections:[update({skills:['rust']})]}));
    const results=await Promise.allSettled(realFirst?[real(),same()]:[same(),real()]);equal(results.filter(r=>r.status==='fulfilled').length,realFirst?1:2);equal(f.state.application.review_revision,8);deepEqual(f.state.corrections.skills.value,{skills:['rust']});
  }
});
test('concurrent identical real edits still conflict and modelled failure rolls back all writes',async()=>{
  const f=setup();const results=await Promise.allSettled([actor,{id:'third',role:'admin'}].map(who=>f.service.patch(id,who,patch({corrections:[update({skills:['rust']})]}))));equal(results.filter(r=>r.status==='fulfilled').length,1);equal(f.state.application.review_revision,8);
  const failed=setup({failWrite:true}),before=structuredClone(failed.state);await rejects(failed.service.patch(id,actor,patch({corrections:[update(null)]})),/Simulated write failure/);deepEqual(failed.state,before);
});
