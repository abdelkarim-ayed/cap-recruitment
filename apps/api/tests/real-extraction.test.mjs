import { test } from 'node:test';
import { equal, deepEqual, rejects } from 'node:assert/strict';
import { PdfTextReader } from '../dist/processing/pdf-reader.js';
import { JevTaskExecutor } from '../dist/processing/jev-executor.js';
import { ContextTextReader, FixtureRegistry } from '../dist/processing/execution.js';
import { createHash } from 'node:crypto';
import { syntheticPdf } from './pdf-fixture.mjs';

// Business-port fixtures only. No gateway request, Redis counters or paid/limit tests.
const context={applicationId:'11111111-1111-4111-8111-111111111111',documentId:'22222222-2222-4222-8222-222222222222',taskId:'skills',sourceHash:'',args:{skills:[' SQL ','sql','Rust'],evidence:false}};
const response=answers=>({model:'jev-1.14.0',usage:{input_tokens:500,output_tokens:20},answers});
const answer=noul=>({type:'noul',noul});
test('real PDF parser and real-reader fixture relay preserve actual text',async()=>{
  const reader=new PdfTextReader(),bytes=syntheticPdf();
  equal(await reader.read(bytes,context),'SQL and TypeScript projects');
  await rejects(reader.read(Buffer.from('not PDF'),context),/Only PDF/);
  await rejects(reader.read(Buffer.from('%PDF-broken'),context),/corrupt/);
  const bound={...context,fixtureKey:'real-reader',sourceHash:createHash('sha256').update(bytes).digest('hex')};
  const registry=new FixtureRegistry();registry.load([{...bound,reader:'pdf',text:'SQL and TypeScript projects',result:{status:'completed',value:{skills:['sql']},evidence:[]}}]);
  equal(await new ContextTextReader(reader,registry).read(bytes,bound),'SQL and TypeScript projects');
});
test('Noul batches normalised skills, forwards signal and uses inclusive 0.8 threshold',async()=>{
  const signal=new AbortController().signal;let calls=0;
  const executor=new JevTaskExecutor({async request(payload,s){calls++;equal(s,signal);equal(payload.state.cv,'Used SQL');deepEqual(Object.keys(payload.questions),['q0','q1']);equal(payload.questions.q0.type,'noul');equal(payload.questions.q0.instructions.includes('"sql"'),true);equal(Object.hasOwn(payload,'model'),false);return response({q0:answer(.8),q1:answer(.799)});}});
  const outcome=await executor.execute('Used SQL',{...context,signal});equal(calls,1);deepEqual(outcome.result,{status:'completed',value:{skills:['sql']},evidence:[]});equal(outcome.provenance.usage.input_tokens,500);
});
test('invalid/missing/extra/non-Noul answers fail terminally and retain usage',async()=>{
  for(const answers of [{},{q0:answer(1.1),q1:answer(0)},{q0:answer(.9),q1:answer(0),q2:answer(0)},{q0:{type:'choice',choice:'yes'},q1:answer(0)}]){
    const outcome=await new JevTaskExecutor({async request(){return response(answers);}}).execute('SQL',context);
    equal(outcome.result.status,'failed');equal(outcome.result.retryable,false);equal(outcome.provenance.usage.input_tokens,500);
  }
});
test('successful no matches is empty, not unavailable; legacy evidence request produces no quotations',async()=>{
  const outcome=await new JevTaskExecutor({async request(){return response({q0:answer(.1),q1:answer(.2)});}}).execute('CV',{...context,args:{...context.args,evidence:true}});
  deepEqual(outcome.result,{status:'completed',value:{skills:[]},evidence:[]});
});
test('business input bounds and gateway failures never trigger automatic retries',async()=>{
  let calls=0;const executor=new JevTaskExecutor({async request(){calls++;throw new TypeError('private network detail');}});
  equal((await executor.execute('a'.repeat(12001),context)).result.status,'failed');equal(calls,0);
  const outcome=await executor.execute('SQL',context);equal(calls,1);equal(outcome.result.retryable,false);equal(JSON.stringify(outcome).includes('private network detail'),false);
});
