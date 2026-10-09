import { equal, deepEqual } from 'node:assert/strict';
import { test } from 'node:test';
import { request as httpRequest } from 'node:http';
import { createApplication } from '../dist/bootstrap.js';
process.env.BETTER_AUTH_SECRET = 'test-only-secret-with-at-least-thirty-two-characters';

test('HTTP health endpoint returns the agreed stage contract', async () => {
  const app = await createApplication(false);
  try {
    await app.listen(0, '127.0.0.1');
    const response = await fetch(`${await app.getUrl()}/api/health`);
    equal(response.status, 200);
    const body = await response.json();
    equal(body.status, 'ok');
    deepEqual(body.applicationStages, ['received', 'review_ready', 'preselected', 'interview', 'offer', 'hired']);
  } finally {
    await app.close();
  }
});

test('readiness reports unavailable dependencies without leaking credentials', async () => {
  const previousDatabase = process.env.DATABASE_URL, previousRedis = process.env.REDIS_URL;
  process.env.DATABASE_URL = 'postgresql://test:not-for-response@127.0.0.1:1/test';
  process.env.REDIS_URL = 'redis://127.0.0.1:1';
  const app = await createApplication(false);
  try {
    await app.listen(0, '127.0.0.1');
    const response = await fetch(`${await app.getUrl()}/api/health/ready`);
    equal(response.status, 503);
    const body = await response.json();
    equal(body.database, 'unavailable');
    equal(body.redis, 'unavailable');
    equal(JSON.stringify(body).includes('not-for-response'), false);
  } finally {
    await app.close();
    if (previousDatabase === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousDatabase;
    if (previousRedis === undefined) delete process.env.REDIS_URL; else process.env.REDIS_URL = previousRedis;
  }
});

test('production bootstrap rejects oversized auth bodies with and without content-length', async () => {
  const app = await createApplication(false);
  try {
    await app.listen(0, '127.0.0.1');
    const url = `${await app.getUrl()}/api/auth/sign-in/email-otp`;
    const body = JSON.stringify({ email: 'body-test@example.test', otp: '123456', name: 'x'.repeat(33000) });
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    equal(response.status, 413);
    equal((await response.json()).code, 'BODY_TOO_LARGE');
    const chunkedStatus = await new Promise((resolve, reject) => {
      const request = httpRequest(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, response => {
        response.resume();
        response.on('end', () => resolve(response.statusCode));
      });
      request.on('error', reject);
      request.setTimeout(5000, () => request.destroy(new Error('Chunked test timed out')));
      request.write(body.slice(0, 16000));
      request.end(body.slice(16000));
    });
    equal(chunkedStatus, 413);
  } finally { await app.close(); }
});

test('production role guard rejects an anonymous caller', async () => {
  const app = await createApplication(false);
  try {
    await app.listen(0, '127.0.0.1');
    equal((await fetch(`${await app.getUrl()}/api/me`)).status, 401);
    equal((await fetch(`${await app.getUrl()}/api/staff/access`)).status, 401);
  } finally { await app.close(); }
});
