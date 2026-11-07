import { useEffect, useState } from 'react';
import { api, download, errorMessage } from './api';
import { Badge, Heading, Notice, Loading, Empty, Pager, display } from './ui';
import { PdfPreview } from './pdf-preview';
import type { ApplicationView, ReviewTask, ReviewView } from '@recruitment/domain';
import type { SkillValue } from '@recruitment/domain/vacancies';
import { ScreeningImport } from './screening-import';
import { readinessLabel, taskDraft, sameReviewDraft, type ReviewDraft, type SavedDraft } from './review-presentation';
import { useNavigationGuard, useOptionalNavigation } from './navigation-guard';

export function extractionLabel(state:string,closed=false) {
  if(closed&&['pending','processing'].includes(state))return 'Processing closed (unfinished)';
  return ({completed_with_errors:'Original extraction errors',failed:'Original extraction failed',completed:'Extracted',pending:'Extraction pending',processing:'Extracting',not_requested:'No extraction'} as Record<string,string>)[state]||state;
}

export function ApplicationList({staff}:{staff:boolean}) {
  const vacancy=new URLSearchParams(location.hash.split('?')[1]||'').get('vacancy');
  const navigation=useOptionalNavigation();
  const [page,setPage]=useState<any>(null),[offset,setOffset]=useState(0),[error,setError]=useState(''),[refresh,setRefresh]=useState(0),[busy,setBusy]=useState(false);
  const [processing,setProcessing]=useState(''),[review,setReview]=useState(''),[readiness,setReadiness]=useState(''),[sort,setSort]=useState('newest');
  const [wizard,setWizard]=useState(false),[undecided,setUndecided]=useState(staff),[from,setFrom]=useState(''),[before,setBefore]=useState('');
  const closeWizard=()=>navigation?navigation.requestAction(()=>setWizard(false)):setWizard(false);
  const screeningQuery=`${undecided?'&undecided=true':''}${from?`&from=${encodeURIComponent(from)}`:''}${before?`&before=${encodeURIComponent(before)}`:''}`;
  const showExtraction=staff&&page?.reviewRequired!==false;
  useEffect(()=>{
    let active=true;setError('');setPage(null);
    const query=`limit=20&offset=${offset}&sort=${sort}${processing?`&processing=${processing}`:''}${staff&&review?`&review=${review}`:''}${staff&&readiness?`&readiness=${readiness}`:''}${staff?screeningQuery:''}`;
    api(`${staff&&vacancy?`vacancies/${vacancy}/`:''}applications?${query}`).then(v=>{if(active)setPage(v);}).catch(e=>{if(active)setError(errorMessage(e));});
    return()=>{active=false;};
  },[staff,vacancy,offset,refresh,processing,review,readiness,sort,screeningQuery]);
  return <>
    <Heading title={staff?'Applications':'My applications'}>
      <button onClick={()=>setRefresh(v=>v+1)}>Refresh</button>
      {staff&&vacancy&&<><a className="button" href={`#/vacancies/${vacancy}/interviews`}>Interview results</a><button className="primary" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await download(`vacancies/${vacancy}/export`,`applications-${vacancy}.csv`);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>{busy?'Exporting…':'Export all CSV'}</button></>}
    </Heading><Notice message={error}/>
    {staff&&vacancy&&<><div className="actions"><button onClick={()=>wizard?closeWizard():setWizard(true)}>{wizard?'Hide import':'Import decisions CSV'}</button><button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await download(`vacancies/${vacancy}/screening-export?${screeningQuery.slice(1)}${processing?`&processing=${processing}`:''}${review?`&review=${review}`:''}${readiness?`&readiness=${readiness}`:''}`,`screening-${vacancy}.csv`);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>Export undecided CSV</button></div><p className="small muted">Exports include evidence, not reservations. Agree work batches with colleagues; already-decided applications are excluded on import.</p>{wizard&&<ScreeningImport vacancyId={vacancy} onClose={()=>setWizard(false)} onApplied={()=>setRefresh(value=>value+1)}/>}</>}
    {staff&&vacancy&&<p className="related-links"><a href={`#/vacancies/${vacancy}`}>Vacancy details</a><a href="#/applications">All applications</a></p>}
    <div className="table-controls">
      {staff&&<><label className="check"><input type="checkbox" checked={undecided} onChange={e=>{setUndecided(e.target.checked);setOffset(0);}}/>Undecided only</label><label>Submitted from (UTC)<input type="date" value={from} onChange={e=>{setFrom(e.target.value);setOffset(0);}}/></label><label>Submitted before (UTC)<input type="date" value={before} onChange={e=>{setBefore(e.target.value);setOffset(0);}}/></label></>}
      {showExtraction&&<label>Original extraction<select aria-label="Processing status" value={processing} onChange={e=>{setProcessing(e.target.value);setOffset(0);}}><option value="">All extraction states</option>{['pending','not_requested','processing','completed','completed_with_errors'].map(v=><option key={v} value={v}>{extractionLabel(v)}</option>)}</select></label>}
      {staff&&showExtraction&&<label>Review status<select value={review} onChange={e=>{setReview(e.target.value);setOffset(0);}}><option value="">All review states</option>{['pending','in_review','completed'].map(v=><option key={v} value={v}>{v.replaceAll('_',' ')}</option>)}</select></label>}
      {staff&&showExtraction&&<label>Review availability<select value={readiness} onChange={e=>{setReadiness(e.target.value);setOffset(0);}}><option value="">All availability</option><option value="waiting">Waiting for processing</option><option value="blocked">Processing blocked</option><option value="ready">Ready for review</option><option value="released">Released to review</option><option value="locked">Review locked</option><option value="not_required">No review required</option></select></label>}
      <label>Sort applications<select value={sort} onChange={e=>{setSort(e.target.value);setOffset(0);}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option>{staff&&<option value="candidate">Candidate A–Z</option>}<option value="position">Position A–Z</option></select></label>
    </div>
    {!page&&!error?<Loading/>:page&&<section className="card">
      {!page.items.length?<Empty>No applications match this view. <a href="#/vacancies">Browse vacancies</a></Empty>:<div className="table-scroll"><table><thead><tr>{staff&&<th>Candidate</th>}<th>Position</th><th>Submitted</th>{staff&&<th>Recruitment stage</th>}{showExtraction&&<th>Original extraction</th>}{staff&&showExtraction&&<th>HR review</th>}<th/></tr></thead>
        <tbody>{page.items.map((item:any)=><tr key={item.id}>
          {staff&&<td><a className="strong" href={`#/applications/${item.id}`}>{item.candidate.name||item.candidate.email}</a><small>{item.candidate.email}</small></td>}
          <td><a href={`#/vacancies/${item.vacancyId}`}>{item.vacancyTitle}</a>{staff&&<small><a href={`#/applications?vacancy=${item.vacancyId}`}>Vacancy applications</a></small>}</td><td>{new Date(item.submittedAt).toLocaleDateString()}</td>{staff&&<td><Badge>{item.stage||'received'}</Badge></td>}{showExtraction&&<td>{item.processingState==='not_requested'?'—':<Badge>{extractionLabel(item.processingState,item.processingClosed??(!['received','review_ready'].includes(item.stage)||item.review?.status==='completed'))}</Badge>}</td>}{staff&&showExtraction&&<td>{item.review?.required===false?'—':<div className="status-stack"><Badge>{item.review?.status==='completed'?'Reviewed':item.review?.status??'pending'}</Badge>{item.readiness&&<Badge>{readinessLabel(item.readiness.state,item.review?.status)}</Badge>}{item.review?.hasCorrections&&<Badge>HR corrections saved</Badge>}</div>}</td>}<td><a href={`#/applications/${item.id}`}>Open →</a>{staff&&<small><a href={`#/applications/${item.id}/interviews`}>Selection & interviews</a></small>}</td>
        </tr>)}</tbody></table></div>}
      <Pager offset={offset} total={page.total} change={setOffset}/>
    </section>}
  </>;
}

function TaskCard({task,onSave,busy,draft,onDraft,onReapply,onDiscard,closed,processingClosed}:{task:ReviewTask;onSave:(correction:{taskId:string;value:SkillValue|null;remove?:boolean})=>void;busy:boolean;draft?:SavedDraft;onDraft:(draft:ReviewDraft)=>void;onReapply:()=>void;onDiscard:()=>void;closed:boolean;processingClosed?:boolean}) {
  const current=draft?.active?draft.value:taskDraft(task),{skills,nullValue,skillFlags}=current;
  const paused=!!draft&&!draft.active;
  const readOnly=busy||closed||paused;
  const change=(patch:Partial<ReviewDraft>)=>onDraft({...current,...patch});
  return <article className="extraction-card">
    <div className="section-heading"><h3>{task.outputKey}</h3><div className="status-row"><Badge>{task.hasCorrection?'HR corrections saved':extractionLabel(task.status,processingClosed)}</Badge>{task.provenance?.mode==='fixture'&&<Badge>Fixture result</Badge>}{task.provenance?.mode==='live'&&<Badge>{task.provenance.provider==='typesafe'?'Jev result':'Live extraction'}</Badge>}</div></div>
    <div className="saved-value" aria-label={`Latest saved value for ${task.outputKey}`}>
      <span className="eyebrow">LATEST SAVED VALUE</span>
      <h4>{task.hasCorrection?'Saved HR correction':task.result.status==='completed'?'Original extraction (no correction)':'Unavailable — extraction has not succeeded'}</h4>
      {task.skillResults?<dl>{task.skillResults.map((row:any)=><div key={row.skill}><dt>{row.skill}</dt><dd>{row.effective===null?'Unavailable':row.effective?'Detected':'Not detected'}</dd></div>)}</dl>:<p className="effective-skills">{task.effectiveValue===null?'Unavailable (null)':task.effectiveValue?.skills?.length?task.effectiveValue.skills.join(', '):'No skills found.'}</p>}
      {task.hasCorrection&&<small className="saved-state">Saved {task.correctedAt?new Date(task.correctedAt).toLocaleString():''}{task.corrector?` · ${task.corrector.name||task.corrector.email}`:''}</small>}
    </div>
    {draft&&<div className="review-draft"><p>{paused?'Your unsaved draft is preserved. Compare it with the latest saved value before reapplying.':'Unsaved correction'}</p>{paused&&<pre aria-label={`Preserved draft for ${task.outputKey}`}>{task.skillResults?JSON.stringify(draft.value.skillFlags,null,2):draft.value.nullValue?'Unavailable':draft.value.skills}</pre>}<div className="actions">{paused&&<button disabled={busy||closed} onClick={onReapply}>Reapply draft for {task.outputKey}</button>}<button disabled={busy} onClick={onDiscard}>Discard draft for {task.outputKey}</button></div></div>}
    <form className="correction-form" onSubmit={e=>{e.preventDefault();if(readOnly)return;onSave({taskId:task.taskId,value:task.skillResults?{skills:Object.keys(skillFlags).filter(skill=>skillFlags[skill]==='true'),unavailableSkills:Object.keys(skillFlags).filter(skill=>skillFlags[skill]==='unknown')}:nullValue?null:{skills:skills.split(',').map(v=>v.trim()).filter(Boolean)}});}}>
      {task.skillResults?<div className="grid two">{task.skillResults.map((row:any)=><label key={row.skill}>Review {row.skill}<select disabled={readOnly} value={skillFlags[row.skill]} onChange={e=>change({skillFlags:{...skillFlags,[row.skill]:e.target.value}})}><option value="true">Detected</option><option value="false">Not detected</option><option value="unknown">Unavailable</option></select></label>)}</div>:<><label>Skills (comma separated)<input disabled={readOnly||nullValue} value={skills} onChange={e=>change({skills:e.target.value})} placeholder="SQL, TypeScript"/></label>
      <label className="check"><input disabled={readOnly} type="checkbox" checked={nullValue} onChange={e=>change({nullValue:e.target.checked})}/> Explicitly mark unavailable (null)</label></>}
      <div className="actions"><button disabled={readOnly}>Save correction</button>{task.hasCorrection&&<button type="button" disabled={readOnly} onClick={()=>onSave({taskId:task.taskId,value:null,remove:true})}>Use original</button>}</div>
    </form>
    <details className="original-result"><summary>Original extraction and evidence · {extractionLabel(task.status,processingClosed)}</summary>
      <pre>{task.result.status==='completed'?JSON.stringify(task.result.value,null,2):'Unavailable (null)'}</pre>
      {task.result.reason&&<p className="notice">{task.result.reason}</p>}
       {(task.result.evidence?.length??0)>0&&<ul className="evidence">{task.result.evidence?.map((text:string,i:number)=><li key={i}>{text}</li>)}</ul>}
      {task.provenance?.fixtureId&&<small className="fixture-label">Fixture: {task.provenance.fixtureId}</small>}
      <dl className="processing-details"><div><dt>Source field</dt><dd>{task.sourceInputId}</dd></div><div><dt>Attempts</dt><dd>{task.attempts}/3</dd></div>{task.provenance?.reader&&<div><dt>Document reader</dt><dd>{task.provenance.reader}</dd></div>}{task.provenance?.model&&<div><dt>Model</dt><dd>{task.provenance.model}</dd></div>}</dl>
    </details>
  </article>;
}

export function ApplicationPage({id,staff}:{id:string;staff:boolean}) {
  return <ApplicationDetail key={`${id}:${staff}`} id={id} staff={staff}/>;
}
function ApplicationDetail({id,staff}:{id:string;staff:boolean}) {
  const [record,setRecord]=useState<ApplicationView|null>(null),[review,setReview]=useState<ReviewView|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
  const [preview,setPreview]=useState<{id:string;filename:string}|null>(null);
  const [confirmRelease,setConfirmRelease]=useState(false),[needsRefresh,setNeedsRefresh]=useState(false),[drafts,setDrafts]=useState<Record<string,SavedDraft>>({});
  const [reviewSaving,setReviewSaving]=useState(false);
  useNavigationGuard(Object.keys(drafts).length>0,reviewSaving);
  const discard=(taskId:string)=>setDrafts(current=>Object.fromEntries(Object.entries(current).filter(([key])=>key!==taskId)));
  function refreshView(){setMessage('');setConfirmRelease(false);setNeedsRefresh(true);setDrafts(current=>Object.fromEntries(Object.entries(current).map(([key,draft])=>[key,{...draft,active:false}])));setRefresh(v=>v+1);}
  useEffect(()=>{let active=true;setError('');setRecord(null);setReview(null);(async()=>{const record=await api<ApplicationView>(`applications/${id}`);const needsReview=staff&&record.actions?.review.allowed&&record.processingState!=='not_requested'&&record.review?.required!==false;const review=needsReview?await api<ReviewView>(`applications/${id}/review`):null;if(active){setRecord(record);setReview(review);setNeedsRefresh(false);}})().catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[id,staff,refresh]);
  async function update(body:Record<string,unknown>,taskId?:string){if(!review||busy||needsRefresh)return;setBusy(true);setReviewSaving(true);setError('');setMessage('');try{const saved=await api<ReviewView>(`applications/${id}/review`,{method:'PATCH',body:JSON.stringify({...body,expectedRevision:review.review.revision})});setReview(saved);if(taskId)discard(taskId);setMessage('Review saved.');}catch(e){setNeedsRefresh(true);setError(`${errorMessage(e)} Use Refresh to reload the latest saved review before retrying. Your unsaved corrections are preserved.`);}finally{setBusy(false);setReviewSaving(false);}}
  async function release(){if(!review||busy||needsRefresh)return;setBusy(true);setReviewSaving(true);setError('');setMessage('');try{const saved=await api<ReviewView>(`applications/${id}/review/release`,{method:'POST',body:JSON.stringify({expectedRevision:review.review.revision})});setReview(saved);setRecord(current=>current?{...current,processingClosed:saved.processingClosed}:current);setMessage('Released to review. Existing results are unchanged.');}catch(e){setNeedsRefresh(true);setError(`${errorMessage(e)} Use Refresh to check the current state before confirming again. No automatic retry was made.`);}finally{setConfirmRelease(false);setBusy(false);setReviewSaving(false);}}
  return <><Notice message={error}/>{!record?!error?<Loading/>:<button onClick={()=>setRefresh(v=>v+1)}>Retry</button>:<>
    <Heading title={staff?(record.candidate.name||record.candidate.email):'Your application'} description={`${record.vacancy.title} · Submitted ${new Date(record.submittedAt).toLocaleString()}`} status={staff?<Badge>{record.stage}</Badge>:<Badge>Application received</Badge>}><a className="button" href={staff?`#/applications?vacancy=${record.vacancyId}`:'#/applications'}>← Applications</a>{record.actions?.workflow.visible&&<a className="button primary" href={`#/applications/${id}/interviews`}>Selection & interviews</a>}<button disabled={busy} onClick={refreshView}>Refresh</button></Heading><p className="related-links"><a href={`#/vacancies/${record.vacancyId}`}>Vacancy details</a>{record.actions?.workflow.visible&&<a href={`#/vacancies/${record.vacancyId}/interviews`}>Interview plan & results</a>}</p><Notice message={message} success/>
     <section className="card"><div className="section-heading"><h2>Answers</h2></div><p>{record.candidate.email}</p>
      <dl className="answer-grid">{record.vacancy.formDefinition.inputs.filter((input:any)=>input.type!=='separator'&&input.type!=='document').map((input:any)=><div key={input.id}><dt>{input.label}</dt><dd>{display(record.answers[input.id])}</dd></div>)}</dl><h3>Documents</h3>
      {!record.documents.length?<p className="muted">No documents submitted.</p>:record.documents.map((doc:any)=><div className="document-actions" key={doc.id}>
        {doc.filename.toLowerCase().endsWith('.pdf')&&<button onClick={()=>setPreview(doc)}>Preview {doc.filename}</button>}
        <button onClick={async()=>{try{await download(`applications/${id}/documents/${doc.id}`,doc.filename);}catch(e){setError(errorMessage(e));}}}>↓ Download {doc.filename} <span className="muted">({Math.ceil(doc.byteCount/1024)} KB)</span></button>
      </div>)}
    </section>
    <div className={`review-workspace ${preview&&review?.tasks.length?'with-preview':''}`}>
      {preview&&<PdfPreview key={preview.id} applicationId={id} document={preview} onClose={()=>setPreview(null)}/>}
       <div>{review&&review.actions.edit.visible&&review.tasks.length>0&&<>
        <section className="card"><div className="section-heading"><h2>Extraction review</h2><Badge>{review.review.status}</Badge></div>
           <div className="status-row">{review.readiness&&<Badge>{readinessLabel(review.readiness.state,review.review.status)}</Badge>}<Badge>{extractionLabel(review.processingState??record.processingState,review.processingClosed)}</Badge></div>
           <p className="small muted">Review supports screening; it is not required to preselect or reject.</p>
           {review.release&&<p>Released {new Date(review.release.at).toLocaleString()}{review.release.actor?` · ${review.release.actor.name||review.release.actor.email}`:''}. Unfinished extraction remains unavailable.</p>}
           {review.actions.release?.allowed&&<button disabled={busy||needsRefresh} onClick={()=>setConfirmRelease(true)}>Release to review</button>}
           {confirmRelease&&<section className="card" role="dialog" aria-labelledby="release-title"><h3 id="release-title">Stop processing and release to review?</h3><p>This permanently stops further processing for this application. Existing results stay; unfinished values remain unavailable. It does not complete review or decide screening.</p><p>A request already sent to an AI provider may still incur cost.</p><div className="actions"><button className="primary" disabled={busy||needsRefresh} onClick={release}>Confirm release</button><button disabled={busy} onClick={()=>setConfirmRelease(false)}>Cancel</button></div></section>}
           <div className="actions"><button disabled={busy||needsRefresh||!review.actions.edit.allowed} onClick={()=>update({status:'in_review'})}>Mark in review</button><button className="primary" disabled={busy||needsRefresh||!review.actions.edit.allowed||Object.keys(drafts).length>0} onClick={()=>update({status:'completed'})}>Mark review complete</button><button disabled={busy||needsRefresh||!review.actions.edit.allowed} onClick={()=>update({status:'pending'})}>Reset to pending</button></div>
           {Object.keys(drafts).length>0&&<p className="small muted">Save or discard unsaved corrections before completing review.</p>}
          {review.tasks.some((task:any)=>task.hasCorrection)&&<p className="review-summary">HR corrections are saved and used in export. Original extraction results remain unchanged.</p>}<small>{review.review.updatedAt?`Saved ${new Date(review.review.updatedAt).toLocaleString()}`:''}{review.review.editor?` · ${review.review.editor.name||review.review.editor.email}`:''}</small>
         </section>
          <section className="card"><div className="section-heading"><h2>Extracted fields</h2></div><Notice message={review.actions.edit.reason??''}/>{review.tasks.map(task=><TaskCard key={task.taskId} task={task} busy={busy||needsRefresh} closed={!review.actions.edit.allowed} processingClosed={review.processingClosed} draft={drafts[task.taskId]} onDraft={value=>{if(sameReviewDraft(value,taskDraft(task)))discard(task.taskId);else setDrafts(current=>({...current,[task.taskId]:{value,active:true}}));}} onDiscard={()=>discard(task.taskId)} onReapply={()=>setDrafts(current=>({...current,[task.taskId]:{...current[task.taskId],active:true}}))} onSave={correction=>update({corrections:[correction]},task.taskId)}/>)}
         </section>
       </>}{record.actions?.export.visible&&<div className="actions"><button disabled={busy||!record.actions.export.allowed} onClick={async()=>{setBusy(true);try{await download(`vacancies/${record.vacancyId}/export`,`applications-${record.vacancyId}.csv`);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>Export vacancy CSV</button></div>}</div>
    </div>
  </>}</>;
}
