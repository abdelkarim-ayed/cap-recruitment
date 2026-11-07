import { test, afterEach } from 'node:test';
import { equal, deepEqual, ok } from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','File','FileList','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,cleanup,waitFor,fireEvent}=await import('@testing-library/react');
const {default:userEvent}=await import('@testing-library/user-event');
const {CandidateForm}=await import('../src/candidate-form.tsx');
const {FormEditor}=await import('../src/form-editor.tsx');
const {App}=await import('../src/app.tsx');
const {ApplicationPage,ApplicationList}=await import('../src/applications.tsx');
const {VacancyPage,VacancyList}=await import('../src/vacancies.tsx');
const {Login}=await import('../src/login.tsx');
const {PdfPreview}=await import('../src/pdf-preview.tsx');
const {ScheduleForm,PipelinePage,InterviewPage,Inbox,cancellationText}=await import('../src/interviews.tsx');
const {makeInput,removeInput,moveInput}=await import('../src/form-model.ts');
const {createVacancySchema}=await import('@recruitment/domain/vacancies');
const originalFetch=globalThis.fetch;
const available={allowed:true,visible:true,reason:null};
const unavailable={allowed:false,visible:false,reason:'Fixture: action unavailable'};
const staffApplicationActions={review:available,workflow:available,export:available};
const reviewActions={edit:available};
test('per-skill correction preserves unavailable siblings rather than inventing negatives',async()=>{
  let submitted;
  const view={actions:reviewActions,review:{status:'pending',revision:1},tasks:[{taskId:'skills',outputKey:'skills',sourceInputId:'cv',status:'failed',attempts:1,result:{status:'failed',value:null},effectiveValue:null,skillResults:[{skill:'sql',original:null,effective:null},{skill:'rust',original:null,effective:null}]}]};
  globalThis.fetch=async(path,init)=>{if(init?.method==='PATCH'){submitted=JSON.parse(init.body);return json(view);}return path.endsWith('/review')?json(view):json({actions:staffApplicationActions,id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-31T00:00:00Z',stage:'received',processingState:'completed_with_errors',vacancy:{title:'Backend',formDefinition:{inputs:[]}},answers:{},documents:[]});};
  render(React.createElement(ApplicationPage,{id:'app',staff:true}));await screen.findByLabelText('Review sql');
  fireEvent.change(screen.getByLabelText('Review sql'),{target:{value:'true'}});fireEvent.click(screen.getByText('Save correction'));
  await waitFor(()=>ok(submitted));deepEqual(submitted.corrections[0].value,{skills:['sql'],unavailableSkills:['rust']});
});
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;window.location.hash='';sessionStorage.clear();});
test('review shows readable effective skills and mode-specific provenance without a global mock claim',async()=>{
  globalThis.fetch=async(path)=>path.endsWith('/review')?json({actions:reviewActions,review:{status:'pending',revision:1},tasks:[{taskId:'skills',outputKey:'skills',sourceInputId:'cv',status:'completed',attempts:1,result:{status:'completed',value:{skills:['SQL']},evidence:['Used SQL']},effectiveValue:{skills:['SQL']},provenance:{mode:'live',provider:'typesafe',reader:'pdfjs-dist@6.4.299',model:'jev-test'}}]}):json({actions:staffApplicationActions,id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-31T00:00:00Z',stage:'received',processingState:'completed',vacancy:{title:'Backend',formDefinition:{inputs:[]}},answers:{},documents:[]});
  render(React.createElement(ApplicationPage,{id:'app',staff:true}));
  await screen.findByText('Jev result');equal(screen.queryByText('Mock extraction'),null);
  equal(document.querySelector('.effective-skills').textContent,'SQL');
  equal(document.querySelector('.original-result').open,false);
  ok(document.querySelector('.original-result').textContent.includes('pdfjs-dist@6.4.299'));
});
test('fixture review stays visibly labelled and keeps technical identifiers in collapsed evidence',async()=>{
  globalThis.fetch=async(path)=>path.endsWith('/review')?json({actions:reviewActions,review:{status:'pending',revision:1},tasks:[{taskId:'skills',outputKey:'skills',sourceInputId:'cv',status:'failed',attempts:1,result:{status:'failed',value:null,reason:'Recorded fixture failure'},effectiveValue:null,provenance:{mode:'fixture',fixtureId:'sample',reader:'pdfjs-dist@6.4.299'}}]}):json({actions:staffApplicationActions,id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-31T00:00:00Z',stage:'received',processingState:'completed_with_errors',vacancy:{title:'Backend',formDefinition:{inputs:[]}},answers:{},documents:[]});
  render(React.createElement(ApplicationPage,{id:'app',staff:true}));await screen.findByText('Fixture result');
  equal(screen.queryByText('Jev result'),null);equal(document.querySelector('.original-result').open,false);ok(document.querySelector('.original-result').textContent.includes('Fixture: sample'));
});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
test('editor input removal drops linked tasks, reorder preserves identities, catalog generates valid inputs',()=>{
  const inputs=['text','long_text','number','yes_no','single_choice','multiple_choice','document','separator'].map((type,i)=>makeInput(type,`field_${i}`));
  const processing={version:1,tasks:[{id:'skills',sourceInputId:'field_6',outputKey:'skills',type:'extractSkills',args:{skills:['SQL'],evidence:true}}]};
  ok(createVacancySchema.safeParse({title:'Fixture',description:'Fixture',formDefinition:{version:1,inputs},processingDefinition:processing}).success);
  equal(moveInput(inputs,0,1)[1].id,'field_0');
  deepEqual(removeInput(inputs,processing,'field_6').processing.tasks,[]);
});
test('document extension editing accepts comma-separated values and preserves task args',async()=>{
  const user=userEvent.setup({document});let saved;
  function Host(){const [form,setForm]=React.useState({version:1,inputs:[makeInput('document','cv')]});const [processing,setProcessing]=React.useState({version:1,tasks:[]});return React.createElement(FormEditor,{form,processing,onChange:(f,p)=>{setForm(f);setProcessing(p);saved={f,p};}});}
  render(React.createElement(Host));await user.type(screen.getByLabelText(/Allowed extensions/),'.pdf, .docx');await user.tab();
  deepEqual(saved.f.inputs[0].args.accept,['.pdf','.docx']);
  await user.click(screen.getByText('+ Skills extraction'));
  equal(saved.p.tasks[0].sourceInputId,'cv');deepEqual(saved.p.tasks[0].args.skills,['sql','typescript']);equal(saved.p.tasks[0].args.evidence,false);
});
test('candidate submits false and zero as typed answers, document separate from answers',async()=>{
  let sent;
  globalThis.fetch=async(path,init)=>{sent={path,init};return json({id:'application-one'});};
  const user=userEvent.setup({document});
  render(React.createElement(CandidateForm,{vacancy:{id:'vacancy-one',form:{version:1,inputs:[{...makeInput('yes_no','available'),label:'Available',required:true},{...makeInput('number','years'),label:'Years',required:true}]}}}));
  await user.selectOptions(screen.getByLabelText(/Available/),'false');await user.type(screen.getByLabelText(/Years/),'0');await user.click(screen.getByText('Submit application'));
  await waitFor(()=>ok(sent));deepEqual(JSON.parse(sent.init.body.get('answers')),{available:false,years:0});equal(sent.path,'/api/vacancies/vacancy-one/applications');
});
test('candidate validation blocks unknown/required omissions before HTTP and preview cannot submit',async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;return json({});};
  const vacancy={id:'preview',form:{version:1,inputs:[{...makeInput('multiple_choice','skills'),required:true}]}};
  render(React.createElement(CandidateForm,{vacancy}));fireEvent.submit(document.querySelector('form'));
  await screen.findByRole('alert');equal(calls,0);cleanup();
  render(React.createElement(CandidateForm,{vacancy,preview:true}));ok(screen.getByText('Preview only').disabled);
});
test('candidate PDF selection survives answer edits and submits the selected file as multipart',async()=>{
  const originalFormData=globalThis.FormData;globalThis.FormData=dom.window.FormData;
  try{
    let sent;globalThis.fetch=async(path,init)=>{sent={path,init};return json({id:'uploaded-application'});};
    const user=userEvent.setup({document});
    render(React.createElement(CandidateForm,{vacancy:{id:'upload-vacancy',form:{version:1,inputs:[{...makeInput('text','name'),label:'Full name',required:true},{...makeInput('document','cv'),label:'Your CV',required:true,args:{accept:['.pdf','.docx']}}]}}}));
    const input=screen.getByLabelText(/Your CV/);const file=new File(['%PDF-1.7\nSynthetic CV'],'candidate-cv.pdf',{type:'application/pdf'});
    await user.upload(input,file);equal(input.files.length,1);equal(input.files[0],file);
    await user.type(screen.getByLabelText(/Full name/),'Candidate');equal(input.files[0],file);
    // jsdom's native required-file validity does not reflect user-event's FileList.
    // Exercise the real submit handler; native file-picker behavior remains manually tested.
    fireEvent.submit(document.querySelector('form'));await waitFor(()=>ok(sent,screen.queryByRole('alert')?.textContent||'Submission handler did not run'));
    equal(sent.path,'/api/vacancies/upload-vacancy/applications');equal(sent.init.body.get('cv').name,'candidate-cv.pdf');equal(sent.init.body.get('cv').size,file.size);deepEqual(JSON.parse(sent.init.body.get('answers')),{name:'Candidate'});
  }finally{globalThis.FormData=originalFormData;}
});
test('real /me envelope chooses HR navigation and vacancy-filtered application route',async()=>{
  window.location.hash='/applications?vacancy=vacancy-one';const calls=[];
  globalThis.fetch=async path=>{calls.push(path);if(path==='/api/me')return json({user:{id:'hr',role:'recruiter',email:'hr@example.test',name:'HR Fixture'}});return json({items:[],total:0,limit:20,offset:0});};
  render(React.createElement(App));await screen.findByText('Export all CSV');
   await waitFor(()=>ok(calls.includes('/api/vacancies/vacancy-one/applications?limit=20&offset=0&sort=newest&undecided=true')));ok(screen.getByText('HR Fixture'));
});
test('password login uses real identity envelope without OTP or client-selected role',async()=>{
  window.location.hash='/login';const calls=[];let loggedIn=false;
  globalThis.fetch=async(path,init)=>{calls.push({path,body:init?.body});if(path==='/api/me')return loggedIn?json({user:{id:'candidate',name:'Candidate',email:'demo.candidate@example.test',role:'candidate'}}):json({message:'Unauthorized'},401);if(path==='/api/auth/sign-in/email')loggedIn=true;if(path.includes('vacancies'))return json({items:[],total:0,limit:20,offset:0});return json({success:true});};
  const user=userEvent.setup({document});render(React.createElement(App));await user.type(await screen.findByLabelText('Email address'),'demo.candidate@example.test');await user.type(screen.getByLabelText('Password'),'DemoRecruitment!2026');await user.click(screen.getByRole('button',{name:'Sign in',exact:true}));
  await screen.findByText('My applications');
  equal(calls.filter(c=>c.path.includes('email-otp')).length,0);
  deepEqual(JSON.parse(calls.find(c=>c.path==='/api/auth/sign-in/email').body),{email:'demo.candidate@example.test',password:'DemoRecruitment!2026'});
});
test('HR correction submits separate task value/revision and stale write asks for refresh',async()=>{
  const patches=[];
  globalThis.fetch=async(path,init)=>{
    if(init?.method==='PATCH'){patches.push(JSON.parse(init.body));return json({message:'Review changed; reload before retrying.'},409);}
    if(path.endsWith('/review'))return json({actions:reviewActions,review:{status:'pending',revision:4,reviewedBy:null,reviewedAt:null},tasks:[{taskId:'skills',sourceInputId:'cv',outputKey:'skills',status:'failed',attempts:1,result:{status:'failed',value:null,reason:'Fixture failure'},provenance:{mode:'fixture',fixtureId:'fixture-one'},hasCorrection:false,effectiveValue:null}]});
    return json({actions:staffApplicationActions,id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-10T00:00:00Z',stage:'received',processingState:'completed_with_errors',vacancy:{title:'Backend',formDefinition:{version:1,inputs:[{...makeInput('text','name'),label:'Name'}]}},answers:{name:'Locked answer'},documents:[]});
  };
  const user=userEvent.setup({document});render(React.createElement(ApplicationPage,{id:'app',staff:true}));
  await user.type(await screen.findByLabelText('Skills (comma separated)'),'SQL, TypeScript');await user.click(screen.getByText('Save correction'));
  await screen.findByRole('alert');deepEqual(patches[0],{corrections:[{taskId:'skills',value:{skills:['SQL','TypeScript']}}],expectedRevision:4});ok(screen.getByText('Locked answer'));ok(screen.getByText(/Use Refresh/));
});
test('candidate detail never requests review or offers extraction edit controls',async()=>{
  const paths=[];globalThis.fetch=async path=>{paths.push(path);return json({id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-10T00:00:00Z',stage:'received',processingState:'pending',vacancy:{title:'Backend',formDefinition:{version:1,inputs:[]}},answers:{},documents:[]});};
  render(React.createElement(ApplicationPage,{id:'app',staff:false}));await screen.findByText('Your application');deepEqual(paths,['/api/applications/app']);equal(screen.queryByText('Mark review complete'),null);
});
test('draft editing sends paired definitions and cannot publish unsaved changes',async()=>{
  const calls=[];const vacancy={actions:{edit:available,publish:available,close:unavailable},id:'vac',ownerId:'hr',title:'Backend',description:'Services',status:'draft',revision:1,formDefinition:{version:1,inputs:[makeInput('text','name')]},processingDefinition:{version:1,tasks:[]}};
  globalThis.fetch=async(path,init)=>{calls.push({path,init});if(init?.method==='PATCH')return json({...vacancy,...JSON.parse(init.body),revision:2});return json(vacancy);};
  const user=userEvent.setup({document});render(React.createElement(VacancyPage,{id:'vac',actor:{id:'hr',name:'HR',email:'hr@example.test',role:'recruiter'}}));
  const title=await screen.findByLabelText('Position title');await user.type(title,' edited');ok(screen.getByText('Publish saved draft').disabled);
  await user.click(screen.getByText('Save draft'));await screen.findByRole('status');
  const body=JSON.parse(calls.find(call=>call.init?.method==='PATCH').init.body);equal(body.expectedRevision,1);deepEqual(body.formDefinition,vacancy.formDefinition);deepEqual(body.processingDefinition,vacancy.processingDefinition);
  equal(screen.getByText('Publish saved draft').disabled,false);
});
test('signup is candidate-only, locks verification recipient and clears password before verification',async()=>{
  const calls=[];globalThis.fetch=async(path,init)=>{calls.push({path,body:JSON.parse(init.body)});return json({});};
  const user=userEvent.setup({document});render(React.createElement(Login,{onLogin:()=>{throw new Error('Signup must not create a session');}}));
  await user.click(screen.getByText('Candidate signup'));await user.type(screen.getByLabelText('Email address'),'new@example.test');await user.type(screen.getByLabelText('Full name'),'New Candidate');await user.type(screen.getByLabelText('Password'),'SyntheticPassword!2026');await user.click(screen.getByText('Create account'));
  ok((await screen.findByLabelText('Verification code')));ok(screen.getByLabelText('Email address').readOnly);equal(screen.queryByLabelText('Password'),null);
  deepEqual(calls[0],{path:'/api/auth/sign-up/email',body:{email:'new@example.test',password:'SyntheticPassword!2026',name:'New Candidate'}});
  await user.type(screen.getByLabelText('Verification code'),'123456');await user.click(screen.getByRole('button',{name:'Verify email',exact:true}));
  await screen.findByText('Email verified. Sign in with your password.');deepEqual(calls[1],{path:'/api/auth/email-otp/verify-email',body:{email:'new@example.test',otp:'123456'}});
});
test('saved correction stays prominent after save and refresh, without replacing original extraction',async()=>{
  let hasCorrection=false;
  const view=()=>({actions:reviewActions,review:{status:'in_review',revision:hasCorrection?5:4,updatedAt:'2026-10-10T12:00:00Z',editor:{name:'Second Recruiter',email:'second@example.test'}},tasks:[{taskId:'skills',sourceInputId:'cv',outputKey:'skills',status:'completed',attempts:1,result:{status:'completed',value:{skills:['Original skill']},evidence:['Original evidence']},hasCorrection,correction:hasCorrection?{skills:['Saved skill']}:null,effectiveValue:{skills:[hasCorrection?'Saved skill':'Original skill']},correctedAt:'2026-10-10T12:00:00Z',corrector:{name:'Second Recruiter'}}]});
  globalThis.fetch=async(path,init)=>{if(init?.method==='PATCH')hasCorrection=true;if(path.endsWith('/review'))return json(view());return json({actions:staffApplicationActions,id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-10T00:00:00Z',stage:'received',processingState:'completed',vacancy:{title:'Backend',formDefinition:{inputs:[]}},answers:{},documents:[]});};
  const user=userEvent.setup({document});render(React.createElement(ApplicationPage,{id:'app',staff:true}));const input=await screen.findByLabelText('Skills (comma separated)');await user.clear(input);await user.type(input,'Saved skill');await user.click(screen.getByText('Save correction'));
  await screen.findByText('Saved HR correction');ok(screen.getByLabelText('Latest saved value for skills').textContent.includes('Saved skill'));ok(screen.getAllByText(/Saved .*2026/).length>0);
  equal(screen.getByLabelText('Skills (comma separated)').value,'Saved skill');ok(document.querySelector('.original-result').textContent.includes('Original skill'));
  await user.click(screen.getByText('Refresh'));await screen.findByText('Saved HR correction');ok(screen.getByLabelText('Latest saved value for skills').textContent.includes('Saved skill'));
});
test('table filters/sort request dataset-level results rather than rearranging one page',async()=>{
  const paths=[];globalThis.fetch=async path=>{paths.push(path);return json({items:[],total:0});};
  const user=userEvent.setup({document});render(React.createElement(ApplicationList,{staff:true}));await screen.findByText(/No applications match/);
  await user.selectOptions(screen.getByLabelText('Review status'),'completed');await waitFor(()=>ok(paths.at(-1).includes('&review=completed')));
  await user.selectOptions(screen.getByLabelText('Processing status'),'completed_with_errors');await user.selectOptions(screen.getByLabelText('Sort applications'),'candidate');await waitFor(()=>ok(paths.at(-1).includes('sort=candidate&processing=completed_with_errors&review=completed')));
});
test('vacancy owner is visible and owner metadata is labelled as mine',async()=>{
  globalThis.fetch=async()=>json({items:[{id:'vac',title:'Backend',ownerId:'hr',owner:{name:'Alex Recruiter',email:'demo.hr@example.test'},status:'draft',revision:1}],total:1});
  render(React.createElement(VacancyList,{staff:true,actorId:'hr'}));await screen.findByText('Alex Recruiter');ok(screen.getByText('demo.hr@example.test'));ok(screen.getByText('Owned by you'));
});
test('PDF preview uses authenticated attachment bytes, rejects non-PDF and releases object URL',async()=>{
  const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;const revoked=[];let fetched;
  URL.createObjectURL=()=> 'blob:synthetic-pdf';URL.revokeObjectURL=url=>revoked.push(url);
  try{
    globalThis.fetch=async(path,init)=>{fetched={path,init};return new Response('%PDF-1.7\nsynthetic');};
    const mounted=render(React.createElement(PdfPreview,{applicationId:'app',document:{id:'doc',filename:'cv.pdf'},onClose:()=>{}}));
    const frame=await screen.findByTitle('PDF: cv.pdf');equal(frame.getAttribute('src'),'blob:synthetic-pdf');equal(fetched.init.credentials,'include');equal(fetched.path,'/api/applications/app/documents/doc');mounted.unmount();deepEqual(revoked,['blob:synthetic-pdf']);
    globalThis.fetch=async()=>new Response('<html>not a PDF</html>');render(React.createElement(PdfPreview,{applicationId:'app',document:{id:'bad',filename:'bad.pdf'},onClose:()=>{}}));
    await screen.findByRole('alert');equal(screen.queryByTitle('PDF: bad.pdf'),null);
  }finally{URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;}
});
test('no-extraction application skips review requests/controls but retains files and export',async()=>{
  const paths=[];globalThis.fetch=async path=>{paths.push(path);return json({actions:staffApplicationActions,id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-10T00:00:00Z',stage:'received',processingState:'not_requested',review:{required:false,status:'completed',revision:1},vacancy:{title:'Backend',formDefinition:{inputs:[]}},answers:{},documents:[{id:'doc',filename:'cv.pdf',byteCount:100}]});};
  render(React.createElement(ApplicationPage,{id:'app',staff:true}));await screen.findByText('Answers');deepEqual(paths,['/api/applications/app']);equal(screen.queryByText('Extraction review'),null);equal(screen.queryByText('Mark review complete'),null);equal(screen.queryByText('Extracted fields'),null);ok(screen.getByText('Preview cv.pdf'));ok(screen.getByText('Export vacancy CSV'));
});
test('no-extraction vacancy list hides review filters/columns and never labels candidates reviewed',async()=>{
  globalThis.fetch=async()=>json({items:[{id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},vacancyTitle:'Backend',submittedAt:'2026-10-10T00:00:00Z',processingState:'not_requested',review:{required:false,status:'completed'}}],total:1,reviewRequired:false});
  render(React.createElement(ApplicationList,{staff:true}));await screen.findByText('candidate@example.test');equal(screen.queryByLabelText('Review status'),null);equal(screen.queryByLabelText('Processing status'),null);equal(screen.queryByText('Extraction review'),null);equal(screen.queryByText('completed'),null);
});
test('schedule form offers half-hour local times and submits explicit timezone/assignment',async()=>{
  let submitted;globalThis.fetch=async()=>json({items:[{id:'interviewer',name:'Engineer',email:'engineer@example.test'}]});
  const user=userEvent.setup({document});render(React.createElement(ScheduleForm,{steps:[{id:'step',name:'Technical'}],busy:false,onSave:async body=>{submitted=body;}}));
  await screen.findByText('Engineer · engineer@example.test');equal(screen.getByLabelText(/Start time/).options.length,48);equal(screen.queryByText('09:15'),null);
  fireEvent.change(screen.getByLabelText('Date'),{target:{value:'2027-01-12'}});await user.selectOptions(screen.getByLabelText('Start time'),'09:30');await user.selectOptions(screen.getByLabelText('Interviewer'),'interviewer');await user.type(screen.getByLabelText('Meeting link or location'),'Room 2');await user.click(screen.getByText('Schedule interview'));
  await waitFor(()=>ok(submitted));equal(submitted.stepId,'step');equal(submitted.interviewerId,'interviewer');equal(submitted.durationMinutes,60);equal(submitted.timezone,Intl.DateTimeFormat().resolvedOptions().timeZone);equal(new Date(submitted.startsAt).getMinutes(),30);
});
test('frozen pipeline shows comparable results and owner contact, without authoring controls',async()=>{
  globalThis.fetch=async()=>json({actions:{edit:unavailable},owner:{name:'Owner',email:'owner@example.test'},editable:false,frozen:true,revision:2,steps:[{id:'s',name:'Technical',instructions:''}],items:[{id:'a',candidate:{name:'Candidate',email:'candidate@example.test'},stage:'not_selected',interviews:[{id:'i',stepId:'s',outcome:'fail',score:2}]}],total:1});
  render(React.createElement(PipelinePage,{id:'v'}));await screen.findByText('candidate@example.test');ok(screen.getByText('Score: 2/10'));equal(screen.queryByText('Save interview plan'),null);ok(screen.getByText('owner@example.test'));equal(screen.getByText('owner@example.test').getAttribute('href'),'mailto:owner@example.test');
});
test('interview Fail requires explicit confirmation and submits notes/score separate from outcome',async()=>{
  const calls=[];let done=false;const record=()=>({actions:{reschedule:unavailable,cancel:unavailable,requestRescheduling:done?unavailable:available,submitFeedback:done?unavailable:available,readApplication:available},id:'i',applicationId:'a',stepName:'Technical',candidate:{name:'Candidate',email:'candidate@example.test'},vacancyTitle:'Backend',owner:{name:'Owner',email:'owner@example.test'},interviewer:{id:'engineer',name:'Engineer',email:'engineer@example.test'},startsAt:'2020-01-01T09:00:00Z',durationMinutes:60,meeting:'Room 1',revision:done?2:1,status:done?'completed':'scheduled',canAssess:!done,canSchedule:false,notes:done?'Not enough technical knowledge.':null,score:done?2:null,outcome:done?'fail':null,submittedAt:done?'2026-10-11T09:00:00Z':null});
  globalThis.fetch=async(path,init)=>{if(path.endsWith('/feedback')){calls.push(JSON.parse(init.body));done=true;return json(record());}if(path.endsWith('/application'))return json({candidate:{email:'candidate@example.test'},vacancy:{formDefinition:{inputs:[]}},answers:{},documents:[]});return json(record());};
  const user=userEvent.setup({document});render(React.createElement(InterviewPage,{id:'i',actor:{id:'engineer',role:'interviewer'}}));await user.type(await screen.findByLabelText('Notes'),'Not enough technical knowledge.');await user.type(screen.getByLabelText('Score (optional, 0–10)'),'2');await user.selectOptions(screen.getByLabelText('Interview outcome'),'fail');await user.click(screen.getByText('Submit feedback'));equal(calls.length,0);ok(screen.getByText(/Fail ends this application/));await user.click(screen.getByText('Confirm feedback'));await screen.findByText('Submitted feedback');deepEqual(calls,[{notes:'Not enough technical knowledge.',score:2,outcome:'fail',expectedRevision:1}]);equal(screen.queryByText('Submit feedback'),null);
});
test('cancelled interview skips candidate document requests and displays its workflow cause',async()=>{
  const paths=[];globalThis.fetch=async path=>{paths.push(path);return json({actions:{reschedule:unavailable,cancel:unavailable,requestRescheduling:unavailable,submitFeedback:unavailable,readApplication:unavailable},stepName:'HR',candidate:{name:'Candidate'},vacancyTitle:'Backend',owner:{name:'Owner',email:'owner@example.test'},interviewer:{id:'engineer',name:'Engineer',email:'engineer@example.test'},status:'cancelled',startsAt:'2026-10-12T09:00:00Z',meeting:'Room',durationMinutes:30,cancellationCause:{type:'interview_failed',stepName:'Technical'},canAssess:false,canSchedule:false});};
  render(React.createElement(InterviewPage,{id:'i',actor:{id:'engineer',role:'interviewer'}}));await screen.findByText('Cancelled after Fail in Technical.');deepEqual(paths,['/api/interviews/i']);equal(screen.queryByText('Interview feedback'),null);
  equal(cancellationText({type:'hr_ended_application',reason:'Withdrawn by HR'}),'Application ended by HR: Withdrawn by HR');
});
test('inbox opens through recipient-specific read action and supports retained messages',async()=>{
  const calls=[];globalThis.fetch=async(path,init)=>{calls.push({path,init});if(init?.method==='POST')return json({id:'n',readAt:'2026-10-11T00:00:00Z'});return json({items:[{id:'n',title:'Interview assigned',body:'Technical interview',createdAt:'2026-10-11T00:00:00Z',readAt:null,interviewId:'i'}],total:1});};
  const user=userEvent.setup({document});render(React.createElement(Inbox));await screen.findByText('Interview assigned');await user.selectOptions(screen.getByLabelText('Messages'),'all');await waitFor(()=>ok(calls.some(c=>c.path.includes('read=all'))));await user.click(screen.getByText('Open interview'));await waitFor(()=>equal(location.hash,'#/interviews/i'));ok(calls.some(c=>c.path==='/api/inbox/n/read'&&c.init.method==='POST'));
});
test('inbox can mark read without navigating and retains the message in All',async()=>{
  let read=false;const calls=[];
  globalThis.fetch=async(path,init)=>{calls.push(path);if(init?.method==='POST'){read=true;return json({id:'n',readAt:'2026-10-11T00:00:00Z'});}const items=!read||path.includes('read=all')?[{id:'n',title:'Scheduling changed',body:'Updated appointment',kind:'rescheduled',createdAt:'2026-10-11T00:00:00Z',readAt:read?'2026-10-11T00:00:00Z':null,interviewId:'i'}]:[];return json({items,total:items.length});};
  const user=userEvent.setup({document});location.hash='/inbox';render(React.createElement(Inbox));await user.click(await screen.findByRole('button',{name:'Mark as read'}));await screen.findByText('No messages in this view.');equal(location.hash,'#/inbox');ok(calls.includes('/api/inbox/n/read'));await user.selectOptions(screen.getByLabelText('Messages'),'all');await screen.findByText('Scheduling changed');equal(screen.queryByRole('button',{name:'Mark as read'}),null);ok(screen.getByText('Open interview'));
});
test('application table distinguishes original extraction errors, reviewed status and HR corrections',async()=>{
  globalThis.fetch=async()=>json({items:[{id:'a',vacancyId:'v',candidate:{name:'Candidate',email:'candidate@example.test'},vacancyTitle:'Backend',submittedAt:'2026-10-11T00:00:00Z',stage:'preselected',processingState:'completed_with_errors',review:{required:true,status:'completed',hasCorrections:true}}],total:1,reviewRequired:true});
  render(React.createElement(ApplicationList,{staff:true}));await screen.findByText('candidate@example.test');ok(screen.getByText('Original extraction errors',{selector:'.badge'}));ok(screen.getByText('Reviewed'));ok(screen.getByText('HR corrections saved'));ok(screen.getByText('preselected'));equal(screen.getByText('Selection & interviews').getAttribute('href'),'#/applications/a/interviews');equal(screen.getByText('Backend').getAttribute('href'),'#/vacancies/v');
});
test('interview detail offers HR related-entity links without granting them to interviewer',async()=>{
  globalThis.fetch=async()=>json({actions:{reschedule:unavailable,cancel:unavailable,requestRescheduling:unavailable,submitFeedback:unavailable,readApplication:unavailable},id:'i',applicationId:'a',vacancyId:'v',stepName:'HR',candidate:{name:'Candidate'},vacancyTitle:'Backend',owner:{name:'Owner',email:'owner@example.test'},interviewer:{id:'engineer',name:'Engineer',email:'engineer@example.test'},status:'cancelled',startsAt:'2026-10-12T09:00:00Z',meeting:'Room',durationMinutes:30,cancellationCause:{type:'hr_cancelled',reason:'Changed plans'},canAssess:false,canSchedule:false});
  render(React.createElement(InterviewPage,{id:'i',actor:{id:'hr',role:'recruiter'}}));await screen.findByText('Changed plans');equal(screen.getByText('Application & CV').getAttribute('href'),'#/applications/a');equal(screen.getByText('Interview plan & results').getAttribute('href'),'#/vacancies/v/interviews');cleanup();render(React.createElement(InterviewPage,{id:'i',actor:{id:'engineer',role:'interviewer'}}));await screen.findByText('Changed plans');equal(screen.queryByText('Application & CV'),null);equal(screen.queryByText('Selection & interviews'),null);
});
test('status chips are separate from heading actions and staff inbox is available in topbar',async()=>{
  globalThis.fetch=async path=>path==='/api/me'?json({user:{id:'hr',role:'recruiter',email:'hr@example.test',name:'Recruiter'}}):json({items:[],total:0});
  render(React.createElement(App));await screen.findByText('Recruiter');ok(document.querySelector('.topbar a[aria-label="Open inbox"]'));equal(document.querySelector('.topbar>.actions>.badge'),null);cleanup();
  const {Heading,Badge}=await import('../src/ui.tsx');render(React.createElement(Heading,{title:'Vacancy',status:React.createElement(Badge,null,'published')},React.createElement('button',null,'Edit')));equal(document.querySelector('.page-heading>.actions .badge'),null);ok(document.querySelector('.page-heading .status-row .badge'));
});
