import { z } from 'zod';
import { reviewReadinessStates } from '@recruitment/domain';

export const applicationFilterShape = {
  work:z.enum(['processing','for_review','for_screening','interviewing','awaiting_offer','offer_recorded','hired','not_selected','other']).optional(),
  recruitmentStatus:z.enum(['received','preselected','interview','offer','hired','not_selected']).optional(),
  processing:z.enum(['pending','not_requested','processing','completed','completed_with_errors']).optional(),
  review:z.enum(['pending','in_review','completed']).optional(),
  readiness:z.enum(reviewReadinessStates).optional(),
  undecided:z.enum(['true','false']).optional(),
  from:z.iso.date().optional(),before:z.iso.date().optional(),
};
export const screeningExportSchema=z.strictObject(applicationFilterShape).refine(value=>!value.from||!value.before||value.from<value.before,'Submitted before must be after submitted from.');
