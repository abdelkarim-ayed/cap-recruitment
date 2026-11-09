import {test,afterEach} from 'node:test';
import {equal,deepEqual,ok} from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
// Lifecycle stubs only, not proof of native top-layer, inertness or focus traps.
dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
const React=await import('react');
const {render,screen,within,cleanup,waitFor,fireEvent,act}=await import('@testing-library/react');
const {ApplicationWorkflow}=await import('../src/interviews.tsx');
const {NavigationBoundary,useNavigation}=await import('../src/navigation-guard.tsx');
const {App}=await import('../src/app.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;window.history.replaceState(null,'','/');sessionStorage.clear();});
const yes={allowed:true,visible:true,reason:null},no={allowed:false,visible:false,reason:'Unavailable'};
const owner={id:'hr',name:'Synthetic owner',email:'hr@example.test'};
const record={id:'app',vacancyId:'vac',candidate:{name:'Synthetic candidate',email:'candidate@example.test'},vacancy:{title:'Synthetic vacancy',formDefinition:{inputs:[]}},documents:[],answers:{},submittedAt:'2026-11-01T10:00:00Z',stage:'received',processingState:'processing',review:{revision:99,required:true}};
const step={id:'technical',position:0,name:'Technical',instructions:'Prepare examples'};
const appointment={id:'i1',applicationId:'app',stepId:step.id,stepName:step.name,startsAt:'2027-01-12T09:30:00Z',durationMinutes:60,status:'completed',outcome:'pass',score:8,interviewer:owner};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
function view({stage='received',revision=7,isOwner=true,steps=[],interviews=[],actions}={}){
  const screening=['received','review_ready'].includes(stage),active=['preselected','interview'].includes(stage),open=!['hired','not_selected'].includes(stage);
  const offerRelevant=isOwner&&(steps.length?stage==='interview':stage==='preselected');
  const passed=steps.every(s=>interviews.some(i=>i.stepId===s.id&&i.status==='completed'&&i.outcome==='pass'));
  return {applicationId:'app',stage,revision,owner,isOwner,steps,interviews,actions:actions??{
    preselect:screening?yes:no,reject:open&&(screening||stage==='preselected'||isOwner)?yes:no,
    offer:offerRelevant?passed?yes:{allowed:false,visible:true,reason:'Every configured interview must pass before an offer.'}:no,
    hire:isOwner&&stage==='offer'?yes:no,schedule:active?yes:no,
  }};
}
function fixture({initial=view(),onWrite}={}){
  window.history.replaceState(null,'','/#/applications/app/interviews');let current=initial;
  const calls=[];
  const f={calls,get current(){return current;},set current(value){current=value;},writes:()=>calls.filter(call=>call.method==='POST')};
  globalThis.fetch=async(path,init)=>{
    const body=init?.body?JSON.parse(init.body):undefined;calls.push({path,body,method:init?.method??'GET'});
    if(init?.method==='POST'){
      if(onWrite){const result=onWrite(path,body,f);if(result!==undefined)return result;}
      if(body.expectedRevision!==current.revision)return json({message:'Workflow changed'},409);
      if(path.endsWith('/stage')){current=view({...current,stage:body.stage,revision:current.revision+1,actions:undefined});return json(current);}
      current=view({...current,stage:'interview',revision:current.revision+1,actions:undefined,interviews:[...current.interviews,{...appointment,id:`i${current.interviews.length+1}`,stepName:current.steps.find(step=>step.id===body.stepId)?.name,status:'scheduled',outcome:null,score:null,startsAt:body.startsAt,stepId:body.stepId}]});
      return json(current.interviews.at(-1));
    }
    if(path==='/api/applications/app/interviews')return json(current);
    if(path==='/api/applications/app')return json(record);
    if(path==='/api/interviewers')return json({items:[owner]});
    throw new Error(`Unexpected mock fetch: ${path}`);
  };
  function Host(){const {path}=useNavigation();return path==='/applications/app/interviews'?React.createElement(ApplicationWorkflow,{id:'app'}):React.createElement('h1',null,'Other destination');}
  render(React.createElement(NavigationBoundary,null,React.createElement(Host)));return f;
}
const unload=()=>{const event=new window.Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;};
async function openScreen(){const trigger=await screen.findByRole('button',{name:'Screening decision'});trigger.focus();fireEvent.click(trigger);return screen.getByRole('dialog',{name:'Screening decision'});}
test('undecided inspection shows one screening intent, not empty interviews, future actions or inline forms',async()=>{
  const f=fixture({initial:view({steps:[step]})});await screen.findByRole('heading',{name:'Screening'});
  equal(screen.queryByRole('heading',{name:'Interviews'}),null);equal(screen.queryByLabelText('Date'),null);
  equal(screen.queryByRole('button',{name:'Preselect candidate'}),null);equal(screen.queryByRole('button',{name:'Record offer'}),null);
  equal(screen.queryByRole('button',{name:'Record hired'}),null);equal(screen.queryByRole('button',{name:'Schedule interview'}),null);
  equal(screen.getByRole('link',{name:'Synthetic vacancy'}).getAttribute('href'),'#/vacancies/vac');
  equal(screen.queryByText('Vacancy details'),null);equal(screen.queryByText('Interview plan & results'),null);
  equal(f.writes().length,0);equal(f.calls.length,2);
});
test('existing appointment facts remain inspectable even if an inconsistent snapshot still says undecided',async()=>{
  fixture({initial:view({steps:[step],interviews:[appointment]})});await screen.findByRole('heading',{name:'Screening'});
  equal(screen.getByRole('link',{name:'Technical'}).getAttribute('href'),'#/interviews/i1');
  equal(screen.queryByRole('button',{name:'Schedule interview'}),null);equal(screen.queryByRole('button',{name:'Record offer'}),null);
});
test('screening dialog starts without a default decision; Cancel/Escape discard proposals and restore focus without writes',async()=>{
  const f=fixture(),dialog=await openScreen(),trigger=screen.getByRole('button',{name:'Screening decision'});
  equal(within(dialog).getByText('Confirm decision').disabled,true);equal(within(dialog).getByLabelText('Preselect').checked,false);
  equal(document.activeElement,within(dialog).getByText('Cancel'));ok(within(dialog).getByText(/locks automated results and human review/));
  fireEvent.click(within(dialog).getByLabelText('Not selected'));fireEvent.change(within(dialog).getByLabelText('Internal reason (optional)'),{target:{value:'Local proposal'}});
  equal(unload(),true);fireEvent.click(within(dialog).getByText('Cancel'));equal(screen.queryByRole('dialog'),null);equal(unload(),false);equal(f.writes().length,0);
  trigger.focus();fireEvent.click(trigger);const reopened=screen.getByRole('dialog');equal(within(reopened).getByLabelText('Not selected').checked,false);
  fireEvent(reopened,new window.Event('cancel',{cancelable:true}));equal(screen.queryByRole('dialog'),null);equal(document.activeElement,trigger);equal(f.writes().length,0);
});
test('confirmed preselection uses only the workflow revision and never auto-offers, books or patches review',async()=>{
  const f=fixture();const dialog=await openScreen();fireEvent.click(within(dialog).getByLabelText('Preselect'));equal(f.writes().length,0);
  fireEvent.click(within(dialog).getByText('Confirm decision'));await screen.findByText('Decision recorded.');
  deepEqual(f.writes().map(call=>({path:call.path,body:call.body})),[{path:'/api/applications/app/stage',body:{expectedRevision:7,stage:'preselected'}}]);
  equal(screen.queryByRole('dialog'),null);ok(screen.getByRole('button',{name:'Record offer'}));equal(screen.queryByRole('button',{name:'Record hired'}),null);
  equal(screen.queryByRole('button',{name:'Schedule interview'}),null);equal(f.current.interviews.length,0);equal(unload(),false);
  ok(document.activeElement.classList.contains('workflow-heading-focus'));
});
test('initial rejection accepts an optional internal reason and opening/switching choices has no effects',async()=>{
  for(const reason of ['', ' Internal screening note ']){
    const f=fixture(),dialog=await openScreen();fireEvent.click(within(dialog).getByLabelText('Not selected'));
    fireEvent.change(within(dialog).getByLabelText('Internal reason (optional)'),{target:{value:reason}});equal(f.writes().length,0);
    fireEvent.click(within(dialog).getByText('Confirm decision'));await screen.findByText('Decision recorded.');
    deepEqual(f.writes()[0].body,{expectedRevision:7,stage:'not_selected',...(reason.trim()?{reason:reason.trim()}:{})});cleanup();
  }
});
test('later rejection has a focused dialog, requires a nonblank internal reason and uses the existing stage command',async()=>{
  const f=fixture({initial:view({stage:'preselected',isOwner:false,steps:[step]})});
  fireEvent.click(await screen.findByRole('button',{name:'Not selected'}));const dialog=screen.getByRole('dialog',{name:'End this application?'});
  ok(within(dialog).getByText(/cancels any remaining unfinished interviews/));equal(within(dialog).getByText('Confirm decision').disabled,true);
  fireEvent.change(within(dialog).getByLabelText('Internal reason'),{target:{value:'   '}});equal(within(dialog).getByText('Confirm decision').disabled,true);
  fireEvent.change(within(dialog).getByLabelText('Internal reason'),{target:{value:'Position no longer suitable'}});fireEvent.click(within(dialog).getByText('Confirm decision'));
  await screen.findByText('Decision recorded.');deepEqual(f.writes()[0].body,{expectedRevision:7,stage:'not_selected',reason:'Position no longer suitable'});
  equal(f.writes().length,1);equal(screen.queryByRole('button',{name:'Not selected'}),null);
});
test('owner finalization remains staged and non-owner controls stay hidden even with inconsistent metadata',async()=>{
  const f=fixture({initial:view({stage:'preselected',isOwner:false,actions:{preselect:no,reject:yes,offer:yes,hire:yes,schedule:yes}})});
  await screen.findByText('Synthetic candidate');equal(screen.queryByRole('button',{name:'Record offer'}),null);equal(screen.queryByRole('button',{name:'Record hired'}),null);
  equal(screen.queryByText(/Only the owner/),null);equal(screen.queryByRole('button',{name:'Schedule interview'}),null);equal(f.writes().length,0);
});
test('a configured incomplete plan keeps Offer disabled while passed results stay readable',async()=>{
  fixture({initial:view({stage:'interview',steps:[step,{...step,id:'hr',name:'HR',position:1}],interviews:[appointment]})});
  equal((await screen.findByRole('button',{name:'Record offer'})).disabled,true);ok(screen.getByText('Every configured interview must pass before an offer.'));
  equal(screen.getByRole('link',{name:'Technical'}).getAttribute('href'),'#/interviews/i1');ok(screen.getByText('Score: 8/10'));ok(screen.getByText('Not scheduled'));
  equal(screen.queryByRole('dialog'),null);
});
test('all-Pass configured interviews still require explicit owner Offer confirmation and retain the results',async()=>{
  const f=fixture({initial:view({stage:'interview',steps:[step],interviews:[appointment]})});
  const trigger=await screen.findByRole('button',{name:'Record offer'});equal(f.writes().length,0);equal(screen.queryByRole('button',{name:'Record hired'}),null);
  fireEvent.click(trigger);const dialog=screen.getByRole('dialog',{name:'Record offer?'});ok(within(dialog).getByText(/All configured interviews have passed/));equal(f.writes().length,0);
  fireEvent.click(within(dialog).getByText('Confirm decision'));await screen.findByText('Decision recorded.');
  deepEqual(f.writes()[0].body,{expectedRevision:7,stage:'offer'});ok(screen.getByRole('link',{name:'Technical'}));ok(screen.getByText('Score: 8/10'));
  ok(screen.getByRole('button',{name:'Record hired'}));equal(f.writes().length,1);
});
test('cancelled configured interviews remain records, not replacement booking slots or passed prerequisites',async()=>{
  fixture({initial:view({stage:'interview',steps:[step],interviews:[{...appointment,status:'cancelled',outcome:null,score:null}]})});
  equal((await screen.findByRole('button',{name:'Record offer'})).disabled,true);
  equal(screen.queryByRole('button',{name:'Schedule interview'}),null);equal(screen.queryByText('Not scheduled'),null);
  ok(screen.getByText('cancelled'));equal(screen.getByRole('link',{name:'Technical'}).getAttribute('href'),'#/interviews/i1');
});
test('pending decision blocks duplicate confirm, Cancel/Escape and leaving, with dialog suspension/resumption around Stay',async()=>{
  let finish;const f=fixture({onWrite:()=>new Promise(resolve=>{finish=resolve;})});const dialog=await openScreen();
  fireEvent.click(within(dialog).getByLabelText('Preselect'));fireEvent.click(within(dialog).getByText('Confirm decision'));
  equal(within(dialog).getByText('Working…').disabled,true);equal(within(dialog).getByText('Cancel').disabled,true);equal(unload(),true);
  fireEvent(dialog,new window.Event('cancel',{cancelable:true}));equal(dialog.open,true);equal(f.writes().length,1);
  fireEvent.click(screen.getByRole('link',{name:'← Application information'}));await screen.findByRole('heading',{name:'Recruitment update in progress'});
  equal(dialog.open,false);equal(screen.getByText('Discard and leave').disabled,true);fireEvent.click(screen.getByText('Stay'));equal(dialog.open,true);equal(f.writes().length,1);
  await act(async()=>finish(json(view({stage:'preselected',revision:8}))));await screen.findByText('Decision recorded.');equal(f.writes().length,1);equal(unload(),false);
});
test('conflict preserves the proposal and disables writes until explicit refresh followed by a new confirmation',async()=>{
  let attempt=0;const f=fixture({onWrite:(_path,_body,state)=>{if(++attempt===1){state.current=view({revision:8});return json({message:'Changed by another HR'},409);}}});
  const dialog=await openScreen();fireEvent.click(within(dialog).getByLabelText('Not selected'));fireEvent.change(within(dialog).getByLabelText('Internal reason (optional)'),{target:{value:'Preserved reason'}});
  fireEvent.click(within(dialog).getByText('Confirm decision'));await screen.findByText(/Changed by another HR/);equal(f.writes().length,1);equal(within(dialog).getByText('Confirm decision').disabled,true);
  equal(within(dialog).getByLabelText('Internal reason (optional)').value,'Preserved reason');fireEvent.click(within(dialog).getByText('Refresh current state'));
  await waitFor(()=>equal(within(dialog).getByText('Confirm decision').disabled,false));equal(f.writes().length,1);
  fireEvent.click(within(dialog).getByText('Confirm decision'));await screen.findByText('Decision recorded.');deepEqual(f.writes().map(call=>call.body.expectedRevision),[7,8]);
});
test('an uncertain response never retries or claims receipt; refresh showing another committed state blocks the stale proposal',async()=>{
  const f=fixture({onWrite:(_path,_body,state)=>{state.current=view({stage:'preselected',revision:8});throw new TypeError('Connection lost');}});
  const dialog=await openScreen();fireEvent.click(within(dialog).getByLabelText('Not selected'));fireEvent.click(within(dialog).getByText('Confirm decision'));
  await screen.findByText(/No automatic retry was made/);equal(f.writes().length,1);equal(screen.queryByText('Decision recorded.'),null);
  fireEvent.click(within(dialog).getByText('Refresh current state'));await screen.findByText('This action is no longer available. Cancel to inspect the current state.');
  equal(within(dialog).getByText('Confirm decision').disabled,true);equal(f.writes().length,1);equal(screen.queryByText('Decision recorded.'),null);
  fireEvent.click(within(dialog).getByText('Cancel'));ok(screen.getByRole('button',{name:'Record offer'}));equal(unload(),false);
});
test('scheduling is dialog-only, uses browser-local time/zone and books only on explicit form submission',async()=>{
  const f=fixture({initial:view({stage:'preselected',steps:[step]})});const trigger=await screen.findByRole('button',{name:'Schedule interview'});
  equal(screen.queryByLabelText('Date'),null);equal(f.calls.some(call=>call.path==='/api/interviewers'),false);fireEvent.click(trigger);
  const dialog=screen.getByRole('dialog',{name:'Schedule interview'});await waitFor(()=>ok(within(dialog).getByRole('option',{name:'Synthetic owner · hr@example.test'})));
  equal(f.writes().length,0);fireEvent.change(within(dialog).getByLabelText('Date'),{target:{value:'2027-01-12'}});
  fireEvent.change(within(dialog).getByLabelText('Start time'),{target:{value:'09:30'}});fireEvent.change(within(dialog).getByLabelText('Interviewer'),{target:{value:'hr'}});
  fireEvent.change(within(dialog).getByLabelText('Meeting link or location'),{target:{value:'Room 2'}});equal(unload(),true);
  fireEvent.submit(dialog.querySelector('form'));await screen.findByText('Interview scheduled.');
  equal(f.writes()[0].path,'/api/applications/app/interviews');deepEqual(f.writes()[0].body,{stepId:'technical',interviewerId:'hr',startsAt:new Date('2027-01-12T09:30:00').toISOString(),durationMinutes:60,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,meeting:'Room 2',expectedRevision:7});
  equal(screen.queryByRole('dialog'),null);equal(screen.queryByRole('button',{name:'Schedule interview'}),null);equal(f.writes().length,1);equal(unload(),false);
});
test('uncertain booking preserves local arrangements and requires refresh; an occupied step cannot be booked again',async()=>{
  const f=fixture({initial:view({stage:'preselected',steps:[step]}),onWrite:(_path,_body,state)=>{state.current=view({stage:'interview',steps:[step],interviews:[{...appointment,status:'scheduled',outcome:null}],revision:8});throw new TypeError('Booking response lost');}});
  fireEvent.click(await screen.findByRole('button',{name:'Schedule interview'}));const dialog=screen.getByRole('dialog');
  await waitFor(()=>ok(within(dialog).getByRole('option',{name:'Synthetic owner · hr@example.test'})));
  fireEvent.change(within(dialog).getByLabelText('Interviewer'),{target:{value:'hr'}});fireEvent.change(within(dialog).getByLabelText('Meeting link or location'),{target:{value:'Retained room'}});
  fireEvent.submit(dialog.querySelector('form'));await screen.findByText(/Booking response lost/);equal(f.writes().length,1);equal(dialog.querySelector('fieldset').disabled,true);
  equal(within(dialog).getByLabelText('Meeting link or location').value,'Retained room');fireEvent.click(within(dialog).getByText('Refresh current state'));
  await screen.findByText('This action is no longer available. Cancel to inspect the current state.');equal(dialog.querySelector('fieldset').disabled,true);equal(f.writes().length,1);
  fireEvent.click(within(dialog).getByText('Cancel'));equal(screen.queryByRole('button',{name:'Schedule interview'}),null);equal(unload(),false);
});
test('refresh with another available interview requires explicit reselection instead of silently replacing the proposed step',async()=>{
  const second={...step,id:'hr-interview',name:'HR',position:1};let attempts=0;
  const f=fixture({initial:view({stage:'preselected',steps:[step,second]}),onWrite:(_path,_body,state)=>{
    if(++attempts===1){state.current=view({stage:'interview',steps:[step,second],interviews:[{...appointment,status:'scheduled',outcome:null}],revision:8});return json({message:'Step already booked'},409);}
  }});
  fireEvent.click(await screen.findByRole('button',{name:'Schedule interview'}));const dialog=screen.getByRole('dialog');
  await waitFor(()=>ok(within(dialog).getByRole('option',{name:'Synthetic owner · hr@example.test'})));
  fireEvent.change(within(dialog).getByLabelText('Interviewer'),{target:{value:'hr'}});fireEvent.change(within(dialog).getByLabelText('Meeting link or location'),{target:{value:'Keep these details'}});
  fireEvent.submit(dialog.querySelector('form'));await screen.findByText(/Step already booked/);fireEvent.click(within(dialog).getByText('Refresh current state'));
  await screen.findByText('Current state loaded. Review it before confirming.');equal(within(dialog).getByLabelText('Interview').value,'');
  equal(within(dialog).getByLabelText('Meeting link or location').value,'Keep these details');
  fireEvent.submit(dialog.querySelector('form'));await screen.findByText('Choose an available interview.');equal(f.writes().length,1);
  fireEvent.change(within(dialog).getByLabelText('Interview'),{target:{value:'hr-interview'}});fireEvent.submit(dialog.querySelector('form'));
  await screen.findByText('Interview scheduled.');equal(f.writes()[1].body.stepId,'hr-interview');equal(f.writes()[1].body.expectedRevision,8);
});
test('explicit Cancel discards interview arrangements without a write; reopening uses a fresh local form',async()=>{
  const f=fixture({initial:view({stage:'preselected',steps:[step]})});fireEvent.click(await screen.findByRole('button',{name:'Schedule interview'}));
  const dialog=screen.getByRole('dialog');fireEvent.change(within(dialog).getByLabelText('Meeting link or location'),{target:{value:'Local only'}});equal(unload(),true);
  fireEvent.click(within(dialog).getByText('Cancel'));equal(unload(),false);equal(f.writes().length,0);
  fireEvent.click(screen.getByRole('button',{name:'Schedule interview'}));equal(screen.getByLabelText('Meeting link or location').value,'');equal(f.writes().length,0);
});
test('unconfirmed proposals use the shared leave warning; Stay keeps inputs and explicit discard leaves without writes',async()=>{
  const f=fixture(),dialog=await openScreen();fireEvent.click(within(dialog).getByLabelText('Not selected'));fireEvent.change(within(dialog).getByLabelText('Internal reason (optional)'),{target:{value:'Do not save'}});
  fireEvent.click(screen.getByRole('link',{name:'← Application information'}));await screen.findByRole('heading',{name:'Leave with an unconfirmed recruitment action?'});
  equal(dialog.open,false);fireEvent.click(screen.getByText('Stay'));equal(dialog.open,true);equal(within(dialog).getByLabelText('Internal reason (optional)').value,'Do not save');
  fireEvent.click(screen.getByRole('link',{name:'← Application information'}));fireEvent.click(await screen.findByText('Discard and leave'));
  await screen.findByRole('heading',{name:'Other destination'});equal(f.writes().length,0);equal(unload(),false);equal(sessionStorage.length,0);
});
test('candidate and interviewer deep links cannot render HR workflow dialogs or fetch workflow data',async()=>{
  for(const role of ['candidate','interviewer']){
    window.history.replaceState(null,'','/#/applications/app/interviews');const calls=[];
    globalThis.fetch=async path=>{calls.push(path);return path==='/api/me'?json({user:{id:role,role,name:'Synthetic actor',email:'actor@example.test'}}):json({...record,review:undefined,actions:undefined});};
    render(React.createElement(App));await screen.findByRole('heading',{name:role==='candidate'?'Your application':'Sign in to continue'});
    equal(calls.includes('/api/applications/app/interviews'),false);equal(screen.queryByRole('button',{name:'Screening decision'}),null);equal(screen.queryByRole('dialog'),null);cleanup();
  }
});
