import {test,afterEach} from 'node:test';
import {equal,deepEqual,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,cleanup,waitFor,fireEvent}=await import('@testing-library/react');
const {ApplicationPage,ApplicationList}=await import('../src/applications.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;location.hash='';});
const yes={allowed:true,visible:true,reason:null},no={allowed:false,visible:true,reason:'Wait or release to review.'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const record={id:'app',vacancyId:'vac',candidate:{name:'Synthetic',email:'person@example.test'},submittedAt:'2026-11-07',stage:'received',processingState:'processing',actions:{review:yes,workflow:yes,export:yes},vacancy:{title:'Synthetic vacancy',formDefinition:{inputs:[{id:'answer',label:'Original answer',type:'text'}]}},answers:{answer:'Immutable answer'},documents:[]};
const task=(taskId='skills')=>({taskId,outputKey:taskId,sourceInputId:'cv',status:'pending',attempts:0,retryable:false,result:{status:'pending',value:null},effectiveValue:null,hasCorrection:false,provenance:{mode:'fixture',fixtureId:'SYNTHETIC ONLY'}});
function view(state='waiting',revision=1){const editable=['ready','released'].includes(state);return {applicationId:'app',processingState:'processing',processingClosed:['released','locked'].includes(state),review:{status:'pending',revision},readiness:{state,reason:null},release:state==='released'?{at:'2026-11-07',actor:{name:'Shared HR',email:'hr@example.test'}}:null,actions:{edit:editable?yes:no,release:['waiting','blocked'].includes(state)?yes:no},tasks:[task()]};}
function detail(server,mutate){globalThis.fetch=async(path,init)=>{if(init?.method)return mutate(path,init);return json(path.endsWith('/review')?server():record);};render(React.createElement(ApplicationPage,{id:'app',staff:true}));}
test('waiting evidence is viewable and screening-linked; release requires confirmation and can cancel',async()=>{
  let posts=0;let current=view();detail(()=>current,async(path,init)=>{posts++;ok(path.endsWith('/review/release'));deepEqual(JSON.parse(init.body),{expectedRevision:1});current=view('released',2);return json(current);});
  await screen.findByText('Waiting for processing');ok(screen.getByText('Immutable answer'));ok(screen.getByRole('link',{name:'Screening decision'}));equal(screen.getByText('Save correction').disabled,true);
  fireEvent.click(screen.getByText('Release to review'));await screen.findByRole('dialog');equal(posts,0);fireEvent.click(screen.getByText('Cancel'));equal(screen.queryByRole('dialog'),null);equal(posts,0);
  fireEvent.click(screen.getByText('Release to review'));ok(screen.getByText(/may still incur cost/));fireEvent.click(screen.getByText('Confirm release'));
  await screen.findByText('Released to review');equal(posts,1);equal(screen.getByText('Save correction').disabled,false);equal(screen.queryByText('Release to review'),null);ok(screen.getAllByText('Processing closed (unfinished)').length>0);equal(screen.queryByText('Current saved revision 2'),null);
});
test('unknown release response never retries and requires refresh then new confirmation',async()=>{
  let posts=0,gets=0;globalThis.fetch=async(path,init)=>{if(init?.method){posts++;if(posts===1)throw new TypeError('Connection lost');return json(view('released',3));}if(path.endsWith('/review')){gets++;return json(view('waiting',gets));}return json(record);};
  render(React.createElement(ApplicationPage,{id:'app',staff:true}));await screen.findByText('Release to review');fireEvent.click(screen.getByText('Release to review'));fireEvent.click(screen.getByText('Confirm release'));await screen.findByText(/No automatic retry/);equal(posts,1);equal(screen.getByText('Release to review').disabled,true);equal(screen.queryByRole('dialog'),null);
  fireEvent.click(screen.getByText('Refresh'));await waitFor(()=>equal(screen.getByText('Release to review').disabled,false));equal(posts,1);fireEvent.click(screen.getByText('Release to review'));fireEvent.click(screen.getByText('Confirm release'));await screen.findByText('Released to review');equal(posts,2);
});
test('screening-frozen and naturally ready failed evidence are not presented as processing success',async()=>{
  for(const state of ['locked','ready']){const current=view(state);current.processingState='completed_with_errors';current.tasks[0]={...task(),status:'failed',result:{status:'failed',value:null,reason:'FIXTURE: unavailable'}};
    detail(()=>current,()=>{throw new Error('No mutation expected');});await screen.findByText(state==='locked'?'Review frozen after screening':'Ready for review');equal(screen.queryByText('Release to review'),null);equal(screen.getByText('Save correction').disabled,state==='locked');ok(screen.getAllByText('Original extraction errors').length>0);cleanup();}
});
test('conflict preserves draft; refresh shows latest saved value and requires explicit reapply with fresh revision',async()=>{
  let current=view('ready',4),patches=[];
  detail(()=>current,async(path,init)=>{const body=JSON.parse(init.body);patches.push(body);if(patches.length===1){current=view('ready',5);current.tasks[0]={...task(),hasCorrection:true,correction:{skills:['Latest colleague value']},effectiveValue:{skills:['Latest colleague value']}};return json({message:'Review changed.'},409);}current={...current,review:{...current.review,revision:6}};return json(current);});
  await screen.findByLabelText('Skills (comma separated)');fireEvent.change(screen.getByLabelText('Skills (comma separated)'),{target:{value:'My draft'}});equal(screen.getByText('Mark review complete').disabled,true);fireEvent.click(screen.getByText('Save correction'));await screen.findByText(/Use Refresh/);equal(screen.getByLabelText('Skills (comma separated)').value,'My draft');equal(screen.getByText('Save correction').disabled,true);
  fireEvent.click(screen.getByText('Refresh'));await screen.findByText('Reapply draft for skills');equal(screen.getByLabelText('Skills (comma separated)').value,'Latest colleague value');ok(screen.getByLabelText('Preserved draft for skills').textContent.includes('My draft'));equal(patches.length,1);
  fireEvent.click(screen.getByText('Reapply draft for skills'));equal(screen.getByLabelText('Skills (comma separated)').value,'My draft');fireEvent.click(screen.getByText('Save correction'));await screen.findByText('Review saved.');equal(patches[1].expectedRevision,5);deepEqual(patches[1].corrections[0].value,{skills:['My draft']});equal(screen.queryByText('Reapply draft for skills'),null);
});
test('saving another task retains unsaved sibling draft; navigation does not leak drafts',async()=>{
  let current=view('ready');current.tasks.push(task('other'));
  globalThis.fetch=async(path,init)=>{if(init?.method){current={...current,review:{...current.review,revision:2}};return json(current);}return json(path.endsWith('/review')?current:record);};
  const renderResult=render(React.createElement(ApplicationPage,{id:'app',staff:true}));
  await screen.findAllByLabelText('Skills (comma separated)');const inputs=screen.getAllByLabelText('Skills (comma separated)');fireEvent.change(inputs[1],{target:{value:'Sibling draft'}});fireEvent.click(screen.getAllByText('Save correction')[0]);await screen.findByText('Review saved.');equal(screen.getAllByLabelText('Skills (comma separated)')[1].value,'Sibling draft');
  renderResult.rerender(React.createElement(ApplicationPage,{id:'another',staff:true}));await waitFor(()=>equal(screen.getAllByLabelText('Skills (comma separated)')[1].value,''));
});
test('per-skill draft reapplication preserves unknowns and requires a fresh explicit save',async()=>{
  let current=view('ready'),sent;
  current.tasks[0].skillResults=[{skill:'sql',original:null,effective:null},{skill:'rust',original:null,effective:null}];
  detail(()=>current,async(path,init)=>{sent=JSON.parse(init.body);return json(current);});
  await screen.findByLabelText('Review sql');fireEvent.change(screen.getByLabelText('Review sql'),{target:{value:'true'}});
  current={...current,review:{...current.review,revision:3},tasks:[{...current.tasks[0],skillResults:[{skill:'sql',original:false,effective:false},{skill:'rust',original:true,effective:true}]}]};
  fireEvent.click(screen.getByText('Refresh'));await screen.findByText('Reapply draft for skills');equal(screen.getByLabelText('Review rust').value,'true');equal(sent,undefined);
  fireEvent.click(screen.getByText('Reapply draft for skills'));equal(screen.getByLabelText('Review rust').value,'unknown');fireEvent.click(screen.getByText('Save correction'));await screen.findByText('Review saved.');deepEqual(sent,{expectedRevision:3,corrections:[{taskId:'skills',value:{skills:['sql'],unavailableSkills:['rust']}}]});
});
test('successful no-op response retains server metadata/counter and clears the submitted local draft',async()=>{
  const current=view('ready',4),sent=[];current.review={...current.review,status:'in_review',editor:{name:'First HR',email:'first@example.test'},updatedAt:'2026-11-07T08:00:00Z'};
  current.tasks[0]={...task(),hasCorrection:true,correction:{skills:['SQL']},effectiveValue:{skills:['SQL']}};
  detail(()=>current,async(path,init)=>{sent.push(JSON.parse(init.body));return json(current);});
  await screen.findByLabelText('Skills (comma separated)');fireEvent.change(screen.getByLabelText('Skills (comma separated)'),{target:{value:' sql '}});fireEvent.click(screen.getByText('Save correction'));await screen.findByText('Review saved.');
  equal(screen.getByLabelText('Skills (comma separated)').value,'SQL');equal(screen.queryByText('Unsaved correction'),null);ok(screen.getByText(/First HR/));equal(screen.getByText('Mark review complete').disabled,false);
  fireEvent.click(screen.getByText('Save correction'));await waitFor(()=>equal(sent.length,2));deepEqual(sent.map(body=>body.expectedRevision),[4,4]);
});
test('candidate and no-task detail have no release/review controls',async()=>{
  const calls=[];globalThis.fetch=async path=>{calls.push(path);return json({...record,actions:undefined});};
  render(React.createElement(ApplicationPage,{id:'app',staff:false}));await screen.findByText('Your application');equal(calls.length,1);equal(screen.queryByText('Release to review'),null);cleanup();
  globalThis.fetch=async()=>json({...record,review:{required:false},processingState:'not_requested'});render(React.createElement(ApplicationPage,{id:'app',staff:true}));await screen.findByText('Immutable answer');equal(screen.queryByText('Extraction review'),null);
});
test('list readiness filter retains factual extraction/review and is staff only',async()=>{
  const paths=[];globalThis.fetch=async path=>{paths.push(path);return json({reviewRequired:true,total:1,items:[{...record,vacancyTitle:'Synthetic vacancy',processingState:'pending',processingClosed:true,review:{required:true,status:'pending'},readiness:{state:'released',reason:null}}]});};
  render(React.createElement(ApplicationList,{staff:true}));await screen.findByText('Released to review');ok(screen.getByText('Processing closed (unfinished)',{selector:'.badge'}));fireEvent.change(screen.getByLabelText('Review availability'),{target:{value:'released'}});await waitFor(()=>ok(paths.at(-1).includes('readiness=released')));cleanup();
  render(React.createElement(ApplicationList,{staff:false}));await screen.findByText('Open →');equal(screen.queryByLabelText('Review availability'),null);equal(screen.queryByText('Released to review'),null);
});
