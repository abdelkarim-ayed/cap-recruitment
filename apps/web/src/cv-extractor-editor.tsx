import { buildCvQuestion, cvFamilyLabels, cvQuestionSchema, type CvNamedValue, type CvQuestion, type CvQuestionType } from '@recruitment/domain';
import type { ProcessingDefinition } from '@recruitment/domain/vacancies';
import { IconButton } from './icons';

const patterns: Record<CvQuestionType,string> = {
  education_level:'As of <publication date>, what is the highest education level completed [or explicitly expected to be completed within <months> months after that date] [in <scope OR alternative>]? Use evidence in the CV, not an assumption that ongoing study is completed.',
  certification:'Does the CV state that <credential> [(also accept: <alias>; <alias>)] is held or completed? Related work, preparation and planned study do not count.',
  experience_years:'As of <publication date>, how much documented work experience does the CV show [in <scope OR alternative>]? Count overlapping periods once. Use elapsed time, not a count of calendar years. Do not assume a listed skill was used throughout an entire role.',
  skill_coverage:'How many of these supplied items are mentioned or unambiguously described in the CV: <skill> [(also accept: <alias>)]; <skill>? Count each item once. A generic category or related activity does not establish a specific product or skill. This is document coverage, not proficiency.',
  skill_evidence:'What is the strongest explicit evidence for <skill> [(also accept: <alias>; <alias>)] in the CV? Classify evidence context, not proficiency. A list-only mention is not a concrete application; do not infer professional use from nearby employment history.',
};
function newQuestion(type:CvQuestionType):CvQuestion {
  const id=`q_${crypto.randomUUID().slice(0,8)}`;
  if(type==='certification')return {id,type,certification:''};
  if(type==='skill_coverage')return {id,type,skills:['']};
  if(type==='skill_evidence')return {id,type,skill:''};
  return {id,type};
}
function NamedValue({value,label,onChange}:{value:CvNamedValue;label:string;onChange:(value:CvNamedValue)=>void}) {
  const name=typeof value==='string'?value:value.name,aliases=typeof value==='string'?[]:value.aliases??[];
  const changeAliases=(next:string[])=>onChange(next.length?{name,aliases:next}:name);
  return <div><label>{label}<input value={name} onChange={e=>onChange(typeof value==='string'?e.target.value:{...value,name:e.target.value})}/></label>
    <details className="field-advanced" open={aliases.length>0}><summary>Accepted terms / aliases (optional)</summary><p className="small muted">Terms accepted for this target only—not automatic equivalents in both directions.</p>
      {aliases.map((alias,index)=><div className="choice-row" key={index}><label>Accepted term {index+1}<input value={alias} onChange={e=>changeAliases(aliases.map((v,i)=>i===index?e.target.value:v))}/></label><IconButton icon="remove" label={`Remove accepted term ${index+1}`} onClick={()=>changeAliases(aliases.filter((_,i)=>i!==index))}/></div>)}
      <button type="button" onClick={()=>changeAliases([...aliases,''])}>+ Add accepted term</button>
    </details></div>;
}
function ScopeEditor({value,onChange}:{value:string|string[]|undefined;onChange:(value:string|string[]|undefined)=>void}) {
  const values=Array.isArray(value)?value:[value??''];
  return <div><p className="small muted">Scope is optional. Alternatives are OR, not separate added durations.</p>{values.map((item,index)=><div className="choice-row" key={index}><label>{index?'OR scope':'Scope (optional)'}<input value={item} placeholder="Any field / overall work" onChange={e=>{const next=values.map((v,i)=>i===index?e.target.value:v);onChange(next.length===1?next[0]||undefined:next);}}/></label>{values.length>1&&<IconButton icon="remove" label={`Remove scope ${index+1}`} onClick={()=>{const next=values.filter((_,i)=>i!==index);onChange(next.length===1?next[0]||undefined:next);}}/>}</div>)}<button type="button" onClick={()=>onChange([...values,''])}>+ Add OR scope</button></div>;
}
export function CvQuestionPreview({question,referenceDate}:{question:CvQuestion;referenceDate?:string|null}) {
  const parsed=cvQuestionSchema.safeParse(question),date=referenceDate??new Date().toISOString().slice(0,10);
  const preview=parsed.success?buildCvQuestion(parsed.data,date):null;
  return <div className="cv-question-preview"><p className="eyebrow">QUESTION SENT TO JEV</p>{!referenceDate&&<p className="small muted">Provisional preview · using {date}. First publication freezes the date.</p>}
    {preview?<><p className="prewrap">{preview.instructions}</p><details><summary>Answer choices</summary><ul>{Object.entries(preview.criteria).map(([key,text])=><li key={key}>{text}</li>)}</ul></details></>:<p className="small muted">Fill in the arguments above to see the exact question.</p>}
    <details className="field-advanced"><summary>Wording pattern</summary><p className="prewrap">{patterns[question.type]}</p><small>Angle brackets are your arguments; square brackets are optional clauses. The full exact wording appears above once valid.</small></details>
  </div>;
}
export function CvExtractorEditor({task,onChange,onRemove}:{task:ProcessingDefinition['tasks'][number];onChange:(task:ProcessingDefinition['tasks'][number])=>void;onRemove:()=>void}) {
  const update=(index:number,q:CvQuestion)=>onChange({...task,args:{questions:task.args.questions.map((v,i)=>i===index?q:v)}});
  return <div className="cv-extractor-editor"><p>One CV extractor processes these questions together. Results support HR review, not screening decisions.</p>
    {task.args.questions.map((q,index)=><details className="field-editor" key={q.id} open><summary>{index+1}. {cvFamilyLabels[q.type]}</summary><div className="field-body">
      {(q.type==='education_level'||q.type==='experience_years')&&<ScopeEditor value={q.scope} onChange={scope=>update(index,{...q,scope})}/>}
      {q.type==='education_level'&&<label>Expected completion within months (optional)<input type="number" min="0" step="1" placeholder="Completed only" value={q.expected_within_months??''} onChange={e=>update(index,{...q,expected_within_months:e.target.value===''?undefined:Number(e.target.value)})}/><small>Measured from publication. A qualifying level is not proof of an awarded degree.</small></label>}
      {q.type==='certification'&&<NamedValue label="Certification" value={q.certification} onChange={certification=>update(index,{...q,certification})}/>}
      {q.type==='skill_evidence'&&<NamedValue label="Skill" value={q.skill} onChange={skill=>update(index,{...q,skill})}/>}
      {q.type==='skill_coverage'&&<div>{q.skills.map((skill,i)=><div className="choice-row" key={i}><NamedValue label={`Item ${i+1}`} value={skill} onChange={value=>update(index,{...q,skills:q.skills.map((v,j)=>i===j?value:v)})}/><IconButton icon="remove" label={`Remove item ${i+1}`} onClick={()=>update(index,{...q,skills:q.skills.filter((_,j)=>j!==i)})}/></div>)}<button type="button" onClick={()=>update(index,{...q,skills:[...q.skills,'']})}>+ Add item</button><small>Counts document coverage, not proficiency. Up to 254 items.</small></div>}
      <CvQuestionPreview question={q}/><details className="field-advanced"><summary>Field identity</summary><label>Question ID<input value={q.id} onChange={e=>update(index,{...q,id:e.target.value})}/><small>Case-sensitive and unique within this extractor; used in CSV columns.</small></label></details>
      <div className="actions"><button type="button" disabled={index===0} onClick={()=>{const next=[...task.args.questions];[next[index-1],next[index]]=[next[index],next[index-1]];onChange({...task,args:{questions:next}});}}>Move up</button><button type="button" className="danger" onClick={()=>onChange({...task,args:{questions:task.args.questions.filter((_,i)=>i!==index)}})}>Remove question</button></div>
    </div></details>)}
    <label>Add extraction question<select value="" onChange={e=>{if(e.target.value)onChange({...task,args:{questions:[...task.args.questions,newQuestion(e.target.value as CvQuestionType)]}});}}><option value="">Choose question type…</option>{Object.entries(cvFamilyLabels).map(([type,label])=><option key={type} value={type}>{label}</option>)}</select></label>
    <details className="field-advanced"><summary>Export settings</summary><label>Column prefix<input value={task.outputKey} onChange={e=>onChange({...task,outputKey:e.target.value})}/></label></details>
    <button type="button" className="danger" onClick={onRemove}>Remove CV extractor</button>
  </div>;
}
