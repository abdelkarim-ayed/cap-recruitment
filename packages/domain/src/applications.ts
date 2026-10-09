import type { FormDefinition } from './vacancies.js';

export const uploadLimits = { fileBytes: 10 * 1024 * 1024, submissionBytes: 25 * 1024 * 1024, answersBytes: 256 * 1024, files: 100 } as const;
export type CandidateAnswer = string | number | boolean | string[];
export interface SubmissionFile { inputId: string; filename: string; byteCount: number }
export interface SubmissionIssue { path: string; message: string }

// Pure intake validation; file bytes/storage/protocols are backend concerns.
export function validateSubmission(form: FormDefinition, rawAnswers: unknown, files: readonly SubmissionFile[]) {
  const issues: SubmissionIssue[] = [];
  const answers: Record<string, CandidateAnswer> = {};
  const issue = (path: string, message: string) => issues.push({ path, message });
  if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
    return { answers, issues: [{ path: 'answers', message: 'Answers must be a JSON object.' }] };
  }
  const raw = rawAnswers as Record<string, unknown>;
  const inputs = new Map(form.inputs.map(input => [input.id, input]));
  const fileInputs = new Set<string>();
  let totalBytes = 0;
  for (const file of files) {
    const path = `files.${file.inputId}`;
    const input = inputs.get(file.inputId);
    if (!input || input.type !== 'document') { issue(path, 'File field must reference a document input.'); continue; }
    if (fileInputs.has(file.inputId)) issue(path, 'Only one file is allowed per document input.');
    fileInputs.add(file.inputId);
    totalBytes += file.byteCount;
    if (!Number.isSafeInteger(file.byteCount) || file.byteCount <= 0) issue(path, 'File must not be empty.');
    if (file.byteCount > uploadLimits.fileBytes) issue(path, 'File exceeds the operational 10 MiB limit.');
    if (input.args.limit?.kind === 'MAX_BYTES' && file.byteCount > input.args.limit.bytes) issue(path, 'File exceeds this input\'s configured size limit.');
    const extension = /\.[^.]+$/.exec(file.filename)?.[0].toLowerCase();
    if (input.args.accept && (!extension || !input.args.accept.includes(extension))) issue(path, 'File extension is not allowed by this input.');
  }
  if (totalBytes > uploadLimits.submissionBytes) issue('files', 'Files exceed the 25 MiB submission limit.');
  if (files.length > uploadLimits.files) issue('files', 'Too many files.');
  for (const name of Object.keys(raw)) {
    const input = inputs.get(name), value = raw[name], path = `answers.${name}`;
    if (!input || input.type === 'document' || input.type === 'separator') { issue(path, 'Answer key must reference an answer input id.'); continue; }
    switch (input.type) {
      case 'text': case 'long_text':
        if (typeof value !== 'string' || value.length > (input.args.maxLength ?? 10000) || (input.required && !value.trim())) issue(path, 'Expected text within the configured limit; required text must not be blank.');
        else answers[name] = value;
        break;
      case 'number': {
        if (typeof value !== 'number' || !Number.isFinite(value) || (input.args.min !== undefined && value < input.args.min) || (input.args.max !== undefined && value > input.args.max)) { issue(path, 'Expected a finite number within the configured range.'); break; }
        if (input.args.step !== undefined) {
          const steps = (value - (input.args.min ?? 0)) / input.args.step;
          if (!Number.isFinite(steps) || Math.abs(steps - Math.round(steps)) > 1e-8) { issue(path, 'Number does not match the configured step.'); break; }
        }
        answers[name] = value; break;
      }
      case 'yes_no':
        if (typeof value !== 'boolean') issue(path, 'Expected a boolean, not a string.'); else answers[name] = value;
        break;
      case 'single_choice':
        if (typeof value !== 'string' || !input.args.choices.some(choice => choice.value === value)) issue(path, 'Expected a configured choice value.'); else answers[name] = value;
        break;
      case 'multiple_choice':
        if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !input.args.choices.some(choice => choice.value === item)) || new Set(value).size !== value.length || (input.required && !value.length)) issue(path, 'Expected distinct configured choice values; required selection cannot be empty.');
        else answers[name] = [...value];
        break;
    }
  }
  for (const input of form.inputs) {
    if (input.type === 'separator' || !input.required) continue;
    if (input.type === 'document' ? !fileInputs.has(input.id) : !Object.hasOwn(raw, input.id)) issue(input.type === 'document' ? `files.${input.id}` : `answers.${input.id}`, 'Required input is missing.');
  }
  return { answers, issues };
}
