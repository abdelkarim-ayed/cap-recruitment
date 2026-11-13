export function processingSettings(env: NodeJS.ProcessEnv = process.env) {
  const reader = env.PROCESSING_READER ?? 'disabled';
  const executor = env.PROCESSING_EXECUTOR ?? 'disabled';
  const runner = env.PROCESSING_RUNNER ?? 'disabled';
  if (!['disabled', 'pdf'].includes(reader)) throw new Error('PROCESSING_READER must be disabled or pdf.');
  if (!['disabled', 'jev'].includes(executor)) throw new Error('PROCESSING_EXECUTOR must be disabled or jev.');
  if (executor === 'jev' && (reader !== 'pdf' || env.EXTRACTION_LIVE_CONSENT !== 'synthetic')) throw new Error('Jev requires PROCESSING_READER=pdf and EXTRACTION_LIVE_CONSENT=synthetic. Use synthetic documents only.');
  if (!['disabled','fixture'].includes(runner)) throw new Error('PROCESSING_RUNNER must be disabled or fixture; unattended live execution is not enabled.');
  if (runner === 'fixture' && (executor !== 'disabled' || env.NODE_ENV === 'production' || !env.PROCESSING_FIXTURE_FILE)) throw new Error('Fixture runner requires a trusted fixture file, disabled normal executor and non-production environment.');
  return { reader, executor, runner, fixtureFile: env.PROCESSING_FIXTURE_FILE };
}
