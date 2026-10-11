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
const defaults = `graph [rankdir=LR, bgcolor="transparent", pad=0.22, nodesep=0.45, ranksep=0.8, fontname="Liberation Sans"];
node [fontname="Liberation Sans", fontsize=18, color="#0f766e", fontcolor="#172b4d", penwidth=1.3];
edge [fontname="Liberation Sans", fontsize=14, color="#64748b", fontcolor="#475569", penwidth=1.2];`;
const classDot = `graph Classes {
${defaults}
${classes.map(c => `${c.id} [shape=plain, label=<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="12" COLOR="#0f766e"><TR><TD BGCOLOR="#e0f2f1"><B>${escape(c.title)}</B></TD></TR><HR/><TR><TD ALIGN="LEFT">${c.fields.map(escape).join('<BR ALIGN="LEFT"/>')}</TD></TR></TABLE>>];`).join('\n')}
${associations.map(([a, b, from, to]) => `${a} -- ${b} [taillabel=${q(from)}, headlabel=${q(to)}, labeldistance=2, labelangle=25];`).join('\n')}
}`;
const classMermaid = `%% Generated from models.mjs; conceptual UML, selected relationships only.
classDiagram
direction LR
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
  Correction: ['valeur', 'auteur', 'date'],
  Etape: ['ordre', 'consignes'],
  Entretien: ['date', 'interviewer', 'notes', 'score', 'passFail'],
};
const actualClassMermaid = classMermaid.replace(/class (\w+)\["([^"]+)"\] \{[^}]+\}/g,
  (_, id, title) => `class ${id}["${title}"] {\n${members[id].map(m => `  ${m}`).join('\n')}\n}`);
const archDot = `digraph Architecture {
${defaults}
node [shape=box, style="rounded,filled", fillcolor="#f0f7f6", margin="0.22,0.17"];
${components.map(c => `${c.id} [label=${q(`${c.title}\n${c.detail}`)}${c.group === 'future' ? ', style="rounded,dashed,filled", fillcolor="#fff8eb", color="#b7791f"' : ''}${c.id === 'Db' ? ', shape=cylinder' : ''}];`).join('\n')}
${flows.map(([a, b, label, future]) => `${a} -> ${b} [label=${q(label)}${future ? ', style=dashed, color="#b7791f"' : ''}];`).join('\n')}
}`;
const archMermaid = `%% Generated from models.mjs. Dashed links denote future integration.
flowchart LR
${components.map(c => `  ${c.id}["${c.title}<br/>${c.detail}"]`).join('\n')}
${flows.map(([a, b, label, future]) => `  ${a} ${future ? '-.->' : '-->'}${label ? `|${label}|` : ''} ${b}`).join('\n')}
  classDef future fill:#fff8eb,stroke:#b7791f,stroke-dasharray:5 5
  class Live future
`;
for (const [name, dot, mermaid] of [
  ['DIA-03-classes', classDot, actualClassMermaid],
  ['DIA-04-architecture', archDot, archMermaid],
]) {
  writeFileSync(resolve(source, `${name}.dot`), `${dot}\n`);
  writeFileSync(resolve(source, `${name}.mmd`), mermaid);
}
const viz = await instance();
for (const name of ['DIA-02-use-cases', 'DIA-03-classes', 'DIA-04-architecture']) {
  const dot = readFileSync(resolve(source, `${name}.dot`), 'utf8');
  const svg = viz.renderString(dot, { format: 'svg', engine: 'dot' });
  writeFileSync(resolve(output, `${name}.svg`), svg);
  console.log(`Rendered ${name}.svg (Graphviz/WASM, no browser)`);
}
