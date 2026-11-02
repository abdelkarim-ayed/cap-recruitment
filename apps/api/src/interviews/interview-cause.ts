// Causes originate in commands, not in persistence hooks or notification delivery.
export type InterviewCause =
  | { type: 'hr_scheduled'; actorId: string }
  | { type: 'hr_rescheduled'; actorId: string }
  | { type: 'hr_cancelled'; actorId: string; reason: string }
  | { type: 'hr_ended_application'; actorId: string; reason: string }
  | { type: 'interview_failed'; actorId: string; interviewId: string; stepName: string }
  | { type: 'feedback_submitted'; actorId: string }
  | { type: 'reschedule_requested'; actorId: string };
