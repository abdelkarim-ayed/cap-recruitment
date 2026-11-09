import {test,afterEach} from 'node:test';
import {equal,deepEqual,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,within,cleanup,waitFor,fireEvent}=await import('@testing-library/react');
const {default:userEvent}=await import('@testing-library/user-event');
const {VacancyList}=await import('../src/vacancies.tsx');
const {NavigationBoundary}=await import('../src/navigation-guard.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;window.history.replaceState(null,'','/');});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const items=[
  {id:'v1',title:'Backend developer',location:'Tunis · Hybrid',ownerId:'hr',owner:{name:'Alex',email:'alex@example.test'},status:'draft',revision:7},
  {id:'v2',title:'Support specialist',location:'Remote',ownerId:'other',owner:{name:'Sam',email:'sam@example.test'},status:'published',revision:8},
  {id:'v3',title:'Operations analyst',ownerId:'third',owner:{name:'Robin',email:'robin@example.test'},status:'closed',revision:9},
];
function fixture({staff=true,actorId='hr',records=items,total=records.length}={}){
  const calls=[];
  globalThis.fetch=async(path,init)=>{calls.push({path,method:init?.method??'GET',credentials:init?.credentials});return json({items:records,total});};
  render(React.createElement(NavigationBoundary,null,React.createElement(VacancyList,{staff,actorId})));
  return calls;
}
test('staff list has a single title link, quiet ownership, location and one text status per vacancy',async()=>{
  const calls=fixture();const table=await screen.findByRole('table',{name:'Vacancies'});
  deepEqual(within(table).getAllByRole('columnheader').map(cell=>cell.textContent),['Position','Location','Status']);
  const rows=within(table).getAllByRole('row').slice(1);
  for(const [index,row] of rows.entries()){
    const links=within(row).getAllByRole('link');equal(links.length,1);
    equal(links[0].textContent,items[index].title);equal(links[0].getAttribute('href'),`#/vacancies/${items[index].id}`);
    equal(links[0].querySelector('button,a,input'),null);equal(row.hasAttribute('tabindex'),false);equal(row.hasAttribute('role'),false);
    equal(row.querySelectorAll('.badge').length,0);equal(row.querySelectorAll('.vacancy-list-status').length,1);
  }
  ok(within(rows[0]).getByText('Owner:',{exact:false}).textContent.includes('Alex (you)'));
  equal(rows[1].textContent.includes('(you)'),false);
  ok(within(rows[0]).getByText('Draft'));ok(within(rows[1]).getByText('Published'));ok(within(rows[2]).getByText('Closed'));
  ok(within(rows[0]).getByText('Tunis · Hybrid'));ok(within(rows[2]).getByText('—'));
  equal(screen.queryByText(/Revision/),null);equal(screen.queryByText('Owned by you'),null);equal(screen.queryByText('Open →'),null);
  equal(screen.queryByText('alex@example.test'),null);equal(document.querySelector('a[href^="mailto:"]'),null);
  equal(screen.getByRole('link',{name:'+ Create vacancy'}).getAttribute('href'),'#/vacancies/new');
  deepEqual(calls,[{path:'/api/vacancies?limit=20&offset=0&sort=newest',method:'GET',credentials:'include'}]);
});
test('owner fallback stays readable without inventing a name or claiming ownership for anonymous actors',async()=>{
  globalThis.fetch=async()=>json({items:[{...items[0],ownerId:undefined,owner:{name:'',email:'fallback@example.test'}},{...items[1],owner:undefined}],total:2});
  render(React.createElement(VacancyList,{staff:true}));
  await screen.findByText('fallback@example.test');ok(screen.getByText('Unknown owner'));equal(document.body.textContent.includes('(you)'),false);
});
test('public list keeps title navigation but renders no staff identity, status, revisions or creation control',async()=>{
  const calls=fixture({staff:false,records:[items[1]]});
  const table=await screen.findByRole('table',{name:'Open positions'});
  deepEqual(within(table).getAllByRole('columnheader').map(cell=>cell.textContent),['Position','Location']);
  equal(within(table).getAllByRole('link').length,1);
  equal(screen.getByRole('link',{name:'Support specialist'}).getAttribute('href'),'#/vacancies/v2');
  equal(screen.queryByLabelText('Vacancy status'),null);equal(screen.queryByRole('link',{name:'+ Create vacancy'}),null);
  equal(screen.queryByText('Sam'),null);equal(screen.queryByText('sam@example.test'),null);equal(screen.queryByText('Published'),null);
  equal(screen.queryByText(/Revision/),null);equal(screen.queryByText('View & apply →'),null);
  equal(calls[0].path,'/api/public/vacancies?limit=20&offset=0&sort=newest');
});
test('native title links support keyboard focus, modifier-click and normal guarded-router navigation',async()=>{
  fixture();const link=await screen.findByRole('link',{name:'Backend developer'});
  const user=userEvent.setup({document});
  screen.getByLabelText('Sort vacancies').focus();await user.tab();equal(document.activeElement,link);
  const initial=location.hash;let intercepted;
  const observe=event=>{intercepted=event.defaultPrevented;event.preventDefault();};
  document.addEventListener('click',observe,{once:true});fireEvent.click(link,{ctrlKey:true});
  equal(intercepted,false);equal(location.hash,initial);
  await user.keyboard('{Enter}');equal(location.hash,'#/vacancies/v1');
});
test('status/sort/pagination retain server queries and changing a filter resets the page without writes',async()=>{
  const calls=fixture({total:45});await screen.findByRole('table');
  fireEvent.click(screen.getByRole('button',{name:'Next',exact:true}));
  await waitFor(()=>ok(calls.at(-1).path.includes('offset=20')));await screen.findByRole('table');
  fireEvent.change(screen.getByLabelText('Vacancy status'),{target:{value:'draft'}});
  await waitFor(()=>equal(calls.at(-1).path,'/api/vacancies?limit=20&offset=0&sort=newest&status=draft'));await screen.findByRole('table');
  fireEvent.click(screen.getByRole('button',{name:'Next',exact:true}));await screen.findByRole('table');
  fireEvent.change(screen.getByLabelText('Sort vacancies'),{target:{value:'title'}});
  await waitFor(()=>equal(calls.at(-1).path,'/api/vacancies?limit=20&offset=0&sort=title&status=draft'));await screen.findByRole('table');
  equal(calls.some(call=>call.method!=='GET'),false);equal(screen.getByRole('button',{name:'Previous',exact:true}).disabled,true);
  equal(screen.queryByLabelText('My drafts'),null);
});
test('loading and empty results remain explicit without fabricated rows or status signals',async()=>{
  let finish;globalThis.fetch=()=>new Promise(resolve=>{finish=resolve;});
  render(React.createElement(VacancyList,{staff:true,actorId:'hr'}));
  ok(screen.getByRole('status'));equal(screen.queryByRole('table'),null);
  finish(json({items:[],total:0}));await screen.findByText('No vacancies match this view.');
  equal(screen.queryByRole('table'),null);ok(screen.getByText('0 records'));
  equal(screen.getByRole('button',{name:'Next',exact:true}).disabled,true);equal(document.querySelector('.vacancy-list-status'),null);
});
test('failed list fetch stays recoverable with an explicit retry and no stale rows',async()=>{
  let calls=0;globalThis.fetch=async()=>++calls===1?json({message:'List unavailable'},503):json({items:[items[0]],total:1});
  render(React.createElement(VacancyList,{staff:true,actorId:'hr'}));await screen.findByRole('alert');
  equal(screen.queryByRole('table'),null);equal(calls,1);
  fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByRole('link',{name:'Backend developer'});
  equal(screen.queryByRole('alert'),null);equal(calls,2);
});
