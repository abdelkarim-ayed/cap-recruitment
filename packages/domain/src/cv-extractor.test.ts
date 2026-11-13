import { test } from 'node:test';
import { deepEqual, equal, throws } from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildCvQuestion, buildCvRequest, cvExtractorArgsSchema, cvFieldDescriptors, cvFieldProjection, cvQuestionSchema,
  cvTaskConfigurationSchema, effectiveCvField, normalizeCvChoice, parseCvCorrections,
  type CvExtractorArgs, type CvQuestion,
} from './cv-extractor.js';
import { extractorProcessingDefinitionSchema, validateExtractorSources } from './extractors.js';

const examples = new URL('../../../research/cv-extraction-lab/snapshot/parser-evaluation/cvextract/examples/review/', import.meta.url);
const date = '2026-11-12';
function json(name: string) { return JSON.parse(readFileSync(new URL(name, examples), 'utf8')); }

for (const name of ['01-education-experience', '02-certifications', '03-skills']) {
  test(`exact transferred Jinja contract: ${name} (offline wording only)`, () => {
    const config = cvTaskConfigurationSchema.parse(json(`${name}.tasks.json`));
    const expected = json(`${name}.request.json`);
    const request = buildCvRequest({ questions: config.questions }, '$cv', config.reference_date!, expected.model);
    // Compact serialization checks object/criteria order as well as wording.
    equal(JSON.stringify(request), JSON.stringify(expected));
    const markdown = '# Synthetic CV\n"quoted" \\ text\nPraca 日本語';
    const hydrated = buildCvRequest({ questions: config.questions }, markdown, config.reference_date!, expected.model);
    equal(JSON.parse(JSON.stringify(hydrated)).state.cv, markdown);
    deepEqual(hydrated.questions, expected.questions);
  });
}

test('optional clauses are absent, zero window is completed-only, OR scopes retain ordering', () => {
  const plain: CvQuestion = { id: 'Education', type: 'education_level' };
  equal(buildCvQuestion(plain, date).instructions, buildCvQuestion({ ...plain, scope: '', expected_within_months: 0 }, date).instructions);
  equal(buildCvQuestion(plain, date).instructions.includes('expected'), false);
  const scoped = buildCvQuestion({ ...plain, scope: ['Physics', 'Chemistry'], expected_within_months: 6 }, date);
  equal(scoped.instructions.includes('Physics OR Chemistry'), true);
  equal(scoped.instructions.includes('within 6 months after that date'), true);
  throws(() => buildCvQuestion(plain, '2026-02-30'));
});

test('names/accepted terms retain exact spelling and direction; repeated families/IDs retain order', () => {
  const config: CvExtractorArgs = { questions: [
    { id: 'SQL', type: 'skill_evidence', skill: { name: 'SQL', aliases: ['T-SQL', 'Transact-SQL'] } },
    { id: 'sql', type: 'skill_evidence', skill: 'T-SQL' },
    { id: 'constructor', type: 'skill_evidence', skill: { name: 'Excel', aliases: [] } },
  ] };
  const request = buildCvRequest(config, 'synthetic', date, 'jev-1.14.0');
  deepEqual(Object.keys(request.questions), ['SQL', 'sql', 'constructor']);
  equal(request.questions.SQL.instructions.includes('(also accept: T-SQL; Transact-SQL)'), true);
  equal(request.questions.sql.instructions.includes('(also accept:'), false);
  equal(request.questions.constructor.instructions.includes('Excel'), true);
  throws(() => cvExtractorArgsSchema.parse({ questions: [config.questions[0], config.questions[0]] }));
  deepEqual(Object.keys(JSON.parse(JSON.stringify(request)).questions), ['SQL', 'sql', 'constructor']);
});

test('schema mirrors flat transferred arguments; no generic args/prompts, validity or award-status extensions', () => {
  for (const q of [
    { id: 'x', type: 'certification', certification: 'AWS', validity: true },
    { id: 'x', type: 'education_level', awarded: true },
    { id: 'x', type: 'education_level', expected_within_months: -1 },
    { id: 'x', type: 'skill_evidence', args: { skill: 'SQL' } },
    { id: 'x', type: 'skill_evidence', skill: { name: 'SQL', aliases: ['T-SQL', 'T-SQL'] } },
    { id: 'x', type: 'experience_years', scope: ['IT', 'IT'] },
    { id: 'x', type: 'skill_coverage', skills: ['SQL', 'SQL'] },
    { id: '_x', type: 'education_level' },
  ]) equal(cvQuestionSchema.safeParse(q).success, false);
  throws(() => buildCvRequest({ questions: [] }, 'text', date, 'jev-1.14.0'));
  throws(() => buildCvRequest({ questions: [{ id: 'x', type: 'education_level' }] }, '  ', date, 'jev-1.14.0'));
});

