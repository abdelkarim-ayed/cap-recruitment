import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module.js';
import { RUNTIME_CONFIG, type RuntimeConfig } from '../configuration/runtime-config.js';
import { REDIS_PROBE } from './connectivity.js';
import { RedisConnectivityProbe } from './redis-connectivity.js';

@Module({
  imports: [ConfigurationModule],
  providers: [{ provide: REDIS_PROBE, inject: [RUNTIME_CONFIG], useFactory: (settings: RuntimeConfig) => new RedisConnectivityProbe(settings.redisUrl) }],
  exports: [REDIS_PROBE],
})
export class InfrastructureModule {}
