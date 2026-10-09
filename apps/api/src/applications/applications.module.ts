import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { ApplicationsController } from './application.controller.js';
import { ApplicationService } from './application.service.js';

@Module({ imports: [DatabaseModule, DocumentsModule], controllers: [ApplicationsController], providers: [ApplicationService] })
export class ApplicationsModule {}
