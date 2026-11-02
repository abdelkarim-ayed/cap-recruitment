import type { InterviewCause } from './interview-cause.js';

type Assignment = { interviewId: string; interviewerId: string };
type Responsibility = { interviewId: string; createdBy: string; ownerId: string };

type NotificationContextByCause = {
  hr_scheduled: Assignment & { interviewName: string; vacancyTitle: string };
  hr_rescheduled: Assignment & { previousInterviewerId: string };
  hr_cancelled: Assignment;
  hr_ended_application: Assignment;
  interview_failed: Assignment;
  feedback_submitted: Responsibility & { interviewName: string; outcome: 'pass' | 'fail' };
  reschedule_requested: Responsibility & { reason: string };
};

type CausedNotificationEvent = {
  [Type in InterviewCause['type']]: {
    type: Type;
    cause: Extract<InterviewCause, { type: Type }>;
  } & NotificationContextByCause[Type];
}[InterviewCause['type']];

export type StaffInterviewNotificationEvent = CausedNotificationEvent
  | { type: 'stage_changed'; stage: 'preselected' | 'offer' | 'hired' };

export type InterviewNotificationKind = 'assigned' | 'rescheduled' | 'cancelled' | 'scheduling_issue' | 'feedback';

export interface StaffInterviewNotification {
  recipientId: string;
  interviewId: string;
  kind: InterviewNotificationKind;
  title: string;
  body: string;
  cause: InterviewCause;
}

function notifications(
  event: CausedNotificationEvent,
  recipients: string[],
  kind: InterviewNotificationKind,
  title: string,
  body: string,
): StaffInterviewNotification[] {
  // Preserve actor copies where the actor also holds a recipient responsibility.
  return [...new Set(recipients)].map(recipientId => ({
    recipientId, interviewId: event.interviewId, kind, title, body, cause: event.cause,
  }));
}

function unsupportedNotificationEvent(_event: never): never {
  throw new Error('Unsupported interview notification event.');
}

// Pure, staff-only intents. The command supplies loaded context; its existing
// transaction persists the result. Candidate/public effects and mail are separate.
export function staffInterviewNotifications(event: StaffInterviewNotificationEvent): StaffInterviewNotification[] {
  switch (event.type) {
    case 'hr_scheduled':
      return notifications(event, [event.interviewerId], 'assigned', 'Interview assigned', `${event.interviewName} · ${event.vacancyTitle}`);
    case 'hr_rescheduled':
      // Reassignment messages deliberately carry no candidate details. Read-side
      // access resolution still removes the former assignee's interview link.
      return notifications(event, [event.previousInterviewerId, event.interviewerId], 'rescheduled', 'Interview schedule changed',
        event.previousInterviewerId === event.interviewerId ? 'Open the interview for the updated schedule.' : 'The interview assignment or schedule changed.');
    case 'hr_cancelled':
      return notifications(event, [event.interviewerId], 'cancelled', 'Interview cancelled', event.cause.reason);
    case 'hr_ended_application':
      return notifications(event, [event.interviewerId], 'cancelled', 'Interview cancelled', `HR ended this application: ${event.cause.reason}`);
    case 'interview_failed':
      return notifications(event, [event.interviewerId], 'cancelled', 'Interview cancelled', `Remaining interview cancelled after a Fail result in ${event.cause.stepName}.`);
    case 'reschedule_requested':
      return notifications(event, [event.createdBy, event.ownerId], 'scheduling_issue', 'Rescheduling requested', event.reason);
    case 'feedback_submitted':
      return notifications(event, [event.createdBy, event.ownerId], 'feedback', `Interview ${event.outcome === 'pass' ? 'passed' : 'failed'}`, `${event.interviewName}: feedback submitted.`);
    case 'stage_changed':
      // Deliberately preserve today's lack of preselection/Offer/Hired messages.
      return [];
    default:
      return unsupportedNotificationEvent(event);
  }
}
