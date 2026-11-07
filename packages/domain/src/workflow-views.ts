import type { ApplicationActions, InterviewActions, InterviewPlanActions, ReviewActions, VacancyActions, WorkflowActions } from './actions.js';
import type { FormDefinition, ProcessingDefinition, SkillValue, Vacancy } from './vacancies.js';

export interface Person { id: string; name: string; email: string }
export type ProcessingFailureCategory = 'ordinary_terminal' | 'operational' | 'uncertain' | 'unclassified';
export const reviewReadinessStates = ['not_required','waiting','blocked','ready','released','locked'] as const;
export interface ReviewReadiness { state: typeof reviewReadinessStates[number]; reason: string | null }
export interface Page<T> { items: T[]; total: number; limit: number; offset: number }
export type StaffVacancy = Vacancy & { actions: VacancyActions };
export interface InterviewPlanEntry { id: string; position: number; name: string; instructions: string }
export type InterviewPlanInput = Pick<InterviewPlanEntry, 'name' | 'instructions'>;
export interface InterviewPlanView {
  vacancyId: string; revision: number; owner: Person; editable: boolean; frozen: boolean;
  steps: InterviewPlanEntry[]; actions: InterviewPlanActions;
}
export type InterviewCause =
  | { type: 'hr_scheduled'; actorId: string }
  | { type: 'hr_rescheduled'; actorId: string }
  | { type: 'hr_cancelled'; actorId: string; reason: string }
  | { type: 'hr_ended_application'; actorId: string; reason: string }
  | { type: 'interview_failed'; actorId: string; interviewId: string; stepName: string }
  | { type: 'feedback_submitted'; actorId: string }
  | { type: 'reschedule_requested'; actorId: string };
export interface InterviewView {
  id: string; applicationId: string; vacancyId: string; stepId: string; stepName: string; instructions: string;
  vacancyTitle: string; candidate: { name: string; email: string }; applicationStage: string;
  revision: number; status: 'scheduled' | 'completed' | 'cancelled'; startsAt: string;
  durationMinutes: 30 | 60 | 90 | 120; timezone: string; meeting: string; interviewer: Person; owner: Person;
  notes: string | null; score: number | null; outcome: 'pass' | 'fail' | null; submittedAt: string | null;
  cancellationCause: InterviewCause | null; changeCause: InterviewCause; schedulingIssue: string | null;
  issueAt: string | null; updatedAt: string; actions: InterviewActions;
}
export interface InterviewDetail extends InterviewView { canAssess: boolean; canSchedule: boolean }
export interface WorkflowView {
  applicationId: string; stage: string; revision: number; owner: Person; isOwner: boolean;
  steps: InterviewPlanEntry[]; interviews: InterviewView[]; actions: WorkflowActions;
}
export type InterviewResults = InterviewPlanView & Page<{
  id: string; candidate: { name: string; email: string }; stage: string; interviews: InterviewView[];
}>;
export interface ApplicationDocument { id: string; inputId: string; filename: string; byteCount: number; mediaType: string }
export interface ReviewMetadata {
  required: boolean; status: 'pending' | 'in_review' | 'completed'; revision: number;
  reviewedBy: string | null; reviewedAt: string | null; hasCorrections?: boolean;
  updatedAt?: string | null; editor?: Person | null;
}
export interface ApplicationView {
  id: string; vacancyId: string; candidateId: string; candidate: { name: string; email: string };
  vacancy: { id: string; title: string; description: string; location?: string; revision: number; formDefinition: FormDefinition; processingDefinition?: ProcessingDefinition };
  answers: Record<string, unknown>; documents: ApplicationDocument[]; stage: string; processingState: string; submittedAt: string;
  review?: ReviewMetadata; actions?: ApplicationActions; processingClosed?: boolean;
}
export interface ReviewTask {
  taskId: string; sourceInputId: string; outputKey: string; status: string; attempts: number; retryable: boolean;
  failureCategory?: ProcessingFailureCategory | null;
  result: { status: string; value: SkillValue | null; reason?: string; evidence?: string[] };
  skillResults: { skill: string; original: boolean | null; effective: boolean | null }[];
  provenance: { mode: string; fixtureId?: string; provider?: string; reader?: string; model?: string } | null;
  hasCorrection: boolean; correction: SkillValue | null; correctedBy: string | null; correctedAt: string | null;
  corrector: Person | null; effectiveValue: SkillValue | null;
}
export interface ReviewView {
  applicationId: string; answers: Record<string, unknown>; formDefinition: FormDefinition;
  processingState: string; review: ReviewMetadata; tasks: ReviewTask[]; actions: ReviewActions; processingClosed?: boolean;
  readiness?: ReviewReadiness; release?: { at: string; actor: Person | null } | null;
}
export interface NotificationView {
  id: string; kind: string; title: string; body: string; cause: InterviewCause | { type:'screening'; decision:'preselected'|'rejected' };
  createdAt: string; readAt: string | null; interviewId: string | null; applicationId?: string | null;
}
