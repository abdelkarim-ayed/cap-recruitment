export function processingSettings(env: NodeJS.ProcessEnv = process.env) {
  const reader = env.PROCESSING_READER ?? 'disabled';
  const executor = env.PROCESSING_EXECUTOR ?? 'disabled';
  const runner = env.PROCESSING_RUNNER ?? 'disabled';
  if (!['disabled', 'pdf'].includes(reader)) throw new Error('PROCESSING_READER must be disabled or pdf.');
  if (!['disabled', 'jev'].includes(executor)) throw new Error('PROCESSING_EXECUTOR must be disabled or jev.');
  if (executor === 'jev' && (reader !== 'pdf' || env.EXTRACTION_LIVE_CONSENT !== 'synthetic')) throw new Error('Jev requires PROCESSING_READER=pdf and EXTRACTION_LIVE_CONSENT=synthetic. Use synthetic documents only.');
  if (!['disabled','fixture','offline-demo','jev'].includes(runner)) throw new Error('PROCESSING_RUNNER must be disabled, fixture, offline-demo or explicitly scoped jev.');
  if (runner === 'fixture' && (executor !== 'disabled' || env.NODE_ENV === 'production' || !env.PROCESSING_FIXTURE_FILE)) throw new Error('Fixture runner requires a trusted fixture file, disabled normal executor and non-production environment.');
  if (runner === 'offline-demo' && (executor !== 'disabled' || reader !== 'pdf' || env.NODE_ENV !== 'development')) throw new Error('Offline demo requires NODE_ENV=development, native PDF reader and disabled provider executor.');
  const liveSince = env.PROCESSING_LIVE_SINCE;
  if (runner === 'jev' && (env.NODE_ENV !== 'development' || executor !== 'jev' || !liveSince || !Number.isFinite(Date.parse(liveSince)) || new Date(liveSince).toISOString() !== liveSince)) throw new Error('Live runner requires development, the consent-gated Jev executor and an explicit PROCESSING_LIVE_SINCE UTC ISO boundary. Reuse that boundary on restart; historical work stays excluded.');
  return { reader, executor, runner, fixtureFile: env.PROCESSING_FIXTURE_FILE, liveSince: runner === 'jev' ? liveSince : undefined };
}
