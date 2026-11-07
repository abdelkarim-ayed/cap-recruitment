import { useEffect, useState } from 'react';
import { api, post, go, errorMessage, type Actor } from './api';
import { Badge, Heading, Notice, Loading } from './ui';
import { VacancyList, VacancyPage } from './vacancies';
import { ApplicationList, ApplicationPage } from './applications';
import { Login } from './login';
import { Agenda, InterviewPage, PipelinePage, ApplicationWorkflow, Inbox } from './interviews';
import { roleAllows } from '@recruitment/domain';

export function App() {
  const [actor,setActor] = useState<Actor|null>(null), [ready,setReady]=useState(false), [path,setPath]=useState(location.hash.slice(1)||'/vacancies'), [error,setError]=useState('');
  useEffect(()=>{ const changed=()=>setPath(location.hash.slice(1)||'/vacancies'); window.addEventListener('hashchange',changed); api<{user:Actor}>('me').then(result=>setActor(result.user)).catch(()=>{}).finally(()=>setReady(true)); return ()=>window.removeEventListener('hashchange',changed); },[]);
  if (!ready) return <Loading/>;
  const staff=roleAllows(actor?.role,'vacancy.read');
  const parts=path.split('?')[0].split('/').filter(Boolean);
  return <div className="layout"><aside className="sidebar"><a className="brand" href="#/vacancies"><span className="brand-mark">R</span><span>Recruitment<small>Company workspace</small></span></a><span className="nav-label">WORKSPACE</span><nav>
    <a className={parts[0]==='vacancies'?'active':''} href="#/vacancies">▦ <span>{staff?'Vacancies':'Open positions'}</span></a>
    {actor && roleAllows(actor.role,'application.list') && <a className={parts[0]==='applications'?'active':''} href="#/applications">☷ <span>{staff?'Applications':'My applications'}</span></a>}
    {actor&&roleAllows(actor.role,'interview.list')&&<a className={parts[0]==='interviews'?'active':''} href="#/interviews">◷ <span>{staff?'Interview agenda':'My interviews'}</span></a>}
    {actor&&roleAllows(actor.role,'notification.list')&&<a className={parts[0]==='inbox'?'active':''} href="#/inbox">✉ <span>Inbox</span></a>}
  </nav></aside>
    <div className="workspace"><div className="topbar"><span className="muted">Recruitment / {parts[0] || 'Workspace'}</span><div className="actions">{actor ? <>{roleAllows(actor.role,'notification.list')&&<a className={`button inbox-shortcut ${parts[0]==='inbox'?'selected':''}`} href="#/inbox" aria-label="Open inbox"><span aria-hidden="true">✉</span> Inbox</a>}<div className="account-summary"><span className="identity">{actor.name || actor.email}<small>{actor.email}</small></span><Badge>{actor.role}</Badge></div><button onClick={async()=>{try{await post('auth/sign-out',{});setActor(null);sessionStorage.removeItem('returnTo');go('/login');}catch(e){setError(errorMessage(e));}}}>Sign out</button></> : <a className="button primary" href="#/login">Sign in</a>}</div></div>
    <main><Notice message={error}/>{parts[0]==='login' ? <Login onLogin={setActor}/> : parts[0]==='interviews'&&actor&&roleAllows(actor.role,'interview.list') ? (parts[1]?<InterviewPage key={`${path}:${actor.id}`} id={parts[1]} actor={actor}/>:<Agenda key={actor.id} staff={staff}/>) : parts[0]==='inbox'&&actor&&roleAllows(actor.role,'notification.list') ? <Inbox key={actor.id}/> : parts[0]==='vacancies' ? (parts[1] ? (parts[2]==='interviews'&&staff?<PipelinePage key={path} id={parts[1]}/>:<VacancyPage key={`${path}:${actor?.id}`} id={parts[1]} actor={actor}/>) : <VacancyList key={actor?.id||'public'} staff={staff} actorId={actor?.id}/>) : parts[0]==='applications' && actor && roleAllows(actor.role,'application.list') ? (parts[1] ? (parts[2]==='interviews'&&staff?<ApplicationWorkflow key={path} id={parts[1]}/>:<ApplicationPage key={`${path}:${actor.id}`} id={parts[1]} staff={staff}/>) : <ApplicationList key={path} staff={staff}/>) : <Heading title="Sign in to continue" description="This section needs an authorized account."><a className="button primary" href="#/login">Sign in</a></Heading>}
    </main></div></div>;
}
