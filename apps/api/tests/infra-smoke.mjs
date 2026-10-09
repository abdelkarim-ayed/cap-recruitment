import { equal, match } from 'node:assert/strict';
import { createConnection } from 'node:net';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';

// Optional local integration check; not part of unit/CI tests.
const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix('api');
try {
  await app.listen(0, '127.0.0.1');
  const response = await fetch(`${await app.getUrl()}/api/health/ready`, { signal: AbortSignal.timeout(8000) });
  const status = await response.json();
  equal(response.status, 200, JSON.stringify(status));
  equal(status.database, 'ok'); equal(status.redis, 'ok');

  const mailpit = await fetch('http://127.0.0.1:58025', { signal: AbortSignal.timeout(5000) });
  equal(mailpit.status, 200);
  const greeting = await new Promise((resolve, reject) => {
    const socket = createConnection({ host: '127.0.0.1', port: 51025 });
    socket.setTimeout(3000);
    socket.once('data', data => { resolve(data.toString()); socket.destroy(); });
    socket.once('error', reject);
    socket.once('timeout', () => { socket.destroy(); reject(new Error('SMTP greeting timed out')); });
  });
  match(greeting, /^220 /);
  console.log('Verified actual stack: API readiness, PostgreSQL, Redis, Mailpit HTTP, and SMTP.');
} finally {
  await app.close();
}
