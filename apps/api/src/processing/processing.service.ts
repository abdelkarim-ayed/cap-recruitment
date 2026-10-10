import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DOCUMENT_STORAGE, type DocumentStorage } from '../documents/document-storage.js';
import { DOCUMENT_TEXT_READER, TASK_EXECUTOR, type DocumentTextReader, type TaskExecutor, type ExecutionContext, type ExecutionResult, taskResultSchema } from './execution.js';
import { ProcessingRepository } from './processing.repository.js';

async function bounded<T>(operation: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try { return await Promise.race([operation, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Processing unit timed out.')), 10000); })]); }
  finally { clearTimeout(timer); }
}
@Injectable()
export class ProcessingService {
  constructor(private readonly repository: ProcessingRepository, @Inject(DOCUMENT_STORAGE) private readonly storage: DocumentStorage,
    @Inject(DOCUMENT_TEXT_READER) private readonly reader: DocumentTextReader, @Inject(TASK_EXECUTOR) private readonly executor: TaskExecutor) {}
  async processOne(id?: string) {
    const claim = await this.repository.claim(id); if (!claim) return false;
    const texts = new Map<string,string>();
    const documents = new Map<string,Buffer>();
    for (const task of claim.tasks) {
      const started = await this.repository.start(claim.id, claim.token, task.task_id); if (!started) continue;
      let outcome: ExecutionResult;
      try {
        const source = await this.repository.source(claim.id, task.source_input_id);
        if (!source) throw new Error('Source document was not submitted.');
        const context: ExecutionContext = { applicationId: claim.id, documentId: source.id, sourceHash: source.content_hash, taskId: task.task_id, args: task.args, ...(task.fixture_key === null ? {} : { fixtureKey: task.fixture_key }) };
        const bytes = documents.get(source.id) ?? await bounded(this.storage.read(source.storage_ref));
        if (bytes.length !== source.byte_count || createHash('sha256').update(bytes).digest('hex') !== source.content_hash) throw new Error('Source integrity mismatch.');
        documents.set(source.id,bytes);
        // Reader fixture identity validated per task; parsed text reused per document.
        const key = `${source.id}:${source.content_hash}:${task.fixture_key === null ? 'normal' : 'fixture'}`;
        const previous = texts.get(key);
        const readText = previous !== undefined && task.fixture_key === null ? previous : await bounded(this.reader.read(bytes, context));
        if (previous !== undefined && previous !== readText) throw new Error('Fixtures disagree on document text.');
        texts.set(key, readText);
        outcome = await bounded(this.executor.execute(previous ?? readText, context));
        outcome.result = taskResultSchema.parse(outcome.result);
      } catch (error) {
        const storageFailure = error instanceof Error && ['ENOENT','EACCES','EIO','ENOSPC'].includes((error as NodeJS.ErrnoException).code ?? '');
        const reason = storageFailure ? 'Document storage unavailable.' : error instanceof Error ? error.message.slice(0,2000) : 'Processing unit failed.';
        outcome = { provenance: task.fixture_key === null ? { mode: 'disabled' } : { mode: 'fixture', fixtureId: task.fixture_key }, result: { status: 'failed', value: null, reason, retryable: storageFailure || reason === 'Processing unit timed out.' } };
      }
      await this.repository.save(claim.id, claim.token, task.task_id, outcome);
    }
    await this.repository.finish(claim.id, claim.token); return true;
  }
}
