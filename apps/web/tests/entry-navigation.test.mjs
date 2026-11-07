import {test,afterEach} from 'node:test';
import {equal,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','HTMLTextAreaElement','Event','MouseEvent','File','FileList','FormData','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,cleanup,waitFor,fireEvent,act}=await import('@testing-library/react');
const {default:userEvent}=await import('@testing-library/user-event');
const {App}=await import('../src/app.tsx');
const {NavigationBoundary}=await import('../src/navigation-guard.tsx');
const {CandidateForm}=await import('../src/candidate-form.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;sessionStorage.clear();window.history.replaceState(null,'','/');});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const unload=()=>{const event=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;};
const vacancy={id:'vacancy-one',title:'Synthetic role',description:'Synthetic description',form:{version:1,inputs:[
  {id:'name',name:'name',label:'Full name',type:'text',required:true,args:{}},
  {id:'cv',name:'cv',label:'Your CV',type:'document',required:false,args:{accept:['.pdf']}}
]}};
const row={key:2,applicationId:'11111111-1111-4111-8111-111111111111',email:'person@example.test',decision:'rejected',reason:'',state:'valid',issue:null,candidate:{name:'Synthetic',email:'person@example.test'},revision:1};
function candidate({submit}={}){
  window.history.replaceState(null,'','/#/vacancies/v1');
  const calls=[];
  globalThis.fetch=async(path,init)=>{
    calls.push({path,method:init?.method??'GET',body:init?.body});
    if(path==='/api/me')return json({user:{id:'cand',role:'candidate',email:'cand@example.test',name:'Candidate'}});
    if(path==='/api/public/vacancies/v1')return json(vacancy);
    if(path.startsWith('/api/public/vacancies?'))return json({items:[],total:0,limit:20,offset:0});
    if(path==='/api/vacancies/vacancy-one/applications'&&init?.method==='POST')return submit?submit(init):json({id:'app1'});
    if(path==='/api/applications/app1')return new Promise(()=>{});
    throw new Error(`Unexpected mock fetch: ${path}`);
  };
  render(React.createElement(App));
  return {calls,writes:()=>calls.filter(call=>call.method!=='GET')};
}
function screening({preview,apply}={}){
  window.history.replaceState(null,'','/#/applications?vacancy=v1');
  const calls=[];
  globalThis.fetch=async(path,init)=>{
    calls.push({path,method:init?.method??'GET'});
    if(path==='/api/me')return json({user:{id:'hr',role:'recruiter',name:'Synthetic HR',email:'hr@example.test'}});
    if(path.startsWith('/api/vacancies/v1/applications?'))return json({items:[],total:0,limit:20,offset:0});
    if(path.startsWith('/api/applications?'))return json({items:[],total:0,limit:20,offset:0});
    if(path.endsWith('/screening/preview'))return preview?preview(init):json({rows:[row]});
    if(path.endsWith('/screening/apply'))return apply?apply(init):json({applied:1});
    throw new Error(`Unexpected mock fetch: ${path}`);
  };
  render(React.createElement(App));
  return {calls,writes:()=>calls.filter(call=>call.method!=='GET')};
}
async function openImport(){
  fireEvent.click(await screen.findByText('Import decisions CSV'));
  fireEvent.change(screen.getByLabelText('Decision CSV'),{target:{files:[new File(['synthetic'],'decisions.csv',{type:'text/csv'})]}});
  await screen.findByLabelText('Include record 2');
}
test('dirty candidate answers require Stay or Discard and reverting to empty clears the warning',async()=>{
  const f=candidate();
  const input=await screen.findByLabelText(/Full name/);
  fireEvent.change(input,{target:{value:'Ada'}});
  equal(unload(),true);
  fireEvent.click(screen.getByText('All positions'));
  await screen.findByRole('alertdialog');ok(screen.getByRole('heading',{name:'Leave with an unsaved application?'}));
  equal(screen.getByLabelText(/Full name/).value,'Ada');equal(location.hash,'#/vacancies/v1');
  fireEvent.click(screen.getByText('Stay'));equal(screen.queryByRole('alertdialog'),null);
  fireEvent.change(screen.getByLabelText(/Full name/),{target:{value:''}});
  equal(unload(),false);
  fireEvent.click(screen.getByText('All positions'));
  await screen.findByText('Find your next opportunity');equal(screen.queryByRole('alertdialog'),null);equal(f.writes().length,0);
});
test('a selected candidate document is dirty even without answer changes',async()=>{
  const f=candidate();
  const user=userEvent.setup({document});
  await screen.findByLabelText(/Full name/);
  await user.upload(screen.getByLabelText(/Your CV/),new File(['%PDF-1.7\nSynthetic CV'],'cv.pdf',{type:'application/pdf'}));
  equal(unload(),true);
  fireEvent.click(screen.getByText('All positions'));
  await screen.findByRole('heading',{name:'Leave with an unsaved application?'});
  fireEvent.click(screen.getByText('Stay'));
  equal(screen.getByLabelText(/Your CV/).files.length,1);equal(f.writes().length,0);
});
test('an in-flight submission blocks leaving until settled, then requires an explicit choice',async()=>{
  let finish;
  const f=candidate({submit:()=>new Promise(resolve=>{finish=resolve;})});
  await screen.findByLabelText(/Full name/);
  fireEvent.change(screen.getByLabelText(/Full name/),{target:{value:'Ada'}});
  fireEvent.click(screen.getByText('Submit application'));
  fireEvent.click(screen.getByText('All positions'));
  await screen.findByRole('heading',{name:'Application submission in progress'});
  equal(screen.getByText('Discard and leave').disabled,true);equal(f.writes().length,1);equal(unload(),true);
  await act(async()=>finish(json({id:'app1'})));
  await screen.findByRole('heading',{name:'Leave this page?'});equal(unload(),false);
  equal(screen.getByText('Leave page').disabled,false);
  fireEvent.click(screen.getByText('Leave page'));
  await screen.findByText('Find your next opportunity');equal(location.hash,'#/vacancies');equal(f.writes().length,1);
});
test('a successful submission redirects only after the form becomes clean',async()=>{
  const f=candidate();
  await screen.findByLabelText(/Full name/);
  fireEvent.change(screen.getByLabelText(/Full name/),{target:{value:'Ada'}});
  fireEvent.click(screen.getByText('Submit application'));
  await waitFor(()=>equal(location.hash,'#/applications/app1'));
  equal(screen.queryByRole('alertdialog'),null);equal(f.writes().length,1);equal(unload(),false);
});
test('the candidate preview never registers an unsaved application',async()=>{
  window.history.replaceState(null,'','/#/preview');
  render(React.createElement(NavigationBoundary,null,React.createElement(CandidateForm,{vacancy,preview:true}),React.createElement('a',{href:'#/elsewhere'},'Elsewhere')));
  fireEvent.change(screen.getByLabelText(/Full name/),{target:{value:'Preview edit'}});
  equal(unload(),false);
  fireEvent.click(screen.getByText('Elsewhere'));
  await waitFor(()=>equal(location.hash,'#/elsewhere'));equal(screen.queryByRole('alertdialog'),null);
});
test('staged screening decisions guard both Hide import and Close wizard',async()=>{
  const f=screening();
  await openImport();
  equal(unload(),true);
  fireEvent.click(screen.getByText('Hide import'));
  await screen.findByRole('heading',{name:'Leave with unsaved screening decisions?'});
  equal(screen.getByLabelText('Include record 2').checked,true);equal(location.hash,'#/applications?vacancy=v1');
  fireEvent.click(screen.getByText('Stay'));
  fireEvent.click(screen.getByText('Close wizard'));
  await screen.findByRole('heading',{name:'Leave with unsaved screening decisions?'});
  fireEvent.click(screen.getByText('Discard and leave'));
  await screen.findByText('Import decisions CSV');
  equal(screen.queryByLabelText('Include record 2'),null);equal(f.writes().length,1);equal(unload(),false);
});
test('leaving the applications page discards staged decisions without applying them',async()=>{
  const f=screening();
  await openImport();
  fireEvent.click(screen.getByText('All applications'));
  await screen.findByRole('heading',{name:'Leave with unsaved screening decisions?'});
  fireEvent.click(screen.getByText('Discard and leave'));
  await waitFor(()=>equal(location.hash,'#/applications'));
  equal(f.calls.filter(call=>call.path.endsWith('/screening/preview')).length,1);
  equal(f.writes().filter(call=>call.path.endsWith('/screening/apply')).length,0);
});
test('an in-flight screening check blocks leaving until rows are staged',async()=>{
  let finish;
  const f=screening({preview:()=>new Promise(resolve=>{finish=resolve;})});
  await screen.findByText('Import decisions CSV');
  fireEvent.click(screen.getByText('Import decisions CSV'));
  fireEvent.change(screen.getByLabelText('Decision CSV'),{target:{files:[new File(['synthetic'],'decisions.csv',{type:'text/csv'})]}});
  fireEvent.click(screen.getByText('Hide import'));
  await screen.findByRole('heading',{name:'Screening check in progress'});
  equal(screen.getByText('Leave page').disabled,true);equal(f.writes().length,1);
  await act(async()=>finish(json({rows:[row]})));
  await screen.findByRole('heading',{name:'Leave with unsaved screening decisions?'});
  equal(screen.getByText('Discard and leave').disabled,false);equal(unload(),true);
  fireEvent.click(screen.getByText('Stay'));ok(screen.getByLabelText('Include record 2'));
});
test('a successful apply clears the staged guard without prompting',async()=>{
  const f=screening();
  await openImport();
  fireEvent.click(screen.getByText('Review confirmation'));
  await screen.findByText('Confirm decisions');
  fireEvent.click(screen.getByText('Confirm decisions'));
  await screen.findByText('1 screening decisions recorded.');
  equal(unload(),false);
  fireEvent.click(screen.getByText('Hide import'));
  await screen.findByText('Import decisions CSV');equal(screen.queryByRole('alertdialog'),null);
  equal(f.writes().filter(call=>call.path.endsWith('/screening/apply')).length,1);
});
test('the candidate preview does not replace a dirty vacancy editor guard',async()=>{
  const yes={allowed:true,visible:true,reason:null},no={allowed:false,visible:false,reason:'Unavailable'};
  const owner={id:'hr',name:'Synthetic HR',email:'hr@example.test'};
  const staffVacancy={id:'v1',ownerId:'hr',owner,title:'Synthetic vacancy',description:'Synthetic role',location:'',status:'draft',revision:3,
    formDefinition:{version:1,inputs:[{id:'name',name:'name',label:'Full name',type:'text',required:true,args:{}}]},processingDefinition:{version:1,tasks:[]},
    actions:{edit:yes,publish:no,close:no}};
  window.history.replaceState(null,'','/#/vacancies/v1');
  globalThis.fetch=async path=>{
    if(path==='/api/me')return json({user:{id:'hr',role:'recruiter',name:'Synthetic HR',email:'hr@example.test'}});
    if(path==='/api/vacancies/v1')return json(staffVacancy);
    if(path.startsWith('/api/vacancies?'))return json({items:[],total:0,limit:20,offset:0});
    throw new Error(`Unexpected mock fetch: ${path}`);
  };
  render(React.createElement(App));
  const title=await screen.findByLabelText('Position title');
  fireEvent.change(title,{target:{value:'Changed title'}});
  fireEvent.click(screen.getByText('Preview form'));
  await screen.findByText('Candidate form preview');
  fireEvent.click(screen.getByRole('link',{name:'← Vacancies'}));
  await screen.findByRole('heading',{name:'Leave with an unsaved vacancy draft?'});
  equal(screen.getByLabelText('Position title').value,'Changed title');
  fireEvent.click(screen.getByText('Stay'));
  equal(screen.getByLabelText('Position title').value,'Changed title');
});
