import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Post, Query, Req, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { uploadLimits } from '@recruitment/domain/applications';
import { Roles, type AuthenticatedRequest } from '../auth/access.js';
import { BoundedUploadStorage } from '../documents/bounded-upload.js';
import { ApplicationService } from './application.service.js';

@Controller()
@Roles('candidate', 'admin', 'recruiter')
export class ApplicationsController {
  constructor(private readonly service: ApplicationService) {}
  @Post('vacancies/:id/applications')
  @Header('Cache-Control', 'private, no-store')
  @Roles('candidate')
  @UseInterceptors(AnyFilesInterceptor({ storage: new BoundedUploadStorage(), limits: { fileSize: uploadLimits.fileBytes, files: uploadLimits.files, fields: 1, fieldSize: uploadLimits.answersBytes, fieldNameSize: 64, parts: 102, headerPairs: 100 } }))
  async submit(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest, @Body() body: unknown, @UploadedFiles() files: Express.Multer.File[], @Res({ passthrough: true }) response: Response) {
    const result = await this.service.submit(id, request.actor, body, files ?? []);
    response.status(result.created ? 201 : 200);
    return result.application;
  }
  @Get('applications') @Header('Cache-Control', 'private, no-store')
  list(@Req() request: AuthenticatedRequest, @Query() query: unknown) { return this.service.list(request.actor, query); }
  @Get('vacancies/:id/applications') @Roles('admin', 'recruiter')
  @Header('Cache-Control', 'private, no-store')
  listVacancy(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest, @Query() query: unknown) { return this.service.list(request.actor, query, id); }
  @Get('applications/:id') @Header('Cache-Control', 'private, no-store')
  get(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AuthenticatedRequest) { return this.service.get(id, request.actor); }
  @Get('applications/:id/documents/:documentId')
  async download(@Param('id', new ParseUUIDPipe()) id: string, @Param('documentId', new ParseUUIDPipe()) documentId: string, @Req() request: AuthenticatedRequest, @Res() response: Response) {
    const { bytes, filename } = await this.service.download(id, documentId, request.actor);
    response.set({ 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="document"; filename*=UTF-8''${encodeURIComponent(filename).replace(/['()*]/g, char => `%${char.charCodeAt(0).toString(16)}`)}`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store', 'Content-Security-Policy': "sandbox; default-src 'none'" });
    response.send(bytes);
  }
}
