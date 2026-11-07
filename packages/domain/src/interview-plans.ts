import { z } from 'zod';

export const interviewPlanInputSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  instructions: z.string().trim().max(4000).default(''),
});
export const interviewPlanSaveSchema = z.strictObject({
  expectedRevision: z.number().int().positive(),
  steps: z.array(interviewPlanInputSchema).max(10),
});

// Validate the saved ordered plan at publication, including legacy/corrupt rows.
// Empty plans are valid; names need not be unique and assignees belong to bookings.
export const storedInterviewPlanSchema = z.array(interviewPlanInputSchema.extend({
  position: z.number().int().min(0).max(9),
})).max(10).superRefine((entries, context) => {
  entries.forEach((entry, index) => {
    if (entry.position !== index) context.addIssue({ code: 'custom', path: [index, 'position'], message: 'Interview positions must be consecutive from zero.' });
  });
});
