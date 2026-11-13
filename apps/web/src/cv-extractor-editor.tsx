import { useRef } from 'react';
import { buildCvQuestion, cvFamilyLabels, cvQuestionSchema, type CvNamedValue, type CvQuestion, type CvQuestionType } from '@recruitment/domain';
import type { ProcessingDefinition } from '@recruitment/domain/vacancies';
import { IconButton } from './icons';
import { suggestedQuestionId, uniqueFieldId } from './cv-field-identity';

function newQuestion(type: CvQuestionType): CvQuestion {
  if (type === 'certification') return { id: 'certification', type, certification: '' };
  if (type === 'skill_coverage') return { id: 'skill_coverage', type, skills: [''] };
  if (type === 'skill_evidence') return { id: 'skill_evidence', type, skill: '' };
  return { id: type, type };
}
const nameOf = (value: CvNamedValue) => typeof value === 'string' ? value : value.name;
function NamedValue({ value, label, placeholder, onChange, onBlur, before, after }: {
  value: CvNamedValue; label: string; placeholder: string; onChange: (value: CvNamedValue) => void; onBlur?: () => void; before?: string; after?: string;
}) {
  const name = nameOf(value), aliases = typeof value === 'string' ? [] : value.aliases ?? [];
  const changeAliases = (next: string[]) => onChange(next.length ? { name, aliases: next } : name);
  return <div className="cv-named-target">
    <div className="cv-sentence">{before}<input className="cv-sentence-input" aria-label={label} placeholder={placeholder} value={name} onBlur={onBlur} onChange={e => onChange(typeof value === 'string' ? e.target.value : { ...value, name: e.target.value })}/>{after}</div>
    <details className="cv-accepted-terms" open={aliases.length > 0}><summary>Also accept other keywords</summary>
      {aliases.map((alias, index) => <div className="choice-row" key={index}><input aria-label={`${label}: accepted keyword ${index + 1}`} placeholder="Another name or abbreviation" value={alias} onChange={e => changeAliases(aliases.map((v, i) => i === index ? e.target.value : v))}/><IconButton icon="remove" label={`Remove accepted keyword ${index + 1}`} onClick={() => changeAliases(aliases.filter((_, i) => i !== index))}/></div>)}
      <button type="button" className="compact" onClick={() => changeAliases([...aliases, ''])}>+ Add keyword</button>
    </details>
  </div>;
}
function ScopeEditor({ value, onChange, onBlur }: { value: string | string[] | undefined; onChange: (value: string | string[] | undefined) => void; onBlur: () => void }) {
  const values = Array.isArray(value) ? value : [value ?? ''];
  const change = (next: string[]) => onChange(next.length === 1 ? next[0] || undefined : next);
  return <span className="cv-scope">{values.map((item, index) => <span className="cv-scope-item" key={index}>{index > 0 && <span>or</span>}<input className="cv-sentence-input" aria-label={`Scope ${index + 1}`} value={item} placeholder="any scope" onBlur={onBlur} onChange={e => change(values.map((v, i) => i === index ? e.target.value : v))}/>{values.length > 1 && <IconButton icon="remove" label={`Remove scope ${index + 1}`} onClick={() => change(values.filter((_, i) => i !== index))}/>}</span>)}<button type="button" className="cv-inline-action" onClick={() => onChange([...values, ''])}>+ or</button></span>;
}
function ReferenceDate({ date }: { date: string }) {
  return <input className="cv-sentence-input cv-reference-date" type="date" aria-label="Reference date, set when published" title="Set when the vacancy is published" value={date} readOnly/>;
}
function readableQuestion(question: CvQuestion, date: string) {
  if (question.type === 'skill_evidence') return `What’s the strongest evidence for ${nameOf(question.skill)} in this CV?`;
  if (question.type === 'certification') return `Does this CV show ${nameOf(question.certification)} as held or completed?`;
  if (question.type === 'skill_coverage') return `How many of these skills are mentioned in the CV: ${question.skills.map(nameOf).join(', ')}?`;
  const scope = question.scope ? ` in ${Array.isArray(question.scope) ? question.scope.join(' or ') : question.scope}` : '';
  if (question.type === 'experience_years') return `As of ${date}, how much work experience is documented${scope}?`;
  return `As of ${date}, what’s the highest completed education level${scope}${question.expected_within_months ? `, including completion expected within ${question.expected_within_months} months` : ''}?`;
}
function TechnicalQuestion({ question, date }: { question: CvQuestion; date: string }) {
  const parsed = cvQuestionSchema.safeParse(question), preview = parsed.success ? buildCvQuestion(parsed.data, date) : null;
  return <details className="field-advanced cv-technical-question"><summary>Technical wording and answer options</summary>{preview ? <><p className="prewrap">{preview.instructions}</p><ul>{Object.values(preview.criteria).map((text, index) => <li key={index}>{text}</li>)}</ul></> : <p className="small muted">Complete the question to view its wording.</p>}</details>;
}
export function CvQuestionPreview({ question, referenceDate }: { question: CvQuestion; referenceDate?: string | null }) {
  const date = referenceDate ?? new Date().toISOString().slice(0, 10);
  return <div className="cv-question-preview"><p>{readableQuestion(question, date)}</p><TechnicalQuestion question={question} date={date}/></div>;
}
export function CvExtractorEditor({ task, onChange, onRemove }: { task: ProcessingDefinition['tasks'][number]; onChange: (task: ProcessingDefinition['tasks'][number]) => void; onRemove: () => void }) {
  // Only questions added in this mounted draft get automatic names. Imported/
  // saved IDs remain untouched. Freeze a generated name on leaving its target.
  const fresh = useRef(new Set<string>());
  const rowKeys = useRef(new Map<string, string>());
  const date = new Date().toISOString().slice(0, 10);
  const update = (index: number, question: CvQuestion) => onChange({ ...task, args: { questions: task.args.questions.map((v, i) => i === index ? question : v) } });
  const finishIdentity = (index: number) => {
    const question = task.args.questions[index];
    if (!fresh.current.has(question.id)) return;
    if (question.type === 'skill_evidence' && !nameOf(question.skill).trim() || question.type === 'certification' && !nameOf(question.certification).trim()) return;
    const nextId = uniqueFieldId(suggestedQuestionId(question), task.args.questions.filter((_, i) => i !== index).map(q => q.id));
    fresh.current.delete(question.id);
    rowKeys.current.set(nextId, rowKeys.current.get(question.id) ?? question.id);
    if (nextId !== question.id) update(index, { ...question, id: nextId });
  };
  return <div className="cv-extractor-editor">
    {task.args.questions.map((q, index) => {
      if (!rowKeys.current.has(q.id)) rowKeys.current.set(q.id, q.id);
      return <section className="cv-question-editor" key={rowKeys.current.get(q.id)} aria-label={`${cvFamilyLabels[q.type]} question ${index + 1}`}>
        <div className="cv-question-heading"><span className="small muted">{index + 1}. {cvFamilyLabels[q.type]}</span><div className="actions"><IconButton icon="up" label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => { const next = [...task.args.questions]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange({ ...task, args: { questions: next } }); }}/><IconButton icon="remove" label={`Remove question ${index + 1}`} onClick={() => onChange({ ...task, args: { questions: task.args.questions.filter((_, i) => i !== index) } })}/></div></div>
        {q.type === 'skill_evidence' && <NamedValue label="Skill" placeholder="e.g. SQL" before="What’s the strongest evidence for " after=" in this CV?" value={q.skill} onChange={skill => update(index, { ...q, skill })} onBlur={() => finishIdentity(index)}/>}
        {q.type === 'certification' && <NamedValue label="Certification" placeholder="e.g. AWS Certified Developer" before="Does this CV show " after=" as held or completed?" value={q.certification} onChange={certification => update(index, { ...q, certification })} onBlur={() => finishIdentity(index)}/>}
        {(q.type === 'education_level' || q.type === 'experience_years') && <>
          <div className="cv-sentence">As of <ReferenceDate date={date}/>, {q.type === 'education_level' ? 'what’s the highest completed education level in ' : 'how much work experience is documented in '}<ScopeEditor value={q.scope} onChange={scope => update(index, { ...q, scope })} onBlur={() => finishIdentity(index)}/>&nbsp;?</div>
          {q.type === 'education_level' && <details className="cv-accepted-terms" open={!!q.expected_within_months}><summary>Include expected qualifications</summary><label className="cv-sentence">Also include completion expected within <input className="cv-sentence-input cv-months" aria-label="Expected completion within months" type="number" min="0" step="1" placeholder="0" value={q.expected_within_months ?? ''} onChange={e => update(index, { ...q, expected_within_months: e.target.value === '' ? undefined : Number(e.target.value) })}/> months.</label></details>}
        </>}
        {q.type === 'skill_coverage' && <><p className="cv-sentence">How many of these skills are mentioned in the CV?</p><div className="cv-coverage-items">{q.skills.map((skill, i) => <div className="choice-row" key={i}><NamedValue label={`Skill ${i + 1}`} placeholder="e.g. Python" value={skill} onChange={value => update(index, { ...q, skills: q.skills.map((v, j) => i === j ? value : v) })}/><IconButton icon="remove" label={`Remove skill ${i + 1}`} onClick={() => update(index, { ...q, skills: q.skills.filter((_, j) => j !== i) })}/></div>)}<button type="button" className="compact" disabled={q.skills.length >= 254} onClick={() => update(index, { ...q, skills: [...q.skills, ''] })}>+ Add skill</button></div></>}
        <details className="field-advanced cv-field-settings"><summary>Result field settings</summary><label>Review / CSV field ID<input value={q.id} onChange={e => { fresh.current.delete(q.id); rowKeys.current.set(e.target.value, rowKeys.current.get(q.id) ?? q.id); update(index, { ...q, id: e.target.value }); }}/></label><p className="small muted">CSV column: <code>{task.outputKey}.question.{q.id}</code></p><TechnicalQuestion question={q} date={date}/></details>
      </section>;
    })}
    <label className="cv-add-question">Add a question<select value="" onChange={e => {
      if (!e.target.value) return;
      const question = newQuestion(e.target.value as CvQuestionType);
      question.id = uniqueFieldId(suggestedQuestionId(question), task.args.questions.map(q => q.id));
      fresh.current.add(question.id);
      onChange({ ...task, args: { questions: [...task.args.questions, question] } });
    }}><option value="">Choose what to look for…</option>{Object.entries(cvFamilyLabels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select></label>
    <details className="field-advanced"><summary>Export settings</summary><label>Column prefix<input value={task.outputKey} onChange={e => onChange({ ...task, outputKey: e.target.value })}/></label></details>
    <button type="button" className="danger" onClick={onRemove}>Remove CV extractor</button>
  </div>;
}
