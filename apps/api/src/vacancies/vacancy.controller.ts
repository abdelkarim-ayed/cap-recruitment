import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Public, Roles, type AuthenticatedRequest } from '../auth/access.js';
import { VacancyService } from './vacancy.service.js';

@Controller('vacancies')
@Roles('admin', 'recruiter')
export class VacanciesController {
  constructor(private readonly service: VacancyService) {}
  @Post() create(@Req() request: AuthenticatedRequest, @Body() body: unknown) { return this.service.create(request.actor.id, body); }
  @Get() list(@Query() query: unknown) { return this.service.list(false, query); }
  @Get(':id') get(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.get(id); }
  @Patch(':id') patch(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest, @Body() body: unknown) { return this.service.patch(id, request.actor.id, body); }
  @Post(':id/publish') @HttpCode(200)
  publish(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest, @Body() body: unknown) { return this.service.transition(id, request.actor.id, 'published', body); }
  @Post(':id/close') @HttpCode(200)
  close(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest, @Body() body: unknown) { return this.service.transition(id, request.actor.id, 'closed', body); }
}
@Controller('public/vacancies')
@Public()
export class PublicVacanciesController {
  constructor(private readonly service: VacancyService) {}
  @Get() list(@Query() query: unknown) { return this.service.list(true, query); }
  @Get(':id') get(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.get(id, true); }
}
