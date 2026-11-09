import { z } from 'zod';

export type ScreeningDecision = 'preselected' | 'rejected';
export interface ScreeningInput {
  key: number; applicationId: string; email: string; decision: string; reason: string;
  parseIssues?: string[];
}
export interface ScreeningRow extends ScreeningInput {
  state: 'valid' | 'invalid' | 'decided'; issue: string | null;
  candidate: { name: string; email: string } | null; revision: number | null;
  issues?: string[]; duplicateKeys?: number[];
}
export interface ScreeningPreview { rows: ScreeningRow[] }
export interface ScreeningSelection {
  applicationId: string; email: string; decision: ScreeningDecision; reason?: string; expectedRevision: number;
}
export const screeningLimits = { rows: 1000, bytes: 10 * 1024 * 1024, cell: 256 * 1024 } as const;

// Bounded RFC-style comma CSV. No expression evaluation or delimiter guessing.
export function parseScreeningCsv(source: string): ScreeningInput[] {
  if (source.length > screeningLimits.bytes) throw new Error('CSV exceeds 10 MiB.');
  const text = source.replace(/^\uFEFF/, '');
  const records: string[][] = [];
  let record: string[] = [], cell = '', quoted = false, closed = false;
  const field = () => {
    if(new TextEncoder().encode(cell).byteLength>screeningLimits.cell)throw new Error('CSV cell limit exceeded.');
    record.push(cell); cell = ''; closed = false;
  };
  const row = () => {
    field();
    if (record.some(value => value.trim() !== '')) records.push(record);
    record = [];
    if (records.length > screeningLimits.rows + 1) throw new Error('CSV exceeds 1,000 data rows.');
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { quoted = false; closed = true; }
      } else cell += c;
    } else if (c === ',') field();
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row(); }
    else if (c === '"' && !cell && !closed) quoted = true;
    else {
      if (closed || c === '"') throw new Error('Malformed CSV quoting.');
      cell += c;
    }
    if (cell.length > screeningLimits.cell || record.length > 10000) throw new Error('CSV cell or column limit exceeded.');
  }
  if (quoted) throw new Error('Unclosed CSV quote.');
  if (cell || record.length || closed) row();
  const headers = records.shift();
  if (!headers || new Set(headers).size !== headers.length) throw new Error('CSV requires unique headers.');
  for (const required of ['application_id', 'candidate_email', 'decision']) {
    if (!headers.includes(required)) throw new Error(`CSV requires ${required}.`);
  }
  if (!records.length) throw new Error('CSV contains no decision rows.');
  const index = (name: string) => headers.indexOf(name);
  return records.map((values, i) => ({
    key: i + 2, applicationId: values[index('application_id')]?.trim().toLowerCase() ?? '',
    email: values[index('candidate_email')]?.trim().toLowerCase() ?? '',
    decision: values[index('decision')]?.trim() ?? '',
    reason: values[index('reason')]?.trim() ?? '',
    ...(values.length===headers.length?{}:{parseIssues:[`Record has ${values.length} columns; the header has ${headers.length}. Fix the CSV row width.`]}),
  }));
}

export function screeningRowIssues(row:ScreeningInput):string[]{
  const issues=[...(row.parseIssues??[])];
  if(!z.uuid().safeParse(row.applicationId).success)issues.push('Application ID must be a valid UUID.');
  if(!z.email().max(320).safeParse(row.email).success)issues.push('A valid candidate account email is required.');
  if(!['preselected','rejected'].includes(row.decision))issues.push('Decision must be exactly preselected or rejected.');
  if(row.reason.length>2000)issues.push('Internal reason exceeds 2,000 characters.');
  return issues;
}
// Duplicates are proposals to resolve explicitly, not intrinsically invalid input.
// Apply still refuses any duplicate IDs in the final included set.
export function screeningIssues(rows: ScreeningInput[]): Map<number, string> {
  const issues = new Map<number, string>();
  for (const row of rows) {
    const found=screeningRowIssues(row);
    if (found.length) issues.set(row.key, found.join(' '));
  }
  return issues;
}
