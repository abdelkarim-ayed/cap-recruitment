// Minimal synthetic text-native PDF with accurate cross-reference offsets.
export function syntheticPdf(text = 'SQL and TypeScript projects') {
  const stream = `BT /F1 12 Tf 50 750 Td (${text.replace(/[\\()]/g, '\\$&')}) Tj ET`;
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
  let pdf = '%PDF-1.7\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

// Text-native pages with explicit WinAnsi encoding, not UTF-8 PDF literals.
// Supports ASCII and Latin-1 printable characters (including French accents),
// deliberately rejecting other Unicode instead of silently corrupting it.
export function syntheticPdfPages(pages) {
  if (!Array.isArray(pages) || pages.length === 0) throw new TypeError('Expected at least one page.');
  const literal = text => [...text].map(character => {
    const code = character.codePointAt(0);
    if (code >= 0xa0 && code <= 0xff) return `\\${code.toString(8).padStart(3, '0')}`;
    if (code < 0x20 || code > 0x7e) throw new TypeError('Fixture supports printable ASCII and Latin-1 only.');
    return /[\\()]/.test(character) ? `\\${character}` : character;
  }).join('');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${4 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];
  for (const text of pages) {
    // Wide pages keep even the character-limit fixtures inside the page bounds.
    const stream = `BT /F1 1 Tf 10 750 Td (${literal(text)}) Tj ET`;
    const contentId = objects.length + 2;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100000 800] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    );
  }
  let pdf = '%PDF-1.7\n';
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}
