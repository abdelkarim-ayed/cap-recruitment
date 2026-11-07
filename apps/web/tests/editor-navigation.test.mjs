import {test,afterEach} from 'node:test';
import {equal,deepEqual,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','Event','MouseEvent','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,cleanup,waitFor,fireEvent,act}=await import('@testing-library/react');
const {App}=await import('../src/app.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;sessionStorage.clear();window.history.replaceState(null,'','/');});
const yes={allowed:true,visible:true,reason:null},no={allowed:false,visible:false,reason:'Unavailable'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const unload=()=>{const event=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;};
const owner={id:'hr',name:'Synthetic HR',email:'hr@example.test'};
const vacancy={id:'v1',ownerId:'hr',owner,title:'Synthetic vacancy',description:'Synthetic role',location:'',status:'draft',revision:3,
  formDefinition:{version:1,inputs:[{id:'name',name:'name',label:'Name',type:'text',required:true,args:{}}]},processingDefinition:{version:1,tasks:[]},
  actions:{edit:yes,publish:no,close:no}};
const plan={vacancyId:'v1',revision:4,owner,editable:true,frozen:false,actions:{edit:yes},
  steps:[{id:'i1',position:0,name:'Technical',instructions:'Saved instructions'}],items:[],total:0,limit:20,offset:0};
function fixture({initial='/vacancies/v1',planTotal=0,mutate}={}){
  window.history.replaceState(null,'',`/#${initial}`);
  let vacancyRecord={...vacancy},planRecord={...plan,steps:plan.steps.map(step=>({...step})),total:planTotal};
  const calls=[];
  globalThis.fetch=async(path,init)=>{
    calls.push({path,method:init?.method??'GET',body:init?.body});
    if(init?.method){
      if(path.endsWith('/sign-out'))return json({});
      if(mutate){const custom=mutate(path,init);if(custom)return custom;}
      const body=init.body?JSON.parse(init.body):{};
      if(path.endsWith('/interview-pipeline')){
        const saved={...planRecord,revision:planRecord.revision+1,steps:body.steps.map((step,index)=>({id:`i${index+1}`,position:index,name:step.name,instructions:step.instructions??''}))};
        planRecord=saved;return json(saved);
      }
      const saved={...vacancyRecord,...body,id:init.method==='POST'?'created':vacancyRecord.id,revision:vacancyRecord.revision+1};
      vacancyRecord=saved;return json(saved,init.method==='POST'?201:200);
    }
    if(path==='/api/me')return json({user:{id:'hr',role:'recruiter',name:'Synthetic HR',email:'hr@example.test'}});
    if(path.startsWith('/api/vacancies/v1/interview-results?'))return json(planRecord);
    if(path==='/api/vacancies/v1')return json(vacancyRecord);
    if(/^\/api\/vacancies\/[^/?]+$/.test(path))return json({...vacancyRecord,id:path.split('/').pop()});
    if(path.startsWith('/api/vacancies?'))return json({items:[],total:0,limit:20,offset:0});
    throw new Error(`Unexpected mock fetch: ${path}`);
  };
  render(React.createElement(App));
  return {calls,writes:()=>calls.filter(call=>call.method!=='GET')};
}
test('dirty vacancy draft requires Stay or Discard and never saves on leave',async()=>{
  const f=fixture();
  await screen.findByLabelText('Position title');
  fireEvent.change(screen.getByLabelText('Position title'),{target:{value:'Changed title'}});
  equal(unload(),true);
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));
  await screen.findByRole('alertdialog');
  ok(screen.getByRole('heading',{name:'Leave with an unsaved vacancy draft?'}));
  equal(screen.getByLabelText('Position title').value,'Changed title');equal(location.hash,'#/vacancies/v1');equal(f.writes().length,0);
  fireEvent.click(screen.getByText('Stay'));equal(screen.queryByRole('alertdialog'),null);equal(screen.getByLabelText('Position title').value,'Changed title');
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));await screen.findByRole('alertdialog');
  fireEvent.click(screen.getByText('Discard and leave'));await screen.findByRole('link',{name:'+ Create vacancy'});
  equal(location.hash,'#/vacancies');equal(f.writes().length,0);equal(unload(),false);
});
test('untouched create and saved vacancy editors do not warn',async()=>{
  fixture({initial:'/vacancies/new'});
  await screen.findByRole('heading',{name:'Create a vacancy'});equal(unload(),false);
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));await screen.findByRole('link',{name:'+ Create vacancy'});
  equal(screen.queryByRole('alertdialog'),null);
  cleanup();
  fixture();
  await screen.findByLabelText('Position title');equal(unload(),false);
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));await screen.findByRole('link',{name:'+ Create vacancy'});
  equal(screen.queryByRole('alertdialog'),null);equal(unload(),false);
});
test('a successful create redirects only after the draft becomes clean',async()=>{
  const f=fixture({initial:'/vacancies/new'});
  await screen.findByRole('heading',{name:'Create a vacancy'});
  fireEvent.change(screen.getByLabelText('Position title'),{target:{value:'Created role'}});
  fireEvent.change(screen.getByLabelText('Description'),{target:{value:'Created description'}});
  await act(async()=>{fireEvent.click(screen.getByText('Save draft'));});
  await waitFor(()=>equal(location.hash,'#/vacancies/created'));
  equal(screen.queryByRole('alertdialog'),null);equal(f.writes().length,1);equal(unload(),false);
});
test('an in-flight vacancy save blocks leaving until settled, then asks before leaving',async()=>{
  let finish;
  const f=fixture({mutate:(path,init)=>init.method==='PATCH'?new Promise(resolve=>{finish=resolve;}):undefined});
  await screen.findByLabelText('Position title');
  fireEvent.change(screen.getByLabelText('Position title'),{target:{value:'Changed title'}});
  fireEvent.click(screen.getByText('Save draft'));
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));
  await screen.findByRole('heading',{name:'Vacancy update in progress'});
  equal(screen.getByText('Discard and leave').disabled,true);equal(f.writes().length,1);equal(unload(),true);
  await act(async()=>finish(json({...vacancy,title:'Changed title',revision:4})));
  await screen.findByRole('heading',{name:'Leave this page?'});equal(unload(),false);
  equal(screen.getByText('Leave page').disabled,false);
  fireEvent.click(screen.getByText('Leave page'));await screen.findByRole('link',{name:'+ Create vacancy'});
  equal(f.writes().length,1);equal(location.hash,'#/vacancies');
});
test('a failed vacancy save keeps edits and never retries during the warning',async()=>{
  const f=fixture({mutate:(path,init)=>init.method==='PATCH'?json({message:'Vacancy changed; reload.'},409):undefined});
  await screen.findByLabelText('Position title');
  fireEvent.change(screen.getByLabelText('Position title'),{target:{value:'Changed title'}});
  fireEvent.click(screen.getByText('Save draft'));await screen.findByText('Vacancy changed; reload.');
  equal(unload(),true);
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));await screen.findByRole('alertdialog');
  fireEvent.click(screen.getByText('Stay'));equal(screen.getByLabelText('Position title').value,'Changed title');
  equal(f.writes().length,1);equal(unload(),true);
});
test('dirty interview plan requires Stay or Discard and keeps local steps',async()=>{
  const f=fixture({initial:'/vacancies/v1/interviews'});
  const input=await screen.findByLabelText('Interview 1 name');equal(input.value,'Technical');
  fireEvent.change(input,{target:{value:'Changed step'}});
  equal(unload(),true);ok(screen.getByText('Unsaved changes'));
  fireEvent.click(screen.getByRole('link',{name:'← Vacancy'}));
  await screen.findByRole('alertdialog');ok(screen.getByRole('heading',{name:'Leave with an unsaved interview plan?'}));
  equal(screen.getByLabelText('Interview 1 name').value,'Changed step');equal(f.writes().length,0);equal(location.hash,'#/vacancies/v1/interviews');
  fireEvent.click(screen.getByText('Stay'));equal(screen.getByLabelText('Interview 1 name').value,'Changed step');
  fireEvent.change(screen.getByLabelText('Interview 1 name'),{target:{value:'Technical'}});equal(unload(),false);equal(screen.queryByText('Unsaved changes'),null);
  fireEvent.change(screen.getByLabelText('Interview 1 name'),{target:{value:'Changed step'}});
  fireEvent.click(screen.getByRole('link',{name:'← Vacancy'}));await screen.findByRole('alertdialog');
  fireEvent.click(screen.getByText('Discard and leave'));await screen.findByLabelText('Position title');
  equal(location.hash,'#/vacancies/v1');equal(f.writes().length,0);
});
test('a successful plan save uses its response as the clean baseline',async()=>{
  const f=fixture({initial:'/vacancies/v1/interviews'});
  await screen.findByLabelText('Interview 1 name');
  fireEvent.change(screen.getByLabelText('Interview 1 name'),{target:{value:'Changed step'}});
  await act(async()=>{fireEvent.click(screen.getByText('Save interview plan'));});
  await waitFor(()=>equal(screen.queryByText('Unsaved changes'),null));
  equal(unload(),false);equal(f.writes().length,1);
  deepEqual(JSON.parse(f.writes()[0].body),{expectedRevision:4,steps:[{name:'Changed step',instructions:'Saved instructions'}]});
  fireEvent.click(screen.getByRole('link',{name:'← Vacancy'}));await screen.findByLabelText('Position title');
  equal(screen.queryByRole('alertdialog'),null);
});
test('a plan conflict retains local edits and never retries',async()=>{
  const f=fixture({initial:'/vacancies/v1/interviews',mutate:(path,init)=>init.method==='PUT'?json({message:'Interview plan changed; reload it.'},409):undefined});
  await screen.findByLabelText('Interview 1 name');
  fireEvent.change(screen.getByLabelText('Interview 1 name'),{target:{value:'Changed step'}});
  fireEvent.click(screen.getByText('Save interview plan'));await screen.findByText('Interview plan changed; reload it.');
  equal(screen.getByLabelText('Interview 1 name').value,'Changed step');ok(screen.getByText('Unsaved changes'));equal(unload(),true);equal(f.writes().length,1);
  fireEvent.click(screen.getByRole('link',{name:'← Vacancy'}));await screen.findByRole('alertdialog');
  fireEvent.click(screen.getByText('Stay'));equal(screen.getByLabelText('Interview 1 name').value,'Changed step');equal(f.writes().length,1);
});
test('plan pagination preserves local edits instead of silently resetting them',async()=>{
  const f=fixture({initial:'/vacancies/v1/interviews',planTotal:40});
  await screen.findByLabelText('Interview 1 name');
  fireEvent.change(screen.getByLabelText('Interview 1 name'),{target:{value:'Changed step'}});
  await act(async()=>{fireEvent.click(screen.getByText('Next'));});
  await waitFor(()=>equal(f.calls.filter(call=>call.path.includes('interview-results?limit=20&offset=20')).length,1));
  equal(screen.getByLabelText('Interview 1 name').value,'Changed step');equal(unload(),true);equal(f.writes().length,0);
});
test('plan pending save blocks discard/leave until it settles',async()=>{
  let finish;
  const f=fixture({initial:'/vacancies/v1/interviews',mutate:(path,init)=>init.method==='PUT'?new Promise(resolve=>{finish=resolve;}):undefined});
  await screen.findByLabelText('Interview 1 name');
  fireEvent.change(screen.getByLabelText('Interview 1 name'),{target:{value:'Changed step'}});
  fireEvent.click(screen.getByText('Save interview plan'));
  fireEvent.click(screen.getByRole('link',{name:'← Vacancy'}));
  await screen.findByRole('heading',{name:'Interview plan save in progress'});
  equal(screen.getByText('Discard and leave').disabled,true);equal(f.writes().length,1);
  await act(async()=>finish(json({...plan,revision:5,steps:[{id:'i1',position:0,name:'Changed step',instructions:'Saved instructions'}]})));
  await screen.findByRole('heading',{name:'Leave this page?'});equal(unload(),false);
  fireEvent.click(screen.getByText('Leave page'));await screen.findByLabelText('Position title');
  equal(f.writes().length,1);
});
