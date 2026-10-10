import { test } from 'node:test';
import { equal, deepEqual, rejects } from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { FixtureRegistry, ContextTextReader, ContextTaskExecutor, DisabledTextReader, DisabledTaskExecutor, taskResultSchema } from '../dist/processing/execution.js';
import { csvRow } from '../dist/review/review.service.js';

const bytes = Buffer.from('DOCUMENT FIXTURE'), context = { applicationId:'11111111-1111-4111-8111-111111111111',documentId:'22222222-2222-4222-8222-222222222222',taskId:'skills',sourceHash:createHash('sha256').update(bytes).digest('hex'),args:{skills:['SQL'],evidence:true},fixtureKey:'fixture-one' };
function setup() {
  const registry = new FixtureRegistry(); registry.load([{ ...context,text:'FIXTURE TEXT',result:{status:'completed',value:{skills:[]},evidence:[]} }]);
  return { registry,reader:new ContextTextReader(new DisabledTextReader(),registry),executor:new ContextTaskExecutor(new DisabledTaskExecutor(),registry) };
}
test('context dispatch verifies bytes/identities/args/text and records provenance/calls',async () => {
  const {registry,reader,executor} = setup(); const text = await reader.read(bytes,context); const result = await executor.execute(text,context);
  deepEqual(result.result.value,{skills:[]}); equal(result.provenance.fixtureId,'fixture-one'); deepEqual(registry.calls.map(call=>call.unit),['text','task']);
});
test('missing fixture never falls back, and absent key uses injected normal adapter',async () => {
  const {reader,executor} = setup(); await rejects(reader.read(bytes,{...context,fixtureKey:'missing'}));
  await rejects(reader.read(bytes,{...context,fixtureKey:undefined}),/No document text reader/);
  equal((await executor.execute('',{...context,fixtureKey:undefined})).provenance.mode,'disabled');
});
test('different candidates/documents/tasks/arguments or altered source cannot share fixture results',async () => {
  const {reader,executor} = setup();
  for (const changed of [{applicationId:'33333333-3333-4333-8333-333333333333'},{documentId:'33333333-3333-4333-8333-333333333333'},{taskId:'wrong'},{args:{skills:['Rust'],evidence:true}}]) await rejects(reader.read(bytes,{...context,...changed}));
  await rejects(reader.read(Buffer.from('other bytes'),context)); await rejects(executor.execute('altered relay',context));
});
test('completed empty and failed null are distinct and invalid recorded output fails validation',() => {
  equal(taskResultSchema.safeParse({status:'completed',value:null,evidence:[]}).success,false);
  equal(taskResultSchema.safeParse({status:'failed',value:null,reason:'fixture failure',retryable:false}).success,true);
  const registry = new FixtureRegistry();
  const fixture = {...context,text:'FIXTURE',result:{status:'failed',value:null,reason:'fixture failure',retryable:false}};
  equal((() => { try { registry.load([fixture,{...fixture,fixtureKey:'another-key'}]); return false; } catch { return true; } })(),true);
});
test('CSV quotes multiline/commas and guards spreadsheet formulas',() => {
  equal(csvRow(['a,b','line\nnext','"quoted"',null]),'"a,b","line\nnext","""quoted""",""\r\n');
  equal(csvRow(['=HYPERLINK("bad")','  +cmd','@formula',false,[]]),'"\'=HYPERLINK(""bad"")","\'  +cmd","\'@formula","false","[]"\r\n');
});
