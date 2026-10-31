import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// A child process keeps untrusted parsing off the API event loop.
process.once('message', async (bytes: Buffer) => {
  try {
    const loading = getDocument({ data: new Uint8Array(bytes), disableFontFace: true, useSystemFonts: false, stopAtErrors: true });
    try {
      const pdf = await loading.promise;
      if (pdf.numPages > 20) throw new Error('PDF exceeds the 20-page extraction limit.');
      const pages: string[] = [];
      let length = 0;
      for (let number = 1; number <= pdf.numPages; number++) {
        const page = await pdf.getPage(number);
        const content = await page.getTextContent();
        const text = content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim();
        length += text.length;
        if (length > 60000) throw new Error('PDF exceeds the 60000-character extraction limit.');
        pages.push(text); page.cleanup();
      }
      if (!pages.join('').trim()) throw new Error('PDF has no readable text layer; OCR is not supported.');
      process.send?.({ text: pages.join('\n\n') });
    } finally { await loading.destroy(); }
  } catch (error) {
    const reason = error instanceof Error && /exceeds|no readable text/.test(error.message) ? error.message : 'PDF is corrupt, encrypted or unsupported.';
    process.send?.({ error: reason });
  } finally { process.disconnect(); }
});
