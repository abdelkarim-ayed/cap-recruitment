import 'reflect-metadata';
import { test } from 'node:test';
import { equal, deepEqual, rejects } from 'node:assert/strict';
import { VacancyService } from '../dist/vacancies/vacancy.service.js';

const draft = () => ({ id: 'example', ownerId: 'owner', revision: 1, status: 'draft', title: 'Backend', description: 'Services', formDefinition: { version: 1, inputs: [{ id: 'name', name: 'name', label: 'Name', type: 'text', required: true, args: {} }] }, processingDefinition: { version: 1, tasks: [] }, createdAt: 'now', updatedAt: 'now' });
function fixture(initial = draft()) {
  let value = structuredClone(initial), writes = 0;
  const repository = {
    async get(id, publicOnly) { return id === value.id && (!publicOnly || value.status === 'published') ? structuredClone(value) : undefined; },
    async change(id, operation) { if (id !== value.id) return undefined; const next = operation(value); if (next !== value) { value = { ...next, revision: value.revision + 1 }; writes++; } return structuredClone(value); },
  };
  return { service: new VacancyService(repository), get value() { return value; }, get writes() { return writes; } };
}
const status = expected => error => error.getStatus() === expected;
test('only owner can change a vacancy, including idempotent actions', async () => {
  const f = fixture();
  await rejects(f.service.patch('example', 'other', { expectedRevision: 1, title: 'Changed' }), status(403));
  await f.service.transition('example', 'owner', 'published', { expectedRevision: 1 });
  await rejects(f.service.transition('example', 'other', 'published', { expectedRevision: 1 }), status(403));
});
test('stale edits fail without writing and published vacancies are locked', async () => {
  const f = fixture();
  await rejects(f.service.patch('example', 'owner', { expectedRevision: 2, title: 'Stale' }), status(409));
  equal(f.writes, 0);
  await f.service.transition('example', 'owner', 'published', { expectedRevision: 1 });
  await rejects(f.service.patch('example', 'owner', { expectedRevision: 2, title: 'Locked' }), status(409));
});
test('publishing/closing is idempotent; closed vacancies cannot reopen', async () => {
  const f = fixture();
  await f.service.transition('example', 'owner', 'published', { expectedRevision: 1 });
  await f.service.transition('example', 'owner', 'published', { expectedRevision: 1 });
  equal(f.value.revision, 2);
  await f.service.transition('example', 'owner', 'closed', { expectedRevision: 2 });
  await f.service.transition('example', 'owner', 'closed', { expectedRevision: 1 });
  equal(f.writes, 2);
  await rejects(f.service.transition('example', 'owner', 'published', { expectedRevision: 3 }), status(409));
});
test('empty drafts can be saved but cannot publish; drafts cannot close', async () => {
  const value = draft(); value.formDefinition.inputs = [];
  const f = fixture(value);
  await rejects(f.service.transition('example', 'owner', 'published', { expectedRevision: 1 }), status(400));
  await rejects(f.service.transition('example', 'owner', 'closed', { expectedRevision: 1 }), status(409));
});
test('public access hides draft/closed records and all private metadata', async () => {
  const f = fixture();
  await rejects(f.service.get('example', true), status(404));
  await f.service.transition('example', 'owner', 'published', { expectedRevision: 1 });
  deepEqual(Object.keys(await f.service.get('example', true)).sort(), ['description', 'form', 'id', 'title']);
  await f.service.transition('example', 'owner', 'closed', { expectedRevision: 2 });
  await rejects(f.service.get('example', true), status(404));
});
