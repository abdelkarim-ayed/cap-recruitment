#!/usr/bin/env node
// Static, dependency-free assembly. Never executes Markdown, HTML, or remote assets.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const presentation = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(presentation, 'dist/report');
const chapterNames = [
  '00-introduction',
  '01-cadre-objectifs-demarche',
  '02-besoins-solutions-existantes',
  '03-conception-metier-donnees-garanties',
  '04-architecture-realisation',
  '05-assistance-documentaire-supervision',
  '06-verification-demonstration-discussion',
  '07-conclusion-perspectives',
  '08-resume-mots-cles-glossaire',
];
const bibliographyPath = 'report/references.bib';
const figureDefinitions = {
  'DIA-02': ['dist/diagrams/DIA-02-use-cases.svg', 'Acteurs et cas d’utilisation'],
  'DIA-03': ['dist/diagrams/DIA-03-classes.svg', 'Modèle métier conceptuel'],
  'DIA-04': ['dist/diagrams/DIA-04-architecture-report.svg', 'Architecture actuelle'],
  'DIA-05': ['dist/diagrams/DIA-05-processing.svg', 'Extraction documentaire'],
  'DIA-06': ['dist/diagrams/DIA-06-lifecycle.svg', 'Parcours de recrutement'],
  'DIA-07': ['dist/diagrams/DIA-07-review.svg', 'Source, correction et valeur effective'],
  'RPT-ER': ['report/diagrams/RPT-ER.svg', 'Modèle relationnel et garanties de données'],
  'RPT-DEPLOY': ['report/diagrams/RPT-DEPLOY.svg', 'Déploiement et frontières techniques'],
  'RPT-PUBLISH': ['report/diagrams/RPT-PUBLISH.svg', 'Publication et gel de la configuration'],
  'RPT-SEQUENCE': ['report/diagrams/RPT-SEQUENCE.svg', 'Séquence de traitement documentaire'],
  'RPT-STATES': ['report/diagrams/RPT-STATES.svg', 'États des tâches et des tentatives d’envoi'],
  'CAP-10': ['assets/images/CAP-10-offre-publication.png', 'Publication de l’offre'],
  'CAP-11': ['assets/images/CAP-11-candidature.png', 'Dépôt de candidature'],
  'CAP-12': ['assets/images/CAP-12-revue-cv.png', 'Examen et correction du CV'],
  'CAP-13': ['assets/images/CAP-13-import-decisions.png', 'Import et confirmation des décisions'],
  'CAP-14': ['assets/images/CAP-14-agenda.png', 'Agenda des entretiens'],
  'CAP-15': ['assets/images/CAP-15-decision.png', 'Décision de recrutement'],
  'CAP-16': ['assets/images/additional-inbox-view.png', 'Boîte de réception interne'],
  'CAP-17': ['assets/images/export-csv.png', 'Export CSV ouvert dans un tableur'],
};

const slash = (value) => value.replaceAll('\\', '/');
const cleanText = (value) => value.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '');
const refKeys = new Set();
const citedKeys = new Set();
const referencedLabels = new Set();
const figures = [];
const warnings = [];

function safeAsset(destination, source) {
  const raw = destination.replace(/^<|>$/g, '');
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) || isAbsolute(raw)) return null;
  const full = resolve(dirname(resolve(presentation, source)), raw);
  const rel = slash(relative(presentation, full));
  if (rel === '..' || rel.startsWith('../')) return null;
  return rel;
}

