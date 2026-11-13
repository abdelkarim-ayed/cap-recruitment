import { createHash } from 'node:crypto';
import { CV_PARSER, type CvMarkdownReader, type ParsedCvDocument } from './cv-parser-contract.js';
import { validateCvResponse, type CvChoiceResponse } from './cv-response.js';
import type { CvRequest } from '@recruitment/domain';
import { serializeJevRequest } from '../integrations/jev/jev-request.js';

// Process-local LRU. Values are private copies; failures/in-flight work are not
// cache entries. Capacity is enforced before insertion, including request bytes.
export class BoundedMemoryCache<T> {
  private readonly entries = new Map<string, { value: T; bytes: number }>();
  private bytes = 0;
  constructor(private readonly maxEntries: number, private readonly maxBytes: number) {
    if (!Number.isSafeInteger(maxEntries) || maxEntries < 1 || !Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error('Positive cache bounds are required.');
  }
  get size() { return this.entries.size; }
  get byteSize() { return this.bytes; }
  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key); this.entries.set(key, entry);
    return structuredClone(entry.value);
  }
  set(key: string, value: T) {
    const bytes = Buffer.byteLength(key) + Buffer.byteLength(JSON.stringify(value));
    const previous = this.entries.get(key);
    if (previous) { this.bytes -= previous.bytes; this.entries.delete(key); }
    if (bytes > this.maxBytes) return false;
    while (this.entries.size >= this.maxEntries || this.bytes + bytes > this.maxBytes) {
      const oldest = this.entries.keys().next().value!;
      this.bytes -= this.entries.get(oldest)!.bytes; this.entries.delete(oldest);
    }
    this.entries.set(key, { value: structuredClone(value), bytes }); this.bytes += bytes;
    return true;
  }
}

export function cvParserCacheKey(sourceHash: string, parser: ParsedCvDocument['parser']) {
  if (!/^[a-f0-9]{64}$/.test(sourceHash)) throw new Error('Invalid PDF hash.');
  return JSON.stringify([sourceHash, parser.name, parser.version, parser.options]);
}
export class CvParserMemoryCache {
  private readonly cache: BoundedMemoryCache<ParsedCvDocument>;
  constructor(maxEntries = 32, maxBytes = 8 * 1024 * 1024) { this.cache = new BoundedMemoryCache(maxEntries, maxBytes); }
  get(sourceHash: string, parser: ParsedCvDocument['parser']) { return this.cache.get(cvParserCacheKey(sourceHash, parser)); }
  set(document: ParsedCvDocument) {
    if (!document.markdown.trim() || document.diagnostics.pagesNeedingOcr.length || createHash('sha256').update(document.markdown).digest('hex') !== document.markdownHash) throw new Error('Invalid parsed document cache value.');
    return this.cache.set(cvParserCacheKey(document.sourceHash, document.parser), document);
  }
}

// Invoked only after private source access/integrity checks by the processing
// service. This wrapper has no document-ID lookup or authorization shortcut.
export class CvCachedMarkdownReader implements CvMarkdownReader {
  constructor(private readonly reader: CvMarkdownReader, private readonly cache: { get(sourceHash: string, parser: ParsedCvDocument['parser']): ParsedCvDocument | undefined | Promise<ParsedCvDocument | undefined>; set(document: ParsedCvDocument): boolean | Promise<boolean> }) {}
  async read(bytes: Buffer, signal?: AbortSignal): Promise<ParsedCvDocument> {
    signal?.throwIfAborted();
    const sourceHash = createHash('sha256').update(bytes).digest('hex');
    const hit = await this.cache.get(sourceHash, CV_PARSER);
    if (hit) return hit;
    const parsed = await this.reader.read(bytes, signal);
    if (parsed.sourceHash !== sourceHash || JSON.stringify(parsed.parser) !== JSON.stringify(CV_PARSER)) throw new Error('Parser source/provenance mismatch.');
    signal?.throwIfAborted();
    await this.cache.set(parsed);
    return parsed;
  }
}

export type CvExecutionMode = 'fixture' | 'live';
export interface PreparedCvRequest { body: string; hash: string; request: CvRequest }
export function prepareCvRequest(request: CvRequest, effectiveModel: string, maxRequestBytes: number): PreparedCvRequest {
  const serialized = serializeJevRequest({ ...request }, effectiveModel, maxRequestBytes);
  return { ...serialized, request: JSON.parse(serialized.body) as CvRequest };
}
export function assertPreparedCvRequest(prepared: PreparedCvRequest) {
  if (createHash('sha256').update(prepared.body).digest('hex') !== prepared.hash || JSON.stringify(prepared.request) !== prepared.body) throw new Error('Request bytes/hash mismatch.');
}
export class CvResponseMemoryCache {
  // Separate stores prevent a research/test fixture hit from satisfying live work.
  private readonly stores: Record<CvExecutionMode, BoundedMemoryCache<{ body: string; response: CvChoiceResponse; attemptId: string }>>;
  constructor(maxEntries = 32, maxBytes = 8 * 1024 * 1024) {
    this.stores = { fixture: new BoundedMemoryCache(maxEntries, maxBytes), live: new BoundedMemoryCache(maxEntries, maxBytes) };
  }
  get(mode: CvExecutionMode, prepared: PreparedCvRequest) {
    assertPreparedCvRequest(prepared);
    const hit = this.stores[mode].get(prepared.hash);
    if (hit && hit.body !== prepared.body) throw new Error('Request cache byte mismatch.');
    return hit;
  }
  set(mode: CvExecutionMode, prepared: PreparedCvRequest, raw: unknown, attemptId: string) {
    assertPreparedCvRequest(prepared);
    return this.stores[mode].set(prepared.hash, { body: prepared.body, response: validateCvResponse(prepared.request, raw), attemptId });
  }
}
