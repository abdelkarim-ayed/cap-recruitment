import { test } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';
import { interviewPlanSaveSchema, storedInterviewPlanSchema } from './interview-plans.js';
import { publishVacancySchema, vacancyActionSchema } from './vacancies.js';

test('empty plans are valid and authored content normalizes without assignees', () => {
  equal(storedInterviewPlanSchema.safeParse([]).success, true);
  deepEqual(interviewPlanSaveSchema.parse({ expectedRevision: 1, steps: [{ name: ' Technical ' }] }).steps, [{ name: 'Technical', instructions: '' }]);
  equal(interviewPlanSaveSchema.safeParse({ expectedRevision: 1, steps: [{ name: 'Technical', interviewerId: 'staff' }] }).success, false);
});
test('publication requires both counters but close keeps its existing request shape', () => {
  equal(publishVacancySchema.safeParse({ expectedRevision: 1 }).success, false);
  equal(publishVacancySchema.safeParse({ expectedRevision: 1, expectedInterviewRevision: 2 }).success, true);
  equal(publishVacancySchema.safeParse({ expectedRevision: 1, expectedInterviewRevision: 0 }).success, false);
  equal(vacancyActionSchema.safeParse({ expectedRevision: 1 }).success, true);
});
test('stored plans reject invalid content, gaps and oversized lists', () => {
  for (const entries of [[{ position: 0, name: ' ', instructions: '' }], [{ position: 1, name: 'Technical', instructions: '' }], [{ position: 0, name: 'Technical', instructions: 'x'.repeat(4001) }], Array.from({ length: 11 }, (_, position) => ({ position, name: 'Interview', instructions: '' }))]) {
    equal(storedInterviewPlanSchema.safeParse(entries).success, false);
  }
});
test('duplicate names remain valid; ordered positions, not names, identify plan entries', () => {
  equal(storedInterviewPlanSchema.safeParse([0, 1].map(position => ({ position, name: 'Discussion', instructions: '' }))).success, true);
});
