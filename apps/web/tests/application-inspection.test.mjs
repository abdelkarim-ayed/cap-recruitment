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
const {ApplicationPage}=await import('../src/applications.tsx');
const {applicationJourney,submittedAnswerGroups}=await import('../src/application-information.tsx');
const {NavigationBoundary}=await import('../src/navigation-guard.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;window.history.replaceState(null,'','/');sessionStorage.clear();});
const yes={allowed:true,visible:true,reason:null},no={allowed:false,visible:false,reason:'Unavailable'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const record={id:'app',vacancyId:'vac',candidate:{name:'Synthetic candidate',email:'candidate@example.test'},submittedAt:'2026-11-01T14:30:00Z',stage:'received',processingState:'completed_with_errors',
  actions:{review:yes,workflow:yes,export:yes},review:{required:true},vacancy:{title:'Backend developer',formDefinition:{version:1,inputs:[
    {id:'name',name:'name',label:'Full name',type:'text',required:true,args:{}},
    {id:'section',type:'separator',label:'Experience'},
    {id:'years',name:'years',label:'Years',type:'number',required:true,args:{}},
    {id:'available',name:'available',label:'Available now',type:'yes_no',required:true,args:{}},
    {id:'note',name:'note',label:'Additional information',type:'long_text',required:false,args:{}},
    {id:'files',type:'separator',label:'Attachments'},
    {id:'cv',name:'cv',label:'Your CV',type:'document',required:true,args:{accept:['.pdf']}},
  ]}},answers:{name:'Submitted identity',years:0,available:false},documents:[{id:'d1',inputId:'cv',filename:'cv.pdf',byteCount:2048,mediaType:'application/octet-stream'}]};
const review={applicationId:'app',processingState:'completed_with_errors',processingClosed:false,review:{status:'pending',revision:4},readiness:{state:'ready',reason:null},release:null,
  actions:{edit:yes,release:no},tasks:[{taskId:'skills',sourceInputId:'cv',outputKey:'skills',status:'failed',attempts:1,retryable:false,
    result:{status:'failed',value:null,reason:'Synthetic failure'},provenance:{mode:'fixture',fixtureId:'SYNTHETIC ONLY'},hasCorrection:false,effectiveValue:null}]};
function setup({application=record,results=review,staff=true,attachment}={}){
  window.history.replaceState(null,'','/#/applications/app');
  const calls=[];
  globalThis.fetch=async(path,init)=>{
    calls.push({path,method:init?.method??'GET',credentials:init?.credentials});
    if(init?.method)throw new Error(`Unexpected write: ${path}`);
    if(path.includes('/documents/'))return attachment?attachment(path,init):new Response('%PDF-1.7\nSynthetic PDF');
    if(path.endsWith('/review'))return json(results);
    if(path==='/api/applications/app')return json(application);
    throw new Error(`Unexpected fetch: ${path}`);
  };
  const rendered=render(React.createElement(NavigationBoundary,null,React.createElement(ApplicationPage,{id:'app',staff})));
  return {...rendered,calls};
}
test('information leads the page, with one vacancy title destination and separate result/review/screening sections',async()=>{
  const f=setup();await screen.findByRole('heading',{name:'Application information'});
  const headings=screen.getAllByRole('heading',{level:2}).map(heading=>heading.textContent);
  deepEqual(headings,['Application information','Automated results','Human review','Screening']);
  equal(screen.getByRole('link',{name:'Backend developer'}).getAttribute('href'),'#/vacancies/vac');
  equal(screen.getByRole('link',{name:'← Applications'}).getAttribute('href'),'#/applications');
  equal(screen.getByRole('link',{name:'Screening decision'}).getAttribute('href'),'#/applications/app/interviews');
  equal(screen.queryByRole('link',{name:'Vacancy details'}),null);equal(screen.queryByRole('link',{name:'Interview plan & results'}),null);
  equal(screen.queryByRole('link',{name:'Selection & interviews'}),null);equal(screen.queryByRole('button',{name:'Export vacancy CSV'}),null);
  equal(document.querySelector('time').dateTime,record.submittedAt);equal(document.querySelector('time').textContent,new Date(record.submittedAt).toLocaleString());
  deepEqual(f.calls.map(call=>call.path),['/api/applications/app','/api/applications/app/review']);
  equal(f.calls.some(call=>call.method!=='GET'||call.path.endsWith('/export')),false);
});
test('submitted-answer groups preserve separator order, false, zero and missing values without editing the submission',async()=>{
  setup();await screen.findByRole('heading',{name:'Submitted answers'});
  deepEqual(submittedAnswerGroups(record.vacancy.formDefinition.inputs).map(group=>group.label),[null,'Experience']);
  equal(screen.queryByRole('heading',{name:'Attachments'}),null);
  const terms=[...document.querySelectorAll('.application-answers dt')].map(term=>term.textContent);
  const values=[...document.querySelectorAll('.application-answers dd')].map(value=>value.textContent);
  deepEqual(terms,['Full name','Years','Available now','Additional information']);deepEqual(values,['Submitted identity','0','No','—']);
  equal(document.querySelector('.application-information form,.application-information input,.application-information textarea'),null);
  equal(document.querySelector('.application-document-meta').textContent,'Your CV · 2 KB');
  deepEqual(record.answers,{name:'Submitted identity',years:0,available:false});
});
test('workflow wording follows the existing stage without offering new mutations or inferring owner finalization',async()=>{
  for(const [stage,heading,link] of [
    ['received','Screening','Screening decision'],['review_ready','Screening','Screening decision'],
    ['preselected','Recruitment','Interviews & next steps'],['interview','Recruitment','Interviews & next steps'],
    ['offer','Recruitment','View recruitment progress'],['hired','Recruitment','View recruitment progress'],['not_selected','Recruitment','View recruitment progress'],
  ]){
    deepEqual(applicationJourney(stage),{heading,link});
    const f=setup({application:{...record,stage,processingState:'not_requested',review:{required:false}}});
    await screen.findByRole('heading',{name:heading});equal(screen.getByRole('link',{name:link}).getAttribute('href'),'#/applications/app/interviews');
    equal(screen.queryByRole('button',{name:'Record offer'}),null);equal(screen.queryByRole('button',{name:'Record hired'}),null);
    equal(screen.queryByRole('button',{name:'Preselect candidate'}),null);equal(f.calls.length,1);cleanup();
  }
});
test('waiting/blocked review still permits the screening journey and release, without unavailable review-status actions',async()=>{
  for(const state of ['waiting','blocked']){
    setup({results:{...review,processingState:'processing',readiness:{state,reason:'Unfinished processing'},actions:{edit:{...no,visible:true,reason:'Wait or release to review.'},release:yes}}});
    await screen.findByRole('heading',{name:'Automated results'});
    ok(screen.getByRole('link',{name:'Screening decision'}));ok(screen.getByRole('button',{name:'Release to review'}));
    equal(screen.queryByRole('button',{name:'Mark in review'}),null);equal(screen.queryByRole('button',{name:'Mark review complete'}),null);
    equal(screen.getByRole('button',{name:'Save correction'}).disabled,true);cleanup();
  }
});
test('no-task and unavailable-workflow views hide irrelevant intents without inventing review completion',async()=>{
  const f=setup({application:{...record,processingState:'not_requested',review:{required:false},actions:{...record.actions,workflow:no}}});
  await screen.findByRole('heading',{name:'Application information'});
  equal(screen.queryByRole('heading',{name:'Automated results'}),null);equal(screen.queryByRole('heading',{name:'Human review'}),null);
  equal(screen.queryByRole('heading',{name:'Screening'}),null);equal(screen.queryByRole('button',{name:'Mark review complete'}),null);
  equal(f.calls.length,1);equal(screen.queryByText('Reviewed'),null);
});
test('candidate view never renders HR intents or fetches private review even with inconsistent action metadata in a fixture',async()=>{
  const f=setup({staff:false,application:{...record,stage:'not_selected'}});await screen.findByRole('heading',{name:'Your application'});
  ok(screen.getByText('Application received'));equal(screen.queryByText('not selected'),null);
  equal(screen.queryByRole('heading',{name:'Automated results'}),null);equal(screen.queryByRole('heading',{name:'Human review'}),null);
  equal(screen.queryByRole('heading',{name:'Recruitment'}),null);equal(screen.queryByRole('link',{name:'View recruitment progress'}),null);
  equal(screen.queryByText('Fixture result'),null);equal(screen.queryByRole('button',{name:'Export vacancy CSV'}),null);
  deepEqual(f.calls.map(call=>call.path),['/api/applications/app']);
});
test('PDF preview stays authenticated and local to the document section; non-PDFs offer download only',async()=>{
  const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;const revoked=[];
  URL.createObjectURL=()=> 'blob:synthetic-application-preview';URL.revokeObjectURL=url=>revoked.push(url);
  try{
    const f=setup({application:{...record,documents:[...record.documents,{id:'d2',inputId:'cv',filename:'notes.docx',byteCount:4096,mediaType:'application/octet-stream'}]}});
    const preview=await screen.findByRole('button',{name:'Preview cv.pdf'});equal(screen.queryByRole('button',{name:'Preview notes.docx'}),null);
    ok(screen.getByRole('button',{name:'Download notes.docx'}));fireEvent.click(preview);
    const frame=await screen.findByTitle('PDF: cv.pdf');equal(frame.getAttribute('src'),'blob:synthetic-application-preview');
    const call=f.calls.find(call=>call.path.includes('/documents/'));equal(call.path,'/api/applications/app/documents/d1');equal(call.credentials,'include');
    equal(document.querySelector('.application-information-layout.with-preview .pdf-preview')!==null,true);
    fireEvent.click(screen.getByRole('button',{name:'Close preview'}));deepEqual(revoked,['blob:synthetic-application-preview']);
  }finally{URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;}
});
test('compact contact disclosure is keyboard-focusable and exposes frozen email on demand',async()=>{
  setup();await screen.findByRole('heading',{name:'Application information'});
  const summary=screen.getByText('Contact email'),details=summary.closest('details');equal(details.open,false);equal(summary.tagName,'SUMMARY');
  const user=userEvent.setup({document});screen.getByRole('link',{name:'Backend developer'}).focus();await user.tab();equal(document.activeElement,summary);
  await user.click(summary);equal(details.open,true);ok(within(details).getByText('candidate@example.test'));
  equal(document.querySelector('a[href^="mailto:"]'),null);
});
test('vacancy and stage links still use the shared dirty guard and never save corrections on navigation',async()=>{
  const f=setup();await screen.findByLabelText('Skills (comma separated)');
  fireEvent.change(screen.getByLabelText('Skills (comma separated)'),{target:{value:'Unsaved local correction'}});
  for(const name of ['Backend developer','Screening decision','← Applications']){
    fireEvent.click(screen.getByRole('link',{name}));await screen.findByRole('alertdialog');
    equal(location.hash,'#/applications/app');equal(screen.getByLabelText('Skills (comma separated)').value,'Unsaved local correction');
    fireEvent.click(screen.getByText('Stay'));equal(f.calls.some(call=>call.method!=='GET'),false);
  }
});
test('locked review keeps original failure, fixture provenance and saved HR correction distinct with no review-status controls',async()=>{
  setup({application:{...record,stage:'preselected'},results:{...review,processingClosed:true,readiness:{state:'locked',reason:null},actions:{edit:{...no,visible:true,reason:'Review is locked.'},release:no},tasks:[{...review.tasks[0],hasCorrection:true,correction:{skills:['SQL']},effectiveValue:{skills:['SQL']}}]}});
  await screen.findByRole('heading',{name:'Human review'});ok(screen.getByText('Original extraction errors'));ok(screen.getByText('Review frozen after screening'));
  ok(screen.getByText('Fixture result'));ok(screen.getByText('Saved HR correction'));ok(screen.getByText('SQL'));ok(screen.getByText('Synthetic failure'));
  equal(document.querySelector('.original-result').open,false);equal(screen.getByRole('button',{name:'Save correction'}).disabled,true);
  equal(screen.queryByRole('button',{name:'Mark review complete'}),null);equal(screen.queryByRole('button',{name:'Release to review'}),null);
});
