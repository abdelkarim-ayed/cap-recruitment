import { equal, deepEqual, ok } from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { Test } from '@nestjs/testing';
import { AppModule } from '../dist/app.module.js';
import { configureApplication } from '../dist/bootstrap.js';
import { DatabaseService } from '../dist/database/database.service.js';
import { RUNTIME_CONFIG, readRuntimeConfig } from '../dist/configuration/runtime-config.js';
import { MAIL_SENDER } from '../dist/integrations/mail/mail-sender.js';
import { MemoryMailSender } from '../dist/integrations/mail/memory-mail-sender.js';
import { DOCUMENT_STORAGE } from '../dist/documents/document-storage.js';
import { LocalDocumentStorage } from '../dist/documents/local-document-storage.js';

const directory = await mkdtemp('/tmp/opencode/application-check-');
const settings = { ...readRuntimeConfig({ ...process.env, MAIL_DRIVER: 'file' }), documentDirectory: directory };
const mail = new MemoryMailSender(), users = [], peers = [], vacancyIds = [];
let app, database, base;
const storage = new LocalDocumentStorage(directory);
const storageOverride = { failAfter: Infinity, calls: 0,
  async put(bytes) { if (++this.calls > this.failAfter) throw new Error('Intentional storage fixture failure'); return storage.put(bytes); },
  read: ref => storage.read(ref), remove: ref => storage.remove(ref) };
