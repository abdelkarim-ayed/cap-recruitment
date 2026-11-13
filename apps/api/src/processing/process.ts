import 'reflect-metadata';
import { readFile } from 'node:fs/promises';
import { NestFactory } from '@nestjs/core';
import { ProcessingModule } from './processing.module.js';
import { ProcessingRepository } from './processing.repository.js';
import { ProcessingService } from './processing.service.js';
import { FIXTURE_REGISTRY, type FixtureRegistry } from './execution.js';
import { processingSettings } from './settings.js';
import { JevGateway } from '../integrations/jev/jev.gateway.js';

const [id, fixturePath] = process.argv.slice(2);
if(processingSettings().runner!=='disabled')throw new Error('Explicit processing CLI requires the background runner disabled.');
if (process.argv.length > 4 || (id && id !== 'pending' && !/^[a-f0-9-]{36}$/.test(id))) throw new Error('Usage: process [pending|application-uuid] [trusted-fixtures.json]');
if (fixturePath && process.env.NODE_ENV === 'production') throw new Error('Fixtures forbidden in production.');
if (!fixturePath && processingSettings().executor === 'disabled') throw new Error('No executor configured. Supply trusted fixtures or explicitly configure Jev before claiming applications.');
if (!fixturePath && (!id || id === 'pending') && process.env.PROCESSING_ALLOW_ALL !== 'true') throw new Error('Live processing requires an explicit application UUID. Set PROCESSING_ALLOW_ALL=true only to deliberately process all eligible applications.');
const app = await NestFactory.createApplicationContext(ProcessingModule, { logger: false });
try {
  if(!fixturePath) {
    console.log(`PID ${process.pid}: starts with an empty Jev key. Load it through jev:key set --worker-pid ${process.pid} within two minutes to continue this explicitly requested run.`);
    // No application claim/admission/provider call before credential preflight.
    // This does not authorize paid execution beyond the existing explicit gates.
    await app.get(JevGateway).waitUntilConfigured(AbortSignal.timeout(120000));
  }
  if (fixturePath) { const fixtures = app.get<FixtureRegistry>(FIXTURE_REGISTRY).load(JSON.parse(await readFile(fixturePath,'utf8'))); await app.get(ProcessingRepository).bind(fixtures); }
  let count = 0;
  while (count < 20 && await app.get(ProcessingService).processOne(id === 'pending' ? undefined : id)) count++;
  console.log(`Processed ${count} applications. Inspect persisted provenance. Retryable whole-extractor work waits 12 hours, max 3 attempts; ambiguous sends never automatically retry.`);
} finally { await app.close(); }