// Inline nodes deliberately stay data, not Typst source. Unsupported syntax is text.
function inline(value) {
  const nodes = [];
  let i = 0;
  const text = (s) => {
    if (!s) return;
    if (nodes.at(-1)?.type === 'text') nodes.at(-1).text += s;
    else nodes.push({ type: 'text', text: s });
  };
  while (i < value.length) {
    const tail = value.slice(i);
    let match;
    if ((match = /^\\([\\`*_[\]{}()#+.!|>-])/.exec(tail))) {
      text(match[1]); i += match[0].length; continue;
    }
    if ((match = /^(`+)([\s\S]*?)\1(?!`)/.exec(tail))) {
      nodes.push({ type: 'code', text: match[2] }); i += match[0].length; continue;
    }
    if ((match = /^\[\[REF:([A-Za-z0-9_.:-]+)\]\]/.exec(tail))) {
      referencedLabels.add(match[1]);
      nodes.push({ type: 'reference', target: match[1] });
      i += match[0].length; continue;
    }
    if ((match = /^\[((?:REF-[A-Za-z0-9_.:-]+)(?:\s*[;,]\s*REF-[A-Za-z0-9_.:-]+)+)\](?!\()/.exec(tail))) {
      for (const [index, key] of match[1].split(/\s*[;,]\s*/).entries()) {
        if (index) text(' ');
        citedKeys.add(key);
        nodes.push({ type: 'citation', key });
      }
      i += match[0].length; continue;
    }
    if ((match = /^\[\[?(REF-[A-Za-z0-9_.:-]+)\]?\](?!\()/.exec(tail))) {
      citedKeys.add(match[1]);
      nodes.push({ type: 'citation', key: match[1] }); i += match[0].length; continue;
    }
    if ((match = /^\[([^\]]+)\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/.exec(tail))) {
      nodes.push({ type: 'link', href: match[2].replace(/^<|>$/g, ''), children: inline(match[1]) });
      i += match[0].length; continue;
    }
    if ((match = /^<(https?:\/\/[^>]+)>/.exec(tail))) {
      nodes.push({ type: 'link', href: match[1], children: [{ type: 'text', text: match[1] }] });
      i += match[0].length; continue;
    }
    if ((match = /^https?:\/\/[^\s<>]+/.exec(tail))) {
      const href = match[0].replace(/[.,;:!?]+$/, '');
      nodes.push({ type: 'link', href, children: [{ type: 'text', text: href }] });
      i += href.length; continue;
    }
    if (tail.startsWith('**') || tail.startsWith('__')) {
      const delimiter = tail.slice(0, 2);
      const end = tail.indexOf(delimiter, 2);
      if (end > 2) {
        nodes.push({ type: 'strong', children: inline(tail.slice(2, end)) });
        i += end + 2; continue;
      }
    }
    if ((tail[0] === '*' || tail[0] === '_') && (i === 0 || !/[\p{L}\p{N}]/u.test(value[i - 1]))) {
      const end = tail.indexOf(tail[0], 1);
      if (end > 1) {
        nodes.push({ type: 'emphasis', children: inline(tail.slice(1, end)) });
        i += end + 1; continue;
      }
    }
    text(value[i++]);
  }
  return nodes;
}

function tableCells(line) {
  let value = line.trim();
  if (value.startsWith('|')) value = value.slice(1);
  if (value.endsWith('|') && !value.endsWith('\\|')) value = value.slice(0, -1);
  const result = [];
  let cell = '';
  let code = false;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '\\' && value[i + 1] === '|') { cell += '|'; i++; }
    else if (value[i] === '`') { code = !code; cell += value[i]; }
    else if (value[i] === '|' && !code) { result.push(cell.trim()); cell = ''; }
    else cell += value[i];
  }
  result.push(cell.trim());
  return result;
}

const isTableRule = (line) => line && tableCells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
const listMatch = (line) => /^(\s*)([-+*]|\d+[.)])\s+(.*)$/.exec(line);
const figureMatch = (line) => /^\s*\[\[FIG:([A-Za-z0-9_-]+)\]\](?:\s+(.+))?\s*$/.exec(line);

function svgSizing(path, id) {
  if (!path.toLowerCase().endsWith('.svg')) return null;
  // Read vector header metadata only. No rasterization or visual inspection.
  const header = /<svg\b[^>]*>/s.exec(readFileSync(resolve(presentation, path), 'utf8'))?.[0];
  if (!header) return null;
  const attribute = (name) => new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i').exec(header)?.[1];
  const mm = (value) => {
    const match = /^([\d.]+)\s*(mm|cm|pt|px|in)?$/.exec(value ?? '');
    return match ? Number(match[1]) * ({ mm: 1, cm: 10, pt: 25.4 / 72, px: 25.4 / 96, in: 25.4 }[match[2] ?? 'px']) : null;
  };
  const box = attribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
  const ratio = box?.length === 4 && box[2] > 0 && box[3] > 0 ? box[2] / box[3] : null;
  let width = mm(attribute('width'));
  let height = mm(attribute('height'));
  if (!width && height && ratio) width = height * ratio;
  if (!height && width && ratio) height = width / ratio;
  if (!width && !height && ratio) { width = 160; height = width / ratio; }
  if (!(width > 0 && height > 0)) return null;
  const scale = Math.min(1, 160 / width, (id === 'DIA-03' ? 150 : 205) / height);
  const rounded = (value) => Math.floor(value * 1000) / 1000;
  return {
    naturalWidthMm: rounded(width), naturalHeightMm: rounded(height),
    widthMm: rounded(width * scale), heightMm: rounded(height * scale),
  };
}

function addFigure(id, source, line, caption, explicitPath) {
  const definition = figureDefinitions[id];
  const path = explicitPath ?? definition?.[0] ?? `report/diagrams/${id}.svg`;
  const available = existsSync(resolve(presentation, path));
  const title = caption || definition?.[1] || id;
  const figure = { id, path, title, available, source, line, kind: id.startsWith('CAP-') ? 'screenshot' : 'diagram',
    sizing: available ? svgSizing(path, id) : null };
  figures.push(figure);
  return { type: 'figure', ...figure };
}

export function parse(markdown, source) {
  const lines = cleanText(markdown).split('\n');
  const blocks = [];
  let pendingTable;
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    let match;
    if (!line.trim() || /^\s*<!--.*-->\s*$/.test(line)) { i++; continue; }
    if ((match = /^\[\[LABEL:([A-Za-z0-9_.:-]+)\]\]\s*$/.exec(line.trim()))) {
      if (blocks.at(-1)?.type !== 'heading') throw new Error(`${source}:${i + 1}: LABEL requires a preceding heading`);
      blocks.at(-1).id = match[1];
      i++; continue;
    }
    if ((match = /^\[\[TABLE:([A-Za-z0-9_.:-]+)\]\]\s+(.+)$/.exec(line.trim()))) {
      pendingTable = { id: match[1], caption: match[2] };
      i++; continue;
    }
    if (/^\s*<!--/.test(line)) {
      while (i < lines.length && !lines[i].includes('-->')) i++;
      i++; continue;
    }
    if ((match = /^\s*(`{3,}|~{3,})(\S*)\s*$/.exec(line))) {
      const fence = match[1][0];
      const size = match[1].length;
      const body = [];
      i++;
      while (i < lines.length && !new RegExp(`^\\s*${fence}{${size},}\\s*$`).test(lines[i])) body.push(lines[i++]);
      if (i === lines.length) warnings.push(`${source}: unclosed code fence`);
      else i++;
      blocks.push({ type: 'code', language: match[2], text: body.join('\n') });
      continue;
    }
    if ((match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line))) {
      blocks.push({ type: 'heading', level: match[1].length, children: inline(match[2]) });
      i++; continue;
    }
    if ((match = figureMatch(line))) {
      const sourceLine = i + 1;
      let next = i + 1;
      while (next < lines.length && !lines[next].trim()) next++;
      const description = /^\*Figure\s*[—:]\s*(.*?)\*\s*$/.exec(lines[next] ?? '');
      blocks.push(addFigure(match[1], source, sourceLine, match[2] || description?.[1]));
      i = description ? next + 1 : i + 1; continue;
    }
    if ((match = /^\s*!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)\s*$/.exec(line))) {
      const path = safeAsset(match[2], source);
      if (path && /\.(svg|png|jpe?g|gif|webp)$/i.test(path)) {
        blocks.push(addFigure(`LOCAL-${figures.length + 1}`, source, i + 1, match[1], path));
      } else {
        warnings.push(`${source}:${i + 1}: remote/unsupported image not fetched: ${match[2]}`);
        blocks.push({ type: 'paragraph', children: inline(`Visuel non intégré : ${match[1]} (${match[2]})`) });
      }
      i++; continue;
    }
    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: 'rule' }); i++; continue;
    }
    if (line.includes('|') && isTableRule(lines[i + 1])) {
      const headers = tableCells(line);
      const rules = tableCells(lines[i + 1]);
      const rawRows = [];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        const row = tableCells(lines[i++]);
        if (row.length !== headers.length) warnings.push(`${source}:${i}: table row width differs from header`);
        rawRows.push(row);
      }
      const width = Math.max(headers.length, ...rawRows.map((row) => row.length));
      while (headers.length < width) headers.push('');
      while (rules.length < width) rules.push('---');
      const rows = rawRows.map((row) => headers.map((_, index) => inline(row[index] ?? '')));
      const preceding = [...blocks].reverse().find((node) => node.type === 'heading');
      const subject = preceding ? plain(preceding.children).replace(/^\d+(?:\.\d+)*\.?\s+/, '') : 'Synthèse';
      blocks.push({ type: 'table', headers: headers.map(inline), rows,
        align: rules.map((rule) => rule.startsWith(':') && rule.endsWith(':') ? 'center' : rule.endsWith(':') ? 'right' : 'left'),
        caption: pendingTable?.caption ?? subject,
        id: pendingTable?.id ?? `table-${source.split('/').at(-1).replace('.md', '')}-${blocks.filter(node => node.type === 'table').length + 1}` });
      pendingTable = undefined;
      continue;
    }
    if (listMatch(line)) {
      const entries = [];
      while (i < lines.length) {
        const item = listMatch(lines[i]);
        if (!item) break;
        let raw = item[3];
        const indent = item[1].replaceAll('\t', '    ').length;
        const ordered = /^\d/.test(item[2]);
        i++;
        // Indented continuation belongs to this entry; nested list markers stay separate.
        while (i < lines.length && lines[i].trim() && !listMatch(lines[i]) && /^\s+/.test(lines[i])) raw += ` ${lines[i++].trim()}`;
        entries.push({ depth: Math.floor(indent / 2), ordered, marker: item[2], children: inline(raw) });
      }
      blocks.push({ type: 'list', entries }); continue;
    }
    if (/^\s*>/.test(line)) {
      const quote = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''));
      blocks.push({ type: 'quote', blocks: parse(quote.join('\n'), source) });
      continue;
    }
    const paragraph = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim()) {
      if (/^\s*(#{1,6}\s|`{3,}|~{3,}|>|<!--|\[\[(?:TABLE|LABEL):)/.test(lines[i]) || listMatch(lines[i]) || figureMatch(lines[i]) ||
          /^\s*!\[/.test(lines[i]) || (lines[i].includes('|') && isTableRule(lines[i + 1])) || /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(lines[i])) break;
      paragraph.push(lines[i++].trim());
    }
    const raw = paragraph.join(' ');
    blocks.push({ type: 'paragraph', children: inline(raw) });
  }
  return blocks;
}

export function parserState() {
  return { bibliographyKeys: [...refKeys].sort(), citedKeys: [...citedKeys].sort(), figures: [...figures], warnings: [...warnings] };
}

function plain(nodes) {
  return nodes.map((node) => node.type === 'citation' ? `[${node.key}]` : node.type === 'link'
    ? node.href : node.children ? plain(node.children) : node.text ?? '').join('');
}

function main() {
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--partial' && arg !== '--help')) {
  console.error('Usage: node report/scripts/assemble.mjs [--partial]');
  process.exitCode = 2;
  return;
}
if (args.includes('--help')) {
  console.log('Assemble existing report Markdown into dist/report/report.json and figures.json.\nMissing required chapters are fatal unless --partial is explicit. No PDF compilation.');
  return;
}
const partial = args.includes('--partial');
const bibliographyText = readFileSync(resolve(presentation, bibliographyPath), 'utf8');
for (const match of bibliographyText.matchAll(/@\w+\s*\{\s*([^\s,]+)\s*,/g)) refKeys.add(match[1]);
const required = chapterNames.map((name) => `report/chapters/${name}.md`);
const missing = required.filter((path) => !existsSync(resolve(presentation, path)));
const empty = required.filter((path) => existsSync(resolve(presentation, path)) && !readFileSync(resolve(presentation, path), 'utf8').trim());
if (!partial && (missing.length || empty.length)) {
  console.error(`Assembly refused; missing/empty required chapters:\n${[...missing, ...empty].map((path) => `  ${path}`).join('\n')}\nUse --partial only for an explicitly incomplete editorial build.`);
  process.exit(1);
}
const sections = required.filter((path) => !missing.includes(path) && !empty.includes(path)).map((path) => ({
  source: path,
  blocks: parse(readFileSync(resolve(presentation, path), 'utf8'), path),
}));
// Keep semantic headings and stable labels in the data. Typst owns all chapter,
// section, figure/table and citation numbering, as well as page references.
const slug = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
for (const section of sections) {
  const chapter = Number(/\/(0[1-6])-/.exec(section.source)?.[1]) || null;
  const prefix = chapter ? `chapter-${chapter}` : section.source.includes('/00-') ? 'introduction' : section.source.includes('/07-') ? 'conclusion' : 'frontmatter';
  for (const node of section.blocks) {
    if (node.type !== 'heading') continue;
    const title = plain(node.children).replace(/^Chapitre\s+\d+\s*[—–-]\s*/i, '').replace(/^\d+(?:\.\d+)*\.?\s+/, '');
    node.numbered = chapter !== null && !/^(?:Introduction|Conclusion(?: du chapitre)?)$/i.test(title);
    node.children = inline(title);
    node.id ??= node.level === 1 ? prefix : `${prefix}-${slug(title)}`;
  }
}
const frontmatter = sections.filter((section) => section.source.endsWith('/08-resume-mots-cles-glossaire.md'));
const chapters = sections.filter((section) => !frontmatter.includes(section));
const bodyCitations = [...citedKeys];
const unresolvedCitations = bodyCitations.filter((key) => !refKeys.has(key)).sort();
const labels = sections.flatMap(section => section.blocks).filter(node => node.id).map(node => node.id);
if (new Set(labels).size !== labels.length) throw new Error('Duplicate heading/figure/table label. Use an explicit LABEL marker.');
const unresolvedLabels = [...referencedLabels].filter(key => !labels.includes(key));
if (unresolvedCitations.length || unresolvedLabels.length) throw new Error(`Unresolved references: ${[...unresolvedCitations, ...unresolvedLabels].join(', ')}`);
const data = {
  schemaVersion: 3,
  partial: partial || missing.length > 0 || empty.length > 0,
  missingChapters: missing,
  emptyChapters: empty,
  bibliographyPath,
  bibliographyKeys: [...refKeys].sort(),
  citedKeys: bodyCitations,
  referencedLabels: [...referencedLabels],
  unresolvedCitations,
  unresolvedLabels,
  frontmatter,
  chapters,
  warnings,
};
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'report.json'), `${JSON.stringify(data, null, 2)}\n`);
writeFileSync(resolve(output, 'figures.json'), `${JSON.stringify({ schemaVersion: 1, figures }, null, 2)}\n`);
console.log(`Assembled ${sections.length}/${required.length} required files (${chapters.length} body, ${frontmatter.length} frontmatter); ${figures.length} figure occurrences (${figures.filter((item) => !item.available).length} missing assets).`);
console.log('Wrote presentation/dist/report/report.json and figures.json. This is not an editorial completeness or page-count check.');
for (const warning of warnings) console.warn(`Warning: ${warning}`);
}

// Importing the parser for isolated tooling checks never reads chapter files.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
