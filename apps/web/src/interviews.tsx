import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { api, post, download, errorMessage, go, type Actor } from './api';
import { Badge, Heading, Notice, Loading, Pager } from './ui';
import { PdfPreview } from './pdf-preview';
import { roleAllows, type ApplicationView, type InterviewCause, type InterviewDetail, type InterviewPlanEntry, type InterviewPlanInput, type InterviewPlanView, type InterviewResults, type InterviewView, type NotificationView, type Page, type Person, type WorkflowView } from '@recruitment/domain';
import { useNavigationGuard, useNavigation, useOptionalNavigation } from './navigation-guard';
import { actorScope, agendaPath, agendaQuery, agendaReturnPath, defaultAgenda, localDate, mondayOfWeek, parseAgenda, readAgendaMemory, rememberAgenda, type AgendaContext } from './agenda-context';
import { IntentDialog } from './intent-dialog';
import { ApplicationInformation } from './application-information';
import { Icon, IconButton } from './icons';
import { inboxFilters, useListFilters } from './list-memory';

const timezone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone;
const dateValue=localDate;
const times=Array.from({length:48},(_,index)=>`${String(Math.floor(index/2)).padStart(2,'0')}:${index%2?'30':'00'}`);
export function OwnerLine({owner}:{owner:Person}) { return <p className="small muted">Vacancy owner: <strong>{owner.name}</strong> · <a href={`mailto:${owner.email}`}>{owner.email}</a></p>; }
export function cancellationText(cause:InterviewCause|null) {
  if(cause?.type==='interview_failed')return `Cancelled after Fail in ${cause.stepName}.`;
  if(cause?.type==='hr_ended_application')return `Application ended by HR: ${cause.reason}`;
  return cause&&'reason' in cause?cause.reason:'Cancelled by recruiter.';
}
function InterviewRows({items}:{items:InterviewView[]}) { return <div className="table-scroll"><table><thead><tr><th scope="col">Interview</th><th scope="col">Time</th><th scope="col">Responsible interviewer</th><th scope="col">Result</th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td><a href={`#/interviews/${i.id}`}>{i.stepName}</a></td><td>{new Date(i.startsAt).toLocaleString()}<small>{i.durationMinutes} min</small></td><td>{i.interviewer.name||i.interviewer.email}</td><td><Badge>{i.outcome||i.status}</Badge>{typeof i.score==='number'&&<small>Score: {i.score}/10</small>}{i.schedulingIssue&&<small>Rescheduling requested</small>}</td></tr>)}</tbody></table></div>; }

