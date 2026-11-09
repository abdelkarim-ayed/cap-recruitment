import {test,afterEach} from 'node:test';
import {equal,deepEqual,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','File','FileList','FormData','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
// Lifecycle only; native focus containment/inertness/Escape remain manual.
dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
const React=await import('react');
const {render,screen,cleanup,fireEvent,waitFor,act}=await import('@testing-library/react');
const {App}=await import('../src/app.tsx');
const {PipelinePage}=await import('../src/interviews.tsx');
const {ApplicationList}=await import('../src/applications.tsx');
const {ScreeningImport}=await import('../src/screening-import.tsx');
const {answerLabel}=await import('../src/answer-presentation.ts');
const {formIssues}=await import('../src/form-feedback.ts');
const {statusLabel}=await import('../src/status-labels.ts');
const {importGroups,initialChoice,chooseDecision,retainProposal,retainedRow}=await import('../src/screening-import-model.ts');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;sessionStorage.clear();window.history.replaceState(null,'','/');});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const yes={visible:true,allowed:true,reason:null},no={visible:false,allowed:false,reason:'Unavailable'};
const owner={id:'hr',name:'Synthetic owner',email:'owner@example.test'};
const vacancy={id:'v',title:'Synthetic scoped role',status:'published'};
const plan={vacancyId:'v',revision:2,owner,frozen:true,actions:{edit:no},steps:[{id:'s',name:'Technical interview',instructions:'Read the submitted document'}],items:[],total:0,limit:20,offset:0};
function planFixture({draft=false}={}){
  const calls=[];let revision=2;
  globalThis.fetch=async(path,init)=>{
    calls.push({path,init});
    if(init?.method==='PUT')return json({...plan,revision:revision+1,frozen:false,actions:{edit:yes},steps:JSON.parse(init.body).steps});
    return json(path==='/api/vacancies/v'?{...vacancy,status:draft?'draft':'published'}:{...plan,revision:revision++,frozen:!draft,actions:{edit:draft?yes:no}});
  };
  render(React.createElement(PipelinePage,{id:'v'}));return calls;
}
test('published plan is scoped readable information, not disabled authoring',async()=>{
  const calls=planFixture();await screen.findByRole('heading',{name:'Technical interview'});
  ok(screen.getByRole('link',{name:vacancy.title}));
  equal(screen.queryByRole('textbox'),null);equal(screen.queryByText('Save interview plan'),null);
  ok(screen.getByRole('heading',{name:'Candidate results'}));
  equal(screen.queryByText(/Only the vacancy owner/),null);
  equal(calls.filter(call=>call.init?.method).length,0);
});
test('draft-owner plan keeps local changes through explicit refresh and sends the separate latest revision only on Save',async()=>{
  const calls=planFixture({draft:true});const input=await screen.findByLabelText('Interview 1 name');
  equal(screen.queryByRole('heading',{name:'Candidate results'}),null);
  fireEvent.change(input,{target:{value:'Local interview name'}});
  fireEvent.click(screen.getByRole('button',{name:'Refresh interview plan'}));
  await waitFor(()=>equal(screen.getByRole('button',{name:'Save interview plan'}).disabled,false));
  equal(screen.getByLabelText('Interview 1 name').value,'Local interview name');
  equal(calls.filter(call=>call.init?.method==='PUT').length,0);
  fireEvent.click(screen.getByRole('button',{name:'Save interview plan'}));await screen.findByText('Interview plan saved.');
  const body=JSON.parse(calls.find(call=>call.init?.method==='PUT').init.body);
  equal(body.expectedRevision,3);equal(body.steps[0].name,'Local interview name');
});
test('vacancy application list displays scope even when no rows match',async()=>{
  window.history.replaceState(null,'','/#/applications?vacancy=v');
  globalThis.fetch=async path=>json(path==='/api/vacancies/v'?vacancy:{items:[],total:0,workFiltersSupported:true});
  render(React.createElement(ApplicationList,{staff:true}));
  await screen.findByText(vacancy.title);ok(screen.getByRole('heading',{name:'Vacancy applications'}));
  ok(screen.getByRole('link',{name:'← Vacancy'}));
});
test('Inbox appears only in the top bar; interviewer receives no general Applications shortcut; normal open waits for mark-read',async()=>{
  window.history.replaceState(null,'','/#/inbox');let finishRead;const writes=[];
  const notice={id:'n',kind:'assigned',title:'Interview assigned',body:'Synthetic notice',createdAt:'2026-11-09T10:00:00Z',readAt:null,interviewId:'i',applicationId:null};
  globalThis.fetch=async(path,init)=>{
    if(path==='/api/me')return json({user:{...owner,id:'assignee',role:'interviewer'}});
    if(path.startsWith('/api/inbox?'))return json({items:[notice],total:1});
    if(path==='/api/inbox/n/read'){writes.push(path);return new Promise(resolve=>{finishRead=()=>resolve(json({}));});}
    if(path==='/api/interviews/i')return json({message:'Synthetic inaccessible detail'},404);
    throw new Error(`Unexpected request ${path}`);
  };
  render(React.createElement(App));const link=await screen.findByRole('link',{name:'View interview →'});
  equal(screen.getAllByRole('link',{name:'Open inbox'}).length,1);
  equal(document.querySelector('.sidebar a[href="#/inbox"]'),null);
  equal(screen.queryByRole('link',{name:'Applications'}),null);
  fireEvent.click(link);equal(location.hash,'#/inbox');equal(writes.length,1);
  await act(async()=>finishRead());await waitFor(()=>equal(location.hash,'#/interviews/i'));
});
const id='11111111-1111-4111-8111-111111111111';
const proposal=(key,decision,reason='')=>({key,applicationId:id,email:'person@example.test',decision,reason,state:'valid',issue:null,issues:[],candidate:{name:'Synthetic candidate',email:'person@example.test'},revision:1,duplicateKeys:[2,3,5]});
test('duplicate agreement is prefilled; conflict starts undecided; selecting a source retains outcome and reason together',()=>{
  const [agree]=importGroups([proposal(2,'preselected'),proposal(3,'preselected')]);
  equal(initialChoice(agree).decision,'preselected');equal(initialChoice(agree).included,true);
  const [conflict]=importGroups([proposal(2,'preselected','A'),proposal(3,'preselected','A'),proposal(5,'rejected','B')]);
  const initial=initialChoice(conflict);equal(initial.decision,'');equal(initial.included,false);
  const rejected=chooseDecision(conflict,initial,'rejected');equal(rejected.keepKey,5);equal(retainedRow(conflict,rejected).reason,'B');
  const kept=retainProposal(conflict,2);equal(kept.decision,'preselected');equal(retainedRow(conflict,kept).reason,'A');
  const override=chooseDecision(agree,initialChoice(agree),'rejected');equal(override.reasonOverride,'');equal(override.included,true);
});
test('wizard groups conflicting records with separate email and sends one decision only after final confirmation',async()=>{
  const rows=[proposal(2,'preselected','A'),proposal(3,'preselected','A'),proposal(5,'rejected','B')];const writes=[];
  globalThis.fetch=async(path,init)=>{
    if(path.endsWith('/preview'))return json({rows});
    if(path.endsWith('/apply')){writes.push(JSON.parse(init.body));return json({applied:1});}
    throw new Error(`Unexpected request ${path}`);
  };
  render(React.createElement(ScreeningImport,{vacancyId:'v',onClose(){},onApplied(){}}));
  fireEvent.change(screen.getByLabelText('Decision CSV'),{target:{files:[new File(['synthetic'],'decisions.csv',{type:'text/csv'})]}});
  const select=await screen.findByLabelText('Decision for records 2, 3, 5');
  equal(document.querySelectorAll('.import-table tbody tr').length,1);equal(select.value,'');
  ok(screen.getByRole('columnheader',{name:'Account email'}));equal(writes.length,0);
  fireEvent.change(select,{target:{value:'rejected'}});
  fireEvent.change(screen.getByLabelText('Retain source for records 2, 3, 5'),{target:{value:'2'}});
  equal(select.value,'preselected');equal(writes.length,0);
  fireEvent.click(screen.getByRole('button',{name:'Review confirmation'}));await screen.findByRole('button',{name:'Confirm decisions'});
  equal(writes.length,0);fireEvent.click(screen.getByRole('button',{name:'Confirm decisions'}));await screen.findByText('1 screening decisions recorded.');
  equal(writes.length,1);deepEqual(writes[0].rows,[{applicationId:id,email:'person@example.test',decision:'preselected',reason:'A',expectedRevision:1}]);
});
test('submitted answers, status labels and validation refer to human labels without changing task outputs',()=>{
  const choice={id:'location',name:'location',label:'Work arrangement',type:'single_choice',required:false,args:{choices:[{value:'hybrid',label:'Hybrid working'}]}};
  equal(answerLabel(choice,'hybrid'),'Hybrid working');
  equal(answerLabel({...choice,type:'multiple_choice'},['hybrid']),'Hybrid working');
  equal(answerLabel({...choice,type:'multiple_choice'},[]),'None selected');
  equal(answerLabel({...choice,type:'yes_no'},false),'No');equal(answerLabel({...choice,type:'number'},0),'0');
  equal(statusLabel('interview'),'Interviewing');equal(statusLabel('offer'),'Offer recorded');
  equal(formIssues([{path:'answers.location',message:'Required input is missing.'}],{version:1,inputs:[choice]}),'Work arrangement: Required input is missing.');
});
