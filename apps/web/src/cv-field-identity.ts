import type { CvQuestion } from '@recruitment/domain';

export function fieldSlug(value: string, fallback = 'field') {
  const slug = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 56);
  return slug ? /^[a-z]/.test(slug) ? slug : `field_${slug}` : fallback;
}
export function uniqueFieldId(base: string, existing: readonly string[]) {
  let candidate = base.slice(0, 64), suffix = 2;
  while (existing.includes(candidate)) {
    const ending = `_${suffix++}`;
    candidate = `${base.slice(0, 64 - ending.length)}${ending}`;
  }
  return candidate;
}
export function suggestedQuestionId(question: CvQuestion) {
  const name = (value: string | { name: string }) => typeof value === 'string' ? value : value.name;
  if (question.type === 'skill_evidence') return fieldSlug(`skill_${name(question.skill)}`);
  if (question.type === 'certification') return fieldSlug(`cert_${name(question.certification)}`);
  if (question.type === 'skill_coverage') return 'skill_coverage';
  const scope = Array.isArray(question.scope) ? question.scope.join('_or_') : question.scope ?? '';
  return fieldSlug(`${question.type}_${scope}`);
}
