import { test } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';
import { validateSubmission, uploadLimits } from './applications.js';
import { formDefinitionSchema } from './vacancies.js';

const form = formDefinitionSchema.parse({ version: 1, inputs: [
  { id: 'full_name', name: 'display_name', label: 'Name', required: true, type: 'text', args: { maxLength: 20 } },
  { id: 'years', name: 'years', label: 'Years', required: true, type: 'number', args: { min: 0, max: 10, step: 0.5 } },
  { id: 'available', name: 'available', label: 'Available', required: true, type: 'yes_no', args: {} },
  { id: 'skills', name: 'skills', label: 'Skills', required: true, type: 'multiple_choice', args: { choices: [{ value: 'sql', label: 'SQL' }] } },
  { id: 'cv', name: 'cv', label: 'CV', required: true, type: 'document', args: {} },
] });
const answers = { full_name: 'Candidate', years: 0, available: false, skills: ['sql'] };
const files = [{ inputId: 'cv', filename: 'no-extension', byteCount: 5 }];
test('answers use input IDs, preserve false/zero, and remain distinct from documents', () => {
  const result = validateSubmission(form, answers, files);
  deepEqual(result.issues, []); deepEqual(result.answers, answers);
});
test('missing, unknown, blank, incorrectly typed, out-of-range and duplicate choices fail', () => {
  for (const changed of [{ full_name: ' ' }, { full_name: 'a'.repeat(21) }, { years: '0' }, { years: 0.3 }, { years: 11 }, { available: 'false' }, { skills: [] }, { skills: ['sql', 'sql'] }, { cv: 'injected' }, { unexpected: true }]) {
    equal(validateSubmission(form, { ...answers, ...changed }, files).issues.length > 0, true);
  }
  equal(validateSubmission(form, {}, []).issues.length, 5);
  for (const raw of [null, [], 'json']) equal(validateSubmission(form, raw, files).issues.length > 0, true);
});
test('optional document constraints and operational caps are independent', () => {
  const restricted = structuredClone(form);
  const cv = restricted.inputs.find(input => input.type === 'document');
  if (!cv || cv.type !== 'document') throw new Error('Missing fixture input');
  cv.args = { accept: ['.pdf'], limit: { kind: 'MAX_BYTES', bytes: 4 } };
  equal(validateSubmission(restricted, answers, files).issues.length, 2);
  equal(validateSubmission(form, answers, [{ ...files[0], byteCount: uploadLimits.fileBytes + 1 }]).issues.length, 1);
  equal(validateSubmission(form, answers, [files[0], files[0]]).issues.length, 1);
  equal(validateSubmission(form, answers, [{ ...files[0], inputId: 'full_name' }]).issues.length, 2);
});
