import { roleAllows, type ActorReference, type ApplicationActions } from '@recruitment/domain';
import { availability, rolePolicy } from '../auth/action-policy.js';

export function canReadApplication(actor: ActorReference, candidateId: string, hasAssignment: boolean): boolean {
  if (actor.role === 'interviewer') return hasAssignment;
  return roleAllows(actor.role, 'application.read') && (actor.role !== 'candidate' || actor.id === candidateId);
}

export function applicationActions(actor: ActorReference): ApplicationActions {
  return {
    review: availability(rolePolicy(actor, 'review.read')),
    workflow: availability(rolePolicy(actor, 'workflow.read')),
    export: availability(rolePolicy(actor, 'review.export')),
  };
}
