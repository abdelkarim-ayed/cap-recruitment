import Reveal from 'reveal.js';
import 'reveal.js/reveal.css';
import 'reveal.js/theme/white.css';

const deck = new Reveal({ hash: true, slideNumber: true, width: 1280, height: 720, pdfSeparateFragments: false });
await deck.initialize();
if (document.querySelector('.mermaid')) {
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' });
  await mermaid.run({ querySelector: '.mermaid' });
}
