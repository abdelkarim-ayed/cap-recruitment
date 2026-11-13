// Vector compilation only. Never imports application code or runs tests.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { instance } from '@viz-js/viz';

const names = ['RPT-ER', 'RPT-DEPLOY', 'RPT-PUBLISH', 'RPT-SEQUENCE', 'RPT-STATES'];
const viz = await instance();
for (const name of names) {
  const source = new URL(`${name}.dot`, import.meta.url);
  const result = viz.render(readFileSync(source, 'utf8'), { format: 'svg', engine: 'dot' });
  if (result.status !== 'success' || result.errors?.some(e => e.level === 'error')) {
    throw new Error(`${name}: ${JSON.stringify(result.errors)}`);
  }
  const box = /viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/.exec(result.output);
  if (!box) throw new Error(`${name}: missing vector viewBox`);
  const widthPt = Number(box[3]), heightPt = Number(box[4]);
  // Never enlarge a small figure. Constrain to the A4 portrait content area.
  const widthMm = Math.min(160, widthPt * 25.4 / 72, 240 * widthPt / heightPt);
  const heightMm = widthMm * heightPt / widthPt;
  const svg = result.output.replace(/width="[^"]+" height="[^"]+"/,
    `width="${widthMm.toFixed(2)}mm" height="${heightMm.toFixed(2)}mm"`);
  const target = new URL(`${name}.svg`, import.meta.url);
  writeFileSync(target, svg);
  const fonts = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => Number(m[1]));
  const minPt = Math.min(...fonts) * widthMm * 72 / 25.4 / widthPt;
  if (minPt < 8) throw new Error(`${name}: text would be smaller than 8 pt; split or simplify the DOT`);
  console.log(`${fileURLToPath(target)}: ${widthMm.toFixed(1)} × ${heightMm.toFixed(1)} mm; smallest text ~${minPt.toFixed(1)} pt`);
  for (const issue of result.errors ?? []) console.warn(`${name}: ${JSON.stringify(issue)}`);
}
