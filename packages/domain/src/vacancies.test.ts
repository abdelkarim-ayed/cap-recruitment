import { test } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { createVacancySchema, patchVacancySchema, publicVacancy, vacancyListSchema, type CreateVacancy, type Vacancy } from './vacancies.js';

function definition(): CreateVacancy {
  return { title: 'Backend', description: 'Build services', formDefinition: { version: 1, inputs: [
    { id: 'cv', name: 'cv', label: 'CV', type: 'document', required: true, args: { accept: ['.pdf'], limit: { kind: 'NO_LIMIT' } } },
  ] }, processingDefinition: { version: 1, tasks: [{ id: 'skills', sourceInputId: 'cv', outputKey: 'extracted_skills', type: 'extractSkills', args: { skills: ['SQL'], evidence: true } }] } };
}
test('separate definitions retain input-owned args and document-task association', () => { deepEqual(createVacancySchema.parse(definition()), definition()); });
test('unknown task/input arguments and executable/provider metadata are rejected', () => {
  equal(createVacancySchema.safeParse({ ...definition(), ownerId: 'spoof' }).success, false);
  const value = definition(); (value.processingDefinition.tasks[0].args as any).prompt = 'Run arbitrary prompt';
  equal(createVacancySchema.safeParse(value).success, false);
});
test('duplicate identities, names, outputs and broken source references are rejected', () => {
  for (const mutate of [
    (v: CreateVacancy) => v.formDefinition.inputs.push(v.formDefinition.inputs[0]),
    (v: CreateVacancy) => { v.processingDefinition.tasks[0].sourceInputId = 'missing'; },
    (v: CreateVacancy) => { v.processingDefinition.tasks[0].outputKey = 'cv'; },
    (v: CreateVacancy) => v.processingDefinition.tasks.push(v.processingDefinition.tasks[0]),
  ]) { const value = definition(); mutate(value); equal(createVacancySchema.safeParse(value).success, false); }
});
test('separators own no answer column, required flag, or processing task', () => {
  const value = definition(); value.formDefinition.inputs.push({ id: 'section', label: 'Documents', type: 'separator', args: {} });
  equal(createVacancySchema.safeParse(value).success, true);
  value.processingDefinition.tasks[0].sourceInputId = 'section'; equal(createVacancySchema.safeParse(value).success, false);
});
test('number and choice variants validate their type-specific arguments', () => {
  const value = definition();
  value.formDefinition.inputs.push({ id: 'years', name: 'years', label: 'Years', type: 'number', required: true, args: { min: 5, max: 2 } });
  equal(createVacancySchema.safeParse(value).success, false);
  value.formDefinition.inputs.pop();
  value.formDefinition.inputs.push({ id: 'shift', name: 'shift', label: 'Shift', type: 'single_choice', required: true, args: { choices: [{ value: 'day', label: 'Day' }, { value: 'day', label: 'Duplicate' }] } });
  equal(createVacancySchema.safeParse(value).success, false);
});
test('patch requires a revision, changed field, and definitions as a pair', () => {
  equal(patchVacancySchema.safeParse({ expectedRevision: 1 }).success, false);
  equal(patchVacancySchema.safeParse({ expectedRevision: 1, formDefinition: definition().formDefinition }).success, false);
  equal(patchVacancySchema.safeParse({ expectedRevision: 1, title: 'Changed' }).success, true);
});
test('public detail is allowlisted and never includes processing/owner metadata', () => {
  const value: Vacancy = { ...definition(), id: 'example', ownerId: 'private-owner', status: 'published', revision: 2, createdAt: 'now', updatedAt: 'now' };
  deepEqual(Object.keys(publicVacancy(value)).sort(), ['description', 'form', 'id', 'title']);
  equal(JSON.stringify(publicVacancy(value)).includes('extracted_skills'), false);
});
test('pagination rejects unknown keys, nonintegers and unbounded limits', () => {
  deepEqual(vacancyListSchema.parse({}), { limit: 20, offset: 0 });
  for (const query of [{ limit: '101' }, { limit: '1.5' }, { offset: '-1' }, { filter: 'anything' }]) equal(vacancyListSchema.safeParse(query).success, false);
});
