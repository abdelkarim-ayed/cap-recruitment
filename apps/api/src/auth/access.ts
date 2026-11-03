import { SetMetadata } from '@nestjs/common';
import type { Request } from 'express';
import type { Action, Role } from '@recruitment/domain';

export { roles, type Role } from '@recruitment/domain';
export const Public = () => SetMetadata('public', true);
export const Roles = (...allowed: Role[]) => SetMetadata('roles', allowed);
export const RequireAction = (action: Action) => SetMetadata('action', action);
export type AuthenticatedRequest = Request & { actor: { id: string; email: string; name: string; role: Role } };
