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
const {makeInput,removeInput,moveInput}=await import('../src/form-model.ts');
const {createVacancySchema}=await import('@recruitment/domain/vacancies');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;window.location.hash='';sessionStorage.clear();});
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
  equal(saved.p.tasks[0].sourceInputId,'cv');deepEqual(saved.p.tasks[0].args.skills,['SQL','TypeScript']);
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
test('real /me envelope chooses HR navigation and vacancy-filtered application route',async()=>{
  window.location.hash='/applications?vacancy=vacancy-one';const calls=[];
  globalThis.fetch=async path=>{calls.push(path);if(path==='/api/me')return json({user:{id:'hr',role:'recruiter',email:'hr@example.test',name:'HR Fixture'}});return json({items:[],total:0,limit:20,offset:0});};
  render(React.createElement(App));await screen.findByText('Export all CSV');
   ok(calls.includes('/api/vacancies/vacancy-one/applications?limit=20&offset=0&sort=newest'));ok(screen.getByText('HR Fixture'));
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
    if(path.endsWith('/review'))return json({review:{status:'pending',revision:4,reviewedBy:null,reviewedAt:null},tasks:[{taskId:'skills',sourceInputId:'cv',outputKey:'skills',status:'failed',attempts:1,result:{status:'failed',value:null,reason:'Fixture failure'},provenance:{mode:'fixture',fixtureId:'fixture-one'},hasCorrection:false,effectiveValue:null}]});
    return json({id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-10T00:00:00Z',stage:'received',processingState:'completed_with_errors',vacancy:{title:'Backend',formDefinition:{version:1,inputs:[{...makeInput('text','name'),label:'Name'}]}},answers:{name:'Locked answer'},documents:[]});
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
  const calls=[];const vacancy={id:'vac',ownerId:'hr',title:'Backend',description:'Services',status:'draft',revision:1,formDefinition:{version:1,inputs:[makeInput('text','name')]},processingDefinition:{version:1,tasks:[]}};
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
  const view=()=>({review:{status:'in_review',revision:hasCorrection?5:4,updatedAt:'2026-10-10T12:00:00Z',editor:{name:'Second Recruiter',email:'second@example.test'}},tasks:[{taskId:'skills',sourceInputId:'cv',outputKey:'skills',status:'completed',attempts:1,result:{status:'completed',value:{skills:['Original skill']},evidence:['Original evidence']},hasCorrection,correction:hasCorrection?{skills:['Saved skill']}:null,effectiveValue:{skills:[hasCorrection?'Saved skill':'Original skill']},correctedAt:'2026-10-10T12:00:00Z',corrector:{name:'Second Recruiter'}}]});
  globalThis.fetch=async(path,init)=>{if(init?.method==='PATCH')hasCorrection=true;if(path.endsWith('/review'))return json(view());return json({id:'app',vacancyId:'vac',candidate:{name:'Candidate',email:'candidate@example.test'},submittedAt:'2026-10-10T00:00:00Z',stage:'received',processingState:'completed',vacancy:{title:'Backend',formDefinition:{inputs:[]}},answers:{},documents:[]});};
  const user=userEvent.setup({document});render(React.createElement(ApplicationPage,{id:'app',staff:true}));const input=await screen.findByLabelText('Skills (comma separated)');await user.clear(input);await user.type(input,'Saved skill');await user.click(screen.getByText('Save correction'));
  await screen.findByText('Saved HR correction');ok(screen.getByLabelText('Latest saved value for skills').textContent.includes('Saved skill'));ok(screen.getByText(/Current saved revision 5/));
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
