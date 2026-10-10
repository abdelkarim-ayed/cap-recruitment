import 'reflect-metadata';
import { readFile } from 'node:fs/promises';
import { NestFactory } from '@nestjs/core';
import { ProcessingModule } from './processing.module.js';
import { ProcessingRepository } from './processing.repository.js';
import { ProcessingService } from './processing.service.js';
import { FIXTURE_REGISTRY, type FixtureRegistry } from './execution.js';

const [id, fixturePath] = process.argv.slice(2);
if (process.argv.length > 4 || (id && id !== 'pending' && !/^[a-f0-9-]{36}$/.test(id))) throw new Error('Usage: process [pending|application-uuid] [trusted-fixtures.json]');
if (fixturePath && process.env.NODE_ENV === 'production') throw new Error('Fixtures forbidden in production.');
const app = await NestFactory.createApplicationContext(ProcessingModule, { logger: false });
try {
  if (fixturePath) { const fixtures = app.get<FixtureRegistry>(FIXTURE_REGISTRY).load(JSON.parse(await readFile(fixturePath,'utf8'))); await app.get(ProcessingRepository).bind(fixtures); }
  let count = 0;
  while (count < 20 && await app.get(ProcessingService).processOne(id === 'pending' ? undefined : id)) count++;
  console.log(`Processed ${count} applications; mock/disabled adapters only. Retryable work waits 30 seconds, max 3 attempts.`);
} finally { await app.close(); }
