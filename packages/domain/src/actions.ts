export const roles = ['admin', 'recruiter', 'interviewer', 'candidate'] as const;
export type Role = (typeof roles)[number];
export interface ActorReference { id: string; role: Role }

const hr = ['admin', 'recruiter'] as const;
const staff = [...hr, 'interviewer'] as const;
const applicants = [...hr, 'candidate'] as const;

// Coarse role eligibility only. Resource ownership, assignment and prerequisites
// are resolved from fresh records by the owning backend feature.
export const actionRoles = {
  'vacancy.read': hr, 'vacancy.create': hr, 'vacancy.edit': hr,
  'vacancy.publish': hr, 'vacancy.close': hr,
  'interviewPlan.read': hr, 'interviewPlan.edit': hr,
  'application.list': applicants, 'application.listVacancy': hr,
  'application.read': applicants, 'application.readAll': hr, 'application.download': applicants,
  'application.submit': ['candidate'],
  'review.read': hr, 'review.edit': hr, 'review.export': hr,
  'workflow.read': hr, 'workflow.change': hr,
  'interview.list': staff, 'interview.read': staff, 'interview.readAll': hr, 'interview.directory': hr,
  'interview.schedule': hr, 'interview.reschedule': hr, 'interview.cancel': hr,
  'interview.requestRescheduling': staff, 'interview.submitFeedback': staff,
  'interview.application': staff, 'interview.document': staff,
  'notification.list': staff, 'notification.read': staff, 'staff.access': staff,
} as const satisfies Record<string, readonly Role[]>;
export type Action = keyof typeof actionRoles;

export function roleAllows(role: Role | null | undefined, action: Action): boolean {
  return role !== undefined && role !== null && (actionRoles[action] as readonly Role[]).includes(role);
}

// Visibility preserves the current UI presentation; it is not authorization.
export interface ActionAvailability { allowed: boolean; visible: boolean; reason: string | null }
export type VacancyActions = Record<'edit' | 'publish' | 'close', ActionAvailability>;
export type InterviewPlanActions = Record<'edit', ActionAvailability>;
export type WorkflowActions = Record<'preselect' | 'reject' | 'offer' | 'hire' | 'schedule', ActionAvailability>;
export type InterviewActions = Record<'reschedule' | 'cancel' | 'requestRescheduling' | 'submitFeedback' | 'readApplication', ActionAvailability>;
export type ReviewActions = Record<'edit', ActionAvailability>;
export type ApplicationActions = Record<'review' | 'workflow' | 'export', ActionAvailability>;
