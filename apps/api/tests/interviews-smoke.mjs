import {equal,deepEqual,ok} from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {request as httpRequest} from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import {Test} from '@nestjs/testing';
import {AppModule} from '../dist/app.module.js';
import {configureApplication} from '../dist/bootstrap.js';
import {DatabaseService} from '../dist/database/database.service.js';
import {RUNTIME_CONFIG,readRuntimeConfig} from '../dist/configuration/runtime-config.js';
import {MAIL_SENDER} from '../dist/integrations/mail/mail-sender.js';
import {MemoryMailSender} from '../dist/integrations/mail/memory-mail-sender.js';
import {cleanupReadNotifications} from '../dist/interviews/cleanup-inbox.js';

const directory=await mkdtemp('/tmp/opencode/interviews-check-');
const settings={...readRuntimeConfig({...process.env,MAIL_DRIVER:'file'}),documentDirectory:directory};
const mail=new MemoryMailSender(),users=[],peers=[],vacancies=[];
let app,database,base;
async function start() {
  const module=await Test.createTestingModule({imports:[AppModule]}).overrideProvider(RUNTIME_CONFIG).useValue(settings).overrideProvider(MAIL_SENDER).useValue(mail).compile();
  app=configureApplication(module.createNestApplication({bodyParser:false,logger:false}));database=app.get(DatabaseService).pool;await app.listen(0,'127.0.0.1');base=await app.getUrl();
}
function call(path,actor,body,method=body===undefined?'GET':'POST',origin=settings.webOrigin) {
  return new Promise((resolve,reject)=>{
    const req=httpRequest(`${base}/api/${path}`,{method,localAddress:actor?.peer||'127.0.0.1',headers:{Origin:origin,...(actor?.cookie?{Cookie:actor.cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})}},res=>{
      const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(Buffer.concat(chunks).toString()),cookie:res.headers['set-cookie']?.map(c=>c.split(';')[0]).join('; ')}));
    });req.on('error',reject);req.setTimeout(15000,()=>req.destroy(new Error('Interview check timed out.')));req.end(body===undefined?undefined:JSON.stringify(body));
  });
}
async function actor(role) {
  const id=randomUUID(),email=`interview-check-${id}@example.test`,b=randomBytes(2),peer=`127.87.${b[0]}.${b[1]||1}`;users.push(id);peers.push(peer);
  await database.query('INSERT INTO "user" (id,name,email,"emailVerified","createdAt","updatedAt",role) VALUES($1,$2,$3,false,now(),now(),$4)',[id,`Fixture ${role}`,email,role]);
  equal((await call('auth/email-otp/send-verification-otp',{peer},{email,type:'sign-in'})).status,200);
  const otp=mail.messages.findLast(m=>m.to===email)?.text.match(/code is (\d{6})/)?.[1];ok(otp);
  const signed=await call('auth/sign-in/email-otp',{peer},{email,otp});equal(signed.status,200);return {id,email,peer,cookie:signed.cookie};
}
async function vacancy(owner) {
  const created=await call('vacancies',owner,{title:'Interview fixture',description:'Synthetic only',formDefinition:{version:1,inputs:[{id:'cv',name:'cv',label:'CV',type:'document',required:true,args:{accept:['.pdf']}}]},processingDefinition:{version:1,tasks:[]}});equal(created.status,201);vacancies.push(created.body.id);
  return created.body.id;
}
async function submit(vacancyId,candidate) {
  const form=new FormData();form.append('answers','{}');form.append('cv',new Blob(['%PDF-1.7\nSynthetic only']), 'fixture.pdf');
  const r=await fetch(`${base}/api/vacancies/${vacancyId}/applications`,{method:'POST',headers:{Cookie:candidate.cookie,Origin:settings.webOrigin},body:form});equal(r.status,201);return r.json();
}
const future=new Date();future.setUTCDate(future.getUTCDate()+2);future.setUTCHours(10,0,0,0);
const slot=(interviewer,offset=0)=>({interviewerId:interviewer.id,startsAt:new Date(future.getTime()+offset*3600000).toISOString(),durationMinutes:60,timezone:'UTC',meeting:'https://example.com/interview'});
const feedback=(revision,outcome='pass')=>({expectedRevision:revision,notes:'Synthetic interview feedback',score:8,outcome});
try {
  await start();const owner=await actor('recruiter'),hr=await actor('recruiter'),admin=await actor('admin'),candidate=await actor('candidate'),candidate2=await actor('candidate'),interviewer=await actor('interviewer'),other=await actor('interviewer');
  const id=await vacancy(owner);const steps=[{name:'Technical',instructions:'Prepare technical questions.'},{name:'HR',instructions:''}];
  equal((await call(`vacancies/${id}/interview-pipeline`,candidate)).status,403);
  equal((await call(`vacancies/${id}/interview-pipeline`,hr,{expectedRevision:1,steps},'PUT')).status,403);
  equal((await call(`vacancies/${id}/interview-pipeline`,admin,{expectedRevision:1,steps},'PUT')).status,403);
  const pipeline=await call(`vacancies/${id}/interview-pipeline`,owner,{expectedRevision:1,steps},'PUT');equal(pipeline.status,200);equal(pipeline.body.owner.email,owner.email);
  equal((await call(`vacancies/${id}/interview-pipeline`,owner,{expectedRevision:1,steps},'PUT')).status,409);
  equal((await call(`vacancies/${id}/publish`,owner,{expectedRevision:1,expectedInterviewRevision:pipeline.body.revision})).status,200);
  const frozen=await call(`vacancies/${id}/interview-pipeline`,owner);equal(frozen.body.frozen,true);equal(frozen.body.editable,false);
  equal((await call(`vacancies/${id}/interview-pipeline`,owner,{expectedRevision:pipeline.body.revision,steps},'PUT')).status,409);
  const a=await submit(id,candidate),b=await submit(id,candidate2);
  equal((await call(`applications/${a.id}/stage`,interviewer,{expectedRevision:1,stage:'preselected'})).status,403);
  equal((await call(`applications/${a.id}/stage`,hr,{expectedRevision:1,stage:'preselected'},'POST','https://untrusted.example')).status,403);
  equal((await call(`applications/${a.id}/stage`,hr,{expectedRevision:1,stage:'preselected'})).status,201);
  equal((await call(`applications/${b.id}/stage`,owner,{expectedRevision:1,stage:'preselected'})).status,201);
  const wrongTime={...slot(interviewer),startsAt:new Date(future.getTime()+15*60000).toISOString()};
  equal((await call(`applications/${a.id}/interviews`,hr,{...wrongTime,stepId:pipeline.body.steps[0].id,expectedRevision:2})).status,400);
  equal((await call(`applications/${a.id}/interviews`,hr,{...slot(candidate),stepId:pipeline.body.steps[0].id,expectedRevision:2})).status,400);
  const first=await call(`applications/${a.id}/interviews`,hr,{...slot(interviewer),stepId:pipeline.body.steps[0].id,expectedRevision:2});equal(first.status,201);let i=first.body;
  equal((await call(`applications/${a.id}/interviews`,hr,{...slot(other),stepId:pipeline.body.steps[0].id,expectedRevision:2})).status,409);
  equal((await call(`applications/${b.id}/interviews`,hr,{...slot(interviewer),stepId:pipeline.body.steps[0].id,expectedRevision:2})).status,409);
  equal((await call(`vacancies/${id}/interview-pipeline`,owner,{expectedRevision:2,steps},'PUT')).status,409);
  equal((await call(`interviews/${i.id}`,candidate)).status,403);equal((await call(`interviews/${i.id}`,other)).status,404);
  const assigned=await call(`interviews/${i.id}`,interviewer);equal(assigned.status,200);equal(assigned.body.owner.email,owner.email);
  const info=await call(`interviews/${i.id}/application`,interviewer);equal(info.status,200);equal(info.body.review,undefined);equal(info.body.vacancy.processingDefinition,undefined);
  equal((await call(`interviews/${i.id}/application`,other)).status,404);equal((await call(`applications/${a.id}`,interviewer)).status,403);
  const doc=await fetch(`${base}/api/interviews/${i.id}/documents/${a.documents[0].id}`,{headers:{Cookie:interviewer.cookie}});equal(doc.status,200);ok((await doc.text()).startsWith('%PDF-'));
  const leak=await fetch(`${base}/api/interviews/${i.id}/documents/${b.documents[0].id}`,{headers:{Cookie:interviewer.cookie}});equal(leak.status,404);
  equal((await call(`interviews/${i.id}/feedback`,interviewer,feedback(1))).status,409); // future assessment blocked
  const issue=await call(`interviews/${i.id}/scheduling-issue`,interviewer,{expectedRevision:1,reason:'Synthetic scheduling conflict'});equal(issue.status,201);i=issue.body;
  equal((await call('inbox?read=unread',owner)).body.items.some(n=>n.kind==='scheduling_issue'),true);
  const changed=await call(`interviews/${i.id}/schedule`,hr,{...slot(other,1),expectedRevision:i.revision},'PUT');equal(changed.status,200);i=changed.body;equal(i.schedulingIssue,null);
  equal((await call(`interviews/${i.id}`,interviewer)).status,404);
  const oldInbox=(await call('inbox?read=all',interviewer)).body;equal(oldInbox.items.find(n=>n.kind==='rescheduled').interviewId,null);
  equal((await call(`inbox/${oldInbox.items[0].id}/read`,other,{})).status,404);
  equal((await call(`inbox/${oldInbox.items[0].id}/read`,interviewer,{})).status,201);
  const second=await call(`applications/${a.id}/interviews`,hr,{...slot(interviewer,3),stepId:pipeline.body.steps[1].id,expectedRevision:3});equal(second.status,201);
  // Trusted test clock fixture only: move scheduled synthetic interviews into the past.
  await database.query("UPDATE interviews SET starts_at=date_trunc('hour',now())-interval '2 hours' WHERE id=$1",[i.id]);
  const failure=await call(`interviews/${i.id}/feedback`,other,feedback(i.revision,'fail'));equal(failure.status,201);
  const ended=(await call(`applications/${a.id}/interviews`,owner)).body;equal(ended.stage,'not_selected');equal(ended.interviews[0].outcome,'fail');equal(ended.interviews[0].score,8);equal(ended.interviews[1].status,'cancelled');equal(ended.interviews[1].cancellationCause.type,'interview_failed');equal(ended.interviews[1].cancellationCause.interviewId,i.id);
  equal((await call(`interviews/${second.body.id}/feedback`,interviewer,feedback(1))).status,409,'A Pass must not be accepted after another interview fails');
  const blockedPass=(await call(`interviews/${second.body.id}`,owner)).body;equal(blockedPass.status,'cancelled');equal(blockedPass.outcome,null);equal(blockedPass.notes,null);equal(blockedPass.score,null);
  equal((await call(`applications/${a.id}/stage`,owner,{expectedRevision:ended.revision,stage:'preselected'})).status,409);
  equal((await call(`interviews/${i.id}/feedback`,other,feedback(failure.body.revision))).status,409);
  equal((await call(`interviews/${second.body.id}/application`,interviewer)).status,404);
  const cancelledInbox=(await call('inbox?read=unread',interviewer)).body.items.find(n=>n.kind==='cancelled');ok(cancelledInbox);equal(cancelledInbox.cause.type,'interview_failed');
  equal((await call(`applications/${a.id}`,candidate)).body.stage,'received'); // internal decision not published
  // Complete a separate application and exercise owner-only offer/hire.
  const bi=await call(`applications/${b.id}/interviews`,hr,{...slot(interviewer,5),stepId:pipeline.body.steps[0].id,expectedRevision:2});equal(bi.status,201);
  const bj=await call(`applications/${b.id}/interviews`,hr,{...slot(other,7),stepId:pipeline.body.steps[1].id,expectedRevision:3});equal(bj.status,201);
  equal((await call(`applications/${b.id}/stage`,owner,{expectedRevision:4,stage:'offer'})).status,409);
  await database.query("UPDATE interviews SET starts_at=date_trunc('hour',now())-interval '4 hours' WHERE application_id=$1",[b.id]);
  equal((await call(`interviews/${bi.body.id}/feedback`,hr,feedback(1))).status,403);
  equal((await call(`interviews/${bi.body.id}/feedback`,interviewer,feedback(1))).status,201);
  equal((await call(`interviews/${bj.body.id}/feedback`,other,{...feedback(1),score:null})).status,201);
  equal((await call(`applications/${b.id}/stage`,admin,{expectedRevision:6,stage:'offer'})).status,403);
  const offer=await call(`applications/${b.id}/stage`,owner,{expectedRevision:6,stage:'offer'});equal(offer.status,201);
  equal((await call(`applications/${b.id}/stage`,owner,{expectedRevision:offer.body.revision,stage:'hired'})).status,201);
  // Real concurrent requests: one overlapping slot wins across applications.
  const c=await submit(id,await actor('candidate')),d=await submit(id,await actor('candidate'));
  for(const a of [c,d])equal((await call(`applications/${a.id}/stage`,hr,{expectedRevision:1,stage:'preselected'})).status,201);
  const slots=await Promise.all([c,d].map(a=>call(`applications/${a.id}/interviews`,hr,{...slot(interviewer,10),stepId:pipeline.body.steps[0].id,expectedRevision:2})));
  deepEqual(slots.map(r=>r.status).sort(),[201,409]);
  const winner=slots[0].status===201?c:d,loser=winner===c?d:c,win=slots.find(r=>r.status===201).body;
  const next=await call(`applications/${winner.id}/interviews`,hr,{...slot(other,12),stepId:pipeline.body.steps[1].id,expectedRevision:3});equal(next.status,201);
  await database.query("UPDATE interviews SET starts_at=date_trunc('hour',now())-interval '4 hours' WHERE application_id=$1",[winner.id]);
  const simultaneous=await Promise.all([call(`interviews/${win.id}/feedback`,interviewer,feedback(1,'fail')),call(`interviews/${next.body.id}/feedback`,other,feedback(1,'fail'))]);
  deepEqual(simultaneous.map(r=>r.status).sort(),[201,409]);
  const stopped=(await call(`applications/${winner.id}/interviews`,hr)).body;equal(stopped.stage,'not_selected');equal(stopped.interviews.filter(i=>i.outcome==='fail').length,1);equal(stopped.interviews.filter(i=>i.status==='cancelled').length,1);
  // Vacancy closure only stops intake; it must not cancel existing interviews.
  const manual=await call(`applications/${loser.id}/interviews`,hr,{...slot(other,14),stepId:pipeline.body.steps[0].id,expectedRevision:2});equal(manual.status,201);
  equal((await call(`vacancies/${id}/close`,owner,{expectedRevision:2})).status,200);
  equal((await call(`interviews/${manual.body.id}`,hr)).body.status,'scheduled');
  equal((await call(`interviews/${manual.body.id}/cancel`,hr,{expectedRevision:1,reason:'Fixture manual cancellation'})).status,201);
  equal((await call(`interviews/${manual.body.id}`,hr)).body.cancellationCause.type,'hr_cancelled');
  equal((await call(`applications/${loser.id}/interviews`,hr)).body.stage,'interview');
  const results=await call(`vacancies/${id}/interview-results`,hr);equal(results.status,200);equal(results.body.total,4);equal(results.body.steps.length,2);
  // Empty plan: preselection is not Offer, and Offer is not Hired.
  const emptyId=await vacancy(owner);
  equal((await call(`vacancies/${emptyId}/publish`,owner,{expectedRevision:1,expectedInterviewRevision:1})).status,200);
  const emptyApplication=await submit(emptyId,candidate);
  equal((await call(`applications/${emptyApplication.id}/stage`,hr,{expectedRevision:1,stage:'preselected'})).status,201);
  equal((await call(`applications/${emptyApplication.id}/interviews`,owner)).body.stage,'preselected');
  equal((await call(`applications/${emptyApplication.id}/stage`,admin,{expectedRevision:2,stage:'offer'})).status,403);
  equal((await call(`applications/${emptyApplication.id}/stage`,owner,{expectedRevision:2,stage:'hired'})).status,409);
  equal((await call(`applications/${emptyApplication.id}/stage`,owner,{expectedRevision:2,stage:'offer'})).status,201);
  equal((await call(`applications/${emptyApplication.id}/interviews`,owner)).body.stage,'offer');
  equal((await call(`applications/${emptyApplication.id}/stage`,owner,{expectedRevision:2,stage:'offer'})).status,409);
  equal((await call(`applications/${emptyApplication.id}/stage`,owner,{expectedRevision:3,stage:'hired'})).status,201);
  equal((await database.query('SELECT id FROM interviews WHERE application_id=$1',[emptyApplication.id])).rows.length,0);
  // Read retention is measured from first read, never creation; unread survives.
  const ids=(await call('inbox?read=all',owner)).body.items.map(n=>n.id);ok(ids.length>=3);
  await database.query("UPDATE inbox_notifications SET created_at=now()-interval '30 days',read_at=CASE WHEN id=$1 THEN now()-interval '8 days' WHEN id=$2 THEN now()-interval '6 days' ELSE NULL END WHERE id=ANY($3::uuid[])",[ids[0],ids[1],ids]);
  // Scope cleanup to test recipients; never delete the user's retained messages.
  await cleanupReadNotifications({query:text=>database.query(`${text} AND recipient_id=ANY($1::text[])`,[users])});equal((await database.query('SELECT id FROM inbox_notifications WHERE id=$1',[ids[0]])).rows.length,0);equal((await database.query('SELECT id FROM inbox_notifications WHERE id=$1',[ids[1]])).rows.length,1);equal((await database.query('SELECT id FROM inbox_notifications WHERE id=$1',[ids[2]])).rows.length,1);
  // Persisted state survives API restart.
  await app.close();await start();equal((await call(`applications/${a.id}/interviews`,owner)).body.stage,'not_selected');equal((await call(`applications/${b.id}/interviews`,owner)).body.stage,'hired');
  console.log('PASS: real auth/PostgreSQL/HTTP interview plans, owner policy, scheduling/conflicts, scoped documents, terminal failure/cancellation, zero/nonzero-interview Offer/Hired, inbox privacy/retention and persistence. No AI or email.');
}finally {
  if(database&&!database.ended) {
    const interviews=(await database.query('SELECT id FROM interviews WHERE vacancy_id=ANY($1::uuid[])',[vacancies])).rows.map(r=>r.id);
    await database.query('DELETE FROM inbox_notifications WHERE interview_id=ANY($1::uuid[])',[interviews]);
    await database.query('DELETE FROM interviews WHERE vacancy_id=ANY($1::uuid[])',[vacancies]);
    await database.query('DELETE FROM interview_steps WHERE vacancy_id=ANY($1::uuid[])',[vacancies]);
    const documents=(await database.query('SELECT stored_file_id FROM application_documents WHERE application_id IN (SELECT id FROM applications WHERE vacancy_id=ANY($1::uuid[]))',[vacancies])).rows.map(r=>r.stored_file_id);
    await database.query('DELETE FROM application_documents WHERE stored_file_id=ANY($1::uuid[])',[documents]);await database.query('DELETE FROM stored_files WHERE id=ANY($1::uuid[])',[documents]);
    await database.query('DELETE FROM screening_notifications WHERE application_id IN (SELECT id FROM applications WHERE vacancy_id=ANY($1::uuid[]))',[vacancies]);
    await database.query('DELETE FROM applications WHERE vacancy_id=ANY($1::uuid[])',[vacancies]);await database.query('DELETE FROM vacancies WHERE id=ANY($1::uuid[])',[vacancies]);
    await database.query('DELETE FROM "user" WHERE id=ANY($1::text[])',[users]);
    await database.query('DELETE FROM "rateLimit" WHERE key LIKE ANY($1::text[])',[peers.map(peer=>`%${peer}%`)]);
  }
  if(app)await app.close();await rm(directory,{recursive:true,force:true});
}
