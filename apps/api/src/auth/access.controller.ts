import { Controller, Get, Req } from '@nestjs/common';
import { RequireAction, type AuthenticatedRequest } from './access.js';

@Controller()
export class AccessController {
  @Get('me')
  me(@Req() request: AuthenticatedRequest) { return { user: request.actor }; }

  @Get('staff/access')
  @RequireAction('staff.access')
  staff(@Req() request: AuthenticatedRequest) { return { user: request.actor }; }
}
