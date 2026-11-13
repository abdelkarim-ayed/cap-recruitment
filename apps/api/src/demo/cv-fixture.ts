import { buildCvRequest, type CvExtractorArgs } from '@recruitment/domain';

// Declared synthetic fixture, NOT extraction/model output or quality evidence.
// Zero usage is simulated fixture metadata, never a billed observation.
export const demoCvQuestions: CvExtractorArgs = { questions: [
  { id: 'Education', type: 'education_level', expected_within_months: 6 },
  { id: 'Certification', type: 'certification', certification: { name: 'AWS Certified Cloud Practitioner', aliases: ['CLF-C02'] } },
  { id: 'Experience', type: 'experience_years', scope: 'software development' },
  { id: 'Coverage', type: 'skill_coverage', skills: ['SQL','TypeScript','Python'] },
  { id: 'SQL', type: 'skill_evidence', skill: { name: 'SQL', aliases: ['T-SQL'] } },
] };
export function declaredCvResponse(args: CvExtractorArgs, markdown: string, referenceDate: string, negative: boolean) {
  const request = buildCvRequest(args, markdown, referenceDate, 'jev-1.14.0');
  return { model: request.model, answers: Object.fromEntries(args.questions.map(q => {
    const selected = q.type === 'education_level' ? negative ? 'not_stated' : 'bachelors'
      : q.type === 'certification' ? negative ? 'not_mentioned' : 'present'
      : q.type === 'experience_years' ? negative ? 'under_1' : '1_to_under_3'
      : q.type === 'skill_evidence' ? negative ? 'not_mentioned' : 'applied'
      : String(negative ? 0 : Math.min(2, q.skills.length));
    return [q.id, { type: 'choice', choice: selected, confidence: 1, probabilities: Object.fromEntries(Object.keys(request.questions[q.id].criteria).map(key => [key, key === selected ? 1 : 0])) }];
  })), usage: { input_tokens: 0, output_tokens: 0 } };
}
