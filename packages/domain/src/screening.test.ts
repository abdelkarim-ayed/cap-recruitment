import { test } from 'node:test';
import { deepEqual, equal, throws } from 'node:assert/strict';
import { parseScreeningCsv, screeningIssues, screeningLimits } from './screening.js';

const id='11111111-1111-4111-8111-111111111111';
const header='application_id,candidate_email,decision';
test('CSV accepts exported evidence columns but imports only explicit decision inputs',()=>{
  const rows=parseScreeningCsv(`\uFEFF${header},reason,skills.effective\r\n${id},PERSON@example.test,rejected,"a, b\n""quoted""",=formula\r\n`);
  deepEqual(rows,[{key:2,applicationId:id,email:'person@example.test',decision:'rejected',reason:'a, b\n"quoted"'}]);
  equal(screeningIssues(rows).size,0);
});
test('email, ID and decision are mandatory; name is ignored',()=>{
  throws(()=>parseScreeningCsv('application_id,decision\na,preselected'),/candidate_email/);
  for(const values of [`${id},,preselected`,`${id},p@example.test,`,`${id},p@example.test,=rejected`,`bad,p@example.test,preselected`])equal(screeningIssues(parseScreeningCsv(`${header}\n${values}`)).size,1);
});
test('duplicates all fail; bad column counts cannot accidentally supply an outcome',()=>{
  const rows=parseScreeningCsv(`${header}\n${id},p@example.test,preselected\n${id.toUpperCase()},p@example.test,rejected`);
  equal(screeningIssues(rows).size,2);
  equal(screeningIssues(parseScreeningCsv(`${header}\n${id},p@example.test,rejected,extra`)).size,1);
});
test('malformed files fail rather than attempting to recover shifted records',()=>{
  for(const source of ['',header,`${header},decision\na,b,c,d`,`${header}\n"unterminated`,`${header}\na"b,c,d`,`${header}\n"a"trailing,c,d`])throws(()=>parseScreeningCsv(source));
});
test('blank records are ignored and record/cell bounds are enforced',()=>{
  equal(parseScreeningCsv(`${header}\n\n${id},p@example.test,preselected\n,,\n`).length,1);
  throws(()=>parseScreeningCsv(`${header}\n${`${id},p@example.test,preselected\n`.repeat(screeningLimits.rows+1)}`),/1,000/);
  throws(()=>parseScreeningCsv(`${header}\n${'a'.repeat(screeningLimits.cell+1)}`),/cell/);
});
