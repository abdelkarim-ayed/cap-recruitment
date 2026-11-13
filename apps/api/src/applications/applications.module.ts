import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { ApplicationsController } from './application.controller.js';
import { ApplicationService } from './application.service.js';
import { ProcessingModule } from '../processing/processing.module.js';

@Module({ imports: [DatabaseModule, DocumentsModule, ProcessingModule], controllers: [ApplicationsController], providers: [ApplicationService], exports:[ApplicationService] })
export class ApplicationsModule {}
