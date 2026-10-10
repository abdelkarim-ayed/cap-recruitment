import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Patch, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Roles, type AuthenticatedRequest } from '../auth/access.js';
import { ReviewService } from './review.service.js';

@Controller()
@Roles('admin','recruiter')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}
  @Get('applications/:id/review') @Header('Cache-Control','private, no-store')
  get(@Param('id',new ParseUUIDPipe()) id: string) { return this.service.get(id); }
  @Patch('applications/:id/review') @Header('Cache-Control','private, no-store')
  patch(@Param('id',new ParseUUIDPipe()) id: string,@Req() request: AuthenticatedRequest,@Body() body: unknown) { return this.service.patch(id,request.actor,body); }
  @Get('vacancies/:id/export')
  async export(@Param('id',new ParseUUIDPipe()) id: string,@Res() response: Response) {
    const csv = await this.service.export(id);
    response.set({ 'Content-Type': 'text/csv; charset=utf-8','Content-Disposition': `attachment; filename="vacancy-${id}.csv"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff' }); response.send(csv);
  }
}
