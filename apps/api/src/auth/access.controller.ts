import { Controller, Get, Req } from '@nestjs/common';
import { Roles, type AuthenticatedRequest } from './access.js';

@Controller()
export class AccessController {
  @Get('me')
  me(@Req() request: AuthenticatedRequest) { return { user: request.actor }; }

  @Get('staff/access')
  @Roles('admin', 'recruiter', 'interviewer')
  staff(@Req() request: AuthenticatedRequest) { return { user: request.actor }; }
}
