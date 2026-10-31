import '../../configuration/environment.js';

// SPENDING SAFETY BOUNDARY: DO NOT raise/reset limits, change endpoint/model,
// bypass this gateway, or introduce retries without explicit user approval.
// This warning applies to future agent sessions as well. Never commit API keys.
export const JEV_CONFIG = Object.freeze({
  url: 'https://api.typesafe.ai/v1/systemone',
  apiKey: process.env.JEV_API_KEY ?? '',
  model: 'jev-1.14.0',
  redisUrl: process.env.REDIS_URL ?? 'redis://127.0.0.1:56379',
  // Fixed, shared namespace: do not randomize/change to evade exhausted budgets.
  budgetKey: 'recruitment:jev:spending-guard:v1',
  limits: Object.freeze({
    requestsPerMinute: 3,
    totalRequests: 20,
    timeoutMs: 10_000,
    lockMs: 60_000,
    maxRequestBytes: 60_000,
    maxResponseBytes: 1_000_000,
  }),
});
