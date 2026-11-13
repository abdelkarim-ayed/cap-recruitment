#!/usr/bin/env node
// Isolated report-tooling check: synthetic content only; no real chapter reads.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parse, bibliography, parserState } from './assemble.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, 'dist/report');
mkdirSync(output, { recursive: true });
const temporary = mkdtempSync(resolve(output, 'renderer-check-'));
try {
  const body = parse(`# Chapitre synthétique

Texte **gras**, *italique*, \`code\`, [site](https://example.org), https://example.org/source et [REF-CHECK-TABLE], [REF-CHECK-HEADING].

## Section

- Une entrée
  - Une entrée imbriquée
1. Première étape

> Citation synthétique.

\`\`\`text
Exemple inerte : #texte
\`\`\`

[[FIG:CAP-12]]
[[FIG:DIA-02]]
[[FIG:RPT-STATES]]
[[FIG:RPT-ER]]
[[FIG:RPT-DEPLOY]]
[[FIG:RPT-PUBLISH]]
[[FIG:RPT-SEQUENCE]]

| Colonne A | Colonne B |
| --- | --- |
${Array.from({ length: 85 }, (_, index) => `| Ligne ${index + 1} | Texte de cellule synthétique suffisamment long pour vérifier le retour à la ligne. |`).join('\n')}
`, 'dist/report/synthetic.md');
  const references = bibliography(`# Registre synthétique

Mention sans définition [REF-CHECK-MENTION] ; convention [REF-*].

| Identifiant | Titre | URL ou chemin dans le dépôt | Affirmation précisément soutenue |
| --- | --- | --- | --- |
| REF-CHECK-TABLE | Source synthétique | \`example/source.md\` | NOTE-EVIDENCE-OMITTED |

### REF-CHECK-HEADING

- **Auteur institutionnel :** Exemple.
- **Titre :** *Document synthétique*.
- **URL :** https://example.org/reference
- **Consultation :** 13 novembre 2026.
- **Ne soutient pas :** NOTE-EVIDENCE-OMITTED
`, 'dist/report/synthetic-references.md');
  const state = parserState();
  assert.deepEqual(state.bibliographyKeys, ['REF-CHECK-HEADING', 'REF-CHECK-TABLE']);
  assert.equal(references.length, 2);
  assert.ok(!JSON.stringify(references).includes('NOTE-EVIDENCE-OMITTED'));
  assert.ok(body.some((node) => node.type === 'paragraph' && node.children.some((child) => child.type === 'link')));
  assert.equal(state.figures.find((figure) => figure.id === 'RPT-STATES').title, 'États des tâches et des tentatives d’envoi');
  for (const figure of state.figures.filter((item) => item.id.startsWith('RPT-') && item.available)) {
    assert.ok(figure.sizing.dedicatedPage);
    assert.ok(figure.sizing.heightMm <= 230 && figure.sizing.heightMm > 200);
    assert.ok(figure.sizing.widthMm <= 160);
  }
  const data = {
    schemaVersion: 2, partial: false, missingChapters: [], emptyChapters: [], missingReferences: [],
    bibliographyKeys: state.bibliographyKeys, unresolvedCitations: [], warnings: [],
    frontmatter: [{ source: 'synthetic', blocks: parse('# Résumé synthétique\n\nRésumé.\n\n## Glossaire\n\nTerme : définition.', 'dist/report/synthetic-frontmatter.md') }],
    chapters: [{ source: 'synthetic', blocks: body }],
    references: [{ source: 'synthetic', blocks: references }],
  };
  const json = resolve(temporary, 'fixture.json');
  writeFileSync(json, `${JSON.stringify(data, null, 2)}\n`);
  const input = `report-data=/${relative(root, json)}`;
  const invoke = (args) => {
    const result = spawnSync(process.execPath, ['scripts/typst.mjs', ...args, '--root', '.', '--input', input], { cwd: root, encoding: 'utf8' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Typst exited ${result.status}`);
    if (result.stderr.trim()) console.warn(result.stderr.trim());
    return result.stdout;
  };
  invoke(['compile', 'report/pdf/main.typ', resolve(temporary, 'fixture.pdf')]);
  const value = JSON.parse(invoke(['query', 'report/pdf/main.typ', '<report-main-body-pages>', '--field', 'value', '--one']));
  assert.ok(Number.isInteger(value.main_body_pages) && value.main_body_pages > 0);
  console.log(`Synthetic renderer compile/query passed (${value.main_body_pages} body pages). No real chapter content was read.`);
} finally {
  // Only this invocation's newly created ignored fixture directory is removed.
  rmSync(temporary, { recursive: true, force: true });
}
