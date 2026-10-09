import { SetMetadata } from '@nestjs/common';
import type { Request } from 'express';

export const roles = ['admin', 'recruiter', 'interviewer', 'candidate'] as const;
export type Role = (typeof roles)[number];
export const Public = () => SetMetadata('public', true);
export const Roles = (...allowed: Role[]) => SetMetadata('roles', allowed);
export type AuthenticatedRequest = Request & { actor: { id: string; email: string; name: string; role: Role } };
