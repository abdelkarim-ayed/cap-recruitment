import { z } from 'zod';
import { ProcessingFailure } from './processing-failure.js';

export const CV_PARSER = Object.freeze({
  name: 'pdf-inspector', version: '1.25.2',
  options: Object.freeze({ method: 'processPdfAsync', nativeOnly: true, ocr: false, pages: 'all' }),
});
export const CV_PARSER_LIMITS = Object.freeze({ inputBytes: 10 * 1024 * 1024, pages: 20, markdownCharacters: 60000, diagnosticsBytes: 65536, timeoutMs: 8000 });
const pages = z.array(z.number().int().nonnegative()).max(CV_PARSER_LIMITS.pages);
export const cvParserDiagnosticsSchema = z.strictObject({
  pdfType: z.string(), pageCount: z.number().int().min(1).max(CV_PARSER_LIMITS.pages),
  pagesNeedingOcr: pages, hasEncodingIssues: z.boolean(), pagesWithColumns: pages, pagesWithTables: pages,
  ocrReasonsByPage: z.array(z.json()), cmapGaps: z.array(z.json()),
});
export type CvParserDiagnostics = z.infer<typeof cvParserDiagnosticsSchema>;
export interface CvParserIdentity { name: string; version: string; options: Readonly<Record<string,string|boolean>> }
export interface ParsedCvDocument {
  markdown: string; markdownHash: string; sourceHash: string;
  parser: CvParserIdentity; diagnostics: CvParserDiagnostics;
}
export class CvParserFailure extends ProcessingFailure {
  constructor(message: string, retryable: boolean, readonly diagnostics?: CvParserDiagnostics) {
    super(message, retryable, retryable ? 'operational' : 'ordinary_terminal');
  }
}
export interface CvMarkdownReader { read(bytes: Buffer, signal?: AbortSignal): Promise<ParsedCvDocument> }
