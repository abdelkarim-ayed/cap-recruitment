import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Patch, Query, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RequireAction, type AuthenticatedRequest } from '../auth/access.js';
import { ReviewService } from './review.service.js';

@Controller()
@RequireAction('review.read')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}
  @Get('applications/:id/review') @Header('Cache-Control','private, no-store')
  get(@Param('id',new ParseUUIDPipe()) id: string,@Req() request:AuthenticatedRequest) { return this.service.get(id,request.actor); }
  @Patch('applications/:id/review') @RequireAction('review.edit') @Header('Cache-Control','private, no-store')
  patch(@Param('id',new ParseUUIDPipe()) id: string,@Req() request: AuthenticatedRequest,@Body() body: unknown) { return this.service.patch(id,request.actor,body); }
  @Get('vacancies/:id/export') @RequireAction('review.export')
  async export(@Param('id',new ParseUUIDPipe()) id: string,@Res() response: Response) {
    const csv = await this.service.export(id);
    response.set({ 'Content-Type': 'text/csv; charset=utf-8','Content-Disposition': `attachment; filename="vacancy-${id}.csv"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff' }); response.send(csv);
  }
  @Get('vacancies/:id/screening-export') @RequireAction('review.export')
  async screeningExport(@Param('id',new ParseUUIDPipe()) id:string,@Query() query:unknown,@Res() response:Response) {
    const csv=await this.service.export(id,query);
    response.set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="screening-${id}.csv"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}).send(csv);
  }
}
