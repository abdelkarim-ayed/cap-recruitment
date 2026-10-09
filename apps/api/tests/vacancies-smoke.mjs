import { equal, deepEqual, ok } from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { Test } from '@nestjs/testing';
import { AppModule } from '../dist/app.module.js';
import { configureApplication } from '../dist/bootstrap.js';
import { DatabaseService } from '../dist/database/database.service.js';
import { RUNTIME_CONFIG, readRuntimeConfig } from '../dist/configuration/runtime-config.js';
import { MAIL_SENDER } from '../dist/integrations/mail/mail-sender.js';
import { MemoryMailSender } from '../dist/integrations/mail/memory-mail-sender.js';

// Real HTTP/auth/PostgreSQL. Own disposable rows only; no table reset or SMTP.
const settings = readRuntimeConfig({ ...process.env, MAIL_DRIVER: 'file' });
const mail = new MemoryMailSender(), users = [];
const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(RUNTIME_CONFIG).useValue(settings).overrideProvider(MAIL_SENDER).useValue(mail).compile();
let app = configureApplication(module.createNestApplication({ bodyParser: false, logger: false }));
let database = app.get(DatabaseService).pool;
const peers = [];
let base;
function request(path, body, cookie, origin = settings.webOrigin, method = body === undefined ? 'GET' : 'POST', peer = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const outgoing = httpRequest(`${base}/api/${path}`, { method, localAddress: peer, headers: { ...(origin ? { Origin: origin } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) } }, incoming => {
      const chunks = []; incoming.on('data', chunk => chunks.push(chunk)); incoming.on('error', reject);
      incoming.on('end', () => resolve({ status: incoming.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()), cookie: incoming.headers['set-cookie']?.map(value => value.split(';')[0]).join('; ') }));
    });
    outgoing.on('error', reject); outgoing.setTimeout(10000, () => outgoing.destroy(new Error('Vacancy check timed out'))); outgoing.end(body === undefined ? undefined : JSON.stringify(body));
  });
}
async function actor(role) {
  const id = randomUUID(), email = `vacancy-check-${id}@example.test`;
  const bytes = randomBytes(2), peer = `127.85.${bytes[0]}.${bytes[1] || 1}`; peers.push(peer);
  await database.query('INSERT INTO "user" (id,name,email,"emailVerified","createdAt","updatedAt",role) VALUES ($1,$2,$3,false,now(),now(),$4)', [id, 'Disposable vacancy actor', email, role]); users.push(id);
  equal((await request('auth/email-otp/send-verification-otp', { email, type: 'sign-in' }, undefined, settings.webOrigin, 'POST', peer)).status, 200);
  const otp = mail.messages.findLast(message => message.to === email)?.text.match(/code is (\d{6})/)?.[1]; ok(otp);
  const login = await request('auth/sign-in/email-otp', { email, otp }, undefined, settings.webOrigin, 'POST', peer); equal(login.status, 200); ok(login.cookie); return { id, cookie: login.cookie };
}
const definition = { title: 'Vacancy fixture', description: 'Test job', formDefinition: { version: 1, inputs: [{ id: 'cv', name: 'cv', label: 'CV', type: 'document', required: true, args: { accept: ['.pdf'], limit: { kind: 'NO_LIMIT' } } }] }, processingDefinition: { version: 1, tasks: [{ id: 'skills', sourceInputId: 'cv', outputKey: 'extracted_skills', type: 'extractSkills', args: { skills: ['SQL'], evidence: true } }] } };
try {
  await app.listen(0, '127.0.0.1'); base = await app.getUrl();
  const owner = await actor('recruiter'), other = await actor('admin'), candidate = await actor('candidate'), interviewer = await actor('interviewer');
  equal((await request('vacancies')).status, 401);
  for (const user of [candidate, interviewer]) equal((await request('vacancies', definition, user.cookie)).status, 403);
  equal((await request('vacancies', definition, owner.cookie, 'https://untrusted.example')).status, 403);
  equal((await request('vacancies', definition, owner.cookie, '')).status, 403);
  const injection = await request('vacancies', { ...definition, ownerId: other.id }, owner.cookie); equal(injection.status, 400);
  const broken = structuredClone(definition); broken.processingDefinition.tasks[0].sourceInputId = 'missing';
  equal((await request('vacancies', broken, owner.cookie)).status, 400);
  equal((await database.query('SELECT count(*)::integer AS count FROM vacancies WHERE owner_id=$1', [owner.id])).rows[0].count, 0, 'Invalid payloads must not create partial rows');
  const created = await request('vacancies', definition, owner.cookie); equal(created.status, 201); const id = created.body.id;
  equal(created.body.ownerId, owner.id); equal(created.body.revision, 1);
  deepEqual(created.body.processingDefinition, definition.processingDefinition);
  equal((await request(`public/vacancies/${id}`)).status, 404);
  equal((await request(`vacancies/${id}`, undefined, other.cookie)).status, 200);
  equal((await request(`vacancies/${id}/publish`, { expectedRevision: 1 }, other.cookie)).status, 403);
  const race = await Promise.all([request(`vacancies/${id}`, { expectedRevision: 1, title: 'First edit' }, owner.cookie, settings.webOrigin, 'PATCH'), request(`vacancies/${id}`, { expectedRevision: 1, title: 'Second edit' }, owner.cookie, settings.webOrigin, 'PATCH')]);
  deepEqual(race.map(value => value.status).sort(), [200, 409]);
  equal((await request(`vacancies/${id}/publish`, { expectedRevision: 2 }, owner.cookie)).status, 200);
  const publicDetail = await request(`public/vacancies/${id}`); equal(publicDetail.status, 200);
  deepEqual(Object.keys(publicDetail.body).sort(), ['description', 'form', 'id', 'title']); equal(JSON.stringify(publicDetail.body).includes('extractSkills'), false);
  equal((await request(`vacancies/${id}`, { expectedRevision: 3, title: 'Locked' }, owner.cookie, settings.webOrigin, 'PATCH')).status, 409);
  equal((await request('vacancies?limit=101', undefined, owner.cookie)).status, 400);
  const page = await request('public/vacancies?limit=1&offset=2147483647'); equal(page.status, 200); equal(page.body.items.length, 0); ok(page.body.total >= 1);
  // Destroy/recreate the API and its pool: persistence must survive restart.
  const secondModule = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(RUNTIME_CONFIG).useValue(settings).overrideProvider(MAIL_SENDER).useValue(new MemoryMailSender()).compile();
  await app.close();
  app = configureApplication(secondModule.createNestApplication({ bodyParser: false, logger: false }));
  database = app.get(DatabaseService).pool;
  await app.listen(0, '127.0.0.1'); base = await app.getUrl();
  equal((await request(`public/vacancies/${id}`)).status, 200);
  equal((await request(`vacancies/${id}/close`, { expectedRevision: 3 }, owner.cookie)).status, 200);
  equal((await request(`public/vacancies/${id}`)).status, 404);
  equal((await request(`vacancies/${id}/publish`, { expectedRevision: 4 }, owner.cookie)).status, 409);
  console.log('PASS: real vacancy persistence across API restart, OTP roles, owner checks, origin protection, validation, concurrent edits, publishing/locking, safe public projection, closing.');
} finally {
  try {
    await database.query('DELETE FROM vacancies WHERE owner_id = ANY($1::text[])', [users]);
    await database.query('DELETE FROM "user" WHERE id = ANY($1::text[])', [users]);
    for (const peer of peers) await database.query('DELETE FROM "rateLimit" WHERE key LIKE $1', [`${peer}%`]);
  } finally { await app.close(); }
}
