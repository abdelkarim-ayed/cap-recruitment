import { useEffect, useRef, useState } from 'react';
import { createVacancySchema, type CreateVacancy } from '@recruitment/domain/vacancies';
import { api, post, go, errorMessage, type Actor } from './api';
import { Heading, Notice, Empty, Loading, Pager } from './ui';
import { FormEditor } from './form-editor';
import { CandidateForm } from './candidate-form';
import { roleAllows, type ApplicationView, type InterviewPlanView, type StaffVacancy } from '@recruitment/domain';
import { useNavigationGuard } from './navigation-guard';
import { VacancyInformation, VacancyOwner, VacancyStatus, vacancyStatusLabels } from './vacancy-inspection';
import { VacancyConfirmation } from './vacancy-confirmation';
import { IntentDialog } from './intent-dialog';
import { useListFilters, vacancyFilters } from './list-memory';
import { formError, formIssues } from './form-feedback';

export function VacancyList({staff,actorId,candidate=false,memoryScope}:{staff:boolean;actorId?:string;candidate?:boolean;memoryScope?:string}) {
  const [page,setPage]=useState<any>(null),[error,setError]=useState(''),[reload,setReload]=useState(0);
  const [{offset,status,owner,sort,notApplied},setFilters]=useListFilters(memoryScope,'vacancies',vacancyFilters);
  const [owners,setOwners]=useState<{id:string;name:string;email:string}[]>([]),[ownerError,setOwnerError]=useState('');
  const setOffset=(offset:number)=>setFilters({offset}),setStatus=(status:string)=>setFilters({status}),setSort=(sort:string)=>setFilters({sort}),setNotApplied=(notApplied:boolean)=>setFilters({notApplied});
  useEffect(()=>{let active=true;setPage(null);setError('');const ownFilter=candidate&&!staff&&notApplied;api(`${ownFilter?'candidate/':staff?'':'public/'}vacancies?limit=20&offset=${offset}&sort=${sort}${staff&&status?`&status=${status}`:''}${staff&&owner?`&owner=${encodeURIComponent(owner)}`:''}${ownFilter?'&notApplied=true':''}`).then(v=>{if(active){if(offset>0&&offset>=v.total){setOffset(Math.max(0,Math.floor((v.total-1)/20)*20));return;}setPage(v);}}).catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[staff,candidate,actorId,notApplied,offset,reload,status,owner,sort]);
  useEffect(()=>{if(!staff)return;let active=true;setOwnerError('');api<{items:{id:string;name:string;email:string}[]}>('vacancies/owners').then(value=>{if(active)setOwners(value.items);}).catch(e=>{if(active)setOwnerError(errorMessage(e));});return()=>{active=false;};},[staff,actorId,reload]);
  const statusLabels=vacancyStatusLabels;
  return <div className="vacancy-index">
    <Heading title={staff?'Vacancies':'Find your next opportunity'} description={staff?'Browse vacancies and prepare new roles.':'Explore open roles and find your next opportunity.'}>
      {staff&&<a className="button primary" href="#/vacancies/new">+ Create vacancy</a>}
    </Heading>
    <Notice message={error}/>
    <div className="table-controls vacancy-list-controls">
      {candidate&&!staff&&<label className="check vacancy-unapplied-filter"><input type="checkbox" checked={notApplied} onChange={event=>{setNotApplied(event.target.checked);setOffset(0);}}/>Not applied yet</label>}
      {staff&&<label>Vacancy status<select value={status} onChange={e=>{setStatus(e.target.value);setOffset(0);}}>
        <option value="">All statuses</option>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
      </select></label>}
      {staff&&<label>Vacancy owner<select value={owner} onChange={e=>setFilters({owner:e.target.value,offset:0})}><option value="">All owners</option><option value="me">Owned by me</option>{owner&&owner!=='me'&&!owners.some(item=>item.id===owner)&&<option value={owner}>Selected owner</option>}{owners.filter(item=>item.id!==actorId||item.id===owner).map(item=><option key={item.id} value={item.id}>{item.name||item.email}{item.id===actorId?' (you)':''}</option>)}</select></label>}
      <label>Sort vacancies<select value={sort} onChange={e=>{setSort(e.target.value);setOffset(0);}}>
        <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Position A–Z</option>
      </select></label>
      {staff&&<div className="vacancy-filter-shortcuts" role="group" aria-label="Vacancy shortcuts"><button aria-pressed={status==='draft'&&(owner==='me'||owner===actorId)} onClick={()=>setFilters({owner:'me',status:'draft',offset:0})}>My drafts</button><button onClick={()=>setFilters({owner:'',status:'',offset:0})} disabled={!owner&&!status}>All vacancies</button></div>}
    </div>
    {staff&&ownerError&&<p className="small muted" role="status">Owner options unavailable: {ownerError} All owners and Owned by me still work. <button className="compact" onClick={()=>setReload(value=>value+1)}>Retry owner options</button></p>}
    {error&&<button onClick={()=>setReload(v=>v+1)}>Retry</button>}
    {!page&&!error?<Loading/>:page&&<section className="vacancy-list-surface" aria-label={staff?'Vacancies':'Open positions'}>
      {!page.items.length?<Empty>No vacancies match this view.</Empty>:<div className="table-scroll">
        <table className="vacancy-list-table" aria-label={staff?'Vacancies':'Open positions'}>
          <thead><tr><th scope="col">Position</th><th scope="col">Location</th>{staff&&<th scope="col" className="vacancy-list-status-column">Status</th>}</tr></thead>
          <tbody>{page.items.map((item:any)=><tr key={item.id}>
            <td className="vacancy-list-position">
              <a className="vacancy-title-link" href={`#/vacancies/${item.id}`}>{item.title}</a>
              {staff&&<p className="vacancy-list-owner">Owner: <span>{item.owner?.name||item.owner?.email||'Unknown owner'}</span>{!!actorId&&item.ownerId===actorId&&' (you)'}</p>}
            </td>
            <td className="vacancy-list-location">{item.location||'—'}</td>
            {staff&&<td><span className="vacancy-list-status" data-state={item.status}>{statusLabels[item.status as keyof typeof statusLabels]||item.status}</span></td>}
          </tr>)}</tbody>
        </table>
      </div>}
      <Pager offset={offset} total={page.total} change={setOffset}/>
    </section>}
  </div>;
}
const initial:CreateVacancy={title:'',description:'',formDefinition:{version:1,inputs:[{id:'full_name',name:'full_name',label:'Full name',type:'text',required:true,args:{}},{id:'cv',name:'cv',label:'Your CV',type:'document',required:true,args:{accept:['.pdf']}}]},processingDefinition:{version:2,tasks:[]}};
function PublicationPlanSummary({plan}:{plan:InterviewPlanView}) {
  return <><h3>Saved interview plan</h3>{plan.steps.length?<ol>{plan.steps.map(interview=><li key={interview.id}>{interview.name}{interview.instructions&&<p className="prewrap small">{interview.instructions}</p>}</li>)}</ol>:<p>No interviews configured. This empty plan will also be locked.</p>}<a href={`#/vacancies/${plan.vacancyId}/interviews`}>Review or edit the draft interview plan</a></>;
}
function StaffVacancyPage({vacancy,actor}:{vacancy:StaffVacancy|null;actor:Actor}) {
  const [value,setValue]=useState<CreateVacancy>(vacancy??structuredClone(initial)),[current,setCurrent]=useState(vacancy),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[action,setAction]=useState<'published'|'closed'|null>(null);
  const canEdit=current?current.status==='draft'&&current.ownerId===actor.id&&current.actions.edit.allowed:roleAllows(actor.role,'vacancy.create');
  const canClose=!!current&&current.status==='published'&&current.ownerId===actor.id&&current.actions.close.visible;
  const header=useRef<HTMLDivElement>(null);
  const [preview,setPreview]=useState(false);
  const [publicationPlan,setPublicationPlan]=useState<InterviewPlanView|null>(null),[createdId,setCreatedId]=useState('');
  const dirty=canEdit&&(current?JSON.stringify(value)!==JSON.stringify(current):JSON.stringify(value)!==JSON.stringify(initial));
  useNavigationGuard(dirty,busy,'vacancy');
  // Redirect only after the clean guard has rendered; the successful create is
  // already acknowledged and must not open an unsaved-changes prompt.
  useEffect(()=>{if(createdId)go(`/vacancies/${createdId}`);},[createdId]);
  async function save(){if(!canEdit)return;setBusy(true);setError('');setMessage('');try{const checked=createVacancySchema.safeParse({title:value.title,description:value.description,...(value.location?.trim()?{location:value.location}:{}),formDefinition:value.formDefinition,processingDefinition:value.processingDefinition});if(!checked.success)throw new Error(formIssues(checked.error.issues,value.formDefinition,value.processingDefinition));const record= current?await api<StaffVacancy>(`vacancies/${current.id}`,{method:'PATCH',body:JSON.stringify({...checked.data,expectedRevision:current.revision})}):await post<StaffVacancy>('vacancies',checked.data);setCurrent(record);setValue(record);setAction(null);setPublicationPlan(null);setMessage('Draft saved.');if(!current)setCreatedId(record.id);}catch(e){setError(formError(e,value.formDefinition,value.processingDefinition));}finally{setBusy(false);}}
  async function reviewPublication(){if(!current||!canEdit||dirty||busy||!current.actions.publish.allowed)return;setBusy(true);setError('');setAction(null);setPublicationPlan(null);try{const plan=await api<InterviewPlanView>(`vacancies/${current.id}/interview-pipeline`);setPublicationPlan(plan);setAction('published');}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  function cancelAction(){if(!busy){setAction(null);setPublicationPlan(null);}}
  async function confirmAction(){
    if(!current||!action||busy||(action==='published'&&(!canEdit||!current.actions.publish.allowed||dirty||!publicationPlan))||(action==='closed'&&(!canClose||!current.actions.close.allowed)))return;
    setBusy(true);setError('');
    try{
      const record=await post<StaffVacancy>(`vacancies/${current.id}/${action==='published'?'publish':'close'}`,{expectedRevision:current.revision,...(action==='published'?{expectedInterviewRevision:publicationPlan!.revision}:{})});
      setCurrent(record);setValue(record);setAction(null);setPublicationPlan(null);setMessage(`Vacancy ${record.status}.`);
    }catch(e){setAction(null);setPublicationPlan(null);setError(errorMessage(e));}finally{setBusy(false);}
  }
  return <div className={`vacancy-detail ${canEdit?'vacancy-editing':'vacancy-inspecting'}`}>
    <a className="vacancy-back-link" href="#/vacancies">← Vacancies</a>
    <div ref={header} tabIndex={-1} className="vacancy-heading-focus">
      <Heading title={current?current.title:'Create a vacancy'} description={canEdit?'Edit job details and the application form.':current?.location} status={current&&<VacancyStatus status={current.status}/>}/>
    </div>
    {current&&<VacancyOwner vacancy={current} actor={actor}/>}
    <Notice message={error}/><Notice message={message} success/>
    {canEdit?<>
      <form onSubmit={e=>{e.preventDefault();void save();}}><fieldset disabled={busy}><section className="card"><h2>Job details</h2><div className="grid two"><label>Position title<input required maxLength={200} value={value.title} onChange={e=>setValue({...value,title:e.target.value})} placeholder="Backend developer"/></label><label>Location<input maxLength={200} value={value.location??''} onChange={e=>setValue({...value,location:e.target.value})} placeholder="Tunis · Hybrid"/></label><label className="span-two">Description<textarea required rows={5} maxLength={20000} value={value.description} onChange={e=>setValue({...value,description:e.target.value})} placeholder="Describe the role, responsibilities and working environment."/></label></div></section><FormEditor form={value.formDefinition} processing={value.processingDefinition} onPreview={()=>setPreview(true)} onChange={(formDefinition,processingDefinition)=>setValue({...value,formDefinition,processingDefinition})}/></fieldset>
        <div className="sticky-actions"><button className="primary" disabled={busy}>{busy?'Saving…':'Save draft'}</button>{current?.actions.publish.visible&&<button type="button" disabled={busy||dirty||!current.actions.publish.allowed} title={dirty?'Save changes before publishing':current.actions.publish.reason??undefined} onClick={()=>void reviewPublication()}>Publish saved draft</button>}{dirty&&<span className="muted">Unsaved changes</span>}</div>
      </form>
      {preview&&<IntentDialog title="Application form preview" description="Preview only. No application will be submitted." busy={busy} onCancel={()=>setPreview(false)} fallbackFocus={header}><CandidateForm preview vacancy={{id:current?.id??'preview',form:value.formDefinition}}/></IntentDialog>}
    </>:current&&<VacancyInformation vacancy={current}/>}
    {current&&<section className="vacancy-section" aria-labelledby="vacancy-recruitment-heading">
      <div className="section-heading"><h2 id="vacancy-recruitment-heading">{current.status==='draft'?'Interview plan':'Recruitment'}</h2>{canClose&&<button className="danger" disabled={busy||!current.actions.close.allowed} onClick={()=>setAction('closed')}>Close vacancy</button>}</div>
      {current.status==='draft'?<><p className="muted">Configure interviews before publication. An empty plan is also valid.</p><a href={`#/vacancies/${current.id}/interviews`}>{canEdit?'Configure interview plan':'View interview plan'}</a></>:<nav className="vacancy-related-nav" aria-label="Vacancy recruitment"><a href={`#/applications?vacancy=${current.id}`}>Applications</a><a href={`#/vacancies/${current.id}/interviews`}>Interview plan &amp; results</a></nav>}
    </section>}
    {action&&<VacancyConfirmation title={action==='published'?'Publish the saved version?':'Close this vacancy?'} description={action==='published'?'Publishing opens applications and permanently locks the job details, application form, automated checks and interview plan. Review the saved plan before confirming.':'New applications will stop. Existing submissions remain available and recruitment can continue.'} busy={busy} confirmDisabled={action==='published'?(dirty||!publicationPlan):!current?.actions.close.allowed} onConfirm={()=>void confirmAction()} onCancel={cancelAction} fallbackFocus={header}>
      {action==='published'&&publicationPlan&&<PublicationPlanSummary plan={publicationPlan}/>}
    </VacancyConfirmation>}
  </div>;
}
export function VacancyPage({id,actor,applicationEntry=false}:{id:string;actor:Actor|null;applicationEntry?:boolean}) {
  const staff=roleAllows(actor?.role,'vacancy.read');
  const candidate=actor?.role==='candidate';
  const source=`${staff?'staff':'public'}:${actor?.id??'guest'}:${actor?.role??'guest'}:${id}:${applicationEntry}`;
  const [resource,setResource]=useState<{source:string;value?:any;applicationId?:string|null;error?:string}|null>(null),[retry,setRetry]=useState(0);
  const value=resource?.source===source?resource.value:null,error=resource?.source===source?resource.error:undefined;
  const existingApplication=resource?.source===source?resource.applicationId:null;
  useEffect(()=>{
    if(id==='new')return;let active=true;
    (async()=>{
      const own=candidate?await api<{applicationId:string|null}>(`applications/for-vacancy/${id}`):null;
      let value;
      try{value=await api(`${staff?'':'public/'}vacancies/${id}`);}
      catch(error){
        if(!own?.applicationId||(error as {status?:number}).status!==404)throw error;
        const submitted=await api<ApplicationView>(`applications/${own.applicationId}`);
        value={id:submitted.vacancyId,title:submitted.vacancy.title,description:submitted.vacancy.description,location:submitted.vacancy.location,form:submitted.vacancy.formDefinition,notPublic:true};
      }
      if(active)setResource({source,value,applicationId:own?.applicationId??null});
    })().catch(e=>{if(active)setResource({source,error:errorMessage(e)});});
    return()=>{active=false;};
  },[id,staff,candidate,source,retry]);
  if(id==='new')return staff&&actor?<StaffVacancyPage vacancy={null} actor={actor}/>:<Notice message="Recruiter/admin sign-in required to create a vacancy."/>;
  if(error)return <><Notice message={error}/><button onClick={()=>{setResource(null);setRetry(value=>value+1);}}>Retry</button><a href="#/vacancies">Back to positions</a></>;
  if(!value)return <Loading/>;
  if(staff&&actor)return <StaffVacancyPage key={`${value.id}:${actor.id}:${actor.role}`} vacancy={value as StaffVacancy} actor={actor}/>;
  return <div className="candidate-vacancy"><a className="vacancy-back-link" href={applicationEntry?`#/vacancies/${id}`:'#/vacancies'}>{applicationEntry?'← Vacancy summary':'← Open positions'}</a><Heading title={value.title} description={value.location}/>
    <section className="vacancy-section prose"><h2>About the role</h2><p className="prewrap">{value.description}</p></section>
    {existingApplication?<section className="vacancy-section"><h2>Already applied</h2><p>Your submitted answers and documents stay unchanged.</p>{value.notPublic&&<p className="muted">This vacancy is no longer publicly listed. Your submission is still available.</p>}<a className="button primary" href={`#/applications/${existingApplication}`}>View your application</a></section>
      :candidate&&applicationEntry?<CandidateForm vacancy={value} accountEmail={actor.email}/>
      :<section className="vacancy-section"><h2>Your application</h2>{candidate?<><p>Review the role, then complete the application with your answers and documents.</p><a className="button primary" href={`#/vacancies/${id}/apply`}>Apply for this role</a></>:!actor?<><p>Sign in with a candidate account to apply.</p><button className="primary" onClick={()=>{try{sessionStorage.setItem('returnTo',`/vacancies/${id}/apply`);}catch{/* Sign-in still works without storage. */}go('/login');}}>Sign in to apply</button></>:<p>Use a candidate account to apply.</p>}</section>}
  </div>;
}
