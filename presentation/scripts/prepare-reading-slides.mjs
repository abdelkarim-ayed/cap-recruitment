import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const draft = readFileSync(resolve(root, 'draft.md'), 'utf8');
const matches = [...draft.matchAll(/^## (\d{2}) — (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
const sectionDefinitions = [
  { start: 2, number: '01', name: 'Introduction générale', summary: 'Contexte du recrutement · Étude de l’existant · Problématique et solution' },
  { start: 7, number: '02', name: 'Besoins et méthodologie', summary: 'Besoins fonctionnels · Exigences de qualité · Démarche de développement' },
  { start: 11, number: '03', name: 'Conception', summary: 'Cas d’utilisation · Modèle de données · Architecture et choix structurants' },
  { start: 15, number: '04', name: 'Réalisation', summary: 'Candidatures · Extraction et revue RH · Entretiens et décisions' },
  { start: 26, number: '05', name: 'Résultats et contribution', summary: 'Vérifications · Démonstration · Relation avec les ODD' },
  { start: 29, number: '06', name: 'Bilan et perspectives', summary: 'Avancement · Backlog · Conclusion' },
];
const sources = {
  3: 'Ashby (2026), candidatures par embauche ; HR Dive / Ladders (2018), premier examen du CV. Périmètres distincts.',
  4: 'Sources : Greenhouse, Workable, Textkernel (Parser ; Semantic Search & Matching). Revue documentaire des offres.',
  26: 'Vérifications locales : docs/status.md et workflow CI configuré. Contrôles d’intégration exécutés séparément.',
  28: 'Nations unies : ODD 8, cible 8.5. Contribution envisagée ; impact non mesuré.',
};
const visualSpecs = {
  'IMG-01': { kind: 'illustration', file: 'IMG-01-contexte-recrutement.png', label: 'Illustration : contexte du recrutement' },
  'DIA-02': { kind: 'diagram', file: 'DIA-02-use-cases.svg', label: 'Cas d’utilisation UML' },
  'DIA-03': { kind: 'diagram', file: 'DIA-03-classes.svg', label: 'Modèle de classes conceptuel' },
  'DIA-04': { kind: 'diagram', file: 'DIA-04-architecture.svg', label: 'Architecture technique' },
  'CAP-02': { kind: 'capture', file: 'CAP-02-configuration-offre.png', label: 'Configuration d’une offre' },
  'CAP-03': { kind: 'capture', file: 'CAP-03-depot-candidature.png', label: 'Dépôt d’une candidature' },
  'CAP-04': { kind: 'capture', file: 'CAP-04-dossier-rh.png', label: 'Consultation RH' },
  'CAP-05': { kind: 'capture', file: 'CAP-05-correction-rh.png', label: 'Revue et correction RH' },
  'CAP-06': { kind: 'capture', file: 'CAP-06-agenda.png', label: 'Agenda des entretiens' },
};
const contents = matches.map(([, number, title, body]) => {
  const items = [], table = [], placeholders = [], notes = [];
  for (const raw of body.trim().split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('Note orale :')) notes.push(line.slice('Note orale :'.length).trim());
    else if (line.startsWith('`[')) placeholders.push(line.slice(2, -2));
    else if (line.startsWith('|')) {
      if (!/^\|[\s|:-]+\|$/.test(line)) table.push(line.split('|').slice(1, -1).map(cell => cell.trim()));
    } else items.push({ bullet: line.startsWith('- '), text: line.replace(/^- /, '') });
  }
  const n = Number(number);
  const section = sectionDefinitions.findLast(s => s.start <= n);
  const visualId = placeholders.map(p => p.match(/^(IMG-\d+|DIA-\d+|CAP-\d+)/)?.[1]).find(Boolean);
  const visual = visualId ? { id: visualId, ...visualSpecs[visualId] } : null;
  if (visual) {
    visual.path = visual.kind === 'diagram' ? `../dist/diagrams/${visual.file}` : `../assets/images/${visual.file}`;
    visual.available = visual.kind === 'diagram' || existsSync(resolve(root, 'assets/images', visual.file));
  }
  return { number: n, kind: n === 1 ? 'cover' : 'content', title, section: section?.name ?? '', items, table, visual, placeholders, notes, source: sources[n] ?? '' };
});
if (contents.length !== 30 || contents.some((s, i) => s.number !== i + 1)) throw new Error('Expected 30 sequential contents');
const slides = [];
for (const content of contents) {
  const section = sectionDefinitions.find(s => s.start === content.number);
  if (section) slides.push({ kind: 'section', title: section.name, sectionNumber: section.number, summary: section.summary, source: '' });
  slides.push(content);
}
slides.forEach((slide, i) => { slide.page = i + 1; });
mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/reading-slides.json'), JSON.stringify(slides, null, 2));
writeFileSync(resolve(root, 'dist/page-map.md'), `# Pagination du PDF\n\n| Page | Contenu | Visuel |\n|---|---|---|\n${slides.map(s => `| ${s.page} | ${s.kind === 'section' ? 'Section : ' : ''}${s.title} | ${s.visual?.id ?? ''} |`).join('\n')}\n`);
console.log(`Prepared ${contents.length} contents + ${sectionDefinitions.length} section dividers = ${slides.length} pages.`);
