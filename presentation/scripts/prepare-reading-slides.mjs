import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const draft = readFileSync(resolve(root, 'draft.md'), 'utf8');
const matches = [...draft.matchAll(/^## (\d{2}) — (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
const sectionDefinitions = [
  { start: 3, number: '01', name: 'Contexte et problématique', summary: 'Cadre du PFE · Existant · Objectifs et périmètre' },
  { start: 8, number: '02', name: 'Analyse des besoins', summary: 'Acteurs et fonctionnalités · Qualité · Démarche de réalisation' },
  { start: 11, number: '03', name: 'Conception de la solution', summary: 'Modèle métier · Choix techniques · Extraction économique et contrôle humain' },
  { start: 20, number: '04', name: 'Réalisation et parcours', summary: 'Publier · Candidater · Examiner · Décider · Coordonner les intervenants' },
  { start: 29, number: '05', name: 'Validation et bilan', summary: 'Éléments vérifiés · Limites · Perspectives · Conclusion' },
  { start: 35, number: 'A', name: 'Annexes de discussion', summary: 'Évaluation proposée · Règles métier de référence' },
];
const sources = {
  5: 'Panorama documentaire : Greenhouse, Workable, Textkernel. Pas de benchmark comparatif exécuté.',
  16: 'Contrat courant : processing-review-api.md ; cinq familles d’extraction, sorties typées.',
  17: 'Hypothèses utilisateur : ≤ 5 000 tokens d’entrée par requête, 0,05 USD / million ; une requête par extracteur. Repère public : parseur commercial 0,05–0,20 USD/page. Voir cost-model.md.',
  27: 'Sources : docs/current/status.md et docs/journal.md. Vérifications datées et de portée limitée.',
  28: 'Jeu synthétique : cinq offres et vingt-cinq scénarios. Aucune mesure de précision IA déduite.',
  33: 'Protocole proposé : corpus, annotation et critères d’acceptation à convenir avec l’encadrant.',
};
const visualSpecs = {
  'IMG-01': { kind: 'illustration', file: 'IMG-01-contexte-recrutement.png', label: 'Illustration : contexte du recrutement' },
  'DIA-02': { kind: 'diagram', file: 'DIA-02-use-cases.svg', label: 'Cas d’utilisation UML' },
  'DIA-03': { kind: 'diagram', file: 'DIA-03-classes.svg', label: 'Modèle de classes conceptuel' },
  'DIA-04': { kind: 'diagram', file: 'DIA-04-architecture.svg', label: 'Architecture technique' },
  'DIA-05': { kind: 'diagram', file: 'DIA-05-processing.svg', label: 'Chaîne d’extraction documentaire' },
  'DIA-06': { kind: 'diagram', file: 'DIA-06-lifecycle.svg', label: 'Parcours de recrutement' },
  'DIA-07': { kind: 'diagram', file: 'DIA-07-review.svg', label: 'Origine et correction des informations' },
  'CAP-10': { kind: 'capture', file: 'CAP-10-offre-publication.png', label: 'Offre : configuration et publication' },
  'CAP-11': { kind: 'capture', file: 'CAP-11-candidature.png', label: 'Candidat : formulaire et dépôt' },
  'CAP-12': { kind: 'capture', file: 'CAP-12-revue-cv.png', label: 'RH : CV source et correction par champ' },
  'CAP-13': { kind: 'capture', file: 'CAP-13-import-decisions.png', label: 'Présélection : aperçu et confirmation CSV' },
  'CAP-14': { kind: 'capture', file: 'CAP-14-agenda.png', label: 'Entretiens : agenda et rendez-vous' },
  'CAP-15': { kind: 'capture', file: 'CAP-15-decision.png', label: 'Responsable : décision explicite' },
  'CAP-16': { kind: 'capture', file: 'additional-inbox-view.png', label: 'Boîte de réception interne' },
  'CAP-17': { kind: 'capture', file: 'export-csv.png', label: 'Export CSV ouvert dans un tableur' },
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
if (contents.length !== 36 || contents.some((s, i) => s.number !== i + 1)) throw new Error('Expected 36 sequential contents');
// Body text size per content number, where the default 21pt would overflow the
// fixed 4.48in body area. Keep larger only where content is genuinely short.
const bodySizes = { 32: 18, 17: 19, 26: 19, 14: 19 };
for (const content of contents) if (bodySizes[content.number]) content.bodySize = bodySizes[content.number];
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
