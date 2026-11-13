import { readFile } from 'node:fs/promises';
import { CvPdfReader } from './cv-pdf-reader.js';
// Parse-only: no provider, gateway, credentials or request construction.
const [file, ...extra] = process.argv.slice(2);
if (!file || extra.length) throw new Error('Usage: extraction:probe PDF_PATH. Native parsing only.');
const result = await new CvPdfReader().read(await readFile(file));
console.log(JSON.stringify({ parser: result.parser, markdownCharacters: result.markdown.length, markdownHash: result.markdownHash, diagnostics: result.diagnostics }));
