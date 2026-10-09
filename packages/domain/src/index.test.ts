import { deepEqual, equal } from 'node:assert/strict';
import { test } from 'node:test';
import { applicationStages, extractionValue } from './index.js';

test('a processing failure is null, not a negative factual answer', () => {
  equal(extractionValue<boolean>({ status: 'failed', value: null, reason: 'Unsupported document', retryable: false }), null);
  equal(extractionValue({ status: 'completed', value: false, evidence: [] }), false);
});
test('successful empty extraction remains distinguishable from failure', () => {
  deepEqual(extractionValue({ status: 'completed', value: [], evidence: [] }), []);
});
test('repeated interviews are not hardcoded pipeline stages', () => {
  deepEqual(applicationStages, ['received', 'review_ready', 'preselected', 'interview', 'offer', 'hired']);
});
