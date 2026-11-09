import {test,afterEach} from 'node:test';
import {equal,deepEqual,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let scrolls=[];
window.scrollTo=(_x,y)=>{scrolls.push(y);Object.defineProperty(window,'scrollY',{configurable:true,value:y});};
const React=await import('react');
const {render,screen,cleanup,waitFor,fireEvent,act}=await import('@testing-library/react');
const {App}=await import('../src/app.tsx');
const {NavigationBoundary,useNavigation,useNavigationGuard}=await import('../src/navigation-guard.tsx');
const {actorScope,agendaPath,agendaReturnPath,defaultAgenda,parseAgenda,readAgendaMemory,rememberAgenda}=await import('../src/agenda-context.ts');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;sessionStorage.clear();window.history.replaceState(null,'','/');window.scrollTo(0,0);scrolls=[];});
const yes={allowed:true,visible:true,reason:null},no={allowed:false,visible:false,reason:'Unavailable'};
const actor={id:'hr',role:'recruiter',name:'Synthetic HR',email:'hr@example.test'};
const interviewer={...actor,id:'interviewer',role:'interviewer'};
const context={start:'2026-10-19',view:'cancelled',offset:20};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const appointment={id:'i1',applicationId:'a1',vacancyId:'v1',stepName:'Technical',candidate:{id:'c1',name:'Synthetic candidate',email:'candidate@example.test'},
  interviewer,owner:actor,vacancyTitle:'Synthetic vacancy',startsAt:'2026-10-20T10:00:00Z',durationMinutes:60,status:'cancelled',outcome:null,score:null,
  meeting:'Office',revision:3,actions:{readApplication:no,reschedule:no,cancel:no,requestRescheduling:no,submitFeedback:no}};
