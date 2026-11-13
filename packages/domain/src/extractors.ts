import { z } from 'zod';
import { cvExtractorArgsSchema, cvFieldDescriptors, cvFieldProjection, parseCvFieldValue, type CvExtractorArgs } from './cv-extractor.js';

// File-field capability registry. Only CV extraction exists today. Keep source
// eligibility and the field descriptor factory here, not in generic form/review
// components. This is not a user-defined workflow or provider-prompt mechanism.
export const extractorRegistry = {
  cvExtractor: {
    sourceType: 'document', label: 'CV extractor', argsSchema: cvExtractorArgsSchema, fields: cvFieldDescriptors, project: cvFieldProjection,
    fieldIds: (args:CvExtractorArgs) => args.questions.map(q=>q.id),
    parseCorrection(args:CvExtractorArgs, questionId:string, value:unknown) {
      const question=args.questions.find(q=>q.id===questionId);
      if(!question)throw new Error('Unknown extraction field.');
      return parseCvFieldValue(question,value);
    },
  },
} as const;

const platformKey = z.string().regex(/^[a-z][a-z0-9_\-]{0,63}$/).refine(value => !['constructor', 'prototype', '__proto__'].includes(value), 'Reserved key');
export const cvExtractorTaskSchema = z.strictObject({
  id: platformKey, sourceInputId: platformKey, outputKey: platformKey,
  type: z.literal('cvExtractor'), args: extractorRegistry.cvExtractor.argsSchema,
});
export const extractorProcessingDefinitionSchema = z.strictObject({
  version: z.literal(2), tasks: z.array(cvExtractorTaskSchema).max(100),
}).superRefine((definition, ctx) => {
  for (const key of ['id', 'sourceInputId', 'outputKey'] as const) {
    if (new Set(definition.tasks.map(task => task[key])).size !== definition.tasks.length) ctx.addIssue({ code: 'custom', message: `Duplicate extractor ${key}.` });
  }
});
export type CvExtractorTask = z.infer<typeof cvExtractorTaskSchema>;
export type ExtractorProcessingDefinition = z.infer<typeof extractorProcessingDefinitionSchema>;

export function validateExtractorSources(definition: ExtractorProcessingDefinition, inputs: readonly { id: string; type: string; name?: string }[]) {
  const parsed = extractorProcessingDefinitionSchema.parse(definition);
  for (const task of parsed.tasks) {
    if (!inputs.some(input => input.id === task.sourceInputId && input.type === extractorRegistry[task.type].sourceType)) throw new Error('Extractor source must be a document field.');
    if (inputs.some(input => input.name === task.outputKey)) throw new Error('Extractor output collides with an answer name.');
  }
  return parsed;
}
