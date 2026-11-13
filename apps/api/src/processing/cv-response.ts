import { z } from 'zod';
import { buildCvRequest, normalizeCvChoice, type CvExtractorArgs, type CvFieldValue, type CvRequest } from '@recruitment/domain';

const probability = z.number().finite().min(0).max(1);
const answerSchema = z.looseObject({
  type: z.literal('choice'), choice: z.string(), confidence: probability,
  probabilities: z.record(z.string(), probability),
});
const responseSchema = z.looseObject({
  model: z.string().min(1), answers: z.record(z.string(), answerSchema),
  usage: z.looseObject({ input_tokens: z.number().int().nonnegative(), output_tokens: z.number().int().nonnegative() }),
});
export type CvChoiceResponse = z.infer<typeof responseSchema>;

function sameKeys(actual: object, expected: object) {
  const keys = Object.keys(actual);
  return keys.length === Object.keys(expected).length && keys.every(key => Object.hasOwn(expected, key));
}

/** Complete request/response validation before either persistence or cache
 * success. Concentration never changes an answer; no thresholding/rounding.
 * Archived observations validate their original requests, not today's wording.
 */
export function validateCvResponse(request: CvRequest, raw: unknown): CvChoiceResponse {
  const response = responseSchema.parse(raw);
  if (response.model !== request.model) throw new Error('Unexpected response model.');
  if (!sameKeys(response.answers, request.questions)) throw new Error('Incomplete or unexpected response question IDs.');
  for (const [id, question] of Object.entries(request.questions)) {
    const answer = response.answers[id];
    if (!Object.hasOwn(question.criteria, answer.choice) || !sameKeys(answer.probabilities, question.criteria)) throw new Error('Incomplete or unexpected answer choices.');
    const total = Object.values(answer.probabilities).reduce((sum, value) => sum + value, 0);
    // Floating-point summation tolerance only, not a confidence/quality gate or
    // a license to renormalize provider values. Non-unit distributions fail.
    if (Math.abs(total - 1) > 1e-6) throw new Error('Answer probabilities do not sum to one.');
    // Preserve the returned winner, including reported ties. Do not recompute
    // confidence or substitute a locally selected/capped answer.
    if (Object.values(answer.probabilities).some(p => p > answer.probabilities[answer.choice] + 1e-6)) throw new Error('Answer choice is inconsistent with its distribution.');
  }
  return structuredClone(response);
}

export function normalizeCvResponse(args: CvExtractorArgs, request: CvRequest, raw: unknown) {
  const expected = buildCvRequest(args, request.state.cv, request.state.reference_date, request.model);
  if (JSON.stringify(expected.questions) !== JSON.stringify(request.questions)) throw new Error('Configuration/request question mismatch.');
  const response = validateCvResponse(request, raw);
  const fields: Record<string, CvFieldValue> = Object.fromEntries(args.questions.map(q => [q.id, normalizeCvChoice(q, response.answers[q.id].choice)]));
  return { version: 1 as const, fields, rawResponse: response };
}