export function PipelinePage({id}:{id:string}) {
  const [page,setPage]=useState<InterviewResults|null>(null),[steps,setSteps]=useState<InterviewPlanInput[]>([]),[offset,setOffset]=useState(0),[refresh,setRefresh]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const planLoaded=useRef(false);
  useEffect(()=>{let active=true;setError('');api<InterviewResults>(`vacancies/${id}/interview-results?limit=20&offset=${offset}`).then(p=>{if(active){setPage(p);if(!planLoaded.current){planLoaded.current=true;setSteps(p.steps.map(s=>({name:s.name,instructions:s.instructions??''})));}}}).catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[id,offset,refresh]);
  const dirty=!!page&&(steps.length!==page.steps.length||steps.some((step,index)=>step.name!==page.steps[index].name||(step.instructions??'')!==(page.steps[index].instructions??'')));
  useNavigationGuard(dirty,busy,'plan');
  async function savePlan(event:FormEvent){
    event.preventDefault();if(!page)return;setBusy(true);setError('');
    try{
      const saved=await api<InterviewPlanView>(`vacancies/${id}/interview-pipeline`,{method:'PUT',body:JSON.stringify({expectedRevision:page.revision,steps})});
      setSteps(saved.steps.map(step=>({name:step.name,instructions:step.instructions??''})));
      setPage(current=>current?{...current,...saved}:current);
    }catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  }
  return <><Heading title="Interview plan & results"><a className="button" href={`#/vacancies/${id}`}>← Vacancy</a><a className="button" href={`#/applications?vacancy=${id}`}>Applications</a><button onClick={()=>setRefresh(v=>v+1)}>Refresh</button></Heading><Notice message={error}/>{!page?!error&&<Loading/>:<><OwnerLine owner={page.owner}/><section className="card"><h2>Interview plan</h2>{page.frozen&&<p className="small muted">The interview plan is locked after publication or scheduling. Appointment arrangements remain editable.</p>}{!page.actions.edit.allowed&&!page.frozen&&<p className="small muted">Only the vacancy owner can configure the draft interview plan.</p>}
    <form onSubmit={savePlan}><fieldset disabled={!page.actions.edit.allowed||busy}>{steps.map((s,index)=><div className="grid two" key={index}><label>Interview {index+1} name<input required maxLength={100} value={s.name} onChange={e=>{const name=e.target.value;setSteps(v=>v.map((item,i)=>i===index?{...item,name}:item));}}/></label><label>Preparation instructions<textarea maxLength={4000} value={s.instructions} onChange={e=>{const instructions=e.target.value;setSteps(v=>v.map((item,i)=>i===index?{...item,instructions}:item));}}/></label>{page.actions.edit.allowed&&<button type="button" onClick={()=>setSteps(v=>v.filter((_,i)=>i!==index))}>Remove interview {index+1}</button>}</div>)}{!steps.length&&<p>No interviews configured. An empty plan is valid and freezes at publication.</p>}{page.actions.edit.allowed&&<div className="actions"><button type="button" disabled={steps.length>=10} onClick={()=>setSteps(v=>[...v,{name:'',instructions:''}])}>Add interview</button><span className="muted">{dirty?'Unsaved changes':''}</span><button className="primary">{busy?'Saving…':'Save interview plan'}</button></div>}</fieldset></form></section>
    <section className="card"><h2>Candidate results</h2><div className="table-scroll"><table><thead><tr><th>Candidate</th>{page.steps.map((s:any)=><th key={s.id}>{s.name}</th>)}<th>Application</th></tr></thead><tbody>{page.items.map((a:any)=><tr key={a.id}><td><a href={`#/applications/${a.id}/interviews`}>{a.candidate.name||a.candidate.email}</a><small>{a.candidate.email}</small></td>{page.steps.map((s:any)=>{const i=a.interviews.find((i:any)=>i.stepId===s.id);return <td key={s.id}>{i?<><a href={`#/interviews/${i.id}`}><Badge>{i.outcome||i.status}</Badge></a>{i.score!==null&&<small>Score: {i.score}/10</small>}</>:'—'}</td>;})}<td><Badge>{a.stage}</Badge></td></tr>)}</tbody></table></div>{!page.items.length&&<p>No applications yet.</p>}<Pager offset={offset} total={page.total} change={setOffset}/></section></>}</>;
}

export function ScheduleForm({steps,initial,onSave,busy,onDirtyChange}:{steps?:InterviewPlanEntry[];initial?:InterviewView;onSave:(value:any)=>Promise<void>;busy:boolean;onDirtyChange?:(dirty:boolean)=>void}) {
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const start=initial?new Date(initial.startsAt):tomorrow;
  const [date,setDate]=useState(dateValue(start)),[time,setTime]=useState(initial?`${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`:'09:00');
  const [interviewerId,setInterviewer]=useState(initial?.interviewer.id||''),[stepId,setStep]=useState(steps?.[0]?.id||''),[durationMinutes,setDuration]=useState<number>(initial?.durationMinutes||60),[meeting,setMeeting]=useState(initial?.meeting||''),[directory,setDirectory]=useState<Person[]>([]),[error,setError]=useState('');
  const baseline=useRef(JSON.stringify({date,time,interviewerId,stepId,durationMinutes,meeting}));
  useEffect(()=>{onDirtyChange?.(JSON.stringify({date,time,interviewerId,stepId,durationMinutes,meeting})!==baseline.current);},[date,time,interviewerId,stepId,durationMinutes,meeting,onDirtyChange]);
  useEffect(()=>{let active=true;api<{items:Person[]}>('interviewers').then(p=>{if(active)setDirectory(p.items);}).catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[]);
  return <form onSubmit={async e=>{e.preventDefault();if(busy)return;setError('');try{if(steps&&!steps.some(step=>step.id===stepId))throw new Error('Choose an available interview.');const local=new Date(`${date}T${time}:00`);if(dateValue(local)!==date||`${String(local.getHours()).padStart(2,'0')}:${String(local.getMinutes()).padStart(2,'0')}`!==time)throw new Error('That local time does not exist. Choose another time.');await onSave({...(steps?{stepId}:{}),interviewerId,startsAt:local.toISOString(),durationMinutes,timezone:timezone(),meeting});}catch(e){setError(errorMessage(e));}}}><Notice message={error}/><fieldset disabled={busy}><div className="grid two">{steps&&<label>Interview<select required value={steps.some(step=>step.id===stepId)?stepId:''} onChange={e=>setStep(e.target.value)}><option value="" disabled>Choose interview</option>{steps.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}<label>Interviewer<select required value={interviewerId} onChange={e=>setInterviewer(e.target.value)}><option value="">Choose interviewer</option>{directory.map(u=><option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}</select></label>
    <label>Date<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label><label>Start time<select aria-label="Start time" required value={time} onChange={e=>setTime(e.target.value)}>{times.map(t=><option key={t}>{t}</option>)}</select><small>{timezone()}</small></label><label>Duration<select value={durationMinutes} onChange={e=>setDuration(Number(e.target.value))}>{[30,60,90,120].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></label><label>Meeting link or location<input required maxLength={1000} value={meeting} onChange={e=>setMeeting(e.target.value)}/></label></div><button className="primary">{busy?'Saving…':initial?'Save schedule':'Schedule interview'}</button></fieldset></form>;
}

type RecruitmentIntent='screening'|'reject'|'offer'|'hired'|'schedule';
type ScreeningChoice=''|'preselected'|'not_selected';
const undecidedStage=(stage:string)=>['received','review_ready'].includes(stage);
const remainingInterviews=(flow:WorkflowView)=>flow.steps.filter(step=>!flow.interviews.some(interview=>interview.stepId===step.id));
function intentAvailable(intent:RecruitmentIntent,flow:WorkflowView,choice:ScreeningChoice=''){
  const usable=(action:WorkflowView['actions']['reject'])=>action.visible&&action.allowed;
  if(intent==='screening')return undecidedStage(flow.stage)&&(choice?usable(choice==='preselected'?flow.actions.preselect:flow.actions.reject):usable(flow.actions.preselect)||usable(flow.actions.reject));
  if(intent==='reject')return !undecidedStage(flow.stage)&&usable(flow.actions.reject);
  if(intent==='offer')return flow.isOwner&&['preselected','interview'].includes(flow.stage)&&usable(flow.actions.offer);
  if(intent==='hired')return flow.isOwner&&flow.stage==='offer'&&usable(flow.actions.hire);
  return ['preselected','interview'].includes(flow.stage)&&usable(flow.actions.schedule)&&remainingInterviews(flow).length>0;
}
const loadWorkflow=(id:string)=>Promise.all([api<WorkflowView>(`applications/${id}/interviews`),api<ApplicationView>(`applications/${id}`)]);

export function ApplicationWorkflow({id}:{id:string}) {return <RecruitmentWorkflow key={id} id={id}/>;}
function RecruitmentWorkflow({id}:{id:string}) {
  const [flow,setFlow]=useState<WorkflowView|null>(null),[record,setRecord]=useState<ApplicationView|null>(null),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[needsRefresh,setNeedsRefresh]=useState(false),[intent,setIntent]=useState<RecruitmentIntent|null>(null);
  const [choice,setChoice]=useState<ScreeningChoice>(''),[reason,setReason]=useState(''),[scheduleDirty,setScheduleDirty]=useState(false);
  const header=useRef<HTMLDivElement>(null),writing=useRef(false);
  const dirty=intent!==null&&(choice!==''||reason.length>0||scheduleDirty);
  useNavigationGuard(dirty,busy,'recruitment');
  useEffect(()=>{let active=true;loadWorkflow(id).then(([f,r])=>{if(active){setFlow(f);setRecord(r);}}).catch(e=>{if(active)setError(errorMessage(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[id]);
  function closeDialog(){if(writing.current||loading)return;setIntent(null);setChoice('');setReason('');setScheduleDirty(false);}
  function openDialog(next:RecruitmentIntent){if(!flow||busy||loading||needsRefresh||!intentAvailable(next,flow))return;setError('');setMessage('');setChoice('');setReason('');setScheduleDirty(false);setIntent(next);}
  async function refreshWorkflow(){
    if(busy||loading)return;setLoading(true);setNeedsRefresh(true);setError('');setMessage('');
    try{const [f,r]=await loadWorkflow(id);setFlow(f);setRecord(r);setNeedsRefresh(false);setMessage('Current state loaded. Review it before confirming.');}
    catch(e){setError(`${errorMessage(e)} Use Refresh to check the current state. No automatic retry was made.`);}
    finally{setLoading(false);}
  }
  async function commitDecision(){
    if(!flow||!intent||intent==='schedule'||writing.current||loading||needsRefresh||!intentAvailable(intent,flow,choice)||(intent==='screening'&&!choice)||(intent==='reject'&&!reason.trim())||reason.length>2000)return;
    const stage=intent==='screening'?choice:intent==='reject'?'not_selected':intent;
    writing.current=true;setBusy(true);setError('');setMessage('');
    try{
      const saved=await post<WorkflowView>(`applications/${id}/stage`,{expectedRevision:flow.revision,stage,...(stage==='not_selected'&&reason.trim()?{reason:reason.trim()}:{})});
      setFlow(saved);setIntent(null);setChoice('');setReason('');setMessage('Decision recorded.');
    }catch(e){setNeedsRefresh(true);setError(`${errorMessage(e)} Use Refresh to check the current state before confirming again. No automatic retry was made.`);}
    finally{writing.current=false;setBusy(false);}
  }
  async function schedule(value:Record<string,unknown>){
    if(!flow||intent!=='schedule'||writing.current||loading||needsRefresh||!intentAvailable('schedule',flow))return;
    writing.current=true;setBusy(true);setError('');setMessage('');
    try{
      await post(`applications/${id}/interviews`,{...value,expectedRevision:flow.revision});
      setIntent(null);setScheduleDirty(false);setNeedsRefresh(true);
      const [f,r]=await loadWorkflow(id);setFlow(f);setRecord(r);setNeedsRefresh(false);setMessage('Interview scheduled.');
    }catch(e){setNeedsRefresh(true);setError(`${errorMessage(e)} Use Refresh to check the current state before scheduling again. No automatic retry was made.`);}
    finally{writing.current=false;setBusy(false);}
  }
  if(!flow||!record)return <><Notice message={error}/>{loading?<Loading/>:<button onClick={()=>void refreshWorkflow()}>Retry</button>}</>;
  const screening=undecidedStage(flow.stage),available=remainingInterviews(flow),disabled=busy||loading||needsRefresh;
  const offerVisible=flow.isOwner&&['preselected','interview'].includes(flow.stage)&&flow.actions.offer.visible;
  const hireVisible=flow.isOwner&&flow.stage==='offer'&&flow.actions.hire.visible;
  const rejectVisible=!screening&&flow.actions.reject.visible&&flow.actions.reject.allowed;
  const showInterviews=flow.interviews.length>0||!screening&&['preselected','interview'].includes(flow.stage);
  const dialogTitle=intent==='screening'?'Screening decision':intent==='reject'?'End this application?':intent==='offer'?'Record offer?':intent==='hired'?'Record hired?':'Schedule interview';
  const description=intent==='screening'?'The screening decision is final. It locks automated results and human review, even if unfinished, and sends the candidate a notification. Preselection is not an offer.'
    :intent==='reject'?'This ends the application and cancels any remaining unfinished interviews. The internal reason is not shown to the candidate. This cannot be undone.'
    :intent==='offer'?(flow.steps.length?'All configured interviews have passed. Record the owner offer decision? Hired remains a separate confirmation. This does not send a candidate message.':'No interviews are configured. Record the owner offer decision for this preselected application? Hired remains a separate confirmation. This does not send a candidate message.')
    :intent==='hired'?'An offer is already recorded. Confirm the separate Hired decision? This does not send a candidate message.'
    :'Choose the planned interview, responsible interviewer and meeting details. Times use your local timezone. Nothing is booked until you submit.';
  return <div className="workflow-page">
    <a className="application-back-link" href={`#/applications/${id}`}>← Application information</a>
    <div ref={header} tabIndex={-1} className="workflow-heading-focus"><Heading title={record.candidate.name||record.candidate.email} status={<Badge>{flow.stage}</Badge>}><IconButton icon="refresh" label="Refresh recruitment progress" disabled={busy||loading} onClick={()=>void refreshWorkflow()}/></Heading></div>
    <p className="application-vacancy"><a href={`#/vacancies/${record.vacancyId}`}>{record.vacancy.title}</a></p>
    <p className="workflow-owner">Owner: {flow.owner.name||flow.owner.email}{flow.isOwner&&' (you)'}</p>
    {!intent&&<><Notice message={error}/><Notice message={message} success/></>}
    {needsRefresh&&!intent&&<p className="notice">Refresh the current state before taking another action.</p>}
    {screening&&<section className="workflow-section"><h2>Screening</h2><p className="muted">Choose whether this application continues.</p>{intentAvailable('screening',flow)&&<button className="primary" disabled={disabled} onClick={()=>openDialog('screening')}>Screening decision</button>}</section>}
    {showInterviews&&<section className="workflow-section"><div className="section-heading"><h2>Interviews</h2>{intentAvailable('schedule',flow)&&<button className="primary" disabled={disabled} onClick={()=>openDialog('schedule')}>Schedule interview</button>}</div>
      {flow.interviews.length>0&&<InterviewRows items={flow.interviews}/>}
      {!flow.steps.length?<p className="muted">No interviews configured.</p>:available.length>0&&<ul className="workflow-plan">{available.map(step=><li key={step.id}><span>{step.name}</span><span className="muted">Not scheduled</span></li>)}</ul>}
    </section>}
    {!screening&&(offerVisible||hireVisible||rejectVisible)&&<section className="workflow-section"><h2>Next action</h2><div className="actions">
      {offerVisible&&<button className="primary" disabled={disabled||!flow.actions.offer.allowed} onClick={()=>openDialog('offer')}>Record offer</button>}
      {hireVisible&&<button className="primary" disabled={disabled||!flow.actions.hire.allowed} onClick={()=>openDialog('hired')}>Record hired</button>}
      {rejectVisible&&<button className="danger" disabled={disabled} onClick={()=>openDialog('reject')}>Not selected</button>}
    </div>{offerVisible&&!flow.actions.offer.allowed&&<p className="small muted">{flow.actions.offer.reason}</p>}</section>}
    {intent&&<IntentDialog title={dialogTitle} description={description} busy={busy||loading} confirmLabel="Confirm decision" confirmDisabled={needsRefresh||!intentAvailable(intent,flow,choice)||(intent==='screening'&&!choice)||(intent==='reject'&&!reason.trim())||reason.length>2000} onConfirm={intent==='schedule'?undefined:()=>void commitDecision()} onCancel={closeDialog} fallbackFocus={header}>
      <Notice message={error}/><Notice message={message} success/>
      {needsRefresh&&<button disabled={busy||loading} onClick={()=>void refreshWorkflow()}>Refresh current state</button>}
      {!needsRefresh&&!intentAvailable(intent,flow,choice)&&<p className="notice">This action is no longer available. Cancel to inspect the current state.</p>}
      {intent==='screening'&&<fieldset className="workflow-screening-choice" disabled={disabled}><legend>Decision</legend>
        <label className="check"><input type="radio" name="screening-decision" checked={choice==='preselected'} disabled={!flow.actions.preselect.visible||!flow.actions.preselect.allowed} onChange={()=>{setChoice('preselected');setReason('');}}/>Preselect</label>
        <label className="check"><input type="radio" name="screening-decision" checked={choice==='not_selected'} disabled={!flow.actions.reject.visible||!flow.actions.reject.allowed} onChange={()=>setChoice('not_selected')}/>Not selected</label>
      </fieldset>}
      {(intent==='reject'||intent==='screening'&&choice==='not_selected')&&<label>{intent==='screening'?'Internal reason (optional)':'Internal reason'}<textarea required={intent==='reject'} maxLength={2000} disabled={disabled||!intentAvailable(intent,flow,choice)} value={reason} onChange={event=>setReason(event.target.value)}/></label>}
      {intent==='schedule'&&<ScheduleForm steps={available} busy={disabled||!intentAvailable('schedule',flow)} onDirtyChange={setScheduleDirty} onSave={schedule}/>}
    </IntentDialog>}
  </div>;
}

export function Agenda({staff,actor}:{staff:boolean;actor:Actor}) {
  const {path,replacePath}=useNavigation(),scope=actorScope(actor);
  const [initial]=useState(()=>readAgendaMemory(scope));
  const query=path.split('?')[1];
  const context=query===undefined?(initial?.context??defaultAgenda()):parseAgenda(query);
  const {start,view,awaitingFeedback,offset}=context,canonical=agendaPath(context);
  const [result,setResult]=useState<{key:string;page:Page<InterviewView>}|null>(null),[refresh,setRefresh]=useState(0),[error,setError]=useState('');
  const page=result?.key===canonical?result.page:null;
  // Canonicalize in place: Back must return to an explicit list state rather
  // than re-resolving a bare agenda entry against a newer remembered context.
  useEffect(()=>{if(path!==canonical)replacePath(canonical);},[path,canonical,replacePath]);
  useEffect(()=>{
    const saved=readAgendaMemory(scope);
    rememberAgenda(scope,{start,view,awaitingFeedback,offset},saved&&agendaPath(saved.context)===canonical?saved.scrollY:0);
  },[canonical,scope,start,view,awaitingFeedback,offset]);
  function change(next:AgendaContext){go(agendaPath(parseAgenda(agendaQuery(next))));}
  const restored=useRef('');
  useLayoutEffect(()=>{
    if(!page)return;
    if(restored.current!==canonical){
      const saved=readAgendaMemory(scope);
      window.scrollTo(0,saved&&agendaPath(saved.context)===canonical?saved.scrollY:0);
      restored.current=canonical;
    }
    const save=()=>rememberAgenda(scope,{start,view,awaitingFeedback,offset},window.scrollY);
    save();window.addEventListener('scroll',save,{passive:true});
    return()=>{window.removeEventListener('scroll',save);};
  },[page,canonical,scope,start,view,awaitingFeedback,offset]);
  useEffect(()=>{
    let active=true;setError('');setResult(null);
    const from=new Date(`${start}T00:00:00`),to=new Date(from);to.setDate(to.getDate()+7);
    api<Page<InterviewView>>(`interviews?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&view=${view}${view==='past'&&awaitingFeedback?'&awaitingFeedback=true':''}&limit=20&offset=${offset}`).then(p=>{
      if(!active)return;
      if(offset>0&&offset>=p.total){replacePath(agendaPath({start,view,awaitingFeedback,offset:Math.max(0,Math.floor((p.total-1)/20)*20)}));return;}
      setResult({key:canonical,page:p});
    }).catch(e=>{if(active)setError(errorMessage(e));});
    return()=>{active=false;};
  },[start,view,awaitingFeedback,offset,refresh,canonical,replacePath]);
  function move(days:number) { const date=new Date(`${start}T12:00:00`);date.setDate(date.getDate()+days);change({...context,start:dateValue(date),offset:0}); }
  const groups:Record<string,InterviewView[]>={};for(const item of page?.items||[])(groups[dateValue(new Date(item.startsAt))]??=[]).push(item);
  const weekEnd=new Date(`${start}T12:00:00`);weekEnd.setDate(weekEnd.getDate()+6);
  const rangeFormat=new Intl.DateTimeFormat(undefined,{day:'numeric',month:'short',year:'numeric'});
  const currentWeek=mondayOfWeek(new Date());
    return <><Heading title={staff?'Interview agenda':'My interviews'} description={`Times shown in ${timezone()}`}><IconButton icon="refresh" label="Refresh agenda" onClick={()=>setRefresh(v=>v+1)}/></Heading><Notice message={error}/>
      <div className="table-controls agenda-controls"><label>View<select value={view} onChange={e=>change({...context,view:e.target.value as AgendaContext['view'],awaitingFeedback:false,offset:0})}><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="cancelled">Cancelled</option></select></label><div className="agenda-week-controls" role="group" aria-label="Week navigation"><IconButton icon="previous" label="Previous week" disabled={view==='upcoming'&&start<=currentWeek} onClick={()=>move(-7)}/><button onClick={()=>change({...context,start:currentWeek,offset:0})}>This week</button><IconButton icon="next" label="Next week" disabled={view==='past'&&start>=currentWeek} onClick={()=>move(7)}/><span className="agenda-week-range" aria-live="polite">{rangeFormat.format(new Date(`${start}T12:00:00`))} – {rangeFormat.format(weekEnd)}</span></div>{view==='past'&&<label className="check agenda-feedback-filter"><input type="checkbox" checked={awaitingFeedback} onChange={e=>change({...context,awaitingFeedback:e.target.checked,offset:0})}/>Awaiting feedback only</label>}</div>
      {view==='past'&&<p className="agenda-view-note">Started interviews, newest first. Feedback may still be pending.</p>}
      {!page?!error&&<Loading/>:<>{Object.entries(groups).map(([day,items])=><section className="card" key={day}><h2>{new Date(`${day}T12:00:00`).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</h2>{items.map(i=><article className="extraction-card" key={i.id}><div className="section-heading"><div><p className="agenda-time">{new Date(i.startsAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} <span>({i.durationMinutes} min)</span></p><a className="strong" href={`#/interviews/${i.id}?${agendaQuery(context)}`}>{i.stepName} · {i.candidate.name||i.candidate.email}</a><small>{i.vacancyTitle}</small></div>{(i.outcome||i.status==='cancelled')?<Badge>{i.outcome||i.status}</Badge>:view==='past'&&<span className="agenda-feedback-state">Awaiting feedback</span>}</div>{staff&&<small>Responsible interviewer: {i.interviewer.name}</small>}{i.schedulingIssue&&<span className="attention-cue" title={i.schedulingIssue}><Icon name="alert"/>Rescheduling requested</span>}</article>)}</section>)}{!page.items.length&&<section className="card">{view==='past'&&awaitingFeedback?'No interviews awaiting feedback this week.':`No ${view} interviews this week.`}</section>}<Pager offset={offset} total={page.total} change={offset=>change({...context,offset})}/></>}
   </>;
}

export function InterviewPage({id,actor}:{id:string;actor:Actor}) {return <AppointmentDetail key={`${id}:${actor.id}:${actor.role}`} id={id} actor={actor}/>;}
function AppointmentDetail({id,actor}:{id:string;actor:Actor}) {
  const navigation=useOptionalNavigation();
  const returnPath=agendaReturnPath(navigation?.path??window.location.hash.slice(1));
  const [record,setRecord]=useState<InterviewDetail|null>(null),[application,setApplication]=useState<ApplicationView|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[needsRefresh,setNeedsRefresh]=useState(false);
  const [mode,setMode]=useState<'schedule'|'feedback'|'cancel'|'scheduling-issue'|null>(null),[notes,setNotes]=useState(''),[score,setScore]=useState(''),[outcome,setOutcome]=useState(''),[reason,setReason]=useState(''),[confirmFeedback,setConfirmFeedback]=useState(false),[scheduleDirty,setScheduleDirty]=useState(false),[preview,setPreview]=useState<{id:string;filename:string}|null>(null);
  const focusTarget=useRef<HTMLDivElement>(null),writing=useRef(false);
  useNavigationGuard(mode!==null&&(!!notes||!!score||!!outcome||!!reason||scheduleDirty),busy,'appointment');
  async function read(){setApplication(null);setPreview(null);const r=await api<InterviewDetail>(`interviews/${id}`);setRecord(r);if(r.actions.readApplication.visible)setApplication(await api<ApplicationView>(`interviews/${id}/application`));}
  useEffect(()=>{let active=true;api<InterviewDetail>(`interviews/${id}`).then(async r=>{if(!active)return;setRecord(r);if(r.actions.readApplication.visible){const a=await api<ApplicationView>(`interviews/${id}/application`);if(active)setApplication(a);}}).catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[id]);
  async function refreshAppointment(){if(busy||loading)return;setLoading(true);setNeedsRefresh(true);setError('');try{await read();setNeedsRefresh(false);}catch(e){setError(errorMessage(e));}finally{setLoading(false);}}
  function permitted(kind:NonNullable<typeof mode>){if(!record)return false;const action=kind==='schedule'?record.actions.reschedule:kind==='feedback'?record.actions.submitFeedback:kind==='cancel'?record.actions.cancel:record.actions.requestRescheduling;return action.visible&&action.allowed;}
  function close(){if(busy||loading)return;setMode(null);setNotes('');setScore('');setOutcome('');setReason('');setScheduleDirty(false);setConfirmFeedback(false);}
  async function commit(kind:NonNullable<typeof mode>,body:Record<string,unknown>){if(!record||writing.current||loading||needsRefresh||!permitted(kind))return;writing.current=true;setBusy(true);setError('');try{await api(`interviews/${id}/${kind}`,{method:kind==='schedule'?'PUT':'POST',body:JSON.stringify({...body,expectedRevision:record.revision})});setMode(null);setNotes('');setScore('');setOutcome('');setReason('');setScheduleDirty(false);setConfirmFeedback(false);setNeedsRefresh(true);await read();setNeedsRefresh(false);}catch(e){setNeedsRefresh(true);setError(`${errorMessage(e)} Refresh the appointment before confirming again. No automatic retry was made.`);}finally{writing.current=false;setBusy(false);}}
  if(!record)return <><Notice message={error}/>{!error?<Loading/>:<button onClick={()=>void refreshAppointment()}>Retry</button>}</>;
  const staff=roleAllows(actor.role,'workflow.read'),disabled=busy||loading||needsRefresh;
  const feedbackValid=!!notes.trim()&&notes.length<=10000&&['pass','fail'].includes(outcome)&&(score===''||Number.isInteger(Number(score))&&Number(score)>=0&&Number(score)<=10);
  return <div className="appointment-detail">
    <a className="application-back-link" href={`#${returnPath}`}>← Agenda</a>
    <div ref={focusTarget} tabIndex={-1}><Heading title={record.stepName} status={<Badge>{record.outcome||record.status}</Badge>}><IconButton icon="refresh" label="Refresh appointment" disabled={busy||loading} onClick={()=>void refreshAppointment()}/></Heading></div>
    <p className="appointment-time">{new Date(record.startsAt).toLocaleString()} <span>({record.durationMinutes} min) · {timezone()}</span></p>
    <p className="appointment-identity">Candidate: {staff?<a href={`#/applications/${record.applicationId}`}>{record.candidate.name||record.candidate.email}</a>:record.candidate.name||record.candidate.email}</p>
    <p className="appointment-identity">Responsible interviewer: {record.interviewer.name||record.interviewer.email}</p>
    <p className="application-vacancy">{staff?<a href={`#/vacancies/${record.vacancyId}`}>{record.vacancyTitle}</a>:record.vacancyTitle}</p>
    <details className="appointment-contacts"><summary>Contact details</summary><p>Interviewer: {record.interviewer.email}</p><p>Vacancy owner: {record.owner.name} · {record.owner.email}</p></details>
    {!mode&&<Notice message={error}/>}
    <section className="workflow-section"><h2>Meeting details</h2><p>{/^https?:\/\//i.test(record.meeting)?<a href={record.meeting} target="_blank" rel="noreferrer">Join meeting ↗</a>:record.meeting}</p>{record.instructions&&<p className="prewrap">{record.instructions}</p>}
      {record.status==='cancelled'&&<p className="notice">{cancellationText(record.cancellationCause)}</p>}{record.schedulingIssue&&<p className="notice">Rescheduling request: {record.schedulingIssue}</p>}
      <div className="actions">{record.actions.reschedule.visible&&<button disabled={disabled||!record.actions.reschedule.allowed} onClick={()=>setMode('schedule')}>Reschedule / reassign</button>}{record.actions.requestRescheduling.visible&&<button disabled={disabled||!record.actions.requestRescheduling.allowed} onClick={()=>setMode('scheduling-issue')}>Request rescheduling</button>}{record.actions.submitFeedback.visible&&<button className="primary" disabled={disabled||!record.actions.submitFeedback.allowed} onClick={()=>setMode('feedback')}>Give feedback</button>}</div>
      {record.actions.submitFeedback.visible&&!record.actions.submitFeedback.allowed&&<p className="muted">Feedback opens when the interview starts. Refresh then.</p>}
      {record.actions.cancel.visible&&<details className="appointment-other"><summary>Other actions</summary><p className="muted">A cancelled interview cannot be replaced for this configured interview. Prefer rescheduling when arrangements change.</p><button className="danger" disabled={disabled||!record.actions.cancel.allowed} onClick={()=>setMode('cancel')}>Cancel interview</button></details>}
    </section>
    {record.status==='completed'&&<section className="workflow-section"><h2>Submitted feedback</h2><p>{record.outcome==='pass'?'Pass':record.outcome==='fail'?'Fail':'Outcome unavailable'} · Score: {record.score===null?'Not provided':`${record.score}/10`}</p><p className="prewrap">{record.notes}</p><small>{record.submittedAt?new Date(record.submittedAt).toLocaleString():''} · {record.interviewer.name}</small></section>}
    {application&&<details className="appointment-application"><summary>Submitted application and documents</summary><ApplicationInformation record={application} onPreview={setPreview} onDownload={async doc=>{try{await download(`interviews/${id}/documents/${doc.id}`,doc.filename);}catch(e){setError(errorMessage(e));}}}/></details>}
    {preview&&application&&<PdfPreview documentBase={`interviews/${id}/documents`} applicationId={record.applicationId} document={preview} onClose={()=>setPreview(null)}/>}
    {staff&&<p className="related-links"><a href={`#/applications/${record.applicationId}/interviews`}>Recruitment progress</a></p>}
    {mode&&<IntentDialog title={mode==='schedule'?'Reschedule interview':mode==='feedback'?(confirmFeedback?`Submit ${outcome} result?`:'Interview feedback'):mode==='cancel'?'Cancel interview?':'Request rescheduling'} description={mode==='schedule'?'Update arrangements or the responsible interviewer. Times use your local timezone.':mode==='feedback'?(confirmFeedback?`${outcome==='fail'?'Fail ends this application and cancels every other unfinished interview.':'Pass continues recruitment; it does not create an offer or another booking.'} Submitted feedback is final.`:'Record your assessment, then review the final result before submitting.'):mode==='cancel'?'This cancels the appointment, not the application. It cannot be replaced for this configured interview.':'Explain the change you need. HR will resolve the request; this does not reschedule the appointment automatically.'} busy={busy||loading} fallbackFocus={focusTarget} onCancel={close} onConfirm={mode==='schedule'||mode==='feedback'&&!confirmFeedback?undefined:()=>void commit(mode,mode==='feedback'?{notes,score:score===''?null:Number(score),outcome}:{reason:reason.trim()})} confirmLabel={mode==='feedback'?'Submit final feedback':'Confirm'} confirmDisabled={disabled||!permitted(mode)||(mode==='feedback'?!feedbackValid:!reason.trim()||reason.length>2000)}>
      <Notice message={error}/>{needsRefresh&&<button disabled={busy||loading} onClick={()=>void refreshAppointment()}>Refresh appointment</button>}{!permitted(mode)&&<p className="notice">This action is no longer available. Cancel to inspect the current appointment.</p>}
      {mode==='schedule'&&<ScheduleForm initial={record} busy={disabled||!permitted(mode)} onDirtyChange={setScheduleDirty} onSave={value=>commit('schedule',value)}/>}
      {mode==='feedback'&&!confirmFeedback&&<form onSubmit={event=>{event.preventDefault();if(feedbackValid&&!disabled&&permitted('feedback'))setConfirmFeedback(true);}}><fieldset disabled={disabled||!permitted('feedback')}><label>Notes<textarea required rows={5} maxLength={10000} value={notes} onChange={e=>setNotes(e.target.value)}/></label><label>Score (optional, 0–10)<input type="number" min={0} max={10} step={1} value={score} onChange={e=>setScore(e.target.value)}/></label><label>Interview outcome<select required value={outcome} onChange={e=>setOutcome(e.target.value)}><option value="">Choose a result</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label><button className="primary" disabled={!feedbackValid}>Review final feedback</button></fieldset></form>}
      {mode==='feedback'&&confirmFeedback&&<><p className="prewrap">{notes}</p><p>Score: {score||'Not provided'}</p><button disabled={busy} onClick={()=>setConfirmFeedback(false)}>Back to assessment</button></>}
      {(mode==='cancel'||mode==='scheduling-issue')&&<label>Reason<textarea required maxLength={2000} disabled={disabled||!permitted(mode)} value={reason} onChange={e=>setReason(e.target.value)}/></label>}
    </IntentDialog>}
  </div>;
}

export function Inbox({memoryScope}:{memoryScope?:string}={}) {
  const [page,setPage]=useState<Page<NotificationView>|null>(null),[refresh,setRefresh]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [{read,offset},setFilters]=useListFilters(memoryScope,'inbox',inboxFilters);
  const setRead=(read:string)=>setFilters({read}),setOffset=(offset:number)=>setFilters({offset});
  useEffect(()=>{let active=true;setError('');setPage(null);api<Page<NotificationView>>(`inbox?read=${read}&limit=20&offset=${offset}`).then(p=>{if(active){if(offset>0&&offset>=p.total){setOffset(Math.max(0,Math.floor((p.total-1)/20)*20));return;}setPage(p);}}).catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[read,offset,refresh]);
  async function markRead(n:NotificationView,open=false) {
    setBusy(true);setError('');
    try {
      if(!n.readAt)await post(`inbox/${n.id}/read`,{});
      if(open&&n.interviewId)location.hash=`/interviews/${n.interviewId}`;
      else if(open&&n.applicationId)location.hash=`/applications/${n.applicationId}`;
      else {if(read==='unread'&&page?.items.length===1&&offset>0)setOffset(Math.max(0,offset-20));setRefresh(v=>v+1);}
    }catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  }
  return <><Heading title="Inbox"><a className="button" href="#/applications">Applications</a><button onClick={()=>setRefresh(v=>v+1)}>Refresh</button></Heading><Notice message={error}/><div className="table-controls"><label>Messages<select value={read} onChange={e=>{setRead(e.target.value);setOffset(0);}}><option value="unread">Unread</option><option value="all">All retained messages</option></select></label></div>{!page?!error&&<Loading/>:<section className="card">{!page.items.length&&<p className="muted">No messages in this view.</p>}{page.items.map((n:NotificationView)=><article className={`inbox-message ${n.readAt?'is-read':'is-unread'}`} key={n.id}><div className="section-heading"><h2><span aria-hidden="true" className="message-icon">{n.kind==='feedback'?'✓':n.kind==='cancelled'?'×':n.kind==='scheduling_issue'?'!':'◷'}</span>{n.title}</h2><Badge>{n.readAt?'Read':'Unread'}</Badge></div><p className="prewrap">{n.body}</p><small>{new Date(n.createdAt).toLocaleString()}</small><div className="actions">{n.interviewId&&<button className="primary" disabled={busy} onClick={()=>markRead(n,true)}>Open interview</button>}{n.applicationId&&<button className="primary" disabled={busy} onClick={()=>markRead(n,true)}>Open application</button>}{!n.readAt&&<button className="compact" disabled={busy} onClick={()=>markRead(n)}><span aria-hidden="true">✓</span> Mark as read</button>}</div></article>)}<Pager offset={offset} total={page.total} change={setOffset}/></section>}</>;
}
