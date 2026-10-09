import type { ExtractionResult } from '@recruitment/domain';
import type { ExtractedFacts, ExtractionProvider, ExtractionRequest, ProviderExtraction } from './extraction-provider.js';

export interface ExtractionFixture { id: string; result: ExtractionResult<ExtractedFacts> }

export class FixtureExtractionProvider implements ExtractionProvider {
  private readonly fixtures: Record<string, ExtractionFixture>;
  constructor(fixtures: Record<string, ExtractionFixture>) { this.fixtures = structuredClone(fixtures); }
  async extract(request: ExtractionRequest): Promise<ProviderExtraction> {
    const fixture = Object.hasOwn(this.fixtures, request.taskKey) ? this.fixtures[request.taskKey] : undefined;
    return {
      provenance: { mode: 'fixture', fixtureId: fixture?.id ?? 'missing-fixture' },
      result: fixture ? structuredClone(fixture.result) : { status: 'failed', value: null, reason: 'No recorded fixture for this task key.', retryable: false },
    };
  }
}

export class DisabledExtractionProvider implements ExtractionProvider {
  async extract(_request: ExtractionRequest): Promise<ProviderExtraction> {
    return { provenance: { mode: 'disabled' }, result: { status: 'failed', value: null, reason: 'No live extraction provider is configured.', retryable: false } };
  }
}

// Recorded adapter fixture. Does not parse or evaluate the supplied source text.
export const demoExtractionFixtures: Record<string, ExtractionFixture> = {
  'demo-skills': { id: 'demo-skills-v1', result: { status: 'completed', value: { skills: ['SQL', 'TypeScript'] }, evidence: ['FIXTURE ONLY: supplied demonstration facts, not document/model evidence.'] } },
};
