import { z } from 'zod';

// Port of the transferred simple-tasks.schema.json/request.json.j2. Do not
// normalize names, aliases or IDs: accepted evidence terms can be directional.
const unique = <T>(items: T[]) => new Set(items.map(item => JSON.stringify(item))).size === items.length;
const questionId = z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/);
export const cvNamedValueSchema = z.union([
  z.string().min(1),
  z.strictObject({ name: z.string().min(1), aliases: z.array(z.string().min(1)).refine(unique, 'Duplicate alias.').optional() }),
]);
const scope = z.union([z.string(), z.array(z.string().min(1)).min(1).refine(unique, 'Duplicate scope.')]);
export const cvQuestionSchema = z.discriminatedUnion('type', [
  z.strictObject({ id: questionId, type: z.literal('education_level'), scope: scope.optional(), expected_within_months: z.number().int().nonnegative().optional() }),
  z.strictObject({ id: questionId, type: z.literal('certification'), certification: cvNamedValueSchema }),
  z.strictObject({ id: questionId, type: z.literal('experience_years'), scope: scope.optional() }),
  z.strictObject({ id: questionId, type: z.literal('skill_coverage'), skills: z.array(cvNamedValueSchema).min(1).max(254).refine(unique, 'Duplicate coverage item.') }),
  z.strictObject({ id: questionId, type: z.literal('skill_evidence'), skill: cvNamedValueSchema }),
]);
export const cvExtractorArgsSchema = z.strictObject({
  questions: z.array(cvQuestionSchema).min(1).refine(questions => new Set(questions.map(q => q.id)).size === questions.length, 'Question IDs must be unique.'),
});
export const cvReferenceDateSchema = z.iso.date();
export const cvTaskConfigurationSchema = cvExtractorArgsSchema.extend({ reference_date: cvReferenceDateSchema.optional() });
export type CvNamedValue = z.infer<typeof cvNamedValueSchema>;
export type CvQuestion = z.infer<typeof cvQuestionSchema>;
export type CvExtractorArgs = z.infer<typeof cvExtractorArgsSchema>;
export type CvQuestionType = CvQuestion['type'];
export const cvFamilyLabels: Record<CvQuestionType, string> = { education_level: 'Education level', certification: 'Certification', experience_years: 'Work experience', skill_coverage: 'Skill coverage count', skill_evidence: 'Skill evidence' };
export function cvQuestionLabel(q:CvQuestion):string {
  const label=(value:CvNamedValue)=>typeof value==='string'?value:value.name;
  if(q.type==='certification')return `Certification · ${label(q.certification)}`;
  if(q.type==='skill_evidence')return `Skill evidence · ${label(q.skill)}`;
  if(q.type==='skill_coverage')return `Skill coverage · ${q.skills.length} items`;
  const scope=q.scope?(Array.isArray(q.scope)?q.scope.join(' OR '):q.scope):'';
  return `${cvFamilyLabels[q.type]}${scope?` · ${scope}`:''}${q.type==='education_level'?(q.expected_within_months?` · within ${q.expected_within_months} months of publication`:' · completed only'):''}`;
}
export function cvValueLabel(question: CvQuestion, value: CvFieldValue | null): string {
  if (value === null) return 'Unavailable';
  if (question.type === 'certification') return value ? 'Present' : 'Not mentioned';
  const labels: Record<string,string> = { secondary_or_lower:'Secondary or lower',vocational_technical:'Vocational / technical',short_cycle_higher:'Short-cycle higher education',bachelors:"Bachelor’s level",masters:"Master’s level",doctorate:'Doctorate',not_stated:'Not stated',under_1:'Under 1 year (including no evidenced duration)','1_to_under_3':'1 to under 3 years','3_to_under_5':'3 to under 5 years','5_to_under_8':'5 to under 8 years','8_plus':'8+ years',not_mentioned:'Not mentioned',stated_or_studied:'Stated or studied',applied:'Applied (nonprofessional)',used_professionally:'Used professionally' };
  return labels[String(value)] ?? String(value);
}
export interface CvChoiceQuestion { type: 'choice'; instructions: string; criteria: Record<string, string> }
export interface CvRequest { model: string; state: { cv: string; reference_date: string }; questions: Record<string, CvChoiceQuestion> }

