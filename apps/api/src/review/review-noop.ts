import { isDeepStrictEqual } from 'node:util';
import { normalizeSkills, skillValueSchema } from '@recruitment/domain/vacancies';

// Skill membership is case-insensitive and unordered (as in skillRows), unlike
// ordered interview plans. Presence of an override is checked by the caller:
// absent and explicit null must never become equivalent here.
export function sameSkillCorrection(current: unknown, proposed: unknown): boolean {
  const left=skillValueSchema.nullable().safeParse(current),right=skillValueSchema.nullable().safeParse(proposed);
  if(!left.success||!right.success)return false; // A valid repair is still a change.
  const canonical=(value:typeof left.data)=>value===null?null:{skills:normalizeSkills(value.skills).sort(),unavailableSkills:normalizeSkills(value.unavailableSkills??[]).sort()};
  return isDeepStrictEqual(canonical(left.data),canonical(right.data));
}
