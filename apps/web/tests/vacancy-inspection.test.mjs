import {test,afterEach} from 'node:test';
import {equal,deepEqual,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
// Lifecycle stub, not proof of native top-layer/inert/keyboard behavior.
let opened=0,closed=0;
dom.window.HTMLDialogElement.prototype.showModal=function(){opened++;this.open=true;};
dom.window.HTMLDialogElement.prototype.close=function(){closed++;this.open=false;};
const React=await import('react');
const {render,screen,within,cleanup,waitFor,fireEvent,act}=await import('@testing-library/react');
const {VacancyPage}=await import('../src/vacancies.tsx');
const {NavigationBoundary}=await import('../src/navigation-guard.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;window.history.replaceState(null,'','/');opened=0;closed=0;});
const yes={allowed:true,visible:true,reason:null},no={allowed:false,visible:false,reason:'Unavailable'};
const actor={id:'hr',role:'recruiter',name:'Synthetic HR',email:'hr@example.test'};
const vacancy={id:'v1',ownerId:'hr',owner:{name:'Alex',email:'alex@example.test'},title:'Synthetic vacancy',description:'Read the role.\nSecond paragraph.',location:'Tunis · Hybrid',status:'draft',revision:3,
  formDefinition:{version:1,inputs:[
    {id:'group',type:'separator',label:'Experience'},
    {id:'name',name:'name',label:'Full name',type:'text',required:true,args:{maxLength:200}},
    {id:'cv',name:'cv',label:'CV',type:'document',required:true,args:{accept:['.pdf'],limit:{kind:'MAX_BYTES',bytes:5000000}}},
    {id:'location',name:'location',label:'Preferred location',type:'single_choice',required:false,args:{choices:[{value:'remote',label:'Remote'},{value:'office',label:'Office'}]}},
    {id:'years',name:'years',label:'Years of experience',type:'number',required:false,args:{min:0,max:50,step:1}},
  ]},processingDefinition:{version:1,tasks:[{id:'skills_task',type:'extractSkills',sourceInputId:'cv',outputKey:'skills_private',args:{skills:['sql','typescript'],evidence:false}}]},
  actions:{edit:yes,publish:yes,close:no}};
const plan={vacancyId:'v1',revision:8,steps:[]};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const publicView={id:vacancy.id,title:vacancy.title,description:vacancy.description,location:vacancy.location,form:vacancy.formDefinition};
function setup({record=vacancy,user=actor,mutate}={}){
  window.history.replaceState(null,'',`/#/vacancies/${record.id}`);
  const calls=[];
  globalThis.fetch=async(path,init)=>{
    calls.push({path,method:init?.method??'GET',body:init?.body});
    if(init?.method){if(mutate)return mutate(path,init);throw new Error(`Unexpected mutation: ${path}`);}
    if(path.endsWith('/interview-pipeline'))return json(plan);
    if(path.startsWith('/api/public/vacancies/'))return json(publicView);
    return json(record);
  };
  const rendered=render(React.createElement(NavigationBoundary,null,React.createElement(VacancyPage,{id:record.id,actor:user})));
  return {...rendered,calls,writes:()=>calls.filter(call=>call.method!=='GET')};
}
const published=()=>({...vacancy,status:'published',actions:{edit:no,publish:no,close:yes}});
const unload=()=>{const event=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;};
test('owner draft remains editable, with plan configuration but no applications/results navigation or revision display',async()=>{
  const f=setup();await screen.findByLabelText('Position title');
  equal(screen.getByLabelText('Position title').closest('fieldset').disabled,false);
  equal(screen.getByRole('link',{name:'Configure interview plan'}).getAttribute('href'),'#/vacancies/v1/interviews');
  equal(screen.queryByRole('link',{name:'Applications'}),null);equal(screen.queryByRole('link',{name:'Interview plan & results'}),null);
  equal(screen.queryByText(/Revision/),null);equal(screen.queryByText('Owned by you'),null);equal(screen.queryByText(/Only the owner/),null);
  ok(screen.getByText('Edit job details and the application form.'));equal(f.writes().length,0);equal(unload(),false);
});
test('another HR inspects a draft as information rather than a disabled editor, with plan read navigation',async()=>{
  const f=setup({user:{...actor,id:'other',role:'admin'},record:{...vacancy,actions:{edit:no,publish:no,close:no}}});
  await screen.findByRole('heading',{name:'About the role'});
  equal(document.querySelector('input,textarea,select,form,fieldset'),null);
  equal(screen.queryByRole('button',{name:'Save draft'}),null);equal(screen.queryByRole('button',{name:'Publish saved draft'}),null);
  equal(screen.queryByRole('button',{name:'Close vacancy'}),null);equal(screen.queryByText(/Only the owner/),null);
  equal(screen.getByRole('link',{name:'View interview plan'}).getAttribute('href'),'#/vacancies/v1/interviews');
  equal(screen.queryByRole('link',{name:'Applications'}),null);equal(f.writes().length,0);equal(unload(),false);
});
test('published and closed views retain readable configuration and recruitment navigation without authoring controls',async()=>{
  for(const status of ['published','closed']){
    const f=setup({record:{...vacancy,status,actions:{edit:no,publish:no,close:no}}});
    await screen.findByRole('heading',{name:'About the role'});
    equal(document.querySelector('form,fieldset,input,textarea,select'),null);
    ok(screen.getByText('Read the role.',{exact:false}));ok(screen.getByText('Full name'));ok(screen.getByText('Experience'));
    ok(screen.getByText('Short answer · Required'));ok(screen.getByText('Up to 200 characters'));
    ok(screen.getByText(/\.pdf · One file · Up to/));ok(screen.getByText('Minimum 0 · Maximum 50 · Increments of 1'));
    ok(screen.getByText('Remote'));ok(screen.getByText('Office'));ok(screen.getByText('Skills to check: sql, typescript'));
    equal(screen.getByRole('link',{name:'Applications'}).getAttribute('href'),'#/applications?vacancy=v1');
    equal(screen.getByRole('link',{name:'Interview plan & results'}).getAttribute('href'),'#/vacancies/v1/interviews');
    equal(screen.queryByText('skills_task'),null);equal(screen.queryByText('skills_private'),null);equal(screen.queryByText(/Revision/),null);
    equal(screen.queryByRole('button',{name:'Save draft'}),null);equal(f.writes().length,0);cleanup();
  }
});
test('non-owner HR cannot see owner close action even with stale or inconsistent action metadata',async()=>{
  setup({record:published(),user:{...actor,id:'other',role:'admin'}});await screen.findByRole('heading',{name:'About the role'});
  equal(screen.queryByRole('button',{name:'Close vacancy'}),null);equal(screen.queryByText(/Only the owner/),null);
});
test('close dialog opens without writes, cancels/Escapes with focus restored, and sends only vacancy revision on confirmation',async()=>{
  const f=setup({record:published(),mutate:()=>json({...vacancy,status:'closed',revision:4,actions:{edit:no,publish:no,close:no}})});
  const trigger=await screen.findByRole('button',{name:'Close vacancy'});trigger.focus();fireEvent.click(trigger);
  let dialog=screen.getByRole('dialog',{name:'Close this vacancy?'});ok(dialog.open);equal(opened,1);equal(f.writes().length,0);
  equal(document.activeElement,within(dialog).getByRole('button',{name:'Cancel'}));
  ok(within(dialog).getByText(/recruitment can continue/));fireEvent.click(within(dialog).getByText('Cancel'));
  equal(screen.queryByRole('dialog'),null);equal(document.activeElement,trigger);equal(closed,1);
  fireEvent.click(trigger);dialog=screen.getByRole('dialog');fireEvent(dialog,new window.Event('cancel',{cancelable:true}));
  equal(screen.queryByRole('dialog'),null);equal(document.activeElement,trigger);equal(f.writes().length,0);
  fireEvent.click(trigger);fireEvent.click(within(screen.getByRole('dialog')).getByText('Confirm'));
  await screen.findByText('Vacancy closed.');equal(screen.queryByRole('dialog'),null);equal(screen.queryByRole('button',{name:'Close vacancy'}),null);
  deepEqual(JSON.parse(f.writes()[0].body),{expectedRevision:3});equal(f.writes()[0].path,'/api/vacancies/v1/close');
  ok(screen.getByRole('heading',{name:'About the role'}));ok(document.activeElement.classList.contains('vacancy-heading-focus'));
});
test('pending close blocks cancel/Escape, duplicate confirmation and leaving until it settles',async()=>{
  let finish;
  const f=setup({record:published(),mutate:()=>new Promise(resolve=>{finish=resolve;})});
  fireEvent.click(await screen.findByRole('button',{name:'Close vacancy'}));fireEvent.click(screen.getByText('Confirm'));
  const dialog=screen.getByRole('dialog');equal(within(dialog).getByText('Cancel').disabled,true);equal(within(dialog).getByText('Working…').disabled,true);
  fireEvent(dialog,new window.Event('cancel',{cancelable:true}));equal(screen.getByRole('dialog'),dialog);equal(unload(),true);
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));await screen.findByRole('heading',{name:'Vacancy update in progress'});
  equal(screen.getByText('Leave page').disabled,true);equal(f.writes().length,1);equal(dialog.open,false);
  fireEvent.click(screen.getByText('Stay'));equal(dialog.open,true);equal(f.writes().length,1);equal(unload(),true);
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));await screen.findByRole('heading',{name:'Vacancy update in progress'});
  await act(async()=>finish(json({...vacancy,status:'closed',revision:4,actions:{edit:no,publish:no,close:no}})));
  equal(unload(),false);equal(f.writes().length,1);ok(screen.getByText('Leave page'));
});
test('uncertain close failure exits dialog, keeps information and never retries automatically',async()=>{
  const f=setup({record:published(),mutate:()=>{throw new Error('Connection interrupted');}});
  fireEvent.click(await screen.findByRole('button',{name:'Close vacancy'}));fireEvent.click(screen.getByText('Confirm'));
  await screen.findByText('Connection interrupted');equal(screen.queryByRole('dialog'),null);equal(f.writes().length,1);
  ok(screen.getByRole('heading',{name:'About the role'}));equal(unload(),false);
});
test('publication transitions the owner draft into inspection and removes mutation controls without faking a booking',async()=>{
  const f=setup({mutate:()=>json({...published(),revision:4})});
  const trigger=await screen.findByRole('button',{name:'Publish saved draft'});trigger.focus();fireEvent.click(trigger);
  await screen.findByRole('dialog',{name:'Publish the saved version?'});
  ok(screen.getByText('No interviews configured. This empty plan will also be locked.'));equal(f.writes().length,0);
  ok(screen.getByText(/permanently locks the job details, application form/));
  fireEvent.click(screen.getByText('Confirm'));await screen.findByText('Vacancy published.');
  equal(screen.queryByLabelText('Position title'),null);ok(screen.getByRole('heading',{name:'About the role'}));
  equal(screen.queryByRole('button',{name:'Publish saved draft'}),null);ok(screen.getByRole('button',{name:'Close vacancy'}));
  deepEqual(JSON.parse(f.writes()[0].body),{expectedRevision:3,expectedInterviewRevision:8});equal(f.writes().length,1);
  equal(unload(),false);ok(document.activeElement.classList.contains('vacancy-heading-focus'));
});
test('public candidates see only the public application journey, with no staff configuration or navigation',async()=>{
  const f=setup({user:{...actor,id:'candidate',role:'candidate'}});await screen.findByRole('heading',{name:'Your application'});
  equal(f.calls[0].path,'/api/public/vacancies/v1');equal(screen.queryByText('Alex'),null);equal(screen.queryByText('Skills to check: sql, typescript'),null);
  equal(screen.queryByRole('link',{name:'Applications'}),null);equal(screen.queryByRole('button',{name:'Close vacancy'}),null);
  ok(screen.getByRole('button',{name:'Submit application'}));
});
test('identity/projection changes remove the staff surface immediately and wait for a fresh public fetch',async()=>{
  const f=setup({record:published()});await screen.findByRole('button',{name:'Close vacancy'});
  let finish;
  globalThis.fetch=()=>new Promise(resolve=>{finish=resolve;});
  f.rerender(React.createElement(NavigationBoundary,null,React.createElement(VacancyPage,{id:'v1',actor:null})));
  equal(screen.queryByRole('button',{name:'Close vacancy'}),null);equal(screen.queryByText('Alex'),null);ok(screen.getByRole('status'));
  await act(async()=>finish(json(publicView)));await screen.findByRole('heading',{name:'Apply for this role'});
  equal(screen.queryByText('Skills to check: sql, typescript'),null);
});
test('locked owner draft is inspection-only and missing form/automation remain explicit rather than simulated results',async()=>{
  setup({record:{...vacancy,formDefinition:{version:1,inputs:[]},processingDefinition:{version:1,tasks:[]},actions:{edit:no,publish:no,close:no}}});
  await screen.findByText('No questions configured.');ok(screen.getByText('No automated checks configured.'));
  equal(document.querySelector('form,fieldset,input,textarea,select'),null);equal(screen.queryByRole('button',{name:'Save draft'}),null);
});
test('saved-plan fetch failure leaves the draft intact and never opens a publication dialog or writes',async()=>{
  const f=setup();await screen.findByLabelText('Position title');
  globalThis.fetch=async(path,init)=>{f.calls.push({path,method:init?.method??'GET'});return json({message:'Plan unavailable'},503);};
  fireEvent.click(screen.getByRole('button',{name:'Publish saved draft'}));await screen.findByText('Plan unavailable');
  equal(screen.queryByRole('dialog'),null);equal(screen.getByLabelText('Position title').value,vacancy.title);
  equal(f.writes().length,0);equal(unload(),false);
});
