import { useEffect, useRef, useState } from 'react';
import { api, download, errorMessage } from './api';
import { Badge, Heading, Notice, Loading, Empty, Pager } from './ui';
import { PdfPreview } from './pdf-preview';
import { cvFamilyLabels, cvQuestionLabel, cvValueLabel, normalizeCvChoice, type ApplicationView, type ReviewTask, type ReviewField, type ReviewView, type StaffVacancy, type CvFieldValue } from '@recruitment/domain';
import { ScreeningImport } from './screening-import';
import { readinessLabel, fieldDraft, sameReviewDraft, type ReviewDraft, type SavedDraft } from './review-presentation';
import { useNavigationGuard, useOptionalNavigation } from './navigation-guard';
import { ApplicationInformation, applicationJourney } from './application-information';
import { IntentDialog } from './intent-dialog';
import { IconButton } from './icons';
import { applicationFilters, useListFilters } from './list-memory';
import { candidateStatus } from './candidate-status';
import { recruitmentStatusLabels } from './status-labels';

export function extractionLabel(state:string,closed=false) {
  if(closed&&['pending','processing'].includes(state))return 'Processing closed (unfinished)';
  return ({completed_with_errors:'Original extraction errors',failed:'Original extraction failed',completed:'Extracted',pending:'Extraction pending',processing:'Extracting',not_requested:'No extraction'} as Record<string,string>)[state]||state;
}

