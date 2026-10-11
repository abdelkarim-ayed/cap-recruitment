import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Post, Put, Query, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Roles, type AuthenticatedRequest } from '../auth/access.js';
import { ApplicationService } from '../applications/application.service.js';
import { InterviewService } from './interview.service.js';

@Controller()
@Roles('admin','recruiter','interviewer')
export class InterviewController {
  constructor(private readonly service:InterviewService,private readonly applications:ApplicationService) {}
  @Get('vacancies/:id/interview-pipeline') @Roles('admin','recruiter') @Header('Cache-Control','private, no-store')
  pipeline(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest) { return this.service.pipeline(id,req.actor); }
  @Put('vacancies/:id/interview-pipeline') @Roles('admin','recruiter')
  savePipeline(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest,@Body() body:unknown) { return this.service.savePipeline(id,req.actor,body); }
  @Get('vacancies/:id/interview-results') @Roles('admin','recruiter') @Header('Cache-Control','private, no-store')
  results(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest,@Query() query:unknown) { return this.service.results(id,req.actor,query); }
  @Get('interviewers') @Roles('admin','recruiter') @Header('Cache-Control','private, no-store')
  directory(@Req() req:AuthenticatedRequest) { return this.service.staffDirectory(req.actor); }
  @Get('applications/:id/interviews') @Roles('admin','recruiter') @Header('Cache-Control','private, no-store')
  application(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest) { return this.service.application(id,req.actor); }
  @Post('applications/:id/stage') @Roles('admin','recruiter')
  stage(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest,@Body() body:unknown) { return this.service.stage(id,req.actor,body); }
  @Post('applications/:id/interviews') @Roles('admin','recruiter')
  create(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest,@Body() body:unknown) { return this.service.create(id,req.actor,body); }
  @Get('interviews') @Header('Cache-Control','private, no-store')
  agenda(@Req() req:AuthenticatedRequest,@Query() query:unknown) { return this.service.agenda(req.actor,query); }
  @Get('interviews/:id') @Header('Cache-Control','private, no-store')
  get(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest) { return this.service.get(id,req.actor); }
  @Put('interviews/:id/schedule') @Roles('admin','recruiter')
  reschedule(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest,@Body() body:unknown) { return this.service.reschedule(id,req.actor,body); }
  @Post('interviews/:id/cancel') @Roles('admin','recruiter')
  cancel(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest,@Body() body:unknown) { return this.service.cancel(id,req.actor,body); }
  @Post('interviews/:id/scheduling-issue')
  issue(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest,@Body() body:unknown) { return this.service.issue(id,req.actor,body); }
  @Post('interviews/:id/feedback')
  feedback(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest,@Body() body:unknown) { return this.service.feedback(id,req.actor,body); }
  @Get('interviews/:id/application') @Header('Cache-Control','private, no-store')
  async candidate(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest) {
    const interview=await this.service.get(id,req.actor);return this.applications.get(interview.applicationId,req.actor);
  }
  @Get('interviews/:id/documents/:documentId')
  async document(@Param('id',new ParseUUIDPipe()) id:string,@Param('documentId',new ParseUUIDPipe()) documentId:string,@Req() req:AuthenticatedRequest,@Res() res:Response) {
    const interview=await this.service.get(id,req.actor);const file=await this.applications.download(interview.applicationId,documentId,req.actor);
    res.set({'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}).send(file.bytes);
  }
  @Get('inbox') @Header('Cache-Control','private, no-store')
  inbox(@Req() req:AuthenticatedRequest,@Query() query:unknown) { return this.service.inbox(req.actor,query); }
  @Post('inbox/:id/read')
  read(@Param('id',new ParseUUIDPipe()) id:string,@Req() req:AuthenticatedRequest) { return this.service.markRead(id,req.actor); }
}
