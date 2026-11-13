import { fork } from 'node:child_process';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { CV_PARSER, CV_PARSER_LIMITS, CvParserFailure, cvParserDiagnosticsSchema, type CvMarkdownReader, type ParsedCvDocument } from './cv-parser-contract.js';

const messageSchema = z.union([
  z.strictObject({ markdown: z.string().max(CV_PARSER_LIMITS.markdownCharacters), diagnostics: cvParserDiagnosticsSchema }),
  z.strictObject({ error: z.string().max(2000), diagnostics: cvParserDiagnosticsSchema.optional() }),
]);

export class CvPdfReader implements CvMarkdownReader {
  constructor(private readonly workerUrl = new URL('./cv-pdf-worker.js', import.meta.url), private readonly timeoutMs = CV_PARSER_LIMITS.timeoutMs) {}
  async read(bytes: Buffer, signal?: AbortSignal): Promise<ParsedCvDocument> {
    if (bytes.length > CV_PARSER_LIMITS.inputBytes || !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new CvParserFailure('Only PDF documents up to 10 MiB are supported.', false);
    if (signal?.aborted) throw new CvParserFailure('PDF preparation cancelled.', true);
    const sourceHash = createHash('sha256').update(bytes).digest('hex');
    return new Promise((resolve, reject) => {
      const worker = fork(this.workerUrl, [], {
        serialization: 'advanced', stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        execArgv: ['--max-old-space-size=192'], env: { NODE_ENV: process.env.NODE_ENV ?? 'development' },
      });
      let settled = false;
      const finish = (error?: Error, document?: ParsedCvDocument) => {
        if (settled) return;
        settled = true; clearTimeout(timer); signal?.removeEventListener('abort', abort);
        // SIGKILL also terminates native work which cannot observe JS abort.
        worker.kill('SIGKILL');
        if (error) reject(error); else resolve(document!);
      };
      const abort = () => finish(new CvParserFailure('PDF preparation cancelled.', true));
      const timer = setTimeout(() => finish(new CvParserFailure('PDF preparation timed out.', true)), this.timeoutMs);
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) { abort(); return; }
      worker.once('message', raw => {
        const parsed = messageSchema.safeParse(raw);
        if (!parsed.success) { finish(new CvParserFailure('PDF parser returned an invalid response.', true)); return; }
        const message = parsed.data;
        if (Buffer.byteLength(JSON.stringify(message.diagnostics ?? {})) > CV_PARSER_LIMITS.diagnosticsBytes) { finish(new CvParserFailure('PDF parser diagnostics exceed the extraction limit.', false)); return; }
        if ('error' in message) { finish(new CvParserFailure(message.error, false, message.diagnostics)); return; }
        if (!message.markdown.trim() || message.diagnostics.pagesNeedingOcr.length) { finish(new CvParserFailure('PDF has no reliable complete native text layer; OCR is not supported.', false, message.diagnostics)); return; }
        finish(undefined, { markdown: message.markdown, markdownHash: createHash('sha256').update(message.markdown).digest('hex'), sourceHash, parser: structuredClone(CV_PARSER), diagnostics: message.diagnostics });
      });
      worker.once('error', () => finish(new CvParserFailure('PDF parser process unavailable.', true)));
      worker.once('exit', () => { if (!settled) finish(new CvParserFailure('PDF parser process exited unexpectedly.', true)); });
      worker.send(bytes, error => { if (error) finish(new CvParserFailure('PDF parser input unavailable.', true)); });
    });
  }
}
