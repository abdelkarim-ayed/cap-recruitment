import { Module } from '@nestjs/common';
import { IdentityModule } from './auth/identity.module.js';
import { HealthModule } from './health.module.js';
import { VacanciesModule } from './vacancies/vacancies.module.js';

@Module({
  imports: [IdentityModule, HealthModule, VacanciesModule],
})
export class AppModule {}
