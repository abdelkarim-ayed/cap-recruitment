import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { ContextTaskExecutor, ContextTextReader, DisabledTaskExecutor, DisabledTextReader, FixtureRegistry, FIXTURE_REGISTRY, TASK_EXECUTOR, DOCUMENT_TEXT_READER } from './execution.js';
import { ProcessingRepository } from './processing.repository.js';
import { ProcessingService } from './processing.service.js';
import { PdfTextReader } from './pdf-reader.js';
import { JevTaskExecutor } from './jev-executor.js';
import { processingSettings } from './settings.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { JevGateway } from '../integrations/jev/jev.gateway.js';

@Module({ imports: [DatabaseModule,DocumentsModule,IntegrationsModule], providers: [ProcessingRepository,ProcessingService,
  { provide: FIXTURE_REGISTRY, useClass: FixtureRegistry },
  { provide: DOCUMENT_TEXT_READER, inject: [FIXTURE_REGISTRY], useFactory: (registry: FixtureRegistry) => new ContextTextReader(processingSettings().reader === 'pdf' ? new PdfTextReader() : new DisabledTextReader(),registry) },
  { provide: TASK_EXECUTOR, inject: [FIXTURE_REGISTRY, JevGateway], useFactory: (registry: FixtureRegistry, gateway: JevGateway) => {
    const config = processingSettings();
    if (config.executor === 'jev' && !gateway.isConfigured()) throw new Error('JEV_API_KEY is not configured for the mandatory gateway.');
    return new ContextTaskExecutor(config.executor === 'jev' ? new JevTaskExecutor(gateway) : new DisabledTaskExecutor(),registry);
  } },
], exports: [ProcessingService,ProcessingRepository,FIXTURE_REGISTRY] })
export class ProcessingModule {}
