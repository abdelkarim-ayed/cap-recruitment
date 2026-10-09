import { PayloadTooLargeException } from '@nestjs/common';
import type { Request } from 'express';
import type { StorageEngine } from 'multer';
import { uploadLimits } from '@recruitment/domain/applications';

// Multer bounds each file; this engine additionally bounds accumulated file bytes
// across all streams in a request before allocating a completed submission.
export class BoundedUploadStorage implements StorageEngine {
  private readonly totals = new WeakMap<Request, number>();
  _handleFile(request: Request, file: Express.Multer.File, callback: (error?: any, info?: Partial<Express.Multer.File>) => void) {
    const chunks: Buffer[] = []; let size = 0, done = false;
    const fail = (error: Error) => { if (done) return; done = true; chunks.length = 0; callback(error); };
    file.stream.on('data', (chunk: Buffer) => {
      if (done) return;
      const total = (this.totals.get(request) ?? 0) + chunk.length;
      this.totals.set(request, total);
      if (total > uploadLimits.submissionBytes) {
        const error = new PayloadTooLargeException('Files exceed the 25 MiB submission limit.');
        fail(error); file.stream.destroy(error); return;
      }
      size += chunk.length; chunks.push(chunk);
    });
    file.stream.on('error', fail);
    file.stream.on('end', () => { if (!done) { done = true; callback(null, { buffer: Buffer.concat(chunks, size), size }); chunks.length = 0; } });
  }
  _removeFile(_request: Request, file: Express.Multer.File, callback: (error: Error | null) => void) { delete (file as Partial<Express.Multer.File>).buffer; callback(null); }
}