async function start() {
  const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(RUNTIME_CONFIG).useValue(settings).overrideProvider(MAIL_SENDER).useValue(mail).overrideProvider(DOCUMENT_STORAGE).useValue(storageOverride).compile();
  app = configureApplication(module.createNestApplication({ bodyParser: false, logger: false }));
  database = app.get(DatabaseService).pool; await app.listen(0, '127.0.0.1'); base = await app.getUrl();
}
function json(path, body, cookie, peer = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const outgoing = httpRequest(`${base}/api/${path}`, { method: body === undefined ? 'GET' : 'POST', localAddress: peer, headers: { Origin: settings.webOrigin, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) } }, incoming => {
      const chunks = []; incoming.on('data', chunk => chunks.push(chunk)); incoming.on('error', reject);
      incoming.on('end', () => resolve({ status: incoming.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()), cookie: incoming.headers['set-cookie']?.map(value => value.split(';')[0]).join('; ') }));
    });
    outgoing.on('error', reject); outgoing.setTimeout(15000, () => outgoing.destroy(new Error('Application check timed out'))); outgoing.end(body === undefined ? undefined : JSON.stringify(body));
  });
}
async function actor(role) {
  const id = randomUUID(), email = `application-check-${id}@example.test`, bytes = randomBytes(2), peer = `127.86.${bytes[0]}.${bytes[1] || 1}`; peers.push(peer);
  await database.query('INSERT INTO "user" (id,name,email,"emailVerified","createdAt","updatedAt",role) VALUES ($1,$2,$3,false,now(),now(),$4)', [id, 'Fixture candidate', email, role]); users.push(id);
  equal((await json('auth/email-otp/send-verification-otp', { email, type: 'sign-in' }, undefined, peer)).status, 200);
  const otp = mail.messages.findLast(message => message.to === email)?.text.match(/code is (\d{6})/)?.[1]; ok(otp);
  const login = await json('auth/sign-in/email-otp', { email, otp }, undefined, peer); equal(login.status, 200); return { id, cookie: login.cookie };
}
const definition = { title: 'Application fixture', description: 'No real candidate data', formDefinition: { version: 1, inputs: [
  { id: 'name', name: 'full_name', label: 'Name', type: 'text', required: true, args: {} },
  { id: 'available', name: 'available', label: 'Available', type: 'yes_no', required: true, args: {} },
  { id: 'cv', name: 'cv', label: 'CV', type: 'document', required: true, args: { accept: ['.pdf'], limit: { kind: 'MAX_BYTES', bytes: 1000 } } },
  { id: 'other', name: 'other', label: 'Other', type: 'document', required: false, args: {} },
  { id: 'third', name: 'third', label: 'Third', type: 'document', required: false, args: {} },
] }, processingDefinition: { version: 1, tasks: [{ id: 'skills', type: 'extractSkills', sourceInputId: 'cv', outputKey: 'extracted_skills', args: { skills: ['SQL'], evidence: true } }] } };
const answers = { name: 'Fixture name', available: false }, pdf = Buffer.from('%PDF-1.7\nUNTRUSTED DOCUMENT FIXTURE\n');
async function submit(id, candidate, values = answers, files = [{ field: 'cv', name: 'cv.pdf', bytes: pdf }], origin = settings.webOrigin) {
  const form = new FormData(); form.append('answers', typeof values === 'string' ? values : JSON.stringify(values));
  for (const file of files) form.append(file.field, new Blob([file.bytes]), file.name);
  const response = await fetch(`${base}/api/vacancies/${id}/applications`, { method: 'POST', headers: { Origin: origin, ...(candidate ? { Cookie: candidate.cookie } : {}) }, body: form, signal: AbortSignal.timeout(20000) });
  return { status: response.status, body: await response.json() };
}
async function vacancy(owner, value = definition) {
  const created = await json('vacancies', value, owner.cookie); equal(created.status, 201); vacancyIds.push(created.body.id);
  equal((await json(`vacancies/${created.body.id}/publish`, { expectedRevision: 1 }, owner.cookie)).status, 200); return created.body.id;
}
try {
  await start();
  const owner = await actor('recruiter'), admin = await actor('admin'), recruiter = await actor('recruiter'), candidate = await actor('candidate'), other = await actor('candidate'), interviewer = await actor('interviewer');
  const id = await vacancy(owner);
  equal((await submit(id, undefined)).status, 401);
  for (const staff of [owner, admin, interviewer]) equal((await submit(id, staff)).status, 403);
  equal((await submit(id, candidate, answers, [], 'https://untrusted.example')).status, 403);
  for (const [values, files] of [
    ['broken json', []], [{ ...answers, unexpected: 'spoof' }, [{ field: 'cv', name: 'cv.pdf', bytes: pdf }]],
    [answers, []], [answers, [{ field: 'cv', name: 'wrong.exe', bytes: pdf }]],
    [answers, [{ field: 'cv', name: 'cv.pdf', bytes: Buffer.alloc(1001) }]],
    [answers, [{ field: 'cv', name: 'cv.pdf', bytes: pdf }, { field: 'cv', name: 'cv.pdf', bytes: pdf }]],
  ]) equal((await submit(id, candidate, values, files)).status, 400);
  equal((await submit(id, candidate, answers, [{ field: 'other', name: 'huge', bytes: Buffer.alloc(10 * 1024 * 1024 + 1) }])).status, 413);
  const largeDefinition = structuredClone(definition); largeDefinition.formDefinition.inputs[2].args = {}; largeDefinition.processingDefinition.tasks = [];
  const largeId = await vacancy(owner, largeDefinition);
  equal((await submit(largeId, candidate, answers, ['cv', 'other', 'third'].map(field => ({ field, name: 'unrestricted', bytes: Buffer.alloc(9 * 1024 * 1024) })))).status, 413);
  equal((await database.query('SELECT count(*)::integer AS count FROM applications WHERE vacancy_id=ANY($1::uuid[])', [vacancyIds])).rows[0].count, 0);
  deepEqual(await readdir(directory), []);
  storageOverride.calls = 0; storageOverride.failAfter = 1;
  equal((await submit(id, candidate, answers, [{ field: 'cv', name: 'cv.pdf', bytes: pdf }, { field: 'other', name: 'anything', bytes: Buffer.from('second fixture') }])).status, 500);
  deepEqual(await readdir(directory), []); storageOverride.failAfter = Infinity;
  equal((await database.query('SELECT count(*)::integer AS count FROM applications WHERE vacancy_id=$1', [id])).rows[0].count, 0);
  const race = await Promise.all([submit(id, candidate), submit(id, candidate)]);
  deepEqual(race.map(result => result.status).sort(), [200, 201]); equal(race[0].body.id, race[1].body.id);
  const application = race[0].body; deepEqual(application.answers, answers); equal(application.stage, 'received'); equal(application.processingState, 'pending');
  equal(Object.hasOwn(application.vacancy, 'processingDefinition'), false);
  ok(!JSON.stringify(application).includes('storage_ref')); ok(!JSON.stringify(application).includes('local-file:'));
  equal((await submit(id, candidate, { ...answers, name: 'Replacement' })).body.answers.name, answers.name);
  equal((await json(`applications/${application.id}`, undefined, other.cookie)).status, 404);
  equal((await json('applications', undefined, other.cookie)).body.items.length, 0);
  equal((await json('applications', undefined, interviewer.cookie)).status, 403);
  for (const staff of [owner, admin, recruiter]) {
    const detail = await json(`applications/${application.id}`, undefined, staff.cookie); equal(detail.status, 200); deepEqual(detail.body.vacancy.processingDefinition, definition.processingDefinition);
    ok((await json(`vacancies/${id}/applications`, undefined, staff.cookie)).body.items.some(item => item.id === application.id));
  }
  const documentId = application.documents[0].id;
  for (const user of [candidate, owner, admin, recruiter]) {
    const download = await fetch(`${base}/api/applications/${application.id}/documents/${documentId}`, { headers: { Cookie: user.cookie } }); equal(download.status, 200);
    deepEqual(Buffer.from(await download.arrayBuffer()), pdf); equal(download.headers.get('content-type'), 'application/octet-stream'); ok(download.headers.get('content-disposition').startsWith('attachment;')); equal(download.headers.get('cache-control'), 'private, no-store');
  }
  equal((await fetch(`${base}/api/applications/${application.id}/documents/${documentId}`, { headers: { Cookie: other.cookie } })).status, 404);
  equal((await json(`applications/${application.id}/documents/${randomUUID()}`, undefined, candidate.cookie)).status, 404);
  await app.close(); await start();
  deepEqual((await json(`applications/${application.id}`, undefined, candidate.cookie)).body.answers, answers);
  equal((await fetch(`${base}/api/applications/${application.id}/documents/${documentId}`, { headers: { Cookie: candidate.cookie } })).status, 200);
  equal((await json(`vacancies/${id}/close`, { expectedRevision: 2 }, owner.cookie)).status, 200);
  equal((await submit(id, other)).status, 409); equal((await submit(id, candidate)).status, 200);
  equal((await json(`applications/${application.id}`, undefined, candidate.cookie)).status, 200);
  const noTasks = await submit(largeId, other, answers, [{ field: 'cv', name: 'no-extension', bytes: Buffer.alloc(10 * 1024 * 1024) }]);
  equal(noTasks.status, 201); equal(noTasks.body.processingState, 'not_requested');
  equal(noTasks.body.documents[0].byteCount, 10 * 1024 * 1024);
  const locked = await fetch(`${base}/api/applications/${application.id}`, { method: 'PATCH', headers: { Cookie: recruiter.cookie, Origin: settings.webOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: { name: 'Attempted edit' } }) });
  equal(locked.status, 404);
  console.log('PASS: real OTP/HTTP/PostgreSQL/private uploads, limits, rollback cleanup, duplicates/concurrency, staff read access, candidate isolation, byte-identical downloads and API restart. No processing or live AI.');
} finally {
  try {
    if (database) {
      const fileIds = await database.query('SELECT stored_file_id FROM application_documents WHERE application_id IN (SELECT id FROM applications WHERE vacancy_id=ANY($1::uuid[]))', [vacancyIds]);
      await database.query('DELETE FROM application_documents WHERE application_id IN (SELECT id FROM applications WHERE vacancy_id=ANY($1::uuid[]))', [vacancyIds]);
      await database.query('DELETE FROM stored_files WHERE id=ANY($1::uuid[])', [fileIds.rows.map(row => row.stored_file_id)]);
      await database.query('DELETE FROM applications WHERE vacancy_id=ANY($1::uuid[])', [vacancyIds]);
      await database.query('DELETE FROM vacancies WHERE id=ANY($1::uuid[])', [vacancyIds]);
      await database.query('DELETE FROM "user" WHERE id=ANY($1::text[])', [users]);
      for (const peer of peers) await database.query('DELETE FROM "rateLimit" WHERE key LIKE $1', [`${peer}%`]);
    }
  } finally { await app?.close(); await rm(directory, { recursive: true, force: true }); }
}
