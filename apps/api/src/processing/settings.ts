export function processingSettings(env: NodeJS.ProcessEnv = process.env) {
  const reader = env.PROCESSING_READER ?? 'disabled';
  const executor = env.PROCESSING_EXECUTOR ?? 'disabled';
  if (!['disabled', 'pdf'].includes(reader)) throw new Error('PROCESSING_READER must be disabled or pdf.');
  if (!['disabled', 'jev'].includes(executor)) throw new Error('PROCESSING_EXECUTOR must be disabled or jev.');
  if (executor === 'jev' && (reader !== 'pdf' || !env.TYPESAFE_API_KEY || env.EXTRACTION_LIVE_CONSENT !== 'synthetic')) throw new Error('Jev requires PROCESSING_READER=pdf, TYPESAFE_API_KEY and EXTRACTION_LIVE_CONSENT=synthetic. Use synthetic documents only.');
  return { reader, executor, key: env.TYPESAFE_API_KEY ?? '', model: env.TYPESAFE_MODEL ?? 'jev-1.14.0' };
}