test('coverage supports the transferred maximum of 254 items/255 ordered choices without subdivision', () => {
  const q: CvQuestion = { id: 'Coverage', type: 'skill_coverage', skills: Array.from({ length: 254 }, (_, n) => `Skill ${n}`) };
  const request = buildCvRequest({ questions: [q] }, 'text', date, 'jev-1.14.0');
  equal(Object.keys(request.questions).length, 1);
  deepEqual(Object.keys(request.questions.Coverage.criteria), Array.from({ length: 255 }, (_, n) => String(n)));
  equal(normalizeCvChoice(q, '254'), 254);
  throws(() => normalizeCvChoice(q, '0254'));
  throws(() => cvQuestionSchema.parse({ ...q, skills: [...q.skills, 'extra'] }));
});

test('family values are typed and unavailable stays separate from zero/non-mention', () => {
  equal(normalizeCvChoice({ id: 'cert', type: 'certification', certification: 'AWS' }, 'not_mentioned'), false);
  equal(normalizeCvChoice({ id: 'count', type: 'skill_coverage', skills: ['SQL'] }, '0'), 0);
  equal(normalizeCvChoice({ id: 'edu', type: 'education_level' }, 'not_stated'), 'not_stated');
  equal(normalizeCvChoice({ id: 'exp', type: 'experience_years' }, 'under_1'), 'under_1');
  throws(() => normalizeCvChoice({ id: 'cert', type: 'certification', certification: 'AWS' }, 'false'));
});

test('field corrections distinguish absent, null, removal and false; validate all sibling values', () => {
  const q: CvQuestion = { id: 'Credential', type: 'certification', certification: 'AWS' };
  const args: CvExtractorArgs = { questions: [q, { id: 'Count', type: 'skill_coverage', skills: ['SQL'] }] };
  equal(effectiveCvField(q, false, undefined), false);
  equal(effectiveCvField(q, false, { value: null }), null);
  equal(effectiveCvField(q, false, { value: true }), true);
  deepEqual(parseCvCorrections(args, [{ questionId: 'Credential', value: null }]), [{ questionId: 'Credential', value: null }]);
  deepEqual(parseCvCorrections(args, [{ questionId: 'Credential', value: null, remove: true }]), [{ questionId: 'Credential', value: null, remove: true }]);
  for (const raw of [
    [{ questionId: 'Credential' }],
    [{ questionId: 'Credential', value: 'present' }],
    [{ questionId: 'Credential', value: false, remove: true }],
    [{ questionId: 'missing', value: null }],
    [{ questionId: 'Count', value: 2 }],
    [{ questionId: 'Count', value: 0 }, { questionId: 'Count', value: 1 }],
    [{ questionId: 'Credential', value: true }, { questionId: 'Count', value: '0' }],
  ]) throws(() => parseCvCorrections(args, raw));
});

test('shared review/export descriptors preserve IDs, order, exact preview and expected-education context', () => {
  const args: CvExtractorArgs = { questions: [
    { id: 'Master', type: 'education_level', expected_within_months: 6 },
    { id: 'Other', type: 'education_level' },
  ] };
  const fields = cvFieldDescriptors(args, 'cv_data', date);
  deepEqual(fields.map(f => f.columnKey), ['cv_data.question.Master', 'cv_data.question.Other']);
  deepEqual(fields[0].configuration, args.questions[0]);
  deepEqual(fields[0].question, buildCvQuestion(args.questions[0], date));
});

test('one extractor task per document field; source/namespace validation is outside question semantics', () => {
  const task = { id: 'cv_extract', sourceInputId: 'cv', outputKey: 'facts', type: 'cvExtractor' as const, args: { questions: [{ id: 'Education', type: 'education_level' as const }] } };
  const definition = { version: 2 as const, tasks: [task] };
  deepEqual(validateExtractorSources(definition, [{ id: 'cv', name: 'cv', type: 'document' }]), definition);
  throws(() => validateExtractorSources(definition, [{ id: 'cv', type: 'text' }]));
  throws(() => validateExtractorSources(definition, [{ id: 'cv', name: 'facts', type: 'document' }]));
  throws(() => extractorProcessingDefinitionSchema.parse({ ...definition, tasks: [task, { ...task, id: 'another', outputKey: 'other' }] }));
  throws(() => extractorProcessingDefinitionSchema.parse({ ...definition, tasks: [{ ...task, type: 'arbitraryProvider' }] }));
});

test('review and exports share original/effective/source mapping, including corrections after a failed batch', () => {
  const args: CvExtractorArgs = { questions: [
    { id: 'Cert', type: 'certification', certification: 'AWS' },
    { id: 'Count', type: 'skill_coverage', skills: ['SQL'] },
  ] };
  const successful = cvFieldProjection(args, 'facts', date, { Cert: false, Count: 0 }, [{ questionId: 'Cert', value: null }]);
  deepEqual(successful.map(f => [f.original, f.effective, f.source, f.hasCorrection]), [[false, null, 'hr', true], [0, 0, 'machine', false]]);
  const failed = cvFieldProjection(args, 'facts', date, null, [{ questionId: 'Count', value: 1 }]);
  deepEqual(failed.map(f => [f.original, f.effective, f.source]), [[null, null, 'unavailable'], [null, 1, 'hr']]);
  throws(() => cvFieldProjection(args, 'facts', date, { Cert: false }, []));
});
