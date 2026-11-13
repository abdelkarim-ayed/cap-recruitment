import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { chmod, lstat, mkdir, open, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import { CV_PARSER_LIMITS, cvParserDiagnosticsSchema, type ParsedCvDocument } from './cv-parser-contract.js';
import { assertPreparedCvRequest, cvParserCacheKey, type CvExecutionMode, type PreparedCvRequest } from './cv-memory-cache.js';
import { validateCvResponse, type CvChoiceResponse } from './cv-response.js';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const documentSchema = z.strictObject({
  markdown: z.string().min(1).max(CV_PARSER_LIMITS.markdownCharacters), markdownHash: digest, sourceHash: digest,
  parser: z.strictObject({ name: z.string(), version: z.string(), options: z.record(z.string(), z.union([z.string(), z.boolean()])) }),
  diagnostics: cvParserDiagnosticsSchema,
});

// Private local cache, not public document storage. No credentials or failures.
// Bounded reads and no-follow/exclusive opens; readers see old or complete new
// values, never a partial write. A corrupt/missing hit cannot override send guards.
class PrivateJsonCache {
  constructor(private readonly directory: string, private readonly maxBytes = 2 * 1024 * 1024) {}
  private async directoryReady() {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const info = await lstat(this.directory);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Unsafe CV cache directory.');
    await chmod(this.directory, 0o700);
  }
  async get(key: string): Promise<unknown | undefined> {
    await this.directoryReady();
    let file;
    try {
      file = await open(join(this.directory, `${key}.json`), constants.O_RDONLY | constants.O_NOFOLLOW);
      const info = await file.stat();
      if (!info.isFile() || info.size > this.maxBytes || (info.mode & 0o077) !== 0) return undefined;
      const bytes = await file.readFile();
      if (bytes.length > this.maxBytes) return undefined;
      return JSON.parse(bytes.toString('utf8')) as unknown;
    } catch (error) {
      if (error instanceof SyntaxError || ['ENOENT', 'ELOOP'].includes((error as NodeJS.ErrnoException).code ?? '')) return undefined;
      throw error;
    } finally { await file?.close(); }
  }
  async set(key: string, value: unknown) {
    const body = JSON.stringify(value);
    if (Buffer.byteLength(body) > this.maxBytes) throw new Error('CV cache entry exceeds private file limit.');
    await this.directoryReady();
    const temporary = join(this.directory, `${randomUUID()}.tmp`);
    try {
      const file = await open(temporary, 'wx', 0o600);
      try { await file.writeFile(body); await file.sync(); } finally { await file.close(); }
      await rename(temporary, join(this.directory, `${key}.json`));
    } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
    return true;
  }
}

function validatedDocument(raw: unknown): ParsedCvDocument {
  const value = documentSchema.parse(raw);
  if (!value.markdown.trim() || value.diagnostics.pagesNeedingOcr.length || hash(value.markdown) !== value.markdownHash) throw new Error('Invalid parsed CV cache entry.');
  if (Buffer.byteLength(JSON.stringify(value.diagnostics)) > CV_PARSER_LIMITS.diagnosticsBytes) throw new Error('Oversized CV diagnostics.');
  return value;
}
export class CvParserFileCache {
  private readonly files: PrivateJsonCache;
  constructor(directory: string) { this.files = new PrivateJsonCache(join(directory, 'markdown-v1')); }
  async get(sourceHash: string, parser: ParsedCvDocument['parser']) {
    const raw = await this.files.get(hash(cvParserCacheKey(sourceHash, parser)));
    if (raw === undefined) return undefined;
    try {
      const value = validatedDocument(raw);
      return value.sourceHash === sourceHash && isDeepStrictEqual(value.parser, parser) ? value : undefined;
    } catch { return undefined; }
  }
  set(document: ParsedCvDocument) {
    const value = validatedDocument(document);
    return this.files.set(hash(cvParserCacheKey(value.sourceHash, value.parser)), value);
  }
}
export interface CvResponseCache {
  get(mode: CvExecutionMode, prepared: PreparedCvRequest): { body: string; response: CvChoiceResponse; attemptId: string } | undefined | Promise<{ body: string; response: CvChoiceResponse; attemptId: string } | undefined>;
  set(mode: CvExecutionMode, prepared: PreparedCvRequest, raw: unknown, attemptId: string): boolean | Promise<boolean>;
}
const responseEntry = z.strictObject({ body: z.string(), response: z.unknown(), attemptId: z.string().min(1).max(200) });
export class CvResponseFileCache implements CvResponseCache {
  private readonly stores: Record<CvExecutionMode, PrivateJsonCache>;
  constructor(directory: string) {
    this.stores = { fixture: new PrivateJsonCache(join(directory, 'responses-fixture-v1')), live: new PrivateJsonCache(join(directory, 'responses-live-v1')) };
  }
  async get(mode: CvExecutionMode, prepared: PreparedCvRequest) {
    assertPreparedCvRequest(prepared);
    const raw = await this.stores[mode].get(prepared.hash);
    if (raw === undefined) return undefined;
    try {
      const entry = responseEntry.parse(raw);
      if (entry.body !== prepared.body) return undefined;
      return { ...entry, response: validateCvResponse(prepared.request, entry.response) };
    } catch { return undefined; }
  }
  async set(mode: CvExecutionMode, prepared: PreparedCvRequest, raw: unknown, attemptId: string) {
    assertPreparedCvRequest(prepared);
    const entry = responseEntry.parse({ body: prepared.body, response: validateCvResponse(prepared.request, raw), attemptId });
    return this.stores[mode].set(prepared.hash, entry);
  }
}
