import { Module } from '@nestjs/common';
import { RUNTIME_CONFIG, readRuntimeConfig } from './runtime-config.js';

@Module({
  providers: [{ provide: RUNTIME_CONFIG, useFactory: () => readRuntimeConfig() }],
  exports: [RUNTIME_CONFIG],
})
export class ConfigurationModule {}
