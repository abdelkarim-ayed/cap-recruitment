import type { ReviewReadiness, ReviewTask } from '@recruitment/domain';

export function readinessLabel(state: ReviewReadiness['state'], status?: string) {
  return state === 'locked' ? status === 'completed' ? 'Review completed' : 'Review frozen after screening'
    : ({not_required:'No review required',waiting:'Waiting for processing',blocked:'Processing blocked',ready:'Ready for review',released:'Released to review'})[state];
}
export interface ReviewDraft { skills: string; nullValue: boolean; skillFlags: Record<string,string> }
export interface SavedDraft { value: ReviewDraft; active: boolean }
export function taskDraft(task: ReviewTask): ReviewDraft {
  return {skills:(task.effectiveValue?.skills??[]).join(', '),nullValue:task.hasCorrection&&task.correction===null,
    skillFlags:Object.fromEntries((task.skillResults??[]).map(row=>[row.skill,row.effective===null?'unknown':String(row.effective)]))};
}
