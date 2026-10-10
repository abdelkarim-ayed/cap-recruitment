import { Module } from '@nestjs/common';
import { IdentityModule } from './auth/identity.module.js';
import { HealthModule } from './health.module.js';
import { VacanciesModule } from './vacancies/vacancies.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { ProcessingModule } from './processing/processing.module.js';
import { ReviewModule } from './review/review.module.js';

@Module({
  imports: [IdentityModule, HealthModule, VacanciesModule, ApplicationsModule, ProcessingModule, ReviewModule],
})
export class AppModule {}
