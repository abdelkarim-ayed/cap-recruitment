import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { ContextTaskExecutor, ContextTextReader, DisabledTaskExecutor, DisabledTextReader, FixtureRegistry, FIXTURE_REGISTRY, TASK_EXECUTOR, DOCUMENT_TEXT_READER } from './execution.js';
import { ProcessingRepository } from './processing.repository.js';
import { ProcessingService } from './processing.service.js';
import { PdfTextReader } from './pdf-reader.js';
import { JevTaskExecutor } from './jev-executor.js';
import { processingSettings } from './settings.js';

@Module({ imports: [DatabaseModule,DocumentsModule], providers: [ProcessingRepository,ProcessingService,
  { provide: FIXTURE_REGISTRY, useClass: FixtureRegistry },
  { provide: DOCUMENT_TEXT_READER, inject: [FIXTURE_REGISTRY], useFactory: (registry: FixtureRegistry) => new ContextTextReader(processingSettings().reader === 'pdf' ? new PdfTextReader() : new DisabledTextReader(),registry) },
  { provide: TASK_EXECUTOR, inject: [FIXTURE_REGISTRY], useFactory: (registry: FixtureRegistry) => { const config = processingSettings(); return new ContextTaskExecutor(config.executor === 'jev' ? new JevTaskExecutor(config.key, config.model) : new DisabledTaskExecutor(),registry); } },
], exports: [ProcessingService,ProcessingRepository,FIXTURE_REGISTRY] })
export class ProcessingModule {}
