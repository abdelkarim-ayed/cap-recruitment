import { test } from 'node:test';
import { deepEqual, equal, throws } from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildCvRequest } from '@recruitment/domain';
import { validateCvResponse, normalizeCvResponse } from '../dist/processing/cv-response.js';
import { assertSerializedJevRequest, serializeJevRequest } from '../dist/integrations/jev/jev-request.js';

const root = new URL('../../../research/cv-extraction-lab/observations/', import.meta.url);
const args = { questions: [
  { id: 'Credential', type: 'certification', certification: 'AWS' },
  { id: 'Coverage', type: 'skill_coverage', skills: ['SQL', 'Python'] },
] };
const request = buildCvRequest(args, '# Synthetic fixture\nSQL', '2026-11-12', 'jev-1.14.0');
function response() { return { model: 'jev-1.14.0', answers: {
  Credential: { type: 'choice', choice: 'not_mentioned', confidence: 0, probabilities: { present: 0.5, not_mentioned: 0.5 } },
  Coverage: { type: 'choice', choice: '0', confidence: 0.3, probabilities: { '0': 0.5, '1': 0.3, '2': 0.2 } },
}, usage: { input_tokens: 100, output_tokens: 30 } }; }

test('all 20 recorded pairs validate as their historical wire contracts, not latest-prompt accuracy evidence', () => {
  let pairs = 0, answers = 0;
  for (const directory of readdirSync(root).filter(name => /^[a-f0-9]{64}$/.test(name))) {
    const path = new URL(`${directory}/`, root);
    const req = JSON.parse(readFileSync(new URL('request.json', path), 'utf8'));
    const raw = JSON.parse(readFileSync(new URL('response.json', path), 'utf8'));
    deepEqual(validateCvResponse(req, raw), raw);
    pairs++; answers += Object.keys(raw.answers).length;
  }
  equal(pairs, 20); equal(answers, 102);
});

test('raw confidence, probabilities, usage and extension data survive untouched; no low-confidence cutoff', () => {
  const raw = { ...response(), diagnostic_extension: { preserved: true } };
  const result = normalizeCvResponse(args, request, raw);
  deepEqual(result.fields, { Credential: false, Coverage: 0 });
  deepEqual(result.rawResponse, raw);
  result.rawResponse.answers.Credential.confidence = 1;
  equal(raw.answers.Credential.confidence, 0);
});

test('malformed/missing/extra answers or choices fail the whole extractor, never fabricate zero/non-mention', () => {
  for (const mutate of [
    r => { delete r.answers.Credential; },
    r => { r.answers.extra = r.answers.Credential; },
    r => { r.answers.Credential.type = 'noul'; },
    r => { r.answers.Credential.choice = 'missing'; },
    r => { delete r.answers.Credential.probabilities.present; },
    r => { r.answers.Credential.probabilities.extra = 0; },
    r => { r.answers.Credential.probabilities.present = 0; },
    r => { r.answers.Credential.probabilities.present = NaN; },
    r => { r.answers.Credential.confidence = Infinity; },
    r => { r.answers.Credential.confidence = -1; },
    r => { r.answers.Coverage.choice = '2'; },
    r => { r.model = 'different-model'; },
    r => { r.usage.input_tokens = -1; },
    r => { delete r.usage; },
  ]) { const raw = response(); mutate(raw); throws(() => normalizeCvResponse(args, request, raw)); }
  const wrongConfig = { questions: [{ ...args.questions[0], certification: 'Different credential' }, args.questions[1]] };
  throws(() => normalizeCvResponse(wrongConfig, request, response()), /Configuration\/request/);
});

test('exact request identity includes hydrated Unicode Markdown/date/model/questions/options and their order', () => {
  const payload = buildCvRequest(args, '# CV\n日本語 "quoted" \\', '2026-11-12', 'placeholder-model');
  const serialized = serializeJevRequest(payload, 'jev-1.14.0', 60000);
  equal(serialized.body, JSON.stringify({ ...payload, model: 'jev-1.14.0' }));
  equal(serialized.hash, createHash('sha256').update(serialized.body).digest('hex'));
  assertSerializedJevRequest(serialized, 'jev-1.14.0', 60000);
  throws(() => assertSerializedJevRequest(serialized, 'different-model', 60000));
  throws(() => assertSerializedJevRequest({ ...serialized, hash: 'wrong' }, 'jev-1.14.0', 60000));
  throws(() => assertSerializedJevRequest(serialized, 'jev-1.14.0', 10));
  equal(JSON.parse(serialized.body).state.cv, payload.state.cv);
  for (const changed of [
    { ...payload, state: { ...payload.state, cv: '$cv' } },
    { ...payload, state: { ...payload.state, reference_date: '2026-11-13' } },
    { ...payload, questions: Object.fromEntries(Object.entries(payload.questions).reverse()) },
    { ...payload, questions: { ...payload.questions, Credential: { ...payload.questions.Credential, criteria: { present: 'Different wording', not_mentioned: 'Not evidenced as held or completed.' } } } },
  ]) equal(serializeJevRequest(changed, 'jev-1.14.0', 60000).hash === serialized.hash, false);
  equal(serializeJevRequest(payload, 'another-model', 60000).hash === serialized.hash, false);
  throws(() => serializeJevRequest(payload, 'jev-1.14.0', Buffer.byteLength(serialized.body) - 1));
  const circular = {}; circular.self = circular;
  throws(() => serializeJevRequest(circular, 'jev-1.14.0', 60000));
});

test('legal prototype-like question IDs remain ordinary own fields through validation/storage JSON', () => {
  const config = { questions: [{ id: 'constructor', type: 'certification', certification: 'AWS' }] };
  const req = buildCvRequest(config, '# Synthetic', '2026-11-12', 'jev-1.14.0');
  const raw = { model: req.model, answers: Object.fromEntries([['constructor', response().answers.Credential]]), usage: response().usage };
  const result = normalizeCvResponse(config, req, raw);
  equal(Object.hasOwn(result.fields, 'constructor'), true);
  equal(result.fields.constructor, false);
  deepEqual(JSON.parse(JSON.stringify(result.rawResponse)), raw);
});
