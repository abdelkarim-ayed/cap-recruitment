import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module.js';
import { DatabaseService } from './database.service.js';

@Module({ imports: [ConfigurationModule], providers: [DatabaseService], exports: [DatabaseService] })
export class DatabaseModule {}
