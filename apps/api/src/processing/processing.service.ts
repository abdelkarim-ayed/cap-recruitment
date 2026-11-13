import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { cvReferenceDateSchema } from '@recruitment/domain';
import { DOCUMENT_STORAGE, type DocumentStorage } from '../documents/document-storage.js';
import { DOCUMENT_MARKDOWN_READER, TASK_EXECUTOR, type DocumentMarkdownReader, type TaskExecutor, type ExecutionContext, type ExecutionResult, taskResultSchema } from './execution.js';
import { ProcessingRepository } from './processing.repository.js';
import { ProcessingFailure } from './processing-failure.js';
import { CvParserFailure } from './cv-parser-contract.js';
import { CvInvalidResponseFailure, CvProviderAttemptFailure } from './cv-attempts.js';

@Injectable()
export class ProcessingService {
  private guardStopped = false;
  constructor(private readonly repository: ProcessingRepository, @Inject(DOCUMENT_STORAGE) private readonly storage: DocumentStorage,
    @Inject(DOCUMENT_MARKDOWN_READER) private readonly reader: DocumentMarkdownReader, @Inject(TASK_EXECUTOR) private readonly executor: TaskExecutor) {}
  async processOne(id?: string, signal?: AbortSignal, fixtureOnly = false) {
    if (signal?.aborted || this.guardStopped) return false;
    // Empty/cleared credentials must not consume pending live work. Explicitly
    // bound trusted fixtures remain usable with the normal executor disabled.
    const claim = await this.repository.claim(id, fixtureOnly || this.executor.isReady?.() === false); if (!claim) return false;
    let stopWithoutRetry = false;
    for (const task of claim.tasks) {
      if (signal?.aborted) break;
      const started = await this.repository.start(claim.id, claim.token, task.task_id); if (!started) continue;
      let provenance: ExecutionResult['provenance'] = task.fixture_key === null ? { mode: 'disabled' } : { mode: 'fixture', fixtureId: task.fixture_key };
      let outcome: ExecutionResult;
      try {
        if (task.type !== 'cvExtractor') throw new ProcessingFailure('Unsupported extractor; recreate this disposable legacy vacancy.', false);
        if (!cvReferenceDateSchema.safeParse(claim.referenceDate).success) throw new ProcessingFailure('Frozen vacancy publication reference date is unavailable.', false);
        await this.repository.assertActive(claim.id, claim.token);
        const source = await this.repository.source(claim.id, task.source_input_id);
        if (!source) throw new ProcessingFailure('Source document was not submitted.', false, 'ordinary_terminal');
        const context: ExecutionContext = { applicationId: claim.id, documentId: source.id, sourceHash: source.content_hash, taskId: task.task_id, token: claim.token, referenceDate: claim.referenceDate!, args: task.args, signal, ...(task.fixture_key === null ? {} : { fixtureKey: task.fixture_key }) };
        provenance = this.executor.describe?.(context) ?? provenance;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let bytes: Buffer;
        try { bytes = await Promise.race([this.storage.read(source.storage_ref), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new ProcessingFailure('Document storage read timed out.', true)), 10000); })]); }
        finally { clearTimeout(timer); }
        if (bytes.length !== source.byte_count || createHash('sha256').update(bytes).digest('hex') !== source.content_hash) throw new ProcessingFailure('Source integrity mismatch.', false);
        await this.repository.assertActive(claim.id, claim.token);
        const document = await this.reader.read(bytes, context);
        provenance = { ...provenance, parser: document.parser, diagnostics: document.diagnostics, markdownHash: document.markdownHash, sourceHash: source.content_hash, referenceDate: context.referenceDate };
        await this.repository.assertActive(claim.id, claim.token);
        // Native parsing and gateway I/O own killable/bounded deadlines. Do not
        // abandon a Promise.race around a paid send and start another attempt.
        outcome = await this.executor.execute(document, context);
        outcome.result = taskResultSchema.parse(outcome.result);
      } catch (error) {
        if (error instanceof CvProviderAttemptFailure || provenance.mode === 'live' && error instanceof ProcessingFailure && error.category === 'uncertain') {
          this.guardStopped = true; stopWithoutRetry = !error.retryable;
        }
        const storageFailure = error instanceof Error && ['ENOENT','EACCES','EIO','ENOSPC'].includes((error as NodeJS.ErrnoException).code ?? '');
        if (error instanceof CvParserFailure && error.diagnostics) provenance.diagnostics = error.diagnostics;
        outcome = { provenance, result: { status: 'failed', value: null,
          reason: storageFailure ? 'Document storage unavailable.' : error instanceof ProcessingFailure ? error.message : 'CV processing failed; inspect configuration or release to manual review.',
          retryable: storageFailure || error instanceof ProcessingFailure && error.retryable,
          failureCategory: error instanceof ProcessingFailure ? error.category : storageFailure ? 'operational' : 'unclassified',
          ...(error instanceof CvInvalidResponseFailure ? { rawResponse: error.rawResponse } : {}) } };
      }
      await this.repository.save(claim.id, claim.token, task.task_id, outcome);
      if(this.guardStopped)break;
    }
    await this.repository.finish(claim.id, claim.token, stopWithoutRetry); return true;
  }
}
