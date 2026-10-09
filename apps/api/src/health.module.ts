import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { HealthController } from './health.controller.js';

@Module({ imports: [DatabaseModule, InfrastructureModule], controllers: [HealthController] })
export class HealthModule {}
