import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { ContextTaskExecutor, ContextMarkdownReader, DisabledTaskExecutor, FixtureRegistry, FIXTURE_REGISTRY, TASK_EXECUTOR, DOCUMENT_MARKDOWN_READER } from './execution.js';
import { ProcessingRepository } from './processing.repository.js';
import { ProcessingService } from './processing.service.js';
import { CvPdfReader } from './cv-pdf-reader.js';
import { CvCachedMarkdownReader } from './cv-memory-cache.js';
import { CvParserFileCache, CvResponseFileCache } from './cv-file-cache.js';
import { ProcessingWake } from './processing-wake.js';
import { OfflineDemoExecutor } from '../demo/offline-executor.js';
import { projectRoot } from '../configuration/environment.js';
import { join } from 'node:path';
import { CvExecutor } from './cv-executor.js';
import { CvAttemptRepository } from './cv-attempt.repository.js';
import { CvAttemptCoordinator } from './cv-attempts.js';
import { CvBackgroundRunner } from './cv-runner.js';
import { processingSettings } from './settings.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { JevGateway } from '../integrations/jev/jev.gateway.js';

const cacheDirectory = () => join(projectRoot, '.local', 'cv-cache');
@Module({ imports: [DatabaseModule, DocumentsModule, IntegrationsModule], providers: [ProcessingRepository, ProcessingService, CvAttemptRepository, CvBackgroundRunner, ProcessingWake,
  { provide: FIXTURE_REGISTRY, useClass: FixtureRegistry },
  { provide: DOCUMENT_MARKDOWN_READER, inject: [FIXTURE_REGISTRY], useFactory: (registry: FixtureRegistry) => new ContextMarkdownReader(processingSettings().reader === 'pdf' ? new CvCachedMarkdownReader(new CvPdfReader(), new CvParserFileCache(cacheDirectory())) : undefined, registry) },
  { provide: TASK_EXECUTOR, inject: [FIXTURE_REGISTRY, JevGateway, CvAttemptRepository], useFactory: (registry: FixtureRegistry, gateway: JevGateway, attempts: CvAttemptRepository) => {
    const config = processingSettings();
    const cache = new CvResponseFileCache(cacheDirectory());
    return new ContextTaskExecutor(config.runner === 'offline-demo' ? new OfflineDemoExecutor(cache) : config.executor === 'jev' ? new CvExecutor(new CvAttemptCoordinator(attempts, gateway, cache), () => gateway.isConfigured()) : new DisabledTaskExecutor(), registry);
  } },
], exports: [ProcessingService, ProcessingRepository, FIXTURE_REGISTRY, ProcessingWake] })
export class ProcessingModule {}
