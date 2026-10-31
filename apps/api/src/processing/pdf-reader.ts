import { fork } from 'node:child_process';
import type { DocumentTextReader, ExecutionContext } from './execution.js';
import { ProcessingFailure } from './processing-failure.js';

export class PdfTextReader implements DocumentTextReader {
  describe() { return 'pdfjs-dist@6.4.299'; }
  async read(bytes: Buffer, context: ExecutionContext): Promise<string> {
    if (bytes.length > 10 * 1024 * 1024 || !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Only PDF documents up to 10 MiB are supported.');
    context.signal?.throwIfAborted();
    return new Promise((resolve, reject) => {
      const worker = fork(new URL('./pdf-worker.js', import.meta.url), [], {
        serialization: 'advanced', stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        execArgv: ['--max-old-space-size=192'], env: { NODE_ENV: process.env.NODE_ENV ?? 'development' },
      });
      let settled = false;
      const finish = (error?: Error, text?: string) => {
        if (settled) return;
        settled = true; clearTimeout(timer); context.signal?.removeEventListener('abort', abort);
        worker.kill();
        if (error) reject(error); else resolve(text!);
      };
      const abort = () => finish(new ProcessingFailure('PDF preparation cancelled.', true));
      const timer = setTimeout(() => finish(new ProcessingFailure('PDF preparation timed out.', true)), 8000);
      context.signal?.addEventListener('abort', abort, { once: true });
      worker.once('message', (message: { text?: string; error?: string }) => {
        if (typeof message.text === 'string') finish(undefined, message.text);
        else finish(new Error(message.error ?? 'PDF preparation failed.'));
      });
      worker.once('error', () => finish(new Error('PDF parser process unavailable.')));
      worker.once('exit', () => { if (!settled) finish(new Error('PDF parser process exited unexpectedly.')); });
      worker.send(bytes, error => { if (error) finish(new Error('PDF parser input unavailable.')); });
    });
  }
}
