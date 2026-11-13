import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import { buildCvRequest, cvExtractorArgsSchema, cvReferenceDateSchema, type CvExtractorArgs, type CvFieldValue } from '@recruitment/domain';
import { normalizeCvResponse } from './cv-response.js';
import type { ParsedCvDocument } from './cv-parser-contract.js';
import { ProcessingFailure } from './processing-failure.js';
import { serializeJevRequest } from '../integrations/jev/jev-request.js';

export interface ExecutionContext { applicationId: string; documentId: string; sourceHash: string; taskId: string; token: string; referenceDate: string; args: CvExtractorArgs; fixtureKey?: string; signal?: AbortSignal }
const failure = z.strictObject({ status: z.literal('failed'), value: z.null(), reason: z.string().min(1).max(2000), retryable: z.boolean(), failureCategory: z.enum(['ordinary_terminal','operational','uncertain','unclassified']).optional(), rawResponse: z.unknown().optional() });
const fieldValue = z.union([z.string(), z.boolean(), z.number().int().nonnegative()]);
export const taskResultSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('completed'), value: z.strictObject({ version: z.literal(1), fields: z.record(z.string(), fieldValue), rawResponse: z.unknown() }) }), failure,
]);
export type TaskResult = z.infer<typeof taskResultSchema>;
export interface ExecutionResult { result: TaskResult; provenance: { mode: 'fixture' | 'disabled' | 'live'; fixtureId?: string; provider?: string; model?: string; reader?: string; parser?: unknown; diagnostics?: unknown; sourceHash?: string; markdownHash?: string; referenceDate?: string; requestHash?: string; requestBody?: string; attemptId?: string; cacheHit?: boolean; usage?: { input_tokens: number; output_tokens: number } } }
export interface DocumentMarkdownReader { read(bytes: Buffer, context: ExecutionContext): Promise<ParsedCvDocument> }
export interface TaskExecutor { execute(document: ParsedCvDocument, context: ExecutionContext): Promise<ExecutionResult>; describe?(context: ExecutionContext): ExecutionResult['provenance']; isReady?(): boolean }
export const DOCUMENT_MARKDOWN_READER = Symbol('DOCUMENT_MARKDOWN_READER');
export const TASK_EXECUTOR = Symbol('TASK_EXECUTOR');
export const FIXTURE_REGISTRY = Symbol('FIXTURE_REGISTRY');
const fixtureSchema = z.strictObject({
  fixtureKey: z.string().min(1).max(200), applicationId: z.uuid(), documentId: z.uuid(), sourceHash: z.string().regex(/^[a-f0-9]{64}$/), taskId: z.string(),
  referenceDate: cvReferenceDateSchema, args: cvExtractorArgsSchema, reader: z.literal('pdf').optional(), markdown: z.string().min(1).max(60000),
  result: z.union([z.strictObject({ status: z.literal('completed'), response: z.json() }), failure]),
});
export type TaskFixture = z.infer<typeof fixtureSchema>;

