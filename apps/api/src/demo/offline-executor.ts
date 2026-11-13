import { buildCvRequest } from '@recruitment/domain';
import { offlineProfiles, profileResponse } from './offline-profiles.js';
import { prepareCvRequest } from '../processing/cv-memory-cache.js';
import { CvResponseFileCache } from '../processing/cv-file-cache.js';
import { normalizeCvResponse } from '../processing/cv-response.js';
import type { ParsedCvDocument } from '../processing/cv-parser-contract.js';
import type { ExecutionContext, ExecutionResult, TaskExecutor } from '../processing/execution.js';
import { ProcessingFailure } from '../processing/processing-failure.js';

export class OfflineDemoExecutor implements TaskExecutor {
  constructor(private readonly cache: CvResponseFileCache) {}
  isReady() { return true; }
  describe(context: ExecutionContext): ExecutionResult['provenance'] {
    return { mode: 'fixture', fixtureId: `offline-declared-v1:${offlineProfiles.find(profile => profile.hash === context.sourceHash)?.id ?? 'unsupported-pdf'}` };
  }
  async execute(document: ParsedCvDocument, context: ExecutionContext): Promise<ExecutionResult> {
    if (process.env.NODE_ENV !== 'development') throw new ProcessingFailure('Offline demo forbidden outside development.', false);
    const profile = offlineProfiles.find(profile => profile.hash === context.sourceHash);
    if (!profile) throw new ProcessingFailure('OFFLINE FIXTURE: no declared answers for this PDF. Use a supplied synthetic PDF or review unavailable values manually; no AI call was made.', false, 'ordinary_terminal');
    const prepared = prepareCvRequest(buildCvRequest(context.args, document.markdown, context.referenceDate, 'jev-1.14.0'), 'jev-1.14.0', 60000);
    let declared;
    try { declared = profileResponse(profile, context.args, document.markdown, context.referenceDate); }
    catch { throw new ProcessingFailure('OFFLINE FIXTURE: questions/date outside the declared profile. No inferred values or AI call; use the demo questions or manual review.', false, 'ordinary_terminal'); }
    const hit = await this.cache.get('fixture', prepared);
    const response = hit?.response ?? declared;
    const attemptId = `declared-profile-v1:${profile.id}`;
    if (!hit) await this.cache.set('fixture', prepared, declared, attemptId);
    return { result: { status: 'completed', value: normalizeCvResponse(context.args, prepared.request, response) },
      provenance: { ...this.describe(context), model: prepared.request.model, sourceHash: context.sourceHash, parser: document.parser, diagnostics: document.diagnostics,
        markdownHash: document.markdownHash, referenceDate: context.referenceDate, requestHash: prepared.hash, requestBody: prepared.body,
        attemptId, cacheHit: !!hit, usage: response.usage } };
  }
}
