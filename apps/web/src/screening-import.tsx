import { useState } from 'react';
import { api, post, errorMessage } from './api';
import { screeningLimits, type ScreeningPreview, type ScreeningRow } from '@recruitment/domain';
import { Notice } from './ui';
import { useNavigationGuard, useOptionalNavigation } from './navigation-guard';

type Row = ScreeningRow & { included:boolean };
export function ScreeningImport({vacancyId,onClose,onApplied}:{vacancyId:string;onClose:()=>void;onApplied:()=>void}) {
  const [file,setFile]=useState<File|null>(null),[rows,setRows]=useState<Row[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[confirm,setConfirm]=useState(false),[uncertain,setUncertain]=useState(false);
  const navigation=useOptionalNavigation();
  useNavigationGuard(rows.length>0,busy,'import');
  const close=()=>navigation?navigation.requestAction(onClose):onClose();
  const included=rows.filter(row=>row.included&&row.state==='valid');
  async function refresh(nextFile=file,review=false) {
    if(!nextFile)return;
    setBusy(true);setError('');setMessage('');setConfirm(false);
    try {
      if(nextFile.size>screeningLimits.bytes)throw new Error('CSV exceeds 10 MiB.');
      const data=new FormData();data.append('file',nextFile);
      const preview=await api<ScreeningPreview>(`vacancies/${vacancyId}/screening/preview`,{method:'POST',body:data});
      const previous=new Map((nextFile===file?rows:[]).map(row=>[row.key,row]));
      const updated=preview.rows.map(row=>{
        const old=previous.get(row.key);
        return {...row,decision:old?.decision??row.decision,included:row.state==='valid'&&(old?old.included:true)};
      });
      const changed=nextFile===file&&included.some(old=>{const row=updated.find(item=>item.key===old.key);return !row||row.state!=='valid'||row.revision!==old.revision;});
      setRows(updated);setFile(nextFile);setUncertain(false);
      if(review&&!changed&&updated.some(row=>row.included))setConfirm(true);
      setMessage(changed?'Some applications changed or were decided. Review the marked rows and confirm the remaining selection.':'Current application eligibility checked. No decisions applied.');
    } catch(e) {setError(errorMessage(e));} finally {setBusy(false);}
  }
  async function apply() {
    setBusy(true);setError('');setMessage('');
    try {
      const result=await post<{applied:number}>(`vacancies/${vacancyId}/screening/apply`,{rows:included.map(row=>({applicationId:row.applicationId,email:row.email,decision:row.decision,reason:row.reason||undefined,expectedRevision:row.revision}))});
      if(!Number.isInteger(result.applied)||result.applied!==included.length)throw new Error('Confirmation response unavailable.');
      setRows([]);setFile(null);setConfirm(false);setMessage(`${result.applied} screening decisions recorded.`);onApplied();
    } catch(e) {
      const failure=e as {status?:number;conflicts?:{applicationId:string;state:'invalid'|'decided';issue:string}[]};
      setConfirm(false);
      if(failure.status===409&&failure.conflicts){
        const conflicts=new Map(failure.conflicts.map(row=>[row.applicationId,row]));
        setRows(current=>current.map(row=>{const conflict=conflicts.get(row.applicationId);return conflict?{...row,...conflict,included:false}:row;}));
        setError(errorMessage(e));
      } else if(!failure.status||failure.status>=500){setUncertain(true);setError('Confirmation unavailable; the outcome is uncertain. Refresh to check recorded outcomes before continuing. Do not resubmit automatically.');}
      else setError(errorMessage(e));
    } finally {setBusy(false);}
  }
  const edit=(key:number,change:Partial<Row>)=>{setConfirm(false);setRows(current=>current.map(row=>row.key===key?{...row,...change}:row));};
  return <section className="card screening-wizard" aria-label="Screening import">
    <div className="section-heading"><h2>Import screening decisions</h2><button disabled={busy} onClick={close}>Close wizard</button></div>
    <p>Upload one CSV with <code>application_id</code>, <code>candidate_email</code> and <code>decision</code> (preselected/rejected). Optional: <code>reason</code>. Other columns are ignored, never corrections.</p>
    <p className="small muted">Working files do not reserve applications. The first committed decision wins. Invalid rows cannot be repaired here; fix the CSV and upload again.</p>
    <Notice message={error}/><Notice message={message} success/>
    <label>Decision CSV<input aria-label="Decision CSV" type="file" accept=".csv,text/csv" disabled={busy||uncertain} onChange={e=>{const next=e.target.files?.[0];if(next){setRows([]);setFile(null);void refresh(next);}}}/></label>
    {rows.length>0&&<>
      <div className="actions"><button disabled={busy} onClick={()=>void refresh()}>Refresh eligibility</button>
        <button disabled={busy||uncertain} onClick={()=>{setConfirm(false);setRows(current=>current.map(row=>({...row,included:row.state==='valid'})));}}>Include all valid</button>
        <button disabled={busy||uncertain} onClick={()=>{setConfirm(false);setRows(current=>current.map(row=>({...row,included:false})));}}>Exclude all</button>
        {(['preselected','rejected'] as const).map(decision=><button key={decision} disabled={busy||uncertain||!included.length} onClick={()=>{setConfirm(false);setRows(current=>current.map(row=>row.included&&row.state==='valid'?{...row,decision}:row));}}>Set included to {decision}</button>)}
      </div>
      <p aria-live="polite">Included: {included.length} ({included.filter(row=>row.decision==='preselected').length} preselected, {included.filter(row=>row.decision==='rejected').length} rejected). Invalid: {rows.filter(row=>row.state==='invalid').length}. Already decided: {rows.filter(row=>row.state==='decided').length}. Excluded valid: {rows.filter(row=>row.state==='valid'&&!row.included).length}.</p>
      <div className="table-scroll"><table><thead><tr><th>Include</th><th>CSV record</th><th>Candidate</th><th>Proposal</th><th>Status / reason</th></tr></thead><tbody>{rows.map(row=><tr key={row.key} className={`screening-${row.state}`}>
        <td><input type="checkbox" aria-label={`Include record ${row.key}`} checked={row.included} disabled={busy||uncertain||row.state!=='valid'} onChange={()=>edit(row.key,{included:!row.included})}/></td>
        <td>{row.key}<small>{row.applicationId}</small></td><td><span className="screening-identity">{row.candidate?.name||row.email}</span><small>{row.email}</small></td>
        <td>{row.state==='valid'?<select aria-label={`Decision for record ${row.key}`} value={row.decision} disabled={busy||uncertain} onChange={e=>edit(row.key,{decision:e.target.value})}><option value="preselected">Preselect</option><option value="rejected">Reject</option></select>:row.decision}</td>
        <td>{row.state==='invalid'?'Invalid input':row.state==='decided'?'Already decided':'Valid'}{row.issue&&<small>{row.issue}</small>}{row.reason&&<small>Internal reason: {row.reason}</small>}</td>
      </tr>)}</tbody></table></div>
      {!confirm?<button className="primary" disabled={busy||uncertain||!included.length} onClick={()=>void refresh(file,true)}>Review confirmation</button>:<section className="confirm" aria-label="Confirm screening decisions"><h3>Record {included.length} final screening decisions?</h3><p>Excluded and invalid rows remain unchanged. Screening cannot be undone. Extraction and review become read-only; unfinished work is not marked complete. Internal reasons are not sent to candidates.</p><button className="primary" disabled={busy} onClick={()=>void apply()}>Confirm decisions</button><button disabled={busy} onClick={()=>setConfirm(false)}>Back to selection</button></section>}
    </>}
  </section>;
}
