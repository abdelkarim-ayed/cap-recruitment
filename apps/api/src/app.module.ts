import { Module } from '@nestjs/common';
import { IdentityModule } from './auth/identity.module.js';
import { HealthModule } from './health.module.js';

@Module({
  imports: [IdentityModule, HealthModule],
})
export class AppModule {}
