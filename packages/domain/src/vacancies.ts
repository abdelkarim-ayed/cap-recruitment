import { z } from 'zod';

const key = z.string().regex(/^[a-z][a-z0-9_\-]{0,63}$/).refine(value => !['constructor', 'prototype', '__proto__'].includes(value), 'Reserved key');
const label = z.string().trim().min(1).max(200);
const base = { id: key, name: key, label, required: z.boolean() };
const choices = z.array(z.strictObject({ value: key, label })).min(1).max(100).superRefine((values, ctx) => {
  if (new Set(values.map(value => value.value)).size !== values.length) ctx.addIssue({ code: 'custom', message: 'Choice values must be unique.' });
});
const numberArgs = z.strictObject({ min: z.number().finite().optional(), max: z.number().finite().optional(), step: z.number().positive().optional() }).refine(value => value.min === undefined || value.max === undefined || value.min <= value.max, 'min must not exceed max');
const textArgs = z.strictObject({ maxLength: z.number().int().min(1).max(10000).optional() });
export const documentLimitSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('NO_LIMIT') }),
  z.strictObject({ kind: z.literal('MAX_BYTES'), bytes: z.number().int().positive().max(Number.MAX_SAFE_INTEGER) }),
]);
export const vacancyInputSchema = z.discriminatedUnion('type', [
  z.strictObject({ ...base, type: z.literal('text'), args: textArgs }),
  z.strictObject({ ...base, type: z.literal('long_text'), args: textArgs }),
  z.strictObject({ ...base, type: z.literal('number'), args: numberArgs }),
  z.strictObject({ ...base, type: z.literal('yes_no'), args: z.strictObject({}) }),
  z.strictObject({ ...base, type: z.literal('single_choice'), args: z.strictObject({ choices }) }),
  z.strictObject({ ...base, type: z.literal('multiple_choice'), args: z.strictObject({ choices }) }),
  z.strictObject({ ...base, type: z.literal('document'), args: z.strictObject({ accept: z.array(z.string().regex(/^\.[a-z0-9]{1,16}$/)).min(1).max(32).refine(value => new Set(value).size === value.length, 'Duplicate file extension').optional(), limit: documentLimitSchema.optional() }) }),
  z.strictObject({ id: key, type: z.literal('separator'), label, args: z.strictObject({}) }),
]);
export const formDefinitionSchema = z.strictObject({ version: z.literal(1), inputs: z.array(vacancyInputSchema).max(100) });
export const processingDefinitionSchema = z.strictObject({ version: z.literal(1), tasks: z.array(z.strictObject({
  id: key, sourceInputId: key, outputKey: key, type: z.literal('extractSkills'),
  args: z.strictObject({ skills: z.array(z.string().trim().min(1).max(100)).min(1).max(100).refine(value => new Set(value.map(skill => skill.toLowerCase())).size === value.length, 'Skills must be unique'), evidence: z.boolean() }),
})).max(100) });

const definitionFields = { formDefinition: formDefinitionSchema, processingDefinition: processingDefinitionSchema };
export const vacancyDefinitionsSchema = z.strictObject(definitionFields).superRefine((value, ctx) => {
  const ids = new Set<string>(), names = new Set<string>(), taskIds = new Set<string>(), outputs = new Set<string>();
  value.formDefinition.inputs.forEach((input, index) => {
    if (ids.has(input.id)) ctx.addIssue({ code: 'custom', path: ['formDefinition', 'inputs', index, 'id'], message: 'Duplicate input id.' });
    ids.add(input.id);
    if (input.type !== 'separator') {
      if (names.has(input.name)) ctx.addIssue({ code: 'custom', path: ['formDefinition', 'inputs', index, 'name'], message: 'Duplicate answer name.' });
      names.add(input.name);
    }
  });
  value.processingDefinition.tasks.forEach((task, index) => {
    const path = ['processingDefinition', 'tasks', index];
    if (taskIds.has(task.id)) ctx.addIssue({ code: 'custom', path: [...path, 'id'], message: 'Duplicate task id.' });
    taskIds.add(task.id);
    if (outputs.has(task.outputKey) || names.has(task.outputKey)) ctx.addIssue({ code: 'custom', path: [...path, 'outputKey'], message: 'Output key collides with an answer or task output.' });
    outputs.add(task.outputKey);
    if (!value.formDefinition.inputs.some(input => input.id === task.sourceInputId && input.type === 'document')) ctx.addIssue({ code: 'custom', path: [...path, 'sourceInputId'], message: 'Task source must be a document input.' });
  });
});
export const createVacancySchema = z.strictObject({ title: z.string().trim().min(1).max(200), description: z.string().trim().min(1).max(20000), location: z.string().trim().min(1).max(200).optional(), ...definitionFields }).superRefine((value, ctx) => {
  const result = vacancyDefinitionsSchema.safeParse({ formDefinition: value.formDefinition, processingDefinition: value.processingDefinition });
  if (!result.success) for (const issue of result.error.issues) ctx.addIssue({ code: 'custom', path: [...issue.path], message: issue.message });
});
export const patchVacancySchema = z.strictObject({
  expectedRevision: z.number().int().positive().max(2147483647),
  title: z.string().trim().min(1).max(200).optional(), description: z.string().trim().min(1).max(20000).optional(), location: z.string().trim().min(1).max(200).optional(),
  formDefinition: formDefinitionSchema.optional(), processingDefinition: processingDefinitionSchema.optional(),
}).superRefine((value, ctx) => {
  if (Object.keys(value).length < 2) ctx.addIssue({ code: 'custom', message: 'Supply at least one editable field.' });
  if ((value.formDefinition === undefined) !== (value.processingDefinition === undefined)) ctx.addIssue({ code: 'custom', message: 'Replace both definitions together.' });
  if (value.formDefinition && value.processingDefinition) {
    const result = vacancyDefinitionsSchema.safeParse({ formDefinition: value.formDefinition, processingDefinition: value.processingDefinition });
    if (!result.success) for (const issue of result.error.issues) ctx.addIssue({ code: 'custom', path: [...issue.path], message: issue.message });
  }
});
export const vacancyActionSchema = z.strictObject({ expectedRevision: z.number().int().positive().max(2147483647) });
export const vacancyListSchema = z.strictObject({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional().default(20),
  offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0).max(2147483647)).optional().default(0),
});
export type FormDefinition = z.infer<typeof formDefinitionSchema>;
export type ProcessingDefinition = z.infer<typeof processingDefinitionSchema>;
export type CreateVacancy = z.infer<typeof createVacancySchema>;
export type PatchVacancy = z.infer<typeof patchVacancySchema>;
export interface Vacancy extends CreateVacancy { id: string; ownerId: string; status: 'draft' | 'published' | 'closed'; revision: number; createdAt: string; updatedAt: string }

export function publicVacancy(vacancy: Vacancy) {
  return { id: vacancy.id, title: vacancy.title, description: vacancy.description, ...(vacancy.location === undefined ? {} : { location: vacancy.location }), form: formDefinitionSchema.parse(vacancy.formDefinition) };
}
