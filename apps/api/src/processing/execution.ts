import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import type { ProcessingDefinition } from '@recruitment/domain/vacancies';

export type SkillExtractionArgs = ProcessingDefinition['tasks'][number]['args'];
export interface ExecutionContext { applicationId: string; documentId: string; sourceHash: string; taskId: string; args: SkillExtractionArgs; fixtureKey?: string; signal?: AbortSignal }
export const taskResultSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('completed'), value: z.strictObject({ skills: z.array(z.string().trim().min(1).max(100)).max(100) }), evidence: z.array(z.string().max(2000)).max(100) }),
  z.strictObject({ status: z.literal('failed'), value: z.null(), reason: z.string().min(1).max(2000), retryable: z.boolean() }),
]);
export type TaskResult = z.infer<typeof taskResultSchema>;
export interface ExecutionResult { result: TaskResult; provenance: { mode: 'fixture' | 'disabled' | 'live'; fixtureId?: string; provider?: string; model?: string; method?: string; textHash?: string; usage?: { input_tokens: number; output_tokens: number }; reader?: string } }
export interface DocumentTextReader { read(bytes: Buffer, context: ExecutionContext): Promise<string>; describe?(context: ExecutionContext): string }
export interface TaskExecutor { execute(text: string, context: ExecutionContext): Promise<ExecutionResult>; describe?(context: ExecutionContext): ExecutionResult['provenance'] }
export const DOCUMENT_TEXT_READER = Symbol('DOCUMENT_TEXT_READER');
export const TASK_EXECUTOR = Symbol('TASK_EXECUTOR');
export const FIXTURE_REGISTRY = Symbol('FIXTURE_REGISTRY');
const fixtureSchema = z.strictObject({ fixtureKey: z.string().min(1).max(200), applicationId: z.uuid(), documentId: z.uuid(), sourceHash: z.string().regex(/^[a-f0-9]{64}$/), taskId: z.string(), args: z.strictObject({ skills: z.array(z.string()), evidence: z.boolean() }), reader: z.literal('pdf').optional(), text: z.string().max(1000000), result: taskResultSchema });
export type TaskFixture = z.infer<typeof fixtureSchema>;

export class FixtureRegistry {
  private readonly fixtures = new Map<string, TaskFixture>();
  readonly calls: { unit: 'text' | 'task'; context: ExecutionContext; textHash?: string }[] = [];
  load(raw: unknown) {
    if (process.env.NODE_ENV === 'production') throw new Error('Fixtures forbidden in production.');
    const fixtures = z.array(fixtureSchema).max(1000).parse(raw);
    if (new Set(fixtures.map(f => f.fixtureKey)).size !== fixtures.length) throw new Error('Duplicate fixture key.');
    if (new Set(fixtures.map(f => `${f.applicationId}:${f.taskId}`)).size !== fixtures.length) throw new Error('Duplicate application/task fixture.');
    this.fixtures.clear(); fixtures.forEach(f => this.fixtures.set(f.fixtureKey, structuredClone(f)));
    return fixtures;
  }
  private resolve(context: ExecutionContext) {
    const fixture = context.fixtureKey ? this.fixtures.get(context.fixtureKey) : undefined;
    if (!fixture) throw new Error('Missing trusted fixture; no fallback permitted.');
    if (fixture.applicationId !== context.applicationId || fixture.documentId !== context.documentId || fixture.sourceHash !== context.sourceHash || fixture.taskId !== context.taskId || !isDeepStrictEqual(fixture.args, context.args)) throw new Error('Fixture source identity or task arguments mismatch.');
    return fixture;
  }
  usesPdf(context: ExecutionContext) { return this.resolve(context).reader === 'pdf'; }
  text(bytes: Buffer, context: ExecutionContext) {
    const { signal: _signal, ...recorded } = context;
    this.calls.push({ unit: 'text', context: structuredClone(recorded) });
    const fixture = this.resolve(context);
    if (createHash('sha256').update(bytes).digest('hex') !== fixture.sourceHash) throw new Error('Fixture document bytes mismatch.');
    return fixture.text;
  }
  result(text: string, context: ExecutionContext): ExecutionResult {
    const { signal: _signal, ...recorded } = context;
    this.calls.push({ unit: 'task', context: structuredClone(recorded), textHash: createHash('sha256').update(text).digest('hex') });
    const fixture = this.resolve(context);
    if (fixture.text !== text) throw new Error('Fixture text relay mismatch.');
    return { provenance: { mode: 'fixture', fixtureId: fixture.fixtureKey }, result: structuredClone(fixture.result) };
  }
}
export class DisabledTextReader implements DocumentTextReader {
  async read(_bytes: Buffer, _context: ExecutionContext): Promise<string> { throw new Error('No document text reader configured; mock-only checkpoint.'); }
}
export class DisabledTaskExecutor implements TaskExecutor {
  describe(): ExecutionResult['provenance'] { return { mode: 'disabled' }; }
  async execute(_text: string, _context: ExecutionContext): Promise<ExecutionResult> { return { provenance: { mode: 'disabled' }, result: { status: 'failed', value: null, reason: 'No live task executor configured.', retryable: false } }; }
}
// Global normal adapters plus trusted per-unit dispatch; never request-controlled.
export class ContextTextReader implements DocumentTextReader {
  constructor(private readonly normal: DocumentTextReader, private readonly fixtures: FixtureRegistry) {}
  describe(context: ExecutionContext) { return context.fixtureKey === undefined ? (this.normal.describe?.(context) ?? 'disabled') : (this.fixtures.usesPdf(context) ? (this.normal.describe?.(context) ?? 'disabled') : 'fixture'); }
  async read(bytes: Buffer, context: ExecutionContext) {
    if (context.fixtureKey === undefined) return this.normal.read(bytes, context);
    const expected = this.fixtures.text(bytes, context);
    if (!this.fixtures.usesPdf(context)) return expected;
    const actual = await this.normal.read(bytes, context);
    if (actual !== expected) throw new Error('Real PDF text differs from trusted fixture text.');
    return actual;
  }
}
export class ContextTaskExecutor implements TaskExecutor {
  constructor(private readonly normal: TaskExecutor, private readonly fixtures: FixtureRegistry) {}
  describe(context: ExecutionContext): ExecutionResult['provenance'] { return context.fixtureKey === undefined ? (this.normal.describe?.(context) ?? { mode: 'disabled' }) : { mode: 'fixture', fixtureId: context.fixtureKey }; }
  async execute(text: string, context: ExecutionContext) { return context.fixtureKey === undefined ? this.normal.execute(text, context) : this.fixtures.result(text, context); }
}
