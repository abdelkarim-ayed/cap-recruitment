import { z } from 'zod';

export const applicationFilterShape = {
  processing:z.enum(['pending','not_requested','processing','completed','completed_with_errors']).optional(),
  review:z.enum(['pending','in_review','completed']).optional(),
  undecided:z.enum(['true','false']).optional(),
  from:z.iso.date().optional(),before:z.iso.date().optional(),
};
export const screeningExportSchema=z.strictObject(applicationFilterShape).refine(value=>!value.from||!value.before||value.from<value.before,'Submitted before must be after submitted from.');