function fixture({initial='/interviews',user=actor,denyDetail=false,signOutFailure=false}={}){
  window.history.replaceState(null,'',`/#${initial}`);
  const calls=[];
  globalThis.fetch=async(path,init)=>{
    calls.push({path,method:init?.method??'GET'});
    if(path==='/api/me')return json({user});
    if(path==='/api/auth/sign-out')return signOutFailure?json({message:'Sign-out failed'},500):json({});
    if(path==='/api/interviews/i1')return denyDetail?json({message:'Not found'},404):json(appointment);
    if(path.startsWith('/api/interviews?'))return json({items:[appointment],total:45,limit:20,offset:0});
    throw new Error(`Unexpected mock fetch: ${path}`);
  };
  render(React.createElement(App));return calls;
}
const listReady=()=>screen.findByRole('link',{name:'Technical · Synthetic candidate'});
const hash=()=>location.hash.slice(1);
async function traverse(direction,expected){
  await act(async()=>window.history[direction]());
  await waitFor(()=>equal(hash(),expected));
}
test('route parsing validates dates/views/pages and strips unrelated or redirect parameters',()=>{
  deepEqual(parseAgenda('start=2026-02-30&view=other&offset=-20'),defaultAgenda());
  for(const offset of ['1','20.5','1e2','Infinity','2147483640','9007199254741000'])equal(parseAgenda(`offset=${offset}`).offset,0);
  deepEqual(parseAgenda('start=2024-02-29&view=feedback&offset=40'),{start:'2024-02-29',view:'feedback',offset:40});
  equal(agendaReturnPath('/interviews/i1?returnTo=https://example.test'),'/interviews');
  equal(agendaReturnPath('/interviews/i1?start=2026-10-19&view=cancelled&offset=20&candidate=secret'),agendaPath(context));
});
test('past range, existing view, pagination and scroll survive detail and explicit return without writes',async()=>{
  const calls=fixture();await listReady();
  fireEvent.change(screen.getByLabelText('Week starting'),{target:{value:context.start}});
  fireEvent.change(screen.getByLabelText('View'),{target:{value:context.view}});
  await listReady();fireEvent.click(screen.getByRole('button',{name:'Next',exact:true}));
  await waitFor(()=>equal(hash(),agendaPath(context)));await listReady();
  window.scrollTo(0,420);fireEvent.scroll(window);
  const link=screen.getByRole('link',{name:'Technical · Synthetic candidate'});
  equal(link.getAttribute('href'),`#/interviews/i1?${agendaPath(context).split('?')[1]}`);
  fireEvent.click(link);await screen.findByRole('heading',{name:'Interview appointment'});
  const back=screen.getByRole('link',{name:'← Agenda'});equal(back.getAttribute('href'),`#${agendaPath(context)}`);
  window.scrollTo(0,0);fireEvent.click(back);await listReady();
  equal(screen.getByLabelText('Week starting').value,context.start);equal(screen.getByLabelText('View').value,context.view);
  ok(screen.getByText('21–40 of 45'));equal(window.scrollY,420);
  equal(calls.filter(call=>call.method!=='GET').length,0);
  const saved=sessionStorage.getItem('recruitmentAgendaContext');
  ok(!saved.includes('candidate'));ok(!saved.includes('email'));ok(!saved.includes('actions'));ok(!saved.includes('i1'));
});
test('managed Back/Forward retains explicit list state and bare entry is canonicalized without an extra entry',async()=>{
  fixture();await listReady();const first=hash();
  fireEvent.click(screen.getByRole('button',{name:'Previous week'}));await listReady();const past=hash();ok(first!==past);
  fireEvent.click(await listReady());await screen.findByRole('heading',{name:'Interview appointment'});const detail=hash();
  await traverse('back',past);await listReady();
  await traverse('back',first);await listReady();
  await traverse('forward',past);await listReady();
  await traverse('forward',detail);await screen.findByRole('heading',{name:'Interview appointment'});
});
test('explicit URL wins over remembered state on fresh mount/reload and fresh lists still fetch',async()=>{
  rememberAgenda(actorScope(actor),context,300);
  const explicit={start:'2026-11-02',view:'feedback',offset:40};
  const calls=fixture({initial:agendaPath(explicit)});await listReady();
  equal(screen.getByLabelText('Week starting').value,explicit.start);equal(screen.getByLabelText('View').value,'feedback');
  ok(screen.getByText('41–45 of 45'));equal(window.scrollY,0);
  cleanup();fixture({initial:hash()});await listReady();equal(hash(),agendaPath(explicit));
  ok(calls.some(call=>call.path.includes('view=feedback')&&call.path.endsWith('offset=40')));
});
test('bare agenda remembers tab-session context; invalid explicit state uses current defaults, not memory',async()=>{
  rememberAgenda(actorScope(actor),context,150);
  fixture();await listReady();equal(hash(),agendaPath(context));equal(window.scrollY,150);
  cleanup();fixture({initial:'/interviews?start=bad&view=bad&offset=bad'});await listReady();
  equal(hash(),agendaPath(defaultAgenda()));equal(window.scrollY,0);
});
test('account and role changes discard remembered state; candidate cannot gain agenda access from a URL',async()=>{
  for(const user of [{...actor,id:'other'},interviewer,{...actor,role:'admin'}]){
    rememberAgenda(actorScope(actor),context,150);
    fixture({user});await listReady();equal(hash(),agendaPath(defaultAgenda()));equal(window.scrollY,0);cleanup();
  }
  rememberAgenda(actorScope(actor),context,150);
  const calls=fixture({initial:agendaPath(context),user:{...actor,id:'candidate',role:'candidate'}});
  await screen.findByRole('heading',{name:'Sign in to continue'});
  equal(calls.filter(call=>call.path.startsWith('/api/interviews')).length,0);equal(sessionStorage.getItem('recruitmentAgendaContext'),null);
});
test('successful logout clears memory; failed logout preserves current context',async()=>{
  fixture({initial:agendaPath(context),signOutFailure:true});await listReady();
  fireEvent.click(screen.getByRole('button',{name:'Sign out'}));await screen.findByText('Sign-out failed');
  equal(hash(),agendaPath(context));ok(readAgendaMemory(actorScope(actor)));cleanup();
  fixture({initial:agendaPath(context)});await listReady();
  fireEvent.click(screen.getByRole('button',{name:'Sign out'}));await screen.findByLabelText('Password');
  equal(sessionStorage.getItem('recruitmentAgendaContext'),null);
});
test('unavailable storage does not break routes, detail return or logout',async()=>{
  const descriptor=Object.getOwnPropertyDescriptor(window,'sessionStorage');
  Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new Error('Storage blocked');}});
  try{
    fixture({initial:agendaPath(context)});await listReady();fireEvent.click(await listReady());
    await screen.findByRole('heading',{name:'Interview appointment'});
    fireEvent.click(screen.getByRole('link',{name:'← Agenda'}));await listReady();equal(hash(),agendaPath(context));
    fireEvent.click(screen.getByRole('button',{name:'Sign out'}));await screen.findByLabelText('Password');
  }finally{Object.defineProperty(window,'sessionStorage',descriptor);}
});
test('direct appointment uses bare agenda fallback, while revoked access is still denied by a fresh detail fetch',async()=>{
  fixture({initial:'/interviews/i1',user:interviewer});await screen.findByRole('heading',{name:'Interview appointment'});
  equal(screen.getByRole('link',{name:'← Agenda'}).getAttribute('href'),'#/interviews');cleanup();
  const calls=fixture({initial:`/interviews/i1?${agendaPath(context).split('?')[1]}`,denyDetail:true});
  await screen.findByText('Not found');equal(screen.queryByRole('heading',{name:'Interview appointment'}),null);
  ok(calls.some(call=>call.path==='/api/interviews/i1'));
});
test('appointment links retain native modifier-click semantics',async()=>{
  fixture({initial:agendaPath(context)});const link=await listReady();const initial=hash();let prevented;
  // Prevent JSDOM's default navigation only after the router has observed it.
  const observe=event=>{prevented=event.defaultPrevented;event.preventDefault();};
  document.addEventListener('click',observe,{once:true});fireEvent.click(link,{ctrlKey:true});
  equal(prevented,false);equal(hash(),initial);equal(link.tagName,'A');
});
test('unchanged local-date and feedback ranges preserve timezone/DST interpretation',async()=>{
  const calls=fixture({initial:'/interviews?start=2026-11-01&view=agenda&offset=0'});await listReady();
  let url=new URL(calls.find(call=>call.path.startsWith('/api/interviews?')).path,'http://localhost');
  equal(url.searchParams.get('from'),new Date('2026-11-01T00:00:00').toISOString());
  equal(url.searchParams.get('to'),new Date('2026-11-08T00:00:00').toISOString());
  fireEvent.change(screen.getByLabelText('View'),{target:{value:'feedback'}});await listReady();
  await waitFor(()=>ok(calls.some(call=>call.path.includes('view=feedback'))));
  url=new URL(calls.find(call=>call.path.includes('view=feedback')).path,'http://localhost');
  const from=new Date('2026-11-01T00:00:00');from.setDate(from.getDate()-90);
  equal(url.searchParams.get('from'),from.toISOString());equal(url.searchParams.get('to'),new Date('2026-11-02T00:00:00').toISOString());
});
test('route canonicalization cannot bypass a registered dirty/pending navigation guard',async()=>{
  function Editor(){
    const {replacePath}=useNavigation();useNavigationGuard(true,true,'plan');
    return React.createElement('button',{onClick:()=>replacePath(agendaPath(context))},'Replace route');
  }
  window.history.replaceState(null,'','/#/vacancies/v1/interviews');
  render(React.createElement(NavigationBoundary,null,React.createElement(Editor)));
  fireEvent.click(screen.getByText('Replace route'));await screen.findByRole('heading',{name:'Interview plan save in progress'});
  equal(hash(),'/vacancies/v1/interviews');equal(screen.getByText('Discard and leave').disabled,true);
  fireEvent.click(screen.getByText('Stay'));equal(hash(),'/vacancies/v1/interviews');
});