export class FixtureRegistry {
  private readonly fixtures = new Map<string, TaskFixture>();
  load(raw: unknown) {
    if (process.env.NODE_ENV === 'production') throw new Error('Fixtures forbidden in production.');
    const fixtures = z.array(fixtureSchema).max(1000).parse(raw);
    if (new Set(fixtures.map(f => f.fixtureKey)).size !== fixtures.length || new Set(fixtures.map(f => `${f.applicationId}:${f.taskId}`)).size !== fixtures.length) throw new Error('Duplicate fixture identity.');
    for (const f of fixtures) if (f.result.status === 'completed') normalizeCvResponse(f.args, buildCvRequest(f.args, f.markdown, f.referenceDate, 'jev-1.14.0'), f.result.response);
    this.fixtures.clear(); fixtures.forEach(f => this.fixtures.set(f.fixtureKey, structuredClone(f)));
    return fixtures;
  }
  resolve(context: ExecutionContext) {
    const fixture = context.fixtureKey ? this.fixtures.get(context.fixtureKey) : undefined;
    if (!fixture) throw new ProcessingFailure('Missing trusted fixture; no fallback permitted.', false);
    if (fixture.applicationId !== context.applicationId || fixture.documentId !== context.documentId || fixture.sourceHash !== context.sourceHash || fixture.taskId !== context.taskId || fixture.referenceDate !== context.referenceDate || !isDeepStrictEqual(fixture.args, context.args)) throw new ProcessingFailure('Fixture source/configuration/date mismatch.', false);
    return fixture;
  }
  document(bytes: Buffer, context: ExecutionContext): ParsedCvDocument {
    const f = this.resolve(context);
    if (createHash('sha256').update(bytes).digest('hex') !== f.sourceHash) throw new ProcessingFailure('Fixture document bytes mismatch.', false);
    return { markdown: f.markdown, markdownHash: createHash('sha256').update(f.markdown).digest('hex'), sourceHash: f.sourceHash, parser: {name:'fixture_only_not_parsed',version:'1',options:{method:'declared',nativeOnly:false,ocr:false,pages:'not_parsed'}},
      diagnostics: { pdfType: 'fixture_only_not_parsed', pageCount: 1, pagesNeedingOcr: [], hasEncodingIssues: false, pagesWithColumns: [], pagesWithTables: [], ocrReasonsByPage: [], cmapGaps: [] } };
  }
  result(document: ParsedCvDocument, context: ExecutionContext): ExecutionResult {
    const f = this.resolve(context);
    if (f.markdown !== document.markdown) throw new ProcessingFailure('Fixture Markdown relay mismatch.', false);
    const request=buildCvRequest(f.args,document.markdown,context.referenceDate,'jev-1.14.0');
    const serialized=serializeJevRequest({...request},request.model,60000);
    const result: TaskResult = f.result.status === 'completed' ? { status: 'completed', value: normalizeCvResponse(f.args, request, f.result.response) } : { ...structuredClone(f.result), failureCategory: f.result.failureCategory ?? (f.result.retryable ? 'operational' : 'ordinary_terminal') };
    return { result, provenance: { mode: 'fixture', fixtureId: f.fixtureKey, reader: f.reader ? 'pdf-inspector@1.25.2' : 'fixture_only_not_parsed', parser:document.parser, diagnostics: document.diagnostics, sourceHash: context.sourceHash, markdownHash: document.markdownHash, referenceDate: context.referenceDate, requestHash:serialized.hash,requestBody:serialized.body,model:request.model } };
  }
}
export class ContextMarkdownReader implements DocumentMarkdownReader {
  constructor(private readonly normal: { read(bytes: Buffer, signal?: AbortSignal): Promise<ParsedCvDocument> } | undefined, private readonly fixtures: FixtureRegistry) {}
  async read(bytes: Buffer, context: ExecutionContext) {
    if (context.fixtureKey !== undefined) {
      const expected = this.fixtures.document(bytes, context);
      if (!this.fixtures.resolve(context).reader) return expected;
      if (!this.normal) throw new ProcessingFailure('Native PDF reader is disabled.', false);
      const actual = await this.normal.read(bytes, context.signal);
      if (actual.markdown !== expected.markdown) throw new ProcessingFailure('Real PDF Markdown differs from trusted fixture.', false);
      return actual;
    }
    if (!this.normal) throw new ProcessingFailure('Native PDF reader is disabled.', false);
    return this.normal.read(bytes, context.signal);
  }
}
export class DisabledTaskExecutor implements TaskExecutor {
  isReady() { return false; }
  describe(): ExecutionResult['provenance'] { return { mode: 'disabled' }; }
  async execute(): Promise<ExecutionResult> { throw new ProcessingFailure('CV extraction executor is disabled.', false); }
}
export class ContextTaskExecutor implements TaskExecutor {
  constructor(private readonly normal: TaskExecutor, private readonly fixtures: FixtureRegistry) {}
  isReady() { return this.normal.isReady?.() ?? true; }
  describe(context: ExecutionContext): ExecutionResult['provenance'] { return context.fixtureKey === undefined ? this.normal.describe?.(context) ?? { mode: 'disabled' } : { mode: 'fixture', fixtureId: context.fixtureKey }; }
  execute(document: ParsedCvDocument, context: ExecutionContext) { return context.fixtureKey === undefined ? this.normal.execute(document, context) : Promise.resolve(this.fixtures.result(document, context)); }
}
