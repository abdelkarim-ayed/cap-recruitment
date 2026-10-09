import type { ExtractionResult } from '@recruitment/domain';

// Integration seam only, not the final vacancy task schema or an HTTP API.
export interface ExtractionRequest { taskKey: string; sourceText: string }
export type ExtractedFacts = Record<string, unknown>;
export type ExtractionProvenance =
  | { mode: 'disabled' }
  | { mode: 'fixture'; fixtureId: string }
  | { mode: 'live'; provider: string; model?: string };
export interface ProviderExtraction {
  provenance: ExtractionProvenance;
  result: ExtractionResult<ExtractedFacts>;
}
export interface ExtractionProvider { extract(request: ExtractionRequest): Promise<ProviderExtraction> }
export const EXTRACTION_PROVIDER = Symbol('EXTRACTION_PROVIDER');
