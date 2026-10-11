import { readdir, readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

// Mermaid sanitizes labels even during parsing. Supply a DOM without launching a browser.
const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });

const directory = new URL('../diagrams/', import.meta.url);
const files = (await readdir(directory)).filter(name => name.endsWith('.mmd')).sort();
if (!files.length) {
  await mermaid.parse('flowchart LR\nA[Tooling check] --> B[Ready]');
  console.log('Mermaid syntax self-check passed; no project diagrams drafted yet.');
}
for (const name of files) {
  await mermaid.parse(await readFile(new URL(name, directory), 'utf8'));
  console.log(`Valid Mermaid: ${name}`);
}
