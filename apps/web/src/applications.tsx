import { useEffect, useState } from 'react';
import { api, download, errorMessage } from './api';
import { Badge, Heading, Notice, Loading, Empty, Pager, display } from './ui';
import { PdfPreview } from './pdf-preview';

export function ApplicationList({staff}:{staff:boolean}) {
  const vacancy=new URLSearchParams(location.hash.split('?')[1]||'').get('vacancy');
  const [page,setPage]=useState<any>(null),[offset,setOffset]=useState(0),[error,setError]=useState(''),[refresh,setRefresh]=useState(0),[busy,setBusy]=useState(false);
  const [processing,setProcessing]=useState(''),[review,setReview]=useState(''),[sort,setSort]=useState('newest');
  const showExtraction=!staff||page?.reviewRequired!==false;
  useEffect(()=>{
    let active=true;setError('');setPage(null);
    const query=`limit=20&offset=${offset}&sort=${sort}${processing?`&processing=${processing}`:''}${staff&&review?`&review=${review}`:''}`;
    api(`${staff&&vacancy?`vacancies/${vacancy}/`:''}applications?${query}`).then(v=>{if(active)setPage(v);}).catch(e=>{if(active)setError(errorMessage(e));});
    return()=>{active=false;};
  },[staff,vacancy,offset,refresh,processing,review,sort]);
  return <>
    <Heading title={staff?'Applications':'My applications'}>
      <button onClick={()=>setRefresh(v=>v+1)}>Refresh</button>
      {staff&&vacancy&&<button className="primary" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await download(`vacancies/${vacancy}/export`,`applications-${vacancy}.csv`);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>{busy?'Exporting…':'Export all CSV'}</button>}
    </Heading><Notice message={error}/>
    {staff&&vacancy&&<p className="small muted"><a href="#/applications">Show all vacancies</a></p>}
    <div className="table-controls">
      {showExtraction&&<label>Processing status<select value={processing} onChange={e=>{setProcessing(e.target.value);setOffset(0);}}><option value="">All processing states</option>{['pending','not_requested','processing','completed','completed_with_errors'].map(v=><option key={v} value={v}>{v==='not_requested'?'No extraction':v.replaceAll('_',' ')}</option>)}</select></label>}
      {staff&&showExtraction&&<label>Review status<select value={review} onChange={e=>{setReview(e.target.value);setOffset(0);}}><option value="">All review states</option>{['pending','in_review','completed'].map(v=><option key={v} value={v}>{v.replaceAll('_',' ')}</option>)}</select></label>}
      <label>Sort applications<select value={sort} onChange={e=>{setSort(e.target.value);setOffset(0);}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option>{staff&&<option value="candidate">Candidate A–Z</option>}<option value="position">Position A–Z</option></select></label>
    </div>
    {!page&&!error?<Loading/>:page&&<section className="card">
      {!page.items.length?<Empty>No applications match this view. <a href="#/vacancies">Browse vacancies</a></Empty>:<div className="table-scroll"><table><thead><tr>{staff&&<th>Candidate</th>}<th>Position</th><th>Submitted</th>{showExtraction&&<th>Processing</th>}{staff&&showExtraction&&<th>Extraction review</th>}<th/></tr></thead>
        <tbody>{page.items.map((item:any)=><tr key={item.id}>
          {staff&&<td><a className="strong" href={`#/applications/${item.id}`}>{item.candidate.name||item.candidate.email}</a><small>{item.candidate.email}</small></td>}
          <td>{staff?<a href={`#/applications?vacancy=${item.vacancyId}`}>{item.vacancyTitle}</a>:item.vacancyTitle}</td><td>{new Date(item.submittedAt).toLocaleDateString()}</td>{showExtraction&&<td>{item.processingState==='not_requested'?'—':<Badge>{item.processingState}</Badge>}</td>}{staff&&showExtraction&&<td>{item.review?.required===false?'—':<Badge>{item.review?.status??'pending'}</Badge>}</td>}<td><a href={`#/applications/${item.id}`}>Open →</a></td>
        </tr>)}</tbody></table></div>}
      <Pager offset={offset} total={page.total} change={setOffset}/>
    </section>}
  </>;
}

function TaskCard({task,onSave,busy}:{task:any;onSave:(correction:any)=>void;busy:boolean}) {
  const [skills,setSkills]=useState<string>((task.effectiveValue?.skills??[]).join(', ')),[nullValue,setNullValue]=useState(task.hasCorrection&&task.correction===null);
  return <article className="extraction-card">
    <div className="section-heading"><div><h3>{task.outputKey}</h3><small>Source: {task.sourceInputId} · Attempt {task.attempts}/3</small></div><div className="actions"><Badge>{task.status}</Badge><Badge>{task.provenance?.mode??'not processed'}</Badge></div></div>
    <div className="saved-value" aria-label={`Latest saved value for ${task.outputKey}`}>
      <span className="eyebrow">LATEST SAVED VALUE</span>
      <h4>{task.hasCorrection?'Saved HR correction':task.result.status==='completed'?'Original extraction (no correction)':'Unavailable — extraction has not succeeded'}</h4>
      <pre>{task.effectiveValue===null?'Unavailable (null)':JSON.stringify(task.effectiveValue,null,2)}</pre>
      {task.effectiveValue?.skills?.length===0&&<p className="small">No skills found.</p>}
      {task.hasCorrection&&<small className="saved-state">Saved {task.correctedAt?new Date(task.correctedAt).toLocaleString():''}{task.corrector?` · ${task.corrector.name||task.corrector.email}`:''}</small>}
    </div>
    <form className="correction-form" onSubmit={e=>{e.preventDefault();onSave({taskId:task.taskId,value:nullValue?null:{skills:skills.split(',').map(v=>v.trim()).filter(Boolean)}});}}>
      <label>Skills (comma separated)<input disabled={busy||nullValue} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="SQL, TypeScript"/></label>
      <label className="check"><input disabled={busy} type="checkbox" checked={nullValue} onChange={e=>setNullValue(e.target.checked)}/> Explicitly mark unavailable (null)</label>
      <div className="actions"><button disabled={busy}>Save correction</button>{task.hasCorrection&&<button type="button" disabled={busy} onClick={()=>onSave({taskId:task.taskId,value:null,remove:true})}>Use original</button>}</div>
    </form>
    <details className="original-result"><summary>Original extraction and evidence</summary>
      <pre>{task.result.status==='completed'?JSON.stringify(task.result.value,null,2):'Unavailable (null)'}</pre>
      {task.result.reason&&<p className="notice">{task.result.reason}</p>}
      {task.result.evidence?.length>0&&<ul className="evidence">{task.result.evidence.map((text:string,i:number)=><li key={i}>{text}</li>)}</ul>}
      {task.provenance?.fixtureId&&<small className="fixture-label">Fixture: {task.provenance.fixtureId}</small>}
    </details>
  </article>;
}

export function ApplicationPage({id,staff}:{id:string;staff:boolean}) {
  const [record,setRecord]=useState<any>(null),[review,setReview]=useState<any>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
  const [preview,setPreview]=useState<{id:string;filename:string}|null>(null);
  useEffect(()=>{let active=true;setError('');setRecord(null);setReview(null);(async()=>{const record=await api(`applications/${id}`);const needsReview=staff&&record.processingState!=='not_requested'&&record.review?.required!==false;const review=needsReview?await api(`applications/${id}/review`):null;if(active){setRecord(record);setReview(review);}})().catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[id,staff,refresh]);
  async function update(body:any){setBusy(true);setError('');setMessage('');try{const saved=await api(`applications/${id}/review`,{method:'PATCH',body:JSON.stringify({...body,expectedRevision:review.review.revision})});setReview(saved);setMessage(`Saved revision ${saved.review.revision}.`);}catch(e){setError(`${errorMessage(e)} Use Refresh to reload the latest saved review before retrying.`);}finally{setBusy(false);}}
  return <><Notice message={error}/>{!record?!error?<Loading/>:<button onClick={()=>setRefresh(v=>v+1)}>Retry</button>:<>
    <Heading title={staff?(record.candidate.name||record.candidate.email):'Your application'} description={`${record.vacancy.title} · Submitted ${new Date(record.submittedAt).toLocaleString()}`}><a className="button" href={staff?`#/applications?vacancy=${record.vacancyId}`:'#/applications'}>Back to applications</a><button disabled={busy} onClick={()=>{setMessage('');setRefresh(v=>v+1);}}>Refresh</button></Heading><Notice message={message} success/>
    <section className="card"><div className="section-heading"><h2>Answers</h2><div className="actions"><Badge>{record.stage}</Badge>{record.processingState!=='not_requested'&&<Badge>{record.processingState}</Badge>}</div></div><p>{record.candidate.email}</p>
      <dl className="answer-grid">{record.vacancy.formDefinition.inputs.filter((input:any)=>input.type!=='separator'&&input.type!=='document').map((input:any)=><div key={input.id}><dt>{input.label}</dt><dd>{display(record.answers[input.id])}</dd></div>)}</dl><h3>Documents</h3>
      {!record.documents.length?<p className="muted">No documents submitted.</p>:record.documents.map((doc:any)=><div className="document-actions" key={doc.id}>
        {doc.filename.toLowerCase().endsWith('.pdf')&&<button onClick={()=>setPreview(doc)}>Preview {doc.filename}</button>}
        <button onClick={async()=>{try{await download(`applications/${id}/documents/${doc.id}`,doc.filename);}catch(e){setError(errorMessage(e));}}}>↓ Download {doc.filename} <span className="muted">({Math.ceil(doc.byteCount/1024)} KB)</span></button>
      </div>)}
    </section>
    <div className={`review-workspace ${preview&&review?.tasks.length?'with-preview':''}`}>
      {preview&&<PdfPreview key={preview.id} applicationId={id} document={preview} onClose={()=>setPreview(null)}/>}
      <div>{staff&&review?.tasks.length>0&&<>
        <section className="card"><div className="section-heading"><h2>Extraction review</h2><Badge>{review.review.status}</Badge></div>
          <div className="actions"><button disabled={busy} onClick={()=>update({status:'in_review'})}>Mark in review</button><button className="primary" disabled={busy} onClick={()=>update({status:'completed'})}>Mark review complete</button><button disabled={busy} onClick={()=>update({status:'pending'})}>Reset to pending</button></div>
          <small>Current saved revision {review.review.revision}{review.review.updatedAt?` · Saved ${new Date(review.review.updatedAt).toLocaleString()}`:''}{review.review.editor?` · ${review.review.editor.name||review.review.editor.email}`:''}</small>
        </section>
        <section className="card"><div className="section-heading"><h2>Extracted fields</h2><Badge>Mock extraction</Badge></div>{review.tasks.map((task:any)=><TaskCard key={`${task.taskId}:${review.review.revision}`} task={task} busy={busy} onSave={correction=>update({corrections:[correction]})}/>)}
        </section>
      </>}{staff&&<div className="actions"><button disabled={busy} onClick={async()=>{setBusy(true);try{await download(`vacancies/${record.vacancyId}/export`,`applications-${record.vacancyId}.csv`);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>Export vacancy CSV</button></div>}</div>
    </div>
  </>}</>;
}
