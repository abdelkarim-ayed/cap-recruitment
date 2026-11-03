import { Inject, Injectable, UnauthorizedException, ForbiddenException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import { AuthService } from './auth.service.js';
import { roles, type Role, type AuthenticatedRequest } from './access.js';
import { RUNTIME_CONFIG, type RuntimeConfig } from '../configuration/runtime-config.js';
import { roleAllows, type Action } from '@recruitment/domain';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly reflector: Reflector, @Inject(RUNTIME_CONFIG) private readonly settings: RuntimeConfig) {}
  async canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>('public', targets)) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // No cookie means no session credential, regardless of database availability.
    if (!request.headers.cookie) throw new UnauthorizedException('Sign in to continue.');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && ![this.settings.webOrigin, new URL(this.settings.authUrl).origin].includes(request.headers.origin ?? '')) {
      throw new ForbiddenException('A trusted Origin header is required for this action.');
    }
    const session = await this.auth.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) throw new UnauthorizedException('Sign in to continue.');
    const role = session.user.role;
    if (!roles.includes(role as Role)) throw new ForbiddenException('Account role is unavailable.');
    const allowed = this.reflector.getAllAndOverride<Role[]>('roles', targets);
    if (allowed && !allowed.includes(role as Role)) throw new ForbiddenException('This action requires a different role.');
    const action = this.reflector.getAllAndOverride<Action>('action', targets);
    if (action && !roleAllows(role as Role, action)) throw new ForbiddenException('This action requires a different role.');
    request.actor = { id: session.user.id, email: session.user.email, name: session.user.name, role: role as Role };
    return true;
  }
}
