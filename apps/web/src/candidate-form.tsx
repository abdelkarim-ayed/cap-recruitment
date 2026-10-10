import { useState } from 'react';
import type { FormDefinition } from '@recruitment/domain/vacancies';
import { validateSubmission } from '@recruitment/domain/applications';
import { api, errorMessage, go } from './api';
import { Notice } from './ui';

export function CandidateForm({vacancy,preview=false}:{vacancy:{id:string;form:FormDefinition};preview?:boolean}) {
  const [answers,setAnswers]=useState<Record<string,any>>({}),[files,setFiles]=useState<Record<string,File>>({}),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const answer=(id:string,value:unknown)=>setAnswers(current=>{const next={...current};if(value===undefined)delete next[id];else next[id]=value;return next;});
  return <section className="card"><h2>{preview?'Candidate form preview':'Your application'}</h2><p>{preview?'Preview only. No application will be submitted.':'Answers and documents are locked after submission. One application per account and vacancy.'}</p><Notice message={error}/><form onSubmit={async e=>{e.preventDefault();if(preview)return;setBusy(true);setError('');try{const checked=validateSubmission(vacancy.form,answers,Object.entries(files).map(([inputId,file])=>({inputId,filename:file.name,byteCount:file.size})));if(checked.issues.length)throw new Error(checked.issues.map(i=>`${i.path}: ${i.message}`).join('\n'));const body=new FormData();body.append('answers',JSON.stringify(checked.answers));Object.entries(files).forEach(([id,file])=>body.append(id,file));const result=await api(`vacancies/${vacancy.id}/applications`,{method:'POST',body});go(`/applications/${result.id}`);}catch(error){setError(errorMessage(error));}finally{setBusy(false);}}}>
    <fieldset disabled={busy} className="candidate-fields">{vacancy.form.inputs.map(input=>{
      if(input.type==='separator')return <h3 className="form-section" key={input.id}>{input.label}</h3>;
      const label=<span>{input.label}{input.required&&<span aria-label="required"> *</span>}</span>;
      if(input.type==='multiple_choice')return <fieldset key={input.id} className="choices"><legend>{label}</legend>{input.args.choices.map(choice=><label className="check" key={choice.value}><input type="checkbox" checked={(answers[input.id]??[]).includes(choice.value)} onChange={e=>answer(input.id,e.target.checked?[...(answers[input.id]??[]),choice.value]:(answers[input.id]??[]).filter((v:string)=>v!==choice.value))}/>{choice.label}</label>)}</fieldset>;
      return <label key={input.id}>{label}
        {input.type==='text'&&<input required={input.required} maxLength={input.args.maxLength??10000} value={answers[input.id]??''} onChange={e=>answer(input.id,e.target.value)}/>}
        {input.type==='long_text'&&<textarea rows={4} required={input.required} maxLength={input.args.maxLength??10000} value={answers[input.id]??''} onChange={e=>answer(input.id,e.target.value)}/>}
        {input.type==='number'&&<input type="number" required={input.required} min={input.args.min} max={input.args.max} step={input.args.step??'any'} value={answers[input.id]??''} onChange={e=>answer(input.id,e.target.value===''?undefined:Number(e.target.value))}/>}
        {input.type==='yes_no'&&<select required={input.required} value={answers[input.id]===undefined?'':String(answers[input.id])} onChange={e=>answer(input.id,e.target.value===''?undefined:e.target.value==='true')}><option value="">Select…</option><option value="true">Yes</option><option value="false">No</option></select>}
        {input.type==='single_choice'&&<select required={input.required} value={answers[input.id]??''} onChange={e=>answer(input.id,e.target.value||undefined)}><option value="">Select…</option>{input.args.choices.map(choice=><option key={choice.value} value={choice.value}>{choice.label}</option>)}</select>}
        {input.type==='document'&&<><input type="file" required={input.required} accept={input.args.accept?.join(',')} onChange={e=>{const file=e.target.files?.[0];setFiles(current=>{const next={...current};if(file)next[input.id]=file;else delete next[input.id];return next;});}}/><small>{input.args.accept?.join(', ')||'Any extension'} · One file · Up to {Math.min(10*1024*1024,input.args.limit?.kind==='MAX_BYTES'?input.args.limit.bytes:Infinity).toLocaleString()} bytes. All files combined: 25 MiB.</small></>}
      </label>;
    })}<div className="form-footer"><p className="small muted">Check your answers before submitting. An existing submission will be returned unchanged.</p><button className="primary" disabled={busy||preview}>{preview?'Preview only':busy?'Submitting…':'Submit application'}</button></div></fieldset>
  </form></section>;
}
