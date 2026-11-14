import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { instance } from '@viz-js/viz';
import { classes, associations, components, flows } from '../diagrams/models.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(root, 'diagrams');
const output = resolve(root, 'dist/diagrams');
mkdirSync(output, { recursive: true });
const q = JSON.stringify;
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const defaults = `graph [rankdir=LR, bgcolor="transparent", pad=0.15, nodesep=0.3, ranksep=0.45, fontname="Liberation Sans", splines=polyline];
node [fontname="Liberation Sans", fontsize=22, color="#0f766e", fontcolor="#172b4d", penwidth=1.3];
edge [fontname="Liberation Sans", fontsize=18, color="#64748b", fontcolor="#475569", penwidth=1.2];`;
const classDot = `graph Classes {
${defaults.replace('rankdir=LR', 'rankdir=TB').replace('nodesep=0.3, ranksep=0.45', 'nodesep=0.65, ranksep=0.9')}
${classes.map(c => `${c.id} [shape=plain, label=<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="#0f766e"><TR><TD BGCOLOR="#e0f2f1"><B>${escape(c.title)}</B></TD></TR><HR/><TR><TD ALIGN="LEFT">${c.fields.map(escape).join('<BR ALIGN="LEFT"/>')}</TD></TR></TABLE>>];`).join('\n')}
{rank=same; Offre; Etape;}
{rank=same; Candidature; Entretien;}
{rank=same; Document; Tache;}
Offre -- Candidature -- Document -- Correction [style=invis];
Etape -- Entretien -- Tache [style=invis];
${associations.map(([a, b, from, to]) => `${a} -- ${b} [taillabel=${q(from)}, headlabel=${q(to)}, labeldistance=2.2, labelangle=35, constraint=false];`).join('\n')}
}`;
const classMermaid = `%% Generated from models.mjs; conceptual UML, selected relationships only.
classDiagram
direction TB
${classes.map(c => `class ${c.id}["${c.title}"] {\n${c.fields.map((_, i) => `  ${['details', 'suivi'][i]}`).join('\n')}\n}`).join('\n')}
${associations.map(([a, b, from, to]) => `${a} "${from}" -- "${to}" ${b}`).join('\n')}
`;
// Attribute descriptions remain comments to avoid Mermaid treating accents/spaces
// as method signatures; actual class members use simple technical labels below.
const members = {
  Offre: ['titre', 'statut', 'formulaire', 'traitement'],
  Candidature: ['reponsesFigees', 'progressionInterne'],
  Document: ['fichierPrive', 'empreinte'],
  Tache: ['source', 'parametres', 'etat', 'resultatOriginal'],
  Correction: ['questionId', 'valeur', 'auteur', 'date'],
  Etape: ['ordre', 'consignes'],
  Entretien: ['date', 'interviewer', 'notes', 'score', 'passFail'],
};
const actualClassMermaid = classMermaid.replace(/class (\w+)\["([^"]+)"\] \{[^}]+\}/g,
  (_, id, title) => `class ${id}["${title}"] {\n${members[id].map(m => `  ${m}`).join('\n')}\n}`);
const archDot = `digraph Architecture {
${defaults}
node [shape=box, style="rounded,filled", fillcolor="#f0f7f6", margin="0.22,0.17"];
${components.map(c => `${c.id} [label=${q(`${c.title}\n${c.detail}`)}${c.group === 'external' ? ', fillcolor="#fff8eb", color="#b7791f"' : ''}${c.id === 'Data' ? ', shape=cylinder' : ''}];`).join('\n')}
{rank=same; Web; Mail;}
${flows.map(([a, b, label]) => `${a} -> ${b} [label=${q(label)}${b === 'Mail' ? ', constraint=false' : ''}];`).join('\n')}
}`;
const archMermaid = `%% Generated from models.mjs. Implemented components, not runtime/quality acceptance.
flowchart LR
${components.map(c => `  ${c.id}["${c.title}<br/>${c.detail}"]`).join('\n')}
${flows.map(([a, b, label]) => `  ${a} -->${label ? `|${label.replaceAll('\n', '<br/>')}|` : ''} ${b}`).join('\n')}
  classDef external fill:#fff8eb,stroke:#b7791f
  class Live external
`;
for (const [name, dot, mermaid] of [
  ['DIA-03-classes', classDot, actualClassMermaid],
  ['DIA-04-architecture', archDot, archMermaid],
]) {
  writeFileSync(resolve(source, `${name}.dot`), `${dot}\n`);
  writeFileSync(resolve(source, `${name}.mmd`), mermaid);
}
const viz = await instance();
// Same semantic model, portrait-oriented arrangement for the A4 report only.
// The presentation keeps its existing wide architecture layout.
const reportArchDot = archDot.replace('rankdir=LR', 'rankdir=TB')
  .replace('{rank=same; Web; Mail;}', '{rank=same; Data; Extraction; Mail;}')
  .replaceAll(', constraint=false', '');
writeFileSync(resolve(output, 'DIA-04-architecture-report.svg'), viz.renderString(reportArchDot, { format: 'svg', engine: 'dot' }));
for (const name of ['DIA-02-use-cases', 'DIA-03-classes', 'DIA-04-architecture', 'DIA-05-processing', 'DIA-06-lifecycle', 'DIA-07-review']) {
  const dot = readFileSync(resolve(source, `${name}.dot`), 'utf8');
  const svg = viz.renderString(dot, { format: 'svg', engine: 'dot' });
  writeFileSync(resolve(output, `${name}.svg`), svg);
  console.log(`Rendered ${name}.svg (Graphviz/WASM, no browser)`);
}
