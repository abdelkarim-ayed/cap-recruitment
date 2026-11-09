import { Body, Controller, Get, Header, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Public, RequireAction, type AuthenticatedRequest } from '../auth/access.js';
import { VacancyService } from './vacancy.service.js';
import { withVacancyActions } from './vacancy.policy.js';

@Controller('vacancies')
@RequireAction('vacancy.read')
export class VacanciesController {
  constructor(private readonly service: VacancyService) {}
  @Post() @RequireAction('vacancy.create')
  async create(@Req() request: AuthenticatedRequest, @Body() body: unknown) { return withVacancyActions(await this.service.create(request.actor.id, body),request.actor.id); }
  @Get() @Header('Cache-Control','private, no-store')
  list(@Req() request:AuthenticatedRequest,@Query() query: unknown) { return this.service.listStaff(request.actor, query); }
  @Get('owners') @Header('Cache-Control','private, no-store')
  owners(@Req() request:AuthenticatedRequest){return this.service.owners(request.actor);}
  @Get(':id') async get(@Param('id', new ParseUUIDPipe()) id: string,@Req() request:AuthenticatedRequest) { return withVacancyActions(await this.service.get(id),request.actor.id); }
  @Patch(':id') @RequireAction('vacancy.edit')
  async patch(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest, @Body() body: unknown) { return withVacancyActions(await this.service.patch(id, request.actor.id, body),request.actor.id); }
  @Post(':id/publish') @HttpCode(200) @RequireAction('vacancy.publish')
  async publish(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest, @Body() body: unknown) { return withVacancyActions(await this.service.transition(id, request.actor.id, 'published', body),request.actor.id); }
  @Post(':id/close') @HttpCode(200) @RequireAction('vacancy.close')
  async close(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest, @Body() body: unknown) { return withVacancyActions(await this.service.transition(id, request.actor.id, 'closed', body),request.actor.id); }
}
@Controller('public/vacancies')
@Public()
export class PublicVacanciesController {
  constructor(private readonly service: VacancyService) {}
  @Get() list(@Query() query: unknown) { return this.service.list(true, query); }
  @Get(':id') get(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.get(id, true); }
}
@Controller('candidate/vacancies')
@RequireAction('application.submit')
export class CandidateVacanciesController {
  constructor(private readonly service:VacancyService){}
  @Get() @Header('Cache-Control','private, no-store')
  list(@Req() request:AuthenticatedRequest,@Query() query:unknown){return this.service.listForCandidate(request.actor,query);}
}
