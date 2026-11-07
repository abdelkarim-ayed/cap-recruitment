import { BadRequestException, Body, Controller, Header, Param, ParseUUIDPipe, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { screeningLimits } from '@recruitment/domain';
import { RequireAction, type AuthenticatedRequest } from '../auth/access.js';
import { ScreeningService } from './screening.service.js';

@Controller('vacancies/:id/screening')
@RequireAction('workflow.change')
export class ScreeningController {
  constructor(private readonly service:ScreeningService) {}
  @Post('preview') @Header('Cache-Control','private, no-store')
  @UseInterceptors(FileInterceptor('file',{storage:memoryStorage(),limits:{fileSize:screeningLimits.bytes,files:1,fields:0,parts:1}}))
  preview(@Param('id',new ParseUUIDPipe()) id:string,@Req() request:AuthenticatedRequest,@UploadedFile() file:Express.Multer.File) {
    if(!file)throw new BadRequestException('Upload one UTF-8 decision CSV.');
    let csv:string;
    try { csv=new TextDecoder('utf-8',{fatal:true}).decode(file.buffer); } catch { throw new BadRequestException('CSV must be valid UTF-8.'); }
    return this.service.preview(id,request.actor,csv);
  }
  @Post('apply') @Header('Cache-Control','private, no-store')
  apply(@Param('id',new ParseUUIDPipe()) id:string,@Req() request:AuthenticatedRequest,@Body() body:unknown) { return this.service.apply(id,request.actor,body); }
}
