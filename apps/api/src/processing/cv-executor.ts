import { buildCvRequest } from '@recruitment/domain';
import { JEV_CONFIG } from '../integrations/jev/jev.config.js';
import { CvAttemptCoordinator } from './cv-attempts.js';
import { prepareCvRequest } from './cv-memory-cache.js';
import { normalizeCvResponse } from './cv-response.js';
import type { ParsedCvDocument } from './cv-parser-contract.js';
import type { ExecutionContext, ExecutionResult, TaskExecutor } from './execution.js';

export class CvExecutor implements TaskExecutor {
  constructor(private readonly coordinator: CvAttemptCoordinator, private readonly configured: () => boolean) {}
  isReady() { return this.configured(); }
  describe(): ExecutionResult['provenance'] { return { mode: 'live', provider: 'typesafe', model: JEV_CONFIG.model }; }
  async execute(document: ParsedCvDocument, context: ExecutionContext): Promise<ExecutionResult> {
    const request = prepareCvRequest(buildCvRequest(context.args, document.markdown, context.referenceDate, JEV_CONFIG.model), JEV_CONFIG.model, JEV_CONFIG.limits.maxRequestBytes);
    const result = await this.coordinator.execute({ applicationId: context.applicationId, taskId: context.taskId, token: context.token }, 'live', request, context.signal);
    return { result: { status: 'completed', value: normalizeCvResponse(context.args, request.request, result.response) },
      provenance: { ...this.describe(), sourceHash: context.sourceHash, parser: document.parser, diagnostics: document.diagnostics, markdownHash: document.markdownHash,
        referenceDate: context.referenceDate, requestHash: request.hash, requestBody: request.body, cacheHit: result.cacheHit, attemptId: result.attemptId, usage: result.response.usage } };
  }
}
