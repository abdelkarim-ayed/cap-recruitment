import { classifyPdfAsync, processPdfAsync } from '@firecrawl/pdf-inspector';
import { CV_PARSER_LIMITS, cvParserDiagnosticsSchema, type CvParserDiagnostics } from './cv-parser-contract.js';

// Native-only API: do not import/call processPdfWithOcr, load OCR runtime assets
// or inherit credentials. The parent can kill the entire native process.
process.once('message', async (bytes: Buffer) => {
  let diagnostics: CvParserDiagnostics | undefined;
  try {
    const classification = await classifyPdfAsync(bytes);
    if (classification.pageCount > CV_PARSER_LIMITS.pages) throw new Error('PDF exceeds the 20-page extraction limit.');
    const result = await processPdfAsync(bytes);
    diagnostics = cvParserDiagnosticsSchema.parse({
      pdfType: result.pdfType, pageCount: result.pageCount,
      pagesNeedingOcr: result.pagesNeedingOcr, hasEncodingIssues: result.hasEncodingIssues,
      pagesWithColumns: result.pagesWithColumns, pagesWithTables: result.pagesWithTables,
      ocrReasonsByPage: result.ocrReasonsByPage, cmapGaps: result.cmapGaps,
    });
    if (Buffer.byteLength(JSON.stringify(diagnostics)) > CV_PARSER_LIMITS.diagnosticsBytes) throw new Error('PDF diagnostics exceed the extraction limit.');
    if (diagnostics.pagesNeedingOcr.length || !result.markdown?.trim()) throw new Error('PDF has no reliable complete native text layer; OCR is not supported.');
    if (result.markdown.length > CV_PARSER_LIMITS.markdownCharacters) throw new Error('PDF exceeds the 60000-character extraction limit.');
    process.send?.({ markdown: result.markdown, diagnostics });
  } catch (error) {
    const reason = error instanceof Error && /exceeds|exceed|no reliable/.test(error.message) ? error.message : 'PDF is corrupt, encrypted or unsupported.';
    // Bound IPC even on error. Never emit original PDF text/stack/path details.
    process.send?.({ error: reason, diagnostics: diagnostics && Buffer.byteLength(JSON.stringify(diagnostics)) <= CV_PARSER_LIMITS.diagnosticsBytes ? diagnostics : undefined });
  } finally { process.disconnect(); }
});
