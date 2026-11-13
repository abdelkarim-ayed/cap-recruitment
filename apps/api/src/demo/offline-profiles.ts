import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCvRequest, type CvExtractorArgs, type CvNamedValue, type CvQuestion } from '@recruitment/domain';
const sourceRoot = fileURLToPath(new URL('../../../../', import.meta.url));

// Destination-authored declarations reviewed against the transferred authoring
// text/PDFs. Not archived provider responses, automatic inference or ground truth.
const corpus = 'research/cv-extraction-lab/snapshot';
export const offlineProfiles = [
  { id: 'precv-001', name: 'Daniel Mercer', family: 'cobalt-cv', hash: '9adac108abfc37706171893d835d0a68c20af12021575e4dcc23e97149468611',
    skills: { SQL: 'used_professionally', 'T-SQL': 'not_mentioned', TypeScript: 'used_professionally', Python: 'used_professionally', PostgreSQL: 'used_professionally', Redis: 'used_professionally', Docker: 'stated_or_studied', 'Node.js': 'stated_or_studied', Excel: 'not_mentioned', 'Power BI': 'not_mentioned', 'Power Query': 'not_mentioned', 'Sage Intacct': 'not_mentioned', Xero: 'not_mentioned', Git: 'not_mentioned', 'GitHub Actions': 'stated_or_studied' },
    experience: { 'software development': '8_plus', 'data analysis': 'under_1', accounting: 'under_1', '': '8_plus' }, certification: 'AWS Certified Developer – Associate' },
  { id: 'precv-002', name: 'Amélie Hartmann', family: 'monofolio', hash: 'e1a3cb5d31c69605b23773201a3d4ec4809c2047e998a33deaf60a828a6090f0',
    skills: { SQL: 'stated_or_studied', 'T-SQL': 'not_mentioned', TypeScript: 'not_mentioned', Python: 'applied', PostgreSQL: 'not_mentioned', Redis: 'not_mentioned', Docker: 'not_mentioned', 'Node.js': 'not_mentioned', Excel: 'stated_or_studied', 'Power BI': 'used_professionally', 'Power Query': 'not_mentioned', 'Sage Intacct': 'not_mentioned', Xero: 'not_mentioned', Git: 'stated_or_studied', 'GitHub Actions': 'not_mentioned' },
    experience: { 'software development': 'under_1', 'data analysis': '1_to_under_3', accounting: 'under_1', '': '3_to_under_5' }, certification: null },
  { id: 'precv-004', name: 'Grace Ellington', family: 'vivid-cv', hash: 'e5adc5e3b5d8b6025e3f457d02abb461890043e93b2e50f7d976832df1268c62',
    skills: { SQL: 'not_mentioned', 'T-SQL': 'not_mentioned', TypeScript: 'not_mentioned', Python: 'not_mentioned', PostgreSQL: 'not_mentioned', Redis: 'not_mentioned', Docker: 'not_mentioned', 'Node.js': 'not_mentioned', Excel: 'not_mentioned', 'Power BI': 'not_mentioned', 'Power Query': 'not_mentioned', 'Sage Intacct': 'not_mentioned', Xero: 'not_mentioned', Git: 'not_mentioned', 'GitHub Actions': 'not_mentioned' },
    experience: { 'software development': 'under_1', 'data analysis': 'under_1', accounting: 'under_1', '': '5_to_under_8' }, certification: null },
  { id: 'precv-005', name: 'Ronan Keating', family: 'calligraphics', hash: '78745d137339a4d8bd2c9018434abb979aa379055cb682b66f8f118f88798ddc',
    skills: { SQL: 'stated_or_studied', 'T-SQL': 'not_mentioned', TypeScript: 'not_mentioned', Python: 'not_mentioned', PostgreSQL: 'not_mentioned', Redis: 'not_mentioned', Docker: 'not_mentioned', 'Node.js': 'not_mentioned', Excel: 'stated_or_studied', 'Power BI': 'not_mentioned', 'Power Query': 'used_professionally', 'Sage Intacct': 'stated_or_studied', Xero: 'stated_or_studied', Git: 'not_mentioned', 'GitHub Actions': 'not_mentioned' },
    experience: { 'software development': 'under_1', 'data analysis': 'under_1', accounting: '5_to_under_8', '': '5_to_under_8' }, certification: null },
] as const;
export type OfflineProfile = typeof offlineProfiles[number];
export function profilePdfPath(profile: OfflineProfile) { return join(sourceRoot, corpus, 'template-based/outputs', profile.family, `${profile.id}-${profile.family}.pdf`); }
export async function profilePdf(profile: OfflineProfile) {
  const bytes = await readFile(profilePdfPath(profile));
  if (createHash('sha256').update(bytes).digest('hex') !== profile.hash) throw new Error('Synthetic PDF source integrity mismatch.');
  return bytes;
}
export function profileMarkdown(profile: OfflineProfile) {
  return readFile(join(sourceRoot, corpus, 'parser-evaluation/outputs/pdf-inspector/corpus-native-001', `${profile.id}-${profile.family}.md`), 'utf8');
}
const terms = (value: CvNamedValue) => typeof value === 'string' ? [value] : [value.name, ...(value.aliases ?? [])];
const certifications = ['AWS Certified Developer – Associate', 'AWS Certified Developer - Associate', 'DVA-C02', 'AWS Certified Cloud Practitioner', 'CLF-C02'];
function choice(profile: OfflineProfile, question: CvQuestion): string {
  const skills: Record<string, string> = profile.skills;
  const evidence = (value: CvNamedValue) => {
    const requested = terms(value);
    if (requested.some(term => !Object.hasOwn(skills, term))) throw new Error('Unsupported declared skill.');
    const levels = ['not_mentioned', 'stated_or_studied', 'applied', 'used_professionally'];
    return levels[Math.max(...requested.map(term => levels.indexOf(skills[term])))];
  };
  if (question.type === 'skill_evidence') return evidence(question.skill);
  if (question.type === 'skill_coverage') return String(question.skills.filter(skill => evidence(skill) !== 'not_mentioned').length);
  if (question.type === 'certification') {
    if (terms(question.certification).some(term => !certifications.includes(term))) throw new Error('Unsupported declared certification.');
    return profile.certification && terms(question.certification).some(term => ['AWS Certified Developer – Associate','AWS Certified Developer - Associate','DVA-C02'].includes(term)) ? 'present' : 'not_mentioned';
  }
  // Scope/date changes outside this narrow declaration are unavailable, not
  // fabricated negatives. New arbitrary questions require a provider or fixtures.
  const scope = question.scope ?? '';
  if (typeof scope !== 'string') throw new Error('Unsupported declared scope.');
  if (question.type === 'education_level') {
    if (scope !== '') throw new Error('Unsupported declared education scope.');
    return 'bachelors';
  }
  const bins: Record<string,string> = profile.experience;
  if (!Object.hasOwn(bins, scope)) throw new Error('Unsupported declared experience scope.');
  return bins[scope];
}
export function profileResponse(profile: OfflineProfile, args: CvExtractorArgs, markdown: string, referenceDate: string) {
  // Explicit declaration window: durations are not a new date inference engine.
  if (referenceDate < '2026-10-01' || referenceDate > '2026-12-31') throw new Error('Publication date outside declared fixture window.');
  const request = buildCvRequest(args, markdown, referenceDate, 'jev-1.14.0');
  return { model: request.model, answers: Object.fromEntries(args.questions.map(question => {
    const selected = choice(profile, question);
    return [question.id, { type: 'choice', choice: selected, confidence: 1,
      probabilities: Object.fromEntries(Object.keys(request.questions[question.id].criteria).map(key => [key, key === selected ? 1 : 0])) }];
  })), usage: { input_tokens: 0, output_tokens: 0 } };
}