export const educationLevels = ['secondary_or_lower', 'vocational_technical', 'short_cycle_higher', 'bachelors', 'masters', 'doctorate', 'not_stated'] as const;
export const experienceBins = ['under_1', '1_to_under_3', '3_to_under_5', '5_to_under_8', '8_plus'] as const;
export const skillEvidenceLevels = ['not_mentioned', 'stated_or_studied', 'applied', 'used_professionally'] as const;
const named = (value: CvNamedValue) => typeof value === 'string' ? value : `${value.name}${value.aliases?.length ? ` (also accept: ${value.aliases.join('; ')})` : ''}`;
const scoped = (value: string | string[] | undefined) => value && (typeof value === 'string' ? value : value.join(' OR '));
const choice = (instructions: string, criteria: Record<string, string>): CvChoiceQuestion => ({ type: 'choice', instructions, criteria });

type Family<K extends CvQuestionType> = {
  build(question: Extract<CvQuestion, { type: K }>, date: string): CvChoiceQuestion;
  valueSchema(question: Extract<CvQuestion, { type: K }>): z.ZodType;
  normalize(answer: string): unknown;
};

// One code-owned family entry owns wording, choices and field conversion. New
// families do not add execution branches/jobs or user-supplied provider prompts.
const families = {
  education_level: {
    build: (q, date) => choice(`As of ${date}, what is the highest education level completed${q.expected_within_months ? ` or explicitly expected to be completed within ${q.expected_within_months} months after that date` : ''}${scoped(q.scope) ? ` in ${scoped(q.scope)}` : ''}? Use evidence in the CV, not an assumption that ongoing study is completed.`, {
      secondary_or_lower: 'Secondary school or lower.',
      vocational_technical: 'Vocational or technical qualification below higher education.',
      short_cycle_higher: 'Short-cycle higher education, below a bachelor degree.',
      bachelors: 'Bachelor degree or equivalent.',
      masters: 'Master degree or equivalent.',
      doctorate: 'Doctorate or equivalent.',
      not_stated: 'No qualifying education stated within the requested scope/time window.',
    }),
    valueSchema: () => z.enum(educationLevels),
    normalize: (answer: string) => z.enum(educationLevels).parse(answer),
  },
  certification: {
    build: q => choice(`Does the CV state that ${named(q.certification)} is held or completed? Related work, preparation and planned study do not count.`, {
      present: 'Stated as held or completed.', not_mentioned: 'Not evidenced as held or completed.',
    }),
    valueSchema: () => z.boolean(),
    normalize: (answer: string) => z.enum(['present', 'not_mentioned']).parse(answer) === 'present',
  },
  experience_years: {
    build: (q, date) => choice(`As of ${date}, how much documented work experience does the CV show${scoped(q.scope) ? ` in ${scoped(q.scope)}` : ''}? Count overlapping periods once. Use elapsed time, not a count of calendar years. Do not assume a listed skill was used throughout an entire role.`, {
      under_1: 'Under 1 year, including no evidenced duration.',
      '1_to_under_3': '1 to under 3 years.',
      '3_to_under_5': '3 to under 5 years.',
      '5_to_under_8': '5 to under 8 years.',
      '8_plus': '8 or more years.',
    }),
    valueSchema: () => z.enum(experienceBins),
    normalize: (answer: string) => z.enum(experienceBins).parse(answer),
  },
  skill_coverage: {
    build: q => choice(`How many of these supplied items are mentioned or unambiguously described in the CV: ${q.skills.map(named).join('; ')}? Count each item once. A generic category or related activity does not establish a specific product or skill. This is document coverage, not proficiency.`, Object.fromEntries(Array.from({ length: q.skills.length + 1 }, (_, count) => [String(count), `Exactly ${count} supplied items are evidenced.`]))),
    valueSchema: q => z.number().int().min(0).max(q.skills.length),
    normalize: (answer: string) => Number(z.string().regex(/^(0|[1-9][0-9]*)$/).parse(answer)),
  },
  skill_evidence: {
    build: q => choice(`What is the strongest explicit evidence for ${named(q.skill)} in the CV? Classify evidence context, not proficiency. A list-only mention is not a concrete application; do not infer professional use from nearby employment history.`, {
      not_mentioned: 'No identifiable reference.',
      stated_or_studied: 'Listed, claimed or studied, without a concrete application example.',
      applied: 'Applied in a personal/coursework project, practical training, volunteering or other nonprofessional activity.',
      used_professionally: 'Explicitly applied in professional work.',
    }),
    valueSchema: () => z.enum(skillEvidenceLevels),
    normalize: (answer: string) => z.enum(skillEvidenceLevels).parse(answer),
  },
} satisfies { [K in CvQuestionType]: Family<K> };

