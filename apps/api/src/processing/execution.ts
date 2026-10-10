import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';

export interface ExecutionContext { applicationId: string; documentId: string; sourceHash: string; taskId: string; args: { skills: string[]; evidence: boolean }; fixtureKey?: string }
export const taskResultSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('completed'), value: z.strictObject({ skills: z.array(z.string().trim().min(1).max(100)).max(100) }), evidence: z.array(z.string().max(2000)).max(100) }),
  z.strictObject({ status: z.literal('failed'), value: z.null(), reason: z.string().min(1).max(2000), retryable: z.boolean() }),
]);
export type TaskResult = z.infer<typeof taskResultSchema>;
export interface ExecutionResult { result: TaskResult; provenance: { mode: 'fixture' | 'disabled'; fixtureId?: string } }
export interface DocumentTextReader { read(bytes: Buffer, context: ExecutionContext): Promise<string> }
export interface TaskExecutor { execute(text: string, context: ExecutionContext): Promise<ExecutionResult> }
export const DOCUMENT_TEXT_READER = Symbol('DOCUMENT_TEXT_READER');
export const TASK_EXECUTOR = Symbol('TASK_EXECUTOR');
export const FIXTURE_REGISTRY = Symbol('FIXTURE_REGISTRY');
const fixtureSchema = z.strictObject({ fixtureKey: z.string().min(1).max(200), applicationId: z.uuid(), documentId: z.uuid(), sourceHash: z.string().regex(/^[a-f0-9]{64}$/), taskId: z.string(), args: z.strictObject({ skills: z.array(z.string()), evidence: z.boolean() }), text: z.string().max(1000000), result: taskResultSchema });
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
  text(bytes: Buffer, context: ExecutionContext) {
    this.calls.push({ unit: 'text', context: structuredClone(context) });
    const fixture = this.resolve(context);
    if (createHash('sha256').update(bytes).digest('hex') !== fixture.sourceHash) throw new Error('Fixture document bytes mismatch.');
    return fixture.text;
  }
  result(text: string, context: ExecutionContext): ExecutionResult {
    this.calls.push({ unit: 'task', context: structuredClone(context), textHash: createHash('sha256').update(text).digest('hex') });
    const fixture = this.resolve(context);
    if (fixture.text !== text) throw new Error('Fixture text relay mismatch.');
    return { provenance: { mode: 'fixture', fixtureId: fixture.fixtureKey }, result: structuredClone(fixture.result) };
  }
}
export class DisabledTextReader implements DocumentTextReader {
  async read(_bytes: Buffer, _context: ExecutionContext): Promise<string> { throw new Error('No document text reader configured; mock-only checkpoint.'); }
}
export class DisabledTaskExecutor implements TaskExecutor {
  async execute(_text: string, _context: ExecutionContext): Promise<ExecutionResult> { return { provenance: { mode: 'disabled' }, result: { status: 'failed', value: null, reason: 'No live task executor configured.', retryable: false } }; }
}
// Global normal adapters plus trusted per-unit dispatch; never request-controlled.
export class ContextTextReader implements DocumentTextReader {
  constructor(private readonly normal: DocumentTextReader, private readonly fixtures: FixtureRegistry) {}
  async read(bytes: Buffer, context: ExecutionContext) { return context.fixtureKey === undefined ? this.normal.read(bytes, context) : this.fixtures.text(bytes, context); }
}
export class ContextTaskExecutor implements TaskExecutor {
  constructor(private readonly normal: TaskExecutor, private readonly fixtures: FixtureRegistry) {}
  async execute(text: string, context: ExecutionContext) { return context.fixtureKey === undefined ? this.normal.execute(text, context) : this.fixtures.result(text, context); }
}
