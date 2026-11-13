import type { ReviewReadiness, ReviewField } from '@recruitment/domain';

export function readinessLabel(state: ReviewReadiness['state'], status?: string) {
  return state === 'locked' ? status === 'completed' ? 'Review completed' : 'Review frozen after screening'
    : ({not_required:'No review required',waiting:'Waiting for processing',blocked:'Processing blocked',ready:'Ready for review',released:'Released to review'})[state];
}
export interface ReviewDraft { selection: string }
export interface SavedDraft { value: ReviewDraft; active: boolean }
export function sameReviewDraft(left:ReviewDraft,right:ReviewDraft){
  return left.selection===right.selection;
}
export function fieldDraft(field: ReviewField): ReviewDraft {
  return { selection: JSON.stringify(field.effective) ?? 'null' };
}
