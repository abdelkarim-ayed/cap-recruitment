import { roleAllows, type ActorReference, type InterviewActions, type WorkflowActions } from '@recruitment/domain';
import { availability, denied, firstDenied, permitted, rolePolicy } from '../auth/action-policy.js';

export const interviewPlanOwner = (actorId: string, ownerId: string) => actorId === ownerId
  ? permitted : denied(403, 'Only the vacancy owner can edit the interview plan.');
export const editableInterviewPlan = (frozen: boolean) => frozen
  ? denied(409, 'The interview plan is frozen after publication or scheduling.') : permitted;
export const activeApplication = (stage: string) => ['preselected', 'interview'].includes(stage)
  ? permitted : denied(409, 'Application is not available for interviews.');
export const scheduledInterview = (status: string) => status === 'scheduled'
  ? permitted : denied(409, 'Only scheduled interviews can be changed. Completed and cancelled interviews are final.');
export const assignedInterviewer = (actorId: string, interviewerId: string, action: 'feedback' | 'rescheduling') => actorId === interviewerId
  ? permitted : denied(403, action === 'feedback' ? 'Only the assigned interviewer can submit feedback.' : 'Only the assigned interviewer can request rescheduling.');
export const feedbackStarted = (startsAt: string | Date, now = Date.now()) => new Date(startsAt).getTime() <= now
  ? permitted : denied(409, 'Feedback can be submitted once the interview starts.');
export const applicationNotFinal = (stage: string) => ['hired', 'not_selected'].includes(stage)
  ? denied(409, 'This application is final. Reopening is not supported.') : permitted;
export const preselectable = (stage: string) => ['received', 'review_ready'].includes(stage)
  ? permitted : denied(409, 'Application is already selected.');
export const rejectionAuthority = (actorId: string, ownerId: string, stage: string) => ['received', 'review_ready', 'preselected'].includes(stage) || actorId === ownerId
  ? permitted : denied(403, 'Only the owner can end an application after interviews start.');
export const finalizationOwner = (actorId: string, ownerId: string) => actorId === ownerId
  ? permitted : denied(403, 'Only the owner can record offer/hired.');
export const offerStage = (stage: string) => stage === 'interview'
  ? permitted : denied(409, 'Complete the interview pipeline before an offer.');
export const passedInterviewPlan = (total: number, passed: number) => total > 0 && passed === total
  ? permitted : denied(409, 'Every interview step must pass before an offer.');
export const hireStage = (stage: string) => stage === 'offer'
  ? permitted : denied(409, 'Record an offer before hiring.');

export function workflowActions(actor: ActorReference, context: { ownerId: string; stage: string; total: number; passed: number }): WorkflowActions {
  const hr = rolePolicy(actor, 'workflow.change');
  const open = applicationNotFinal(context.stage);
  const owner = finalizationOwner(actor.id, context.ownerId);
  return {
    preselect: availability(firstDenied(hr, open, preselectable(context.stage))),
    reject: availability(firstDenied(hr, open, rejectionAuthority(actor.id, context.ownerId, context.stage))),
    offer: availability(firstDenied(hr, open, owner, offerStage(context.stage), passedInterviewPlan(context.total, context.passed)),hr.allowed&&owner.allowed&&context.stage==='interview'),
    hire: availability(firstDenied(hr, open, owner, hireStage(context.stage)),hr.allowed&&owner.allowed&&context.stage==='offer'),
    schedule: availability(firstDenied(rolePolicy(actor, 'interview.schedule'), activeApplication(context.stage))),
  };
}

export function interviewActions(actor: ActorReference, context: { interviewerId: string; stage: string; status: string; startsAt: string | Date; hasApplicationAssignment: boolean }): InterviewActions {
  const active = activeApplication(context.stage);
  const scheduled = scheduledInterview(context.status);
  const assigned = assignedInterviewer(actor.id, context.interviewerId, 'rescheduling');
  const scheduling = firstDenied(rolePolicy(actor, 'interview.reschedule'), active, scheduled);
  const read = roleAllows(actor.role,'interview.application') && (roleAllows(actor.role, 'application.readAll') || (actor.id === context.interviewerId && context.hasApplicationAssignment));
  const assessmentVisible=roleAllows(actor.role,'interview.submitFeedback')&&actor.id===context.interviewerId&&context.status==='scheduled'&&context.stage==='interview';
  const schedulingVisible=roleAllows(actor.role,'interview.reschedule')&&context.status==='scheduled'&&context.stage==='interview';
  return {
    reschedule: availability(scheduling,schedulingVisible), cancel: availability(scheduling,schedulingVisible),
    requestRescheduling: availability(firstDenied(rolePolicy(actor, 'interview.requestRescheduling'), assigned, active, scheduled),assessmentVisible),
    submitFeedback: availability(firstDenied(rolePolicy(actor, 'interview.submitFeedback'), assignedInterviewer(actor.id, context.interviewerId, 'feedback'), active, scheduled, feedbackStarted(context.startsAt)),assessmentVisible),
    readApplication: availability(read ? permitted : denied(403, 'Candidate application access is unavailable.'),read&&context.status!=='cancelled'),
  };
}
