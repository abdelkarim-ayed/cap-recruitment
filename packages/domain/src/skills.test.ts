import { test } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';
import { normalizeSkills, skillRows, skillValueSchema, processingDefinitionSchema } from './vacancies.js';
test('skills normalise and deduplicate without losing punctuation',()=>{
  deepEqual(normalizeSkills([' SQL ','sql','C++','C#']),['sql','c++','c#']);
  const value=processingDefinitionSchema.parse({version:1,tasks:[{id:'skills',sourceInputId:'cv',outputKey:'skills',type:'extractSkills',args:{skills:[' SQL ','sql'],evidence:false}}]});
  deepEqual(value.tasks[0].args.skills,['sql']);
});
test('per-skill projections distinguish false, null and partial corrections',()=>{
  deepEqual(skillRows(['SQL','Rust'],null,{skills:['sql'],unavailableSkills:['rust']}),[{skill:'sql',original:null,effective:true},{skill:'rust',original:null,effective:null}]);
  deepEqual(skillRows(['sql','rust'],{skills:[]},{skills:[]}).map(row=>row.effective),[false,false]);
  equal(skillValueSchema.safeParse({skills:['SQL'],unavailableSkills:['sql']}).success,false);
});
