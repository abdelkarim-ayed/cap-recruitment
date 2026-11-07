import { test,afterEach } from 'node:test';
import { equal,deepEqual,ok } from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','File','FileList','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,cleanup,fireEvent,waitFor}=await import('@testing-library/react');
const {VacancyPage}=await import('../src/vacancies.tsx');
const {PipelinePage}=await import('../src/interviews.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;});
const allowed={allowed:true,visible:true,reason:null},denied={allowed:false,visible:false,reason:'Unavailable'};
const actor={id:'owner',role:'recruiter',name:'Synthetic owner',email:'owner@example.test'};
const vacancy={id:'vacancy',ownerId:actor.id,title:'Synthetic vacancy',description:'Synthetic role',status:'draft',revision:1,formDefinition:{version:1,inputs:[{id:'name',name:'name',label:'Name',type:'text',required:true,args:{}}]},processingDefinition:{version:1,tasks:[]},actions:{edit:allowed,publish:allowed,close:denied}};
const plan={vacancyId:vacancy.id,revision:4,steps:[{id:'interview',name:'Technical',instructions:'Saved instructions'}]};
const json=(body,status=200)=>({ok:status<400,status,headers:new Headers(),async json(){return body;}});
function setup(selectedPlan=plan,postStatus=200){
  const requests=[];
  globalThis.fetch=async(path,init)=>{
    requests.push({path,init});
    if(init?.method==='POST')return postStatus===200?json({...vacancy,status:'published',revision:2,actions:{edit:denied,publish:denied,close:allowed}}):json({message:'Interview plan changed; reload it before publishing.'},409);
    return json(path.endsWith('/interview-pipeline')?selectedPlan:vacancy);
  };
  render(React.createElement(VacancyPage,{id:vacancy.id,actor}));return requests;
}
test('publication reviews the saved plan and sends its independent revision with vacancy revision',async()=>{
  const requests=setup();fireEvent.click(await screen.findByText('Publish saved draft'));
  await screen.findByText('Saved interview plan');ok(screen.getByText('Technical'));ok(screen.getByText('Saved instructions'));
  equal(requests.filter(request=>request.init?.method==='POST').length,0);
  fireEvent.click(screen.getByText('Confirm'));await screen.findByText('Vacancy published.');
  deepEqual(JSON.parse(requests.find(request=>request.init?.method==='POST').init.body),{expectedRevision:1,expectedInterviewRevision:4});
});
test('empty plans are shown explicitly and can be published without a fake interview',async()=>{
  const requests=setup({...plan,steps:[]});fireEvent.click(await screen.findByText('Publish saved draft'));
  await screen.findByText('No interviews configured. This empty plan will also be locked.');fireEvent.click(screen.getByText('Confirm'));
  await screen.findByText('Vacancy published.');equal(requests.some(request=>request.init?.method==='PUT'),false);
});
test('editing form data after opening publication confirmation disables confirmation until saved',async()=>{
  const requests=setup();fireEvent.click(await screen.findByText('Publish saved draft'));await screen.findByText('Saved interview plan');
  fireEvent.change(screen.getByLabelText('Position title'),{target:{value:'Changed title'}});
  equal(screen.getByText('Confirm').disabled,true);equal(requests.filter(request=>request.init?.method==='POST').length,0);
});
test('stale plan closes confirmation and never automatically retries publication',async()=>{
  const requests=setup(plan,409);fireEvent.click(await screen.findByText('Publish saved draft'));await screen.findByText('Saved interview plan');fireEvent.click(screen.getByText('Confirm'));
  await screen.findByText('Interview plan changed; reload it before publishing.');
  equal(screen.queryByText('Confirm'),null);equal(requests.filter(request=>request.init?.method==='POST').length,1);
  equal(screen.getByLabelText('Position title').value,vacancy.title);
});
test('published unscheduled plan has read-only authoring controls and publication wording',async()=>{
  globalThis.fetch=async()=>json({...plan,owner:actor,frozen:true,editable:false,actions:{edit:denied},items:[],total:0});
  render(React.createElement(PipelinePage,{id:vacancy.id}));await screen.findByText('Interview plan');
  equal(screen.queryByText('Save interview plan'),null);
  await waitFor(()=>ok(screen.getByLabelText('Interview 1 name').closest('fieldset').disabled));
  ok(screen.getByText('The interview plan is locked after publication or scheduling. Appointment arrangements remain editable.'));
});
