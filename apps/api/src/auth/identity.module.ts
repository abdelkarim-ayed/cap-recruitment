import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigurationModule } from '../configuration/configuration.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { AccessController } from './access.controller.js';
import { AuthService } from './auth.service.js';
import { SessionGuard } from './session.guard.js';

@Module({
  imports: [ConfigurationModule, DatabaseModule, IntegrationsModule],
  controllers: [AccessController],
  providers: [AuthService, { provide: APP_GUARD, useClass: SessionGuard }],
  exports: [AuthService],
})
export class IdentityModule {}