// The discriminant selects the matching implementation. This single cast keeps
// family-specific arguments typed at registration rather than spreading casts
// across the preview/result/review/export callers.
function family(q: CvQuestion): Family<CvQuestionType> { return families[q.type] as Family<CvQuestionType>; }
export function buildCvQuestion(question: CvQuestion, referenceDate: string): CvChoiceQuestion {
  const q = cvQuestionSchema.parse(question);
  return family(q).build(q, cvReferenceDateSchema.parse(referenceDate));
}
export function buildCvRequest(args: CvExtractorArgs, markdown: string, referenceDate: string, model: string): CvRequest {
  const config = cvExtractorArgsSchema.parse(args), date = cvReferenceDateSchema.parse(referenceDate);
  if (!markdown.trim()) throw new Error('CV Markdown is empty.');
  if (!model.trim()) throw new Error('A resolved provider model is required.');
  return { model, state: { cv: markdown, reference_date: date }, questions: Object.fromEntries(config.questions.map(q => [q.id, family(q).build(q, date)])) };
}

export type CvFieldValue = typeof educationLevels[number] | typeof experienceBins[number] |
  typeof skillEvidenceLevels[number] | boolean | number;

export function parseCvFieldValue(question: CvQuestion, value: unknown): CvFieldValue | null {
  const q = cvQuestionSchema.parse(question);
  return family(q).valueSchema(q).nullable().parse(value) as CvFieldValue | null;
}
export function normalizeCvChoice(question: CvQuestion, answer: string): CvFieldValue {
  const q = cvQuestionSchema.parse(question);
  // Family normalizers accept only configured category keys/canonical count
  // strings. Then validate the family value/count bound, without a made-up date.
  return parseCvFieldValue(q, family(q).normalize(answer))!;
}

export interface CvFieldCorrection { questionId: string; value: CvFieldValue | null; remove?: boolean }
export function parseCvCorrections(args: CvExtractorArgs, raw: unknown): CvFieldCorrection[] {
  const config = cvExtractorArgsSchema.parse(args);
  const corrections = z.array(z.strictObject({ questionId, value: z.unknown(), remove: z.boolean().optional() })).parse(raw);
  if (new Set(corrections.map(c => c.questionId)).size !== corrections.length) throw new Error('Duplicate correction question.');
  return corrections.map(c => {
    const q = config.questions.find(q => q.id === c.questionId);
    if (!q) throw new Error('Unknown correction question.');
    if (!Object.hasOwn(c, 'value')) throw new Error('Correction value is required.');
    if (c.remove && c.value !== null) throw new Error('Removal requires a null value.');
    return { ...c, value: parseCvFieldValue(q, c.value) };
  });
}

export function cvFieldDescriptors(args: CvExtractorArgs, outputKey: string, referenceDate: string) {
  return cvExtractorArgsSchema.parse(args).questions.map(q => ({
    questionId: q.id, type: q.type, columnKey: `${outputKey}.question.${q.id}`,
    question: buildCvQuestion(q, referenceDate),
    // Retain the complete configuration/window so a qualifying expected degree
    // is never relabelled as awarded. Display labels are not field identities.
    configuration: q,
  }));
}

export function effectiveCvField(question: CvQuestion, original: CvFieldValue | null, correction: { value: CvFieldValue | null } | undefined) {
  return parseCvFieldValue(question, correction === undefined ? original : correction.value);
}

export function cvFieldProjection(args: CvExtractorArgs, outputKey: string, referenceDate: string,
  original: Record<string, CvFieldValue> | null,
  corrections: readonly { questionId: string; value: CvFieldValue | null }[]) {
  // Reuse correction validation to reject unknown/duplicate IDs atomically.
  const overrides = parseCvCorrections(args, corrections);
  return cvFieldDescriptors(args, outputKey, referenceDate).map(field => {
    const correction = overrides.find(c => c.questionId === field.questionId);
    if (original !== null && !Object.hasOwn(original, field.questionId)) throw new Error('Incomplete machine fields.');
    const value = original === null ? null : parseCvFieldValue(field.configuration, original[field.questionId]);
    return { ...field, original: value, effective: effectiveCvField(field.configuration, value, correction),
      hasCorrection: correction !== undefined, source: correction !== undefined ? 'hr' as const : original === null ? 'unavailable' as const : 'machine' as const };
  });
}
