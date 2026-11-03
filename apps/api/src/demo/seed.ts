import 'reflect-metadata';
import { createHash } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { DatabaseService } from '../database/database.service.js';
import { VacancyService } from '../vacancies/vacancy.service.js';
import { ApplicationService } from '../applications/application.service.js';
import { ReviewService } from '../review/review.service.js';
import { projectRoot } from '../configuration/environment.js';
import type { Role } from '../auth/access.js';
import type { CreateVacancy, Vacancy } from '@recruitment/domain/vacancies';
import { demoOnly, processDemo } from './fixtures.js';

demoOnly();
const directory=join(projectRoot,'.local','demo');
const samples:Record<string,Buffer>={};
for(const alias of ['success','failure','pending','empty','candidate']){
  samples[alias]=await readFile(join(directory,'rendercv-pdfs',`${alias}-cv.pdf`)).catch(()=>{throw new Error('Generate RenderCV samples first: python3 scripts/render-demo-cvs.py (see demo-guide.md for isolated setup).');});
  if(samples[alias].subarray(0,5).toString()!=='%PDF-')throw new Error(`Invalid RenderCV PDF for ${alias}.`);
}
const app=await NestFactory.createApplicationContext(AppModule,{logger:false});
const stableId=(alias:string)=>{const h=createHash('sha256').update(`recruitment-demo-v1:${alias}`).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;};
try{
  await mkdir(directory,{recursive:true,mode:0o700});
  const database=app.get(DatabaseService),vacancies=app.get(VacancyService),applications=app.get(ApplicationService);
  const actors:Record<string,{id:string;email:string;name:string;role:Role}>={};
  for(const [alias,name,role] of [['admin','Morgan Admin','admin'],['hr','Alex Recruiter','recruiter'],['hr2','Sam Recruiter','recruiter'],['interviewer','Jamie Interviewer','interviewer'],['candidate','Taylor Candidate','candidate'],['candidate2','Riley Candidate','candidate'],['success','Casey SQL','candidate'],['failure','Jordan Failure','candidate'],['pending','Drew Pending','candidate'],['empty','Avery Empty','candidate']] as const){
    const actor={id:stableId(alias),email:`demo.${alias}@example.test`,name,role};
    const existing=await database.query('SELECT id,role FROM "user" WHERE email=$1 OR id=$2',[actor.email,actor.id]);
    if(existing.rows.some(row=>row.id!==actor.id||row.role!==role))throw new Error(`Demo account collision for ${alias}; not overwriting.`);
    await database.query('INSERT INTO "user"(id,name,email,"emailVerified","createdAt","updatedAt",role) VALUES($1,$2,$3,true,now(),now(),$4) ON CONFLICT(id) DO NOTHING',[actor.id,actor.name,actor.email,actor.role]);
    // Trusted synthetic demo identities only. Never assign staff roles through public signup.
    await database.query('UPDATE "user" SET "emailVerified"=true WHERE id=$1',[actor.id]);
    await database.query('INSERT INTO account(id,"accountId","providerId","userId",password,"createdAt","updatedAt") SELECT $1,$2,\'credential\',$2,$3,now(),now() WHERE NOT EXISTS(SELECT 1 FROM account WHERE "userId"=$2 AND "providerId"=\'credential\')',[stableId(`credential-${alias}`),actor.id,await hashPassword('DemoRecruitment!2026')]);
    actors[alias]=actor;
  }
  const definition:CreateVacancy={title:'[DEMO] Backend developer',description:'Build reliable TypeScript services with our product team.\n\nThis is a synthetic demonstration vacancy. Work with PostgreSQL, API design and automated tests. Applications in this workspace are fixture data.',location:'Tunis · Hybrid',formDefinition:{version:1,inputs:[
    {id:'full_name',name:'full_name',label:'Full name',type:'text',required:true,args:{maxLength:200}},
    {id:'motivation',name:'motivation',label:'What interests you about this role?',type:'long_text',required:false,args:{maxLength:2000}},
    {id:'years',name:'experience_years',label:'Years of relevant experience',type:'number',required:true,args:{min:0,max:40,step:0.5}},
    {id:'available',name:'available',label:'Available to start within a month?',type:'yes_no',required:true,args:{}},
    {id:'location',name:'work_preference',label:'Preferred work arrangement',type:'single_choice',required:true,args:{choices:[{value:'hybrid',label:'Hybrid'},{value:'remote',label:'Remote'}]}},
    {id:'tools',name:'tools',label:'Tools you have used',type:'multiple_choice',required:false,args:{choices:[{value:'sql',label:'SQL'},{value:'typescript',label:'TypeScript'},{value:'python',label:'Python'}]}},
    {id:'documents',type:'separator',label:'Supporting documents',args:{}},
    {id:'cv',name:'cv',label:'Your CV',type:'document',required:true,args:{accept:['.pdf','.docx']}},
    {id:'portfolio',name:'portfolio',label:'Optional portfolio document',type:'document',required:false,args:{}},
  ]},processingDefinition:{version:1,tasks:[{id:'cv_skills',sourceInputId:'cv',outputKey:'extracted_skills',type:'extractSkills',args:{skills:['SQL','TypeScript','Python'],evidence:true}}]}};
  const jobs:Record<string,Vacancy>={};
  for(const alias of ['published','draft']){
    const title=alias==='published'?`${definition.title} — RenderCV`:'[DEMO] Operations coordinator — draft';
    const existing=await database.query('SELECT id FROM vacancies WHERE owner_id=$1 AND title=$2 ORDER BY created_at LIMIT 1',[actors.hr.id,title]);
    let job=existing.rows[0]?await vacancies.get(existing.rows[0].id) as Vacancy:await vacancies.create(actors.hr.id,{...definition,title});
    if(alias==='published'&&job.status==='draft')job=await vacancies.transition(job.id,actors.hr.id,'published',{expectedRevision:job.revision});
    jobs[alias]=job;
  }
  const manifest:any={version:2,accounts:Object.values(actors).map(({email,name,role})=>({email,name,role})),vacancies:Object.fromEntries(Object.entries(jobs).map(([key,value])=>[key,{id:value.id,title:value.title}])),applications:{},sampleFiles:[]};
  for(const alias of ['success','failure','pending','empty','candidate']){
    const actor=actors[alias];
    const bytes=samples[alias];
    const filename=`${alias}-cv.pdf`;await writeFile(join(directory,filename),bytes,{mode:0o600});manifest.sampleFiles.push(`.local/demo/${filename}`);
    if(alias==='candidate')continue;
    const existing=(await database.query('SELECT id FROM applications WHERE candidate_id=$1 AND vacancy_id=$2',[actor.id,jobs.published.id])).rows[0];
    if(existing){manifest.applications[alias]=existing.id;continue;}
    if(jobs.published.status!=='published')throw new Error('Demo published vacancy was closed. Existing data preserved; create another vacancy for new tests.');
    const result=await applications.submit(jobs.published.id,actor,{answers:JSON.stringify({full_name:actor.name,motivation:'Synthetic demonstration application.',years:alias==='empty'?0:3.5,available:alias!=='failure',location:'hybrid',tools:alias==='empty'?[]:['sql','typescript']})},[{fieldname:'cv',originalname:filename,size:bytes.length,buffer:bytes,mimetype:'application/pdf',encoding:'7bit'} as Express.Multer.File]);
    const id=result.application.id;manifest.applications[alias]=id;
    if(alias!=='pending'){
      const fixtures=await processDemo(app,id,alias as 'success'|'failure'|'empty');await writeFile(join(directory,`${alias}-fixtures.json`),JSON.stringify(fixtures,null,2)+'\n',{mode:0o600});
      if(alias==='success'){const review=await app.get(ReviewService).get(id,actors.hr);await app.get(ReviewService).patch(id,actors.hr,{expectedRevision:review.review.revision,status:'completed'});}
    }
  }
  await writeFile(join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
  console.log('Demo seed ready. Existing accounts/submissions preserved; no sessions bypassed.');
  console.log('Accounts: demo.hr@example.test / demo.hr2@example.test / demo.admin@example.test / demo.candidate@example.test / demo.candidate2@example.test / demo.interviewer@example.test');
  console.log('Files and manifest: .local/demo/ (ignored). Open http://localhost:5173');
}finally{await app.close();}
