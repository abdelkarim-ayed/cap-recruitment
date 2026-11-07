import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ApplicationsModule } from '../applications/applications.module.js';
import { InterviewService } from './interview.service.js';
import { InterviewController } from './interview.controller.js';
import { ScreeningService } from './screening.service.js';
import { ScreeningController } from './screening.controller.js';
@Module({imports:[DatabaseModule,ApplicationsModule],providers:[InterviewService,ScreeningService],controllers:[InterviewController,ScreeningController]})
export class InterviewModule {}
