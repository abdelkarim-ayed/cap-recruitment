import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { roleAllows, type Action, type ActionAvailability, type ActorReference } from '@recruitment/domain';

export type PolicyDecision = { allowed: true; reason: null }
  | { allowed: false; reason: string; status: 400 | 403 | 409 };
export const permitted: PolicyDecision = { allowed: true, reason: null };
export const denied = (status: 400 | 403 | 409, reason: string): PolicyDecision => ({ allowed: false, reason, status });

export function requirePolicy(decision: PolicyDecision): void {
  if (decision.allowed) return;
  if (decision.status === 400) throw new BadRequestException(decision.reason);
  if (decision.status === 403) throw new ForbiddenException(decision.reason);
  throw new ConflictException(decision.reason);
}

export function rolePolicy(actor: ActorReference, action: Action, reason = 'Recruiter access required.'): PolicyDecision {
  return roleAllows(actor.role, action) ? permitted : denied(403, reason);
}

export function availability(decision: PolicyDecision, visible = decision.allowed): ActionAvailability {
  return { allowed: decision.allowed, visible, reason: decision.reason };
}

export function firstDenied(...decisions: PolicyDecision[]): PolicyDecision {
  return decisions.find(decision => !decision.allowed) ?? permitted;
}
