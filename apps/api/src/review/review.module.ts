import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ReviewController } from './review.controller.js';
import { ReviewService } from './review.service.js';
@Module({ imports: [DatabaseModule],providers:[ReviewService],controllers:[ReviewController] })
export class ReviewModule {}
