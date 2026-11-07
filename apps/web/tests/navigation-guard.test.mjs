import {test,afterEach} from 'node:test';
import {equal,deepEqual,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,cleanup,waitFor,fireEvent,act}=await import('@testing-library/react');
const {App}=await import('../src/app.tsx');
const {go}=await import('../src/api.ts');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;sessionStorage.clear();window.history.replaceState(null,'','/');});
const yes={allowed:true,visible:true,reason:null},no={allowed:false,visible:true,reason:'Unavailable'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const savedTask=(taskId='skills')=>({taskId,outputKey:taskId,sourceInputId:'cv',status:'completed',attempts:1,retryable:false,result:{status:'completed',value:{skills:['SQL']},evidence:[]},effectiveValue:{skills:['SQL']},hasCorrection:true,correction:{skills:['SQL']},provenance:{mode:'fixture',fixtureId:'SYNTHETIC ONLY'}});
function fixture({initial='/applications/app',tasks=1,candidate=false,noTasks=false,mutate}={}){
  window.history.replaceState(null,'',`/#${initial}`);
  let current={applicationId:'app',processingState:'completed',processingClosed:false,review:{status:'in_review',revision:7,required:true},readiness:{state:'ready',reason:null},release:null,actions:{edit:yes,release:no},tasks:Array.from({length:tasks},(_,i)=>savedTask(i?'other':'skills'))};
  const record={id:'app',vacancyId:'vac',candidate:{name:'Synthetic candidate',email:'candidate@example.test'},vacancy:{title:'Synthetic vacancy',formDefinition:{inputs:[]}},answers:{},documents:[],stage:'received',processingState:noTasks?'not_requested':'completed',...(!candidate?{review:{required:!noTasks},actions:{review:yes,workflow:yes,export:yes}}:{})};
  const calls=[];globalThis.fetch=async(path,init)=>{
    calls.push({path,method:init?.method??'GET',body:init?.body});
    if(init?.method){if(mutate)return mutate(path,init,current);if(path.endsWith('/sign-out'))return json({});current={...current,review:{...current.review,revision:current.review.revision+1}};return json(current);}
    if(path==='/api/me')return json({user:{id:'hr',role:candidate?'candidate':'recruiter',name:'Synthetic HR',email:'hr@example.test'}});
    if(path.endsWith('/review'))return json(current);
    if(path==='/api/applications/app')return json(record);
    if(path.includes('applications?'))return json({items:[{...record,vacancyTitle:record.vacancy.title}],total:1,reviewRequired:!candidate,limit:20,offset:0});
    if(path.includes('vacancies?')||path.includes('inbox?'))return json({items:[],total:0,limit:20,offset:0});
    throw new Error(`Unexpected mock fetch: ${path}`);
  };
  render(React.createElement(App));
  return {calls,get current(){return current;},set current(value){current=value;},writes:()=>calls.filter(call=>call.method!=='GET')};
}
async function draft(value='My unsaved correction',index=0){await screen.findAllByLabelText('Skills (comma separated)');fireEvent.change(screen.getAllByLabelText('Skills (comma separated)')[index],{target:{value}});}
const unload=()=>{const event=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;};
test('dirty links offer Stay/discard, retain mounted input and use a keyboard-contained warning',async()=>{
  const f=fixture();await draft();const input=screen.getByLabelText('Skills (comma separated)');
  fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByRole('alertdialog');equal(input.value,'My unsaved correction');equal(location.hash,'#/applications/app');equal(f.writes().length,0);
  equal(document.activeElement,screen.getByText('Stay'));fireEvent.keyDown(document,{key:'Tab',shiftKey:true});equal(document.activeElement,screen.getByText('Discard and leave'));fireEvent.keyDown(document,{key:'Tab'});equal(document.activeElement,screen.getByText('Stay'));
  fireEvent.keyDown(document,{key:'Escape'});equal(screen.queryByRole('alertdialog'),null);equal(screen.getByLabelText('Skills (comma separated)'),input);
  fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));fireEvent.click(await screen.findByText('Discard and leave'));await screen.findByRole('heading',{name:'Inbox'});equal(f.writes().length,0);equal(screen.queryByLabelText('Skills (comma separated)'),null);
});
test('reverting input or explicitly discarding its draft removes the leave/unload warning',async()=>{
  fixture();await draft();equal(unload(),true);await draft('SQL');equal(unload(),false);equal(screen.queryByText('Unsaved correction'),null);
  await draft();fireEvent.click(screen.getByText('Discard draft for skills'));equal(unload(),false);
  fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByRole('heading',{name:'Inbox'});equal(screen.queryByRole('alertdialog'),null);
});
test('the last successful save clears the guard, but unsaved sibling corrections keep it active',async()=>{
  const f=fixture({tasks:2});await draft('First',0);await draft('Sibling',1);fireEvent.click(screen.getAllByText('Save correction')[0]);await screen.findByText('Review saved.');equal(unload(),true);equal(f.writes().length,1);
  fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByRole('alertdialog');fireEvent.click(screen.getByText('Stay'));equal(screen.getAllByLabelText('Skills (comma separated)')[1].value,'Sibling');
  fireEvent.click(screen.getAllByText('Save correction')[1]);await waitFor(()=>ok(!screen.queryByText('Unsaved correction')));equal(unload(),false);equal(f.writes().length,2);
});
test('conflict/refresh preserves a guarded separate draft without automatic save or merge',async()=>{
  const f=fixture({mutate:()=>json({message:'Review changed.'},409)});await draft();fireEvent.click(screen.getByText('Save correction'));await screen.findByText(/Use Refresh/);
  fireEvent.click(screen.getByText('Refresh'));await screen.findByText('Reapply draft for skills');equal(unload(),true);
  fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByRole('alertdialog');fireEvent.click(screen.getByText('Stay'));ok(screen.getByLabelText('Preserved draft for skills').textContent.includes('My unsaved correction'));equal(f.writes().length,1);
});
test('in-flight status save blocks discard/leave until settled and then requires an explicit choice',async()=>{
  let finish;const f=fixture({mutate:()=>new Promise(resolve=>{finish=resolve;})});await screen.findByText('Mark in review');fireEvent.click(screen.getByText('Mark in review'));equal(unload(),true);
  fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByText('Review save in progress');equal(screen.getByText('Leave page').disabled,true);equal(f.writes().length,1);
  await act(async()=>finish(json(f.current)));await screen.findByText('Leave this page?');equal(location.hash,'#/applications/app');equal(unload(),false);fireEvent.click(screen.getByText('Leave page'));await screen.findByRole('heading',{name:'Inbox'});equal(f.writes().length,1);
});
test('an uncertain save failure retains the draft and never retries during a leave warning',async()=>{
  let fail;const f=fixture({mutate:()=>new Promise((resolve,reject)=>{fail=reject;})});await draft();fireEvent.click(screen.getByText('Save correction'));fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByText('Review save in progress');
  await act(async()=>fail(new TypeError('Connection lost')));await screen.findByText('Leave with unsaved corrections?');equal(f.writes().length,1);fireEvent.click(screen.getByText('Stay'));equal(screen.getByLabelText('Skills (comma separated)').value,'My unsaved correction');equal(screen.getByText('Save correction').disabled,true);equal(unload(),true);
});
test('sign-out requires consent before its API call and redirects once without retaining drafts',async()=>{
  const f=fixture();await draft();fireEvent.click(screen.getByText('Sign out'));await screen.findByRole('alertdialog');equal(f.writes().length,0);fireEvent.click(screen.getByText('Stay'));equal(f.writes().length,0);
  fireEvent.click(screen.getByText('Sign out'));fireEvent.click(await screen.findByText('Discard and leave'));await screen.findByRole('heading',{name:'Welcome back'});await waitFor(()=>ok(!screen.queryByRole('alertdialog')));deepEqual(f.writes().map(call=>call.path),['/api/auth/sign-out']);equal(unload(),false);equal(sessionStorage.length,0);
});
test('failed sign-out keeps the original guarded review draft',async()=>{
  const f=fixture({mutate:()=>json({message:'Sign-out unavailable.'},503)});await draft();fireEvent.click(screen.getByText('Sign out'));fireEvent.click(await screen.findByText('Discard and leave'));await screen.findByText('Sign-out unavailable.');await waitFor(()=>ok(!screen.queryByRole('alertdialog')));equal(screen.getByLabelText('Skills (comma separated)').value,'My unsaved correction');equal(unload(),true);equal(f.writes().length,1);
});
test('managed Back restores the mounted review on Stay and traverses only after discard',async()=>{
  const f=fixture({initial:'/applications'});fireEvent.click(await screen.findByRole('link',{name:'Synthetic candidate'}));await draft();const gets=f.calls.filter(call=>call.path.endsWith('/review')).length;
  await act(async()=>window.history.back());await screen.findByRole('alertdialog');await waitFor(()=>{equal(location.hash,'#/applications/app');equal(screen.getByText('Discard and leave').disabled,false);});fireEvent.click(screen.getByText('Stay'));equal(screen.getByLabelText('Skills (comma separated)').value,'My unsaved correction');equal(f.calls.filter(call=>call.path.endsWith('/review')).length,gets);
  await act(async()=>window.history.back());await screen.findByRole('alertdialog');await waitFor(()=>equal(screen.getByText('Discard and leave').disabled,false));fireEvent.click(screen.getByText('Discard and leave'));await screen.findByRole('heading',{name:'Applications'});equal(location.hash,'#/applications');equal(f.writes().length,0);
});
test('managed Forward restores review on cancellation and resumes the requested forward entry on discard',async()=>{
  fixture();await screen.findByLabelText('Skills (comma separated)');fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByRole('heading',{name:'Inbox'});await act(async()=>window.history.back());await draft();
  await act(async()=>window.history.forward());await screen.findByRole('alertdialog');await waitFor(()=>equal(screen.getByText('Discard and leave').disabled,false));fireEvent.click(screen.getByText('Stay'));equal(location.hash,'#/applications/app');
  await act(async()=>window.history.forward());await screen.findByRole('alertdialog');await waitFor(()=>equal(screen.getByText('Discard and leave').disabled,false));fireEvent.click(screen.getByText('Discard and leave'));await screen.findByRole('heading',{name:'Inbox'});equal(location.hash,'#/inbox');
});
test('managed restoration finishes before either leave choice, without rewriting the requested entry',async()=>{
  fixture({initial:'/applications'});fireEvent.click(await screen.findByRole('link',{name:'Synthetic candidate'}));await draft();
  const originalGo=window.history.go,calls=[];window.history.go=delta=>calls.push(delta);
  try{
    const index=window.history.state.recruitmentNavigationIndex;
    act(()=>{window.history.replaceState({recruitmentNavigationIndex:index-1},'','#/applications');window.dispatchEvent(new window.PopStateEvent('popstate',{state:window.history.state}));});
    await screen.findByRole('alertdialog');equal(screen.getByText('Discard and leave').disabled,true);equal(screen.getByText('Stay').disabled,true);deepEqual(calls,[1]);equal(location.hash,'#/applications');
    act(()=>{window.history.replaceState({recruitmentNavigationIndex:index},'','#/applications/app');window.dispatchEvent(new window.PopStateEvent('popstate',{state:window.history.state}));});
    await waitFor(()=>equal(screen.getByText('Stay').disabled,false));fireEvent.click(screen.getByText('Stay'));equal(location.hash,'#/applications/app');equal(screen.getByLabelText('Skills (comma separated)').value,'My unsaved correction');
    fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByRole('alertdialog');equal(screen.getByText('Discard and leave').disabled,false);
  }finally{window.history.go=originalGo;}
});
test('programmatic go uses the same consent boundary, while unmanaged fragments retain the current review',async()=>{
  const f=fixture();await draft();act(()=>go('/inbox'));await screen.findByRole('alertdialog');equal(location.hash,'#/applications/app');fireEvent.click(screen.getByText('Stay'));
  await act(async()=>{window.location.hash='/inbox';});await screen.findByRole('alertdialog');equal(location.hash,'#/applications/app');equal(screen.getByLabelText('Skills (comma separated)').value,'My unsaved correction');fireEvent.click(screen.getByText('Discard and leave'));await screen.findByRole('heading',{name:'Inbox'});equal(f.writes().length,0);
});
test('clean/no-task/candidate pages have no review-leave warning and cleanup removes unload listeners',async()=>{
  fixture();await screen.findByLabelText('Skills (comma separated)');equal(unload(),false);cleanup();equal(unload(),false);
  const noTaskFixture=fixture({noTasks:true});await screen.findByText('Synthetic candidate',{selector:'h1'});equal(noTaskFixture.calls.some(call=>call.path.endsWith('/review')),false);equal(unload(),false);cleanup();
  const f=fixture({candidate:true});await screen.findByText('Your application');equal(f.calls.some(call=>call.path.endsWith('/review')),false);equal(unload(),false);fireEvent.click(screen.getByRole('link',{name:'Open inbox'}));await screen.findByRole('heading',{name:'Inbox'});equal(screen.queryByRole('alertdialog'),null);
});
test('same-route links and modified/external links do not discard drafts or get hijacked',async()=>{
  const f=fixture();await draft();
  const same=document.createElement('a');same.href='#/applications/app';same.textContent='Same review';document.body.append(same);fireEvent.click(same);same.remove();equal(screen.queryByRole('alertdialog'),null);equal(f.calls.filter(call=>call.path.endsWith('/review')).length,1);
  const inbox=screen.getByRole('link',{name:'Open inbox'});let prevented;
  const stop=event=>{prevented=event.defaultPrevented;event.preventDefault();};inbox.addEventListener('click',stop);fireEvent.click(inbox,{ctrlKey:true});inbox.removeEventListener('click',stop);equal(prevented,false);equal(screen.queryByRole('alertdialog'),null);
  const external=document.createElement('a');external.href='https://example.test/';external.addEventListener('click',stop);document.body.append(external);fireEvent.click(external);external.remove();equal(prevented,false);equal(screen.queryByRole('alertdialog'),null);equal(screen.getByLabelText('Skills (comma separated)').value,'My unsaved correction');equal(f.writes().length,0);
});
