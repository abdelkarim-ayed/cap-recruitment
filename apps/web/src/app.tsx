import { useEffect, useState } from 'react';
import { api, post, go, errorMessage, type Actor } from './api';
import { Badge, Heading, Notice, Loading } from './ui';
import { VacancyList, VacancyPage } from './vacancies';
import { ApplicationList, ApplicationPage } from './applications';
import { Login } from './login';
import { Agenda, InterviewPage, PipelinePage, ApplicationWorkflow, Inbox } from './interviews';
import { roleAllows } from '@recruitment/domain';
import { NavigationBoundary, useNavigation } from './navigation-guard';
import { actorScope, clearAgendaMemory, readAgendaMemory } from './agenda-context';
import { activateListMemory } from './list-memory';
import { Icon } from './icons';

export function App() {
  return <NavigationBoundary><Workspace/></NavigationBoundary>;
}
function Workspace(){
  const {path,requestAction}=useNavigation();
  const [actor,setActor] = useState<Actor|null>(null), [ready,setReady]=useState(false), [error,setError]=useState('');
  function acceptActor(next:Actor|null){
    activateListMemory(next?actorScope(next):null);
    if(next)readAgendaMemory(actorScope(next));else clearAgendaMemory();
    setActor(next);
  }
  useEffect(()=>{let active=true;api<{user:Actor}>('me').then(result=>{if(active)acceptActor(result.user);}).catch(()=>{if(active)acceptActor(null);}).finally(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
  if (!ready) return <Loading/>;
  const staff=roleAllows(actor?.role,'vacancy.read');
  const memoryScope=actor?actorScope(actor):undefined;
  const parts=path.split('?')[0].split('/').filter(Boolean);
  const sectionLabel=({vacancies:staff?'Vacancies':'Open positions',applications:staff?'Applications':'My applications',interviews:staff?'Interview agenda':'My interviews',inbox:'Inbox',login:'Sign in'} as Record<string,string>)[parts[0]]??'Workspace';
  return <div className="layout"><aside className="sidebar"><a className="brand" href="#/vacancies"><span className="brand-mark">R</span><span>Recruitment<small>Company workspace</small></span></a><span className="nav-label">WORKSPACE</span><nav>
    <a className={parts[0]==='vacancies'?'active':''} href="#/vacancies">▦ <span>{staff?'Vacancies':'Open positions'}</span></a>
    {actor && roleAllows(actor.role,'application.list') && <a className={parts[0]==='applications'?'active':''} href="#/applications">☷ <span>{staff?'Applications':'My applications'}</span></a>}
    {actor&&roleAllows(actor.role,'interview.list')&&<a className={parts[0]==='interviews'?'active':''} href="#/interviews">◷ <span>{staff?'Interview agenda':'My interviews'}</span></a>}
  </nav></aside>
    <div className="workspace"><div className="topbar"><span className="muted">Recruitment / {sectionLabel}</span><div className="actions">{actor ? <>{roleAllows(actor.role,'notification.list')&&<a className={`button inbox-shortcut ${parts[0]==='inbox'?'selected':''}`} href="#/inbox" aria-label="Open inbox" aria-current={parts[0]==='inbox'?'page':undefined}><Icon name="inbox"/> Inbox</a>}<div className="account-summary"><span className="identity">{actor.name || actor.email}<small>{actor.email}</small></span><Badge>{actor.role}</Badge></div><button onClick={()=>requestAction(async()=>{try{await post('auth/sign-out',{});acceptActor(null);try{sessionStorage.removeItem('returnTo');}catch{/* Storage is optional. */}go('/login');}catch(e){setError(errorMessage(e));}})}>Sign out</button></> : <a className="button primary" href="#/login">Sign in</a>}</div></div>
    <main><Notice message={error}/>{parts[0]==='login' ? <Login onLogin={acceptActor}/> : parts[0]==='interviews'&&actor&&roleAllows(actor.role,'interview.list') ? (parts[1]?<InterviewPage key={`${path}:${memoryScope}`} id={parts[1]} actor={actor}/>:<Agenda key={memoryScope} staff={staff} actor={actor}/>) : parts[0]==='inbox'&&actor&&roleAllows(actor.role,'notification.list') ? <Inbox key={memoryScope} memoryScope={memoryScope}/> : parts[0]==='vacancies' ? (parts[1] ? (parts[2]==='interviews'&&staff?<PipelinePage key={`${path}:${memoryScope}`} id={parts[1]}/>:<VacancyPage key={`${path}:${memoryScope}`} id={parts[1]} actor={actor} applicationEntry={parts[2]==='apply'}/>) : <VacancyList key={memoryScope||'public'} memoryScope={memoryScope} staff={staff} actorId={actor?.id} candidate={actor?.role==='candidate'}/>) : parts[0]==='applications' && actor && roleAllows(actor.role,'application.list') ? (parts[1] ? (parts[2]==='interviews'&&staff?<ApplicationWorkflow key={`${path}:${memoryScope}`} id={parts[1]}/>:<ApplicationPage key={`${path}:${memoryScope}`} id={parts[1]} staff={staff}/>) : <ApplicationList key={`${path}:${memoryScope}`} memoryScope={memoryScope} staff={staff}/>) : <Heading title="Sign in to continue" description="This section needs an authorized account."><a className="button primary" href="#/login">Sign in</a></Heading>}
    </main></div></div>;
}
