// Records environment key NAMES only, never values or inherited credentials.
process.once('message', () => {
  process.send({ markdown: Object.keys(process.env).sort().join(','), diagnostics: {
    pdfType: 'TextBased', pageCount: 1, pagesNeedingOcr: [], hasEncodingIssues: false,
    pagesWithColumns: [], pagesWithTables: [], ocrReasonsByPage: [], cmapGaps: [],
  } });
  process.disconnect();
});
