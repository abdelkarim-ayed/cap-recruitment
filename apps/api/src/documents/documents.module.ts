import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module.js';
import { RUNTIME_CONFIG, type RuntimeConfig } from '../configuration/runtime-config.js';
import { DOCUMENT_STORAGE } from './document-storage.js';
import { LocalDocumentStorage } from './local-document-storage.js';

@Module({ imports: [ConfigurationModule], providers: [{ provide: DOCUMENT_STORAGE, inject: [RUNTIME_CONFIG], useFactory: (settings: RuntimeConfig) => new LocalDocumentStorage(settings.documentDirectory) }], exports: [DOCUMENT_STORAGE] })
export class DocumentsModule {}