export function ApplicationList({staff,memoryScope}:{staff:boolean;memoryScope?:string}) {
  const vacancy=new URLSearchParams(location.hash.split('?')[1]||'').get('vacancy');
  const navigation=useOptionalNavigation();
  const [page,setPage]=useState<any>(null),[error,setError]=useState(''),[refresh,setRefresh]=useState(0),[busy,setBusy]=useState(false);
  const [vacancyTitle,setVacancyTitle]=useState(''),[scopeError,setScopeError]=useState('');
  const [{offset,sort,work,recruitmentStatus,undecided,from,before},setFilters]=useListFilters(memoryScope,staff&&vacancy?`applications:${vacancy}`:'applications',applicationFilters);
  const setOffset=(offset:number)=>setFilters({offset}),setSort=(sort:string)=>setFilters({sort}),setWork=(work:string)=>setFilters({work}),setRecruitmentStatus=(recruitmentStatus:string)=>setFilters({recruitmentStatus});
  const setUndecided=(undecided:boolean)=>setFilters({undecided}),setFrom=(from:string)=>setFilters({from}),setBefore=(before:string)=>setFilters({before});
  const [workSupported,setWorkSupported]=useState(false);
  const workLabels:Record<string,string>={processing:'Processing',for_review:'For review',for_screening:'For screening',interviewing:'Interviews',awaiting_offer:'Awaiting offer',offer_recorded:'Offer recorded',hired:'Hired',not_selected:'Not selected',other:'Other'};
  const statusLabels=recruitmentStatusLabels;
  const [wizard,setWizard]=useState(false);
  const closeWizard=()=>navigation?navigation.requestAction(()=>setWizard(false)):setWizard(false);
  const screeningQuery=`${undecided?'&undecided=true':''}${from?`&from=${encodeURIComponent(from)}`:''}${before?`&before=${encodeURIComponent(before)}`:''}${work?`&work=${work}`:''}${recruitmentStatus?`&recruitmentStatus=${recruitmentStatus}`:''}`;
  useEffect(()=>{
    let active=true;setError('');setPage(null);
    const query=`limit=20&offset=${offset}&sort=${sort}${staff?screeningQuery:''}`;
    api(`${staff&&vacancy?`vacancies/${vacancy}/`:''}applications?${query}`).then(v=>{if(active){if(offset>0&&offset>=v.total){setOffset(Math.max(0,Math.floor((v.total-1)/20)*20));return;}setPage(v);setWorkSupported(v.workFiltersSupported===true);}}).catch(e=>{if(active)setError(errorMessage(e));});
    return()=>{active=false;};
  },[staff,vacancy,offset,refresh,sort,screeningQuery]);
  useEffect(()=>{
    if(!staff||!vacancy)return;let active=true;setVacancyTitle('');setScopeError('');
    api<StaffVacancy>(`vacancies/${vacancy}`).then(value=>{if(active)setVacancyTitle(value.title);}).catch(error=>{if(active)setScopeError(errorMessage(error));});
    return()=>{active=false;};
  },[staff,vacancy,refresh]);
  return <div className="application-index">
    {staff&&vacancy&&<a className="application-back-link" href={`#/vacancies/${vacancy}`}>← Vacancy</a>}
    <Heading title={staff?(vacancy?'Vacancy applications':'Applications'):'My applications'} description={staff&&vacancy?vacancyTitle:undefined}>
      <IconButton icon="refresh" label="Refresh applications" onClick={()=>setRefresh(v=>v+1)}/>
    </Heading><Notice message={error}/><Notice message={scopeError?`Vacancy title unavailable: ${scopeError}`:''}/>{(error||scopeError)&&<button onClick={()=>setRefresh(value=>value+1)}>Retry applications</button>}
    {staff&&vacancy&&<details className="application-file-tools"><summary>Decision files</summary><p className="muted">Export undecided applications or import proposed screening decisions. Nothing is reserved by downloading a file.</p><div className="actions"><button onClick={()=>wizard?closeWizard():setWizard(true)}>{wizard?'Hide import':'Import decisions CSV'}</button><button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await download(`vacancies/${vacancy}/screening-export?${screeningQuery.slice(1)}`,`screening-${vacancy}.csv`);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>Export undecided CSV</button><button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await download(`vacancies/${vacancy}/export`,`applications-${vacancy}.csv`);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>Diagnostic CSV · all applications</button></div>{wizard&&<ScreeningImport vacancyId={vacancy} onClose={()=>setWizard(false)} onApplied={()=>setRefresh(value=>value+1)}/>}</details>}
    {staff&&vacancy&&<p className="related-links"><a href="#/applications">All applications</a></p>}
    {staff&&<div className="table-controls intent-filters"><label>Work to do<select disabled={!workSupported} value={work} onChange={e=>{setWork(e.target.value);setOffset(0);}}><option value="">All work</option>{Object.entries(workLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Recruitment status<select disabled={!workSupported} value={recruitmentStatus} onChange={e=>{setRecruitmentStatus(e.target.value);setOffset(0);}}><option value="">All statuses</option>{Object.entries(statusLabels).filter(([value])=>value!=='review_ready').map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>}
    <details className="application-list-filters"><summary>Dates and sorting</summary><div className="table-controls">
      {staff&&<><label className="check"><input type="checkbox" checked={undecided} onChange={e=>{setUndecided(e.target.checked);setOffset(0);}}/>Undecided only</label><label>Submitted from (UTC)<input type="date" value={from} onChange={e=>{setFrom(e.target.value);setOffset(0);}}/></label><label>Submitted before (UTC)<input type="date" value={before} onChange={e=>{setBefore(e.target.value);setOffset(0);}}/></label></>}
      <label>Sort applications<select value={sort} onChange={e=>{setSort(e.target.value);setOffset(0);}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option>{staff&&<option value="candidate">Candidate A–Z</option>}<option value="position">Position A–Z</option></select></label>
    </div></details>
    {!page&&!error?<Loading/>:page&&<section className="vacancy-list-surface">
      {!page.items.length?<Empty>No applications match this view. <a href="#/vacancies">Browse vacancies</a></Empty>:<div className="table-scroll"><table className="application-list-table"><thead><tr>{staff&&<th scope="col">Candidate</th>}<th scope="col">Position</th><th scope="col">Submitted</th><th scope="col">Status</th>{staff&&<th scope="col">Work to do</th>}</tr></thead>
        <tbody>{page.items.map((item:any)=><tr key={item.id}>
          {staff&&<td><a className="vacancy-title-link" href={`#/applications/${item.id}`}>{item.candidate.name||item.candidate.email}</a></td>}
          <td><a className={staff?'':'vacancy-title-link'} href={staff?`#/vacancies/${item.vacancyId}`:`#/applications/${item.id}`}>{item.vacancyTitle}</a></td><td>{new Date(item.submittedAt).toLocaleDateString()}</td><td>{staff?<span className="list-state">{statusLabels[item.stage]??item.stage}</span>:<Badge>{candidateStatus(item.stage)}</Badge>}</td>{staff&&<td><span className="list-state">{workLabels[item.workItem]??(item.readiness?readinessLabel(item.readiness.state,item.review?.status):'—')}</span>{item.readiness?.state==='blocked'&&<span className="attention-cue">Processing needs attention</span>}<details className="list-secondary"><summary>Details</summary><dl><dt>Original processing</dt><dd>{extractionLabel(item.processingState,item.processingClosed)}</dd><dt>Human review</dt><dd>{item.review?.required===false?'Not required':(item.review?.status??'pending').replaceAll('_',' ')}</dd><dt>Saved corrections</dt><dd>{item.review?.hasCorrections?'Yes':'No'}</dd></dl></details></td>}
        </tr>)}</tbody></table></div>}
      <Pager offset={offset} total={page.total} change={setOffset}/>
    </section>}
  </div>;
}

function TaskCard({task,field,title,editing=false,onDocument,onSave,busy,draft,onDraft,onReapply,onDiscard,closed,processingClosed}:{task:ReviewTask;field:ReviewField;title:string;editing?:boolean;onDocument?:()=>void;onSave:(correction:{taskId:string;questionId:string;value:CvFieldValue|null;remove?:boolean})=>void;busy:boolean;draft?:SavedDraft;onDraft:(draft:ReviewDraft)=>void;onReapply:()=>void;onDiscard:()=>void;closed:boolean;processingClosed?:boolean}) {
  const current=draft?.active?draft.value:fieldDraft(field);
  const paused=!!draft&&!draft.active;
  const readOnly=busy||closed||paused;
  return <article className="extraction-card">
    <div className="section-heading"><div><h3>{title.split(' · ')[0]}</h3><p className="field-qualifier">{title.split(' · ').slice(1).join(' · ')}</p></div>{editing&&onDocument&&<IconButton icon="eye" label={`Show source document for ${title}`} onClick={onDocument}/>}</div>
    <div className="saved-value" aria-label={`Latest saved value for ${field.columnKey}`}>
      <p className="effective-skills">{cvValueLabel(field.configuration,field.effective)}</p>
      {field.hasCorrection&&<small className="saved-state">Saved {field.correctedAt?new Date(field.correctedAt).toLocaleString():''}{field.corrector?` · ${field.corrector.name||field.corrector.email}`:''}</small>}
    </div>
    {editing&&draft&&<div className="review-draft"><p>{paused?'Your unsaved draft is preserved. Compare it with the latest saved value before reapplying.':'Unsaved correction'}</p>{paused&&<pre aria-label={`Preserved draft for ${field.columnKey}`}>{cvValueLabel(field.configuration,JSON.parse(draft.value.selection) as CvFieldValue|null)}</pre>}<div className="actions">{paused&&<button disabled={busy||closed} onClick={onReapply}>Reapply local draft</button>}<button disabled={busy} onClick={onDiscard}>Discard local draft</button></div></div>}
    {editing&&<form className="correction-form" onSubmit={e=>{e.preventDefault();if(readOnly)return;onSave({taskId:task.taskId,questionId:field.questionId,value:JSON.parse(current.selection) as CvFieldValue|null});}}>
      <label>Review {cvFamilyLabels[field.type]}<select disabled={readOnly} value={current.selection} onChange={e=>onDraft({selection:e.target.value})}><option value="null">Unavailable</option>{Object.keys(field.question.criteria).map(key=>{const value=normalizeCvChoice(field.configuration,key);return <option key={key} value={JSON.stringify(value)}>{cvValueLabel(field.configuration,value)}</option>;})}</select></label>
      <div className="actions"><button disabled={readOnly}>Save correction</button>{field.hasCorrection&&<button type="button" disabled={readOnly} onClick={()=>onSave({taskId:task.taskId,questionId:field.questionId,value:null,remove:true})}>Use original</button>}</div>
    </form>}
    <details className="original-result"><summary>Original extraction and evidence · {extractionLabel(task.status,processingClosed)}</summary>
      <p>{cvValueLabel(field.configuration,field.original)}</p>
      {task.result.reason&&<p className="notice">{task.result.reason}</p>}
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
  const [reviewEditor,setReviewEditor]=useState(false),[completeReview,setCompleteReview]=useState(false);
  const [reviewDocument,setReviewDocument]=useState('');
  const [viewTab,setViewTab]=useState<'application'|'review'>('application');
  const focusTarget=useRef<HTMLDivElement>(null),navigation=useOptionalNavigation();
  const closeReview=()=>{if(reviewSaving)return;const close=()=>{setReviewEditor(false);setCompleteReview(false);};if(Object.keys(drafts).length&&navigation)navigation.requestAction(()=>{setDrafts({});close();});else if(!Object.keys(drafts).length)close();};
  useNavigationGuard(Object.keys(drafts).length>0,reviewSaving);
  const discard=(taskId:string)=>setDrafts(current=>Object.fromEntries(Object.entries(current).filter(([key])=>key!==taskId)));
  function refreshView(){setMessage('');setConfirmRelease(false);setNeedsRefresh(true);setDrafts(current=>Object.fromEntries(Object.entries(current).map(([key,draft])=>[key,{...draft,active:false}])));setRefresh(v=>v+1);}
  useEffect(()=>{let active=true;setError('');(async()=>{const record=await api<ApplicationView>(`applications/${id}`);const needsReview=staff&&record.actions?.review.allowed&&record.processingState!=='not_requested'&&record.review?.required!==false;const review=needsReview?await api<ReviewView>(`applications/${id}/review`):null;if(active){setRecord(record);setReview(review);setNeedsRefresh(false);}})().catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[id,staff,refresh]);
  async function update(body:Record<string,unknown>,taskId?:string){if(!review||busy||needsRefresh)return;setBusy(true);setReviewSaving(true);setError('');setMessage('');try{const saved=await api<ReviewView>(`applications/${id}/review`,{method:'PATCH',body:JSON.stringify({...body,expectedRevision:review.review.revision})});setReview(saved);if(taskId)discard(taskId);if(body.status==='completed'){setCompleteReview(false);setReviewEditor(false);}setMessage('Review saved.');}catch(e){setNeedsRefresh(true);setError(`${errorMessage(e)} Use Refresh to reload the latest saved review before retrying. Your unsaved corrections are preserved.`);}finally{setBusy(false);setReviewSaving(false);}}
  async function release(){if(!review||busy||needsRefresh)return;setBusy(true);setReviewSaving(true);setError('');setMessage('');try{const saved=await api<ReviewView>(`applications/${id}/review/release`,{method:'POST',body:JSON.stringify({expectedRevision:review.review.revision})});setReview(saved);setRecord(current=>current?{...current,processingClosed:saved.processingClosed}:current);setMessage('Released to review. Existing results are unchanged.');}catch(e){setNeedsRefresh(true);setError(`${errorMessage(e)} Use Refresh to check the current state before confirming again. No automatic retry was made.`);}finally{setConfirmRelease(false);setBusy(false);setReviewSaving(false);}}
  const journey=applicationJourney(record?.stage??'');
  const showReview=staff&&review&&review.actions.edit.visible&&review.tasks.length>0;
  const pdfDocuments=record?.documents.filter(doc=>doc.filename.toLowerCase().endsWith('.pdf'))??[];
  const selectedDocument=reviewDocument==='hidden'?undefined:pdfDocuments.find(doc=>doc.id===reviewDocument)??pdfDocuments.find(doc=>doc.inputId===review?.tasks[0]?.sourceInputId)??pdfDocuments[0];
  const taskCards=(editing:boolean)=>review?.tasks.flatMap(task=>task.fields.map(field=>{const key=`${task.taskId}:${field.questionId}`;return <TaskCard key={key} task={task} field={field} editing={editing} onDocument={pdfDocuments.some(doc=>doc.inputId===task.sourceInputId)?()=>setReviewDocument(pdfDocuments.find(doc=>doc.inputId===task.sourceInputId)!.id):undefined} title={`${cvQuestionLabel(field.configuration)} · ${record?.vacancy.formDefinition.inputs.find(input=>input.id===task.sourceInputId)?.label||'Document'}`} busy={busy||needsRefresh} closed={!review.actions.edit.allowed} processingClosed={review.processingClosed} draft={drafts[key]} onDraft={value=>{if(sameReviewDraft(value,fieldDraft(field)))discard(key);else setDrafts(current=>({...current,[key]:{value,active:true}}));}} onDiscard={()=>discard(key)} onReapply={()=>setDrafts(current=>({...current,[key]:{...current[key],active:true}}))} onSave={correction=>update({corrections:[correction]},key)}/>;}));
  return <div ref={focusTarget} tabIndex={-1} className="application-detail">{!reviewEditor&&!confirmRelease&&<Notice message={error}/>} {!record?!error?<Loading/>:<button onClick={()=>setRefresh(v=>v+1)}>Retry</button>:<>
    <a className="application-back-link" href="#/applications">← Applications</a>
    <Heading title={staff?(record.candidate.name||record.candidate.email):'Your application'} status={<Badge>{staff?record.stage:candidateStatus(record.stage)}</Badge>}><IconButton icon="refresh" label="Refresh application" disabled={busy} onClick={refreshView}/></Heading>
    <p className="application-vacancy"><a href={`#/vacancies/${record.vacancyId}`}>{record.vacancy.title}</a></p>
    <div className="application-metadata"><p>Submitted <time dateTime={record.submittedAt}>{new Date(record.submittedAt).toLocaleString()}</time></p><details className="application-contact"><summary>Contact email</summary><span>{record.candidate.email}</span></details></div>
    <Notice message={message} success/>
    {showReview&&review&&<nav className="application-view-tabs" aria-label="Application views">
      <button className={viewTab==='application'?'active':''} onClick={()=>setViewTab('application')}>Application</button>
      <button className={viewTab==='review'?'active':''} onClick={()=>setViewTab('review')}>Review results</button>
    </nav>}
    {viewTab==='application'&&<div className={`application-information-layout ${preview?'with-preview':''}`}>
      <ApplicationInformation record={record} onPreview={setPreview} onDownload={async doc=>{try{await download(`applications/${id}/documents/${doc.id}`,doc.filename);}catch(e){setError(errorMessage(e));}}}/>
      {preview&&!reviewEditor&&<PdfPreview key={preview.id} applicationId={id} document={preview} onClose={()=>setPreview(null)}/>}
    </div>}
    {showReview&&review&&viewTab==='review'&&<>
        <section className="application-section" aria-labelledby="application-results-heading">
          <h2 id="application-results-heading">Automated results</h2>
          <p className="small muted" title="Processing state and review readiness are separate. Extraction can be complete while review is still pending.">{extractionLabel(review.processingState??record.processingState,review.processingClosed)} · {review.readiness?readinessLabel(review.readiness.state,review.review.status):'Review not applicable'}</p>
          {review.release&&<p className="small muted">Released {new Date(review.release.at).toLocaleString()}{review.release.actor?` · ${review.release.actor.name||review.release.actor.email}`:''}. Unfinished extraction remains unavailable.</p>}
          {review.actions.release?.allowed&&<button disabled={busy||needsRefresh} onClick={()=>setConfirmRelease(true)}>Continue with manual review</button>}
          <div className="application-review-fields">{!reviewEditor&&taskCards(false)}</div>
        </section>
        <section className="application-section" aria-labelledby="application-review-heading">
          <div className="section-heading"><h2 id="application-review-heading">Human review</h2><Badge>{review.review.status}</Badge></div>
          <p className="small muted">Review supports screening; it is not required to preselect or reject.</p>
          {(review.actions.edit.allowed||Object.keys(drafts).length>0)&&<button disabled={busy} className="primary" onClick={()=>setReviewEditor(true)}>{Object.keys(drafts).length?'Resume review':'Review application'}</button>}
          {Object.keys(drafts).length>0&&<p className="small muted">Save or discard unsaved corrections before completing review.</p>}
          {review.tasks.some((task:any)=>task.hasCorrection)&&<p className="review-summary">HR corrections are saved and used in export. Original extraction results remain unchanged.</p>}
          <small>{review.review.updatedAt?`Saved ${new Date(review.review.updatedAt).toLocaleString()}`:''}{review.review.editor?` · ${review.review.editor.name||review.review.editor.email}`:''}</small>
          {!review.actions.edit.allowed&&<p className="muted">{review.readiness?readinessLabel(review.readiness.state,review.review.status):'Review is not available.'}</p>}
        </section>
      </>}
    {reviewEditor&&review&&<IntentDialog title={completeReview?'Complete human review?':'Human review'} description={completeReview?'Completing review locks corrections. Missing or unavailable evidence stays unknown. This does not preselect or reject the application.':'Compare saved information with the original evidence. Save corrections individually; completion is a separate action.'} busy={reviewSaving} fallbackFocus={focusTarget} onCancel={closeReview} onConfirm={completeReview?()=>void update({status:'completed'}):undefined} confirmLabel="Complete review" confirmDisabled={needsRefresh||!review.actions.edit.allowed||Object.keys(drafts).length>0}>
      <Notice message={error}/><Notice message={message} success/>
      <button disabled={busy} onClick={refreshView}>Refresh saved review</button>
      {completeReview?<button disabled={busy} onClick={()=>setCompleteReview(false)}>Back to corrections</button>:<>
        <div className="review-document-layout"><div className="application-review-fields">{taskCards(true)}</div><aside className="review-document-panel" aria-label="Review source document"><label>Source document<select value={selectedDocument?.id??''} onChange={event=>setReviewDocument(event.target.value)}><option value="" disabled>Choose a PDF</option>{pdfDocuments.map(doc=><option key={doc.id} value={doc.id}>{record.vacancy.formDefinition.inputs.find(input=>input.id===doc.inputId)?.label??'Document'} · {doc.filename}</option>)}</select></label>{selectedDocument?<PdfPreview key={selectedDocument.id} applicationId={id} document={selectedDocument} onClose={()=>setReviewDocument('hidden')}/>:<p className="muted">{pdfDocuments.length?'Select a document to resume preview.':'No submitted PDF is available for preview. Other files can be downloaded from application information.'}</p>}</aside></div>
        {review.actions.edit.allowed&&<div className="actions review-command-bar"><button className="primary" disabled={busy||needsRefresh||Object.keys(drafts).length>0} onClick={()=>setCompleteReview(true)}>Complete review…</button></div>}
        {Object.keys(drafts).length>0&&<p className="muted">Save or discard each local correction before completing review.</p>}
      </>}
    </IntentDialog>}
    {confirmRelease&&<IntentDialog title="Continue with manual review?" description="This permanently closes automated processing for this application. Existing results stay; unfinished values remain unavailable. It does not complete review or decide screening. Work already sent to an AI provider may still incur cost." busy={reviewSaving} fallbackFocus={focusTarget} onCancel={()=>{if(!busy)setConfirmRelease(false);}} onConfirm={()=>void release()} confirmDisabled={needsRefresh||!review?.actions.release?.allowed} confirmLabel="Close processing and continue"><Notice message={error}/></IntentDialog>}
    {staff&&record.actions?.workflow.visible&&<section className="application-section" aria-labelledby="application-journey-heading"><h2 id="application-journey-heading">{journey.heading}</h2><a className="application-journey-link" href={`#/applications/${id}/interviews`}>{journey.link} <span aria-hidden="true">→</span></a></section>}
  </>}</div>;
}
