import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { VacancyRepository } from './vacancy.repository.js';
import { VacancyService } from './vacancy.service.js';
import { PublicVacanciesController, VacanciesController } from './vacancy.controller.js';

@Module({ imports: [DatabaseModule], controllers: [VacanciesController, PublicVacanciesController], providers: [VacancyRepository, VacancyService] })
export class VacanciesModule {}
