import { useRef, useState } from 'react';
import { api, post, errorMessage } from './api';
import { screeningLimits, type ScreeningPreview, type ScreeningRow } from '@recruitment/domain';
import { Notice } from './ui';
import { Icon } from './icons';
import { IntentDialog } from './intent-dialog';
import { useNavigationGuard, useOptionalNavigation } from './navigation-guard';
import { chooseDecision, importGroups, initialChoice, resolvedChoice, retainedRow, type ImportChoice } from './screening-import-model';

const outcome=(value:string)=>value==='preselected'?'Preselect':value==='rejected'?'Reject':value||'Missing decision';
type StagedRow=ScreeningRow&{needsRecheck?:boolean};
export function ScreeningImport({vacancyId,onClose,onApplied}:{vacancyId:string;onClose:()=>void;onApplied:()=>void}) {
  const [file,setFile]=useState<File|null>(null),[rows,setRows]=useState<StagedRow[]>([]),[choices,setChoices]=useState<Record<string,ImportChoice>>({});
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[fileError,setFileError]=useState(''),[message,setMessage]=useState('');
  const [confirm,setConfirm]=useState(false),[uncertain,setUncertain]=useState(false),[needsRefresh,setNeedsRefresh]=useState(false);
  const header=useRef<HTMLDivElement>(null),writing=useRef(false),navigation=useOptionalNavigation();
  useNavigationGuard(rows.length>0,busy,'import');
  const close=()=>navigation?navigation.requestAction(onClose):onClose();
  const groups=importGroups(rows),choiceFor=(key:string)=>choices[key];
  const included=groups.flatMap(group=>{
    const choice=choiceFor(group.key),row=choice&&retainedRow(group,choice);
    return row&&choice.included&&resolvedChoice(group,choice)?[{...row,decision:choice.decision}]:[];
  });
  const edit=(key:string,change:Partial<ImportChoice>)=>{setConfirm(false);setChoices(current=>({...current,[key]:{...current[key],...change}}));};
  async function refresh(nextFile=file,review=false) {
    if(!nextFile||writing.current)return;
    writing.current=true;setBusy(true);setError('');setMessage('');setConfirm(false);setNeedsRefresh(true);
    try {
      if(nextFile.size>screeningLimits.bytes)throw new Error('CSV exceeds 10 MiB. Split it into smaller files.');
      const data=new FormData();data.append('file',nextFile);
      const preview=await api<ScreeningPreview>(`vacancies/${vacancyId}/screening/preview`,{method:'POST',body:data});
      const sameFile=nextFile===file,updatedGroups=importGroups(preview.rows),updatedChoices:Record<string,ImportChoice>={};
      for(const group of updatedGroups){
        const old=sameFile?choices[group.key]:undefined;
        const retained=old&&retainedRow(group,old);
        updatedChoices[group.key]=old&&retained?{...old}:old?{...initialChoice(group),included:false}:initialChoice(group);
      }
      const changed=sameFile&&included.some(old=>{
        const row=preview.rows.find(row=>row.key===old.key);
        return !row||row.state!=='valid'||row.revision!==old.revision;
      });
      setRows(preview.rows);setChoices(updatedChoices);setFile(nextFile);setUncertain(false);setNeedsRefresh(false);
      if(review&&!changed&&updatedGroups.some(group=>updatedChoices[group.key].included&&resolvedChoice(group,updatedChoices[group.key])))setConfirm(true);
      setMessage(changed?'Some applications changed or were decided. Review the marked rows, then check and confirm the remaining selection.':'Eligibility checked. No decisions applied by this preview.');
    }catch(e){
      if((e as {status?:number}).status===400||nextFile.size>screeningLimits.bytes)setFileError(errorMessage(e));
      else setError(errorMessage(e));
    }finally{writing.current=false;setBusy(false);}
  }
  async function apply() {
    if(writing.current||!confirm||uncertain||needsRefresh||!included.length)return;
    writing.current=true;setBusy(true);setError('');setMessage('');
    try {
      const result=await post<{applied:number}>(`vacancies/${vacancyId}/screening/apply`,{rows:included.map(row=>({applicationId:row.applicationId,email:row.email,decision:row.decision,reason:row.reason||undefined,expectedRevision:row.revision}))});
      if(!Number.isInteger(result.applied)||result.applied!==included.length)throw new Error('Confirmation response unavailable.');
      setRows([]);setChoices({});setFile(null);setConfirm(false);setMessage(`${result.applied} screening decisions recorded.`);onApplied();
    }catch(e){
      const failure=e as {status?:number;conflicts?:{applicationId:string;state:'invalid'|'decided';issue:string}[]};
      setConfirm(false);setNeedsRefresh(true);
      if(failure.status===409&&failure.conflicts){
        const conflicts=new Map(failure.conflicts.map(row=>[row.applicationId,row]));
        setRows(current=>current.map(row=>{const conflict=conflicts.get(row.applicationId);return conflict?{...row,...conflict,issues:[conflict.issue],needsRecheck:conflict.state==='invalid'}:row;}));
        setChoices(current=>Object.fromEntries(Object.entries(current).map(([key,choice])=>[key,conflicts.has(key.replace('application:',''))?{...choice,included:false}:choice])));
        setError(errorMessage(e));
      }else if(!failure.status||failure.status>=500){setUncertain(true);setError('Confirmation unavailable; the outcome is uncertain. Refresh eligibility to inspect current outcomes before continuing. No automatic retry was made.');}
      else setError(errorMessage(e));
    }finally{writing.current=false;setBusy(false);}
  }
  const locked=busy||uncertain;
  const invalid=rows.filter(row=>row.state==='invalid'),decided=rows.filter(row=>row.state==='decided');
  const preselected=included.filter(row=>row.decision==='preselected').length;
  return <section className="card screening-wizard" aria-label="Screening import">
    <div ref={header} tabIndex={-1} className="section-heading"><h2>Import screening decisions</h2><button disabled={busy} onClick={close}>Close wizard</button></div>
    <ol className="import-steps" aria-label="Import steps"><li aria-current={!rows.length?'step':undefined}>1 · Upload</li><li aria-current={rows.length&&!confirm?'step':undefined}>2 · Review selection</li><li aria-current={confirm?'step':undefined}>3 · Confirm</li></ol>
    <p>CSV columns: <code>application_id</code>, <code>candidate_email</code>, <code>decision</code> (<code>preselected</code> or <code>rejected</code>), and optional <code>reason</code>. Other columns are ignored.</p>
    <details className="import-help"><summary>File rules and exclusions</summary><p>UTF-8 comma CSV, up to 1,000 records / 10 MiB. Correct IDs/emails and malformed content in the CSV, not here. Choose one retained source record for duplicates; every other proposal is excluded. Identical proposals have a suggested record but require explicit inclusion. Already-decided applications cannot be changed.</p></details>
    <Notice message={error}/><Notice message={message} success/>
    <label className="import-upload">Decision CSV<input aria-label="Decision CSV" type="file" accept=".csv,text/csv" disabled={locked} onChange={e=>{
      const next=e.target.files?.[0];e.target.value='';if(!next)return;
      const upload=()=>void refresh(next);
      if(rows.length&&navigation)navigation.requestAction(upload);else upload();
    }}/></label>
    {rows.length>0&&<>
      <div className="import-summary" aria-live="polite"><span><strong>{included.length}</strong> applications included</span><span className="outcome-preselected"><Icon name="check"/>{preselected} preselect</span><span className="outcome-rejected"><Icon name="close"/>{included.length-preselected} reject</span><span>{invalid.length} invalid records</span><span>{decided.length} already-decided records</span></div>
      <div className="actions import-selection-tools"><button disabled={busy} onClick={()=>void refresh()}>Refresh eligibility</button><button disabled={locked} onClick={()=>{setConfirm(false);setChoices(current=>Object.fromEntries(groups.map(group=>{const choice=current[group.key]??initialChoice(group);return [group.key,{...choice,included:resolvedChoice(group,choice)}];})));}}>Include all resolved</button><button disabled={locked} onClick={()=>{setConfirm(false);setChoices(current=>Object.fromEntries(Object.entries(current).map(([key,choice])=>[key,{...choice,included:false}])));}}>Exclude all</button></div>
      <div className="actions import-bulk-decisions"><span className="small muted">Set included to:</span>{(['preselected','rejected'] as const).map(decision=><button key={decision} className={`compact outcome-${decision}`} disabled={locked||!included.length} onClick={()=>{setConfirm(false);setChoices(current=>Object.fromEntries(Object.entries(current).map(([key,choice])=>[key,choice.included?{...choice,decision}:choice])));}}><Icon name={decision==='preselected'?'check':'close'}/>{outcome(decision)}</button>)}</div>
      {needsRefresh&&<p className="notice">Refresh eligibility before confirming. Your remaining choices are retained.</p>}
      <div className="table-scroll"><table className="import-table"><thead><tr><th scope="col">Include</th><th scope="col">CSV records</th><th scope="col">Application</th><th scope="col">Proposed decision</th><th scope="col">Status / exclusions</th></tr></thead><tbody>{groups.map(group=>{
        const row=group.rows[0],choice=choiceFor(group.key)??initialChoice(group),retained=retainedRow(group,choice),valid=row.state==='valid',resolved=resolvedChoice(group,choice);
        const needsRecheck=(row as StagedRow).needsRecheck;
        const state=row.state==='decided'?'decided':needsRecheck?'unresolved':!valid?(row.parseIssues?.length?'parse':'invalid'):!resolved?'unresolved':!choice.included?'excluded':choice.decision;
        const conflicting=group.rows.some(item=>item.decision!==row.decision);
        return <tr key={group.key} className={`import-row import-${state}`}>
          <td><input type="checkbox" aria-label={`Include records ${group.rows.map(row=>row.key).join(', ')}`} checked={valid&&resolved&&choice.included} disabled={locked||!valid||!resolved} onChange={()=>edit(group.key,{included:!choice.included})}/></td>
          <td>{group.rows.map(row=>row.key).join(', ')}{group.duplicate&&<small>Duplicate proposals</small>}</td>
          <td>{row.candidate?<a className="screening-identity" href={`#/applications/${row.applicationId}`} target="_blank" rel="noopener noreferrer">{row.candidate.name||row.candidate.email} ↗</a>:<span className="screening-identity">Unverified application</span>}<small className="import-email">{row.email||'Missing email'}</small><small className="import-application-id">{row.applicationId||'Missing application ID'}</small></td>
          <td>{valid?<><select aria-label={`Decision for records ${group.rows.map(row=>row.key).join(', ')}`} value={choice.decision} disabled={locked} onChange={e=>edit(group.key,chooseDecision(group,choice,e.target.value))}><option value="">Undecided — choose</option><option value="preselected">Preselect</option><option value="rejected">Reject</option></select><span className={`import-outcome outcome-${choice.decision||'undecided'}`}><Icon name={choice.decision==='preselected'?'check':choice.decision==='rejected'?'close':'alert'}/>{choice.decision?outcome(choice.decision):'Undecided'}</span></>:<span>{outcome(row.decision)}</span>}</td>
          <td><strong className="import-state"><Icon name={!valid||!resolved?'alert':!choice.included?'close':'check'}/>{row.state==='decided'?'Already decided':needsRecheck?'Changed · refresh eligibility':!valid?(row.parseIssues?.length?'CSV row error':'Invalid identity or proposal'):!resolved?'Resolve duplicate':!choice.included?'Excluded':'Ready to apply'}</strong>
            {!valid&&<ul className="import-issues">{(row.issues?.length?row.issues:row.issue?[row.issue]:[]).map((issue,index)=><li key={index}>{issue}</li>)}</ul>}
            {row.state==='decided'&&<small>{row.issue}</small>}
            {valid&&group.duplicate&&<><small>{conflicting?'Conflicting outcomes: choose a decision.':'Matching outcomes are prefilled, not automatically included.'}</small><label className="import-retained">Keep CSV record<select aria-label={`Retain source for records ${group.rows.map(row=>row.key).join(', ')}`} disabled={locked} value={choice.keepKey??''} onChange={e=>{const kept=group.rows.find(row=>row.key===Number(e.target.value));edit(group.key,{keepKey:kept?.key??null,decision:choice.decision||kept?.decision||'',included:false});}}><option value="">Choose source proposal…</option>{group.rows.map(row=><option key={row.key} value={row.key}>Record {row.key} · {outcome(row.decision)}{row.reason?` · ${row.reason}`:''}</option>)}</select></label>{retained&&<small>Keeping record {retained.key}; all other occurrences excluded.</small>}<button type="button" className="compact" disabled={locked} onClick={()=>edit(group.key,{included:false})}>Exclude group</button></>}
            {retained?.reason&&<small>Internal reason: {retained.reason}</small>}
            {valid&&group.duplicate&&<details><summary>Original proposals</summary><ul>{group.rows.map(row=><li key={row.key}>Record {row.key}: {outcome(row.decision)}{row.reason?` · ${row.reason}`:''}</li>)}</ul></details>}
          </td>
        </tr>;
      })}</tbody></table></div>
      <div className="import-footer"><p className="small muted">{rows.length} source records. Only included applications will be committed; excluded, invalid and already-decided entries stay unchanged.</p><button className="primary" disabled={busy||uncertain||needsRefresh||!included.length} onClick={()=>void refresh(file,true)}>Review confirmation</button></div>
    </>}
    {confirm&&<IntentDialog title={`Record ${included.length} final screening decisions?`} description={`${preselected} preselect · ${included.length-preselected} reject. This cannot be undone. It locks automated results and review, including unfinished work, and sends the candidate a generic notification. Internal reasons stay private.`} busy={busy} confirmDisabled={needsRefresh||uncertain||!included.length} confirmLabel="Confirm decisions" onConfirm={()=>void apply()} onCancel={()=>setConfirm(false)} fallbackFocus={header}><p>One proposal per application is included. Other duplicate proposals and excluded/invalid records will not be applied.</p></IntentDialog>}
    {fileError&&<IntentDialog title="Could not read the decision file" description={fileError} busy={busy} cancelLabel="Close" onCancel={()=>setFileError('')} fallbackFocus={header}><p>Fix the CSV and upload it again. Any previous staged selection is retained; no decisions were applied by this upload.</p></IntentDialog>}
  </section>;
}
