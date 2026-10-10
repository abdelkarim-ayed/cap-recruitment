import { equal, ok, notEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { Test } from '@nestjs/testing';
import { AppModule } from '../dist/app.module.js';
import { configureApplication } from '../dist/bootstrap.js';
import { MAIL_SENDER } from '../dist/integrations/mail/mail-sender.js';
import { MemoryMailSender } from '../dist/integrations/mail/memory-mail-sender.js';
import { DatabaseService } from '../dist/database/database.service.js';
import { RUNTIME_CONFIG, readRuntimeConfig } from '../dist/configuration/runtime-config.js';
import { hashPassword } from 'better-auth/crypto';

const mail=new MemoryMailSender(),settings=readRuntimeConfig({...process.env,MAIL_DRIVER:'file'});
const module=await Test.createTestingModule({imports:[AppModule]}).overrideProvider(RUNTIME_CONFIG).useValue(settings).overrideProvider(MAIL_SENDER).useValue(mail).compile();
const app=configureApplication(module.createNestApplication({bodyParser:false,logger:false}));
const database=module.get(DatabaseService);
const marker=randomUUID(),emails=[`password-a-${marker}@example.test`,`password-b-${marker}@example.test`,`password-staff-${marker}@example.test`];
// Independent real socket peer; no header spoofing or disabled rate/security checks.
const peer=`127.64.${parseInt(marker.slice(0,2),16)}.${parseInt(marker.slice(2,4),16)}`;
function fetch(url,init={}){return new Promise((resolve,reject)=>{const req=httpRequest(url,{method:init.method??'GET',headers:init.headers,localAddress:peer},res=>{const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>{const headers=new Headers();for(const [key,value] of Object.entries(res.headers))for(const item of Array.isArray(value)?value:[value])if(item!==undefined)headers.append(key,item);resolve(new Response(Buffer.concat(chunks),{status:res.statusCode,headers}));});});req.on('error',reject);req.end(init.body);});}
const password='SyntheticPassword!2026',newPassword='ChangedSynthetic!2026';let base;
async function post(path,body,cookie){return fetch(`${base}/api/auth/${path}`,{method:'POST',headers:{Origin:settings.webOrigin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});}
function otp(email){const message=mail.messages.findLast(message=>message.to===email);ok(message,'captured verification for exact recipient');return message.text.match(/code is (\d{6})/)[1];}
function cookie(response){return response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');}
try{
  await app.listen(0,'127.0.0.1');base=await app.getUrl();
  for(const email of emails.slice(0,2)){
    const response=await post('sign-up/email',{email,password,name:'Password fixture',role:'admin'});equal(response.status,200);
    equal((await database.query('SELECT role,"emailVerified" FROM "user" WHERE email=$1',[email])).rows[0].role,'candidate');
  }
  const a=otp(emails[0]),b=otp(emails[1]);
  // Independent mailboxes; a code for A must not verify B. If randomly identical, perturb it.
  const wrong=a===b?(b==='000000'?'111111':'000000'):a;
  equal((await post('email-otp/verify-email',{email:emails[1],otp:wrong})).status,400);
  equal((await post('sign-in/email',{email:emails[0],password})).status,403);
  for(const email of emails.slice(0,2))equal((await post('email-otp/verify-email',{email,otp:otp(email)})).status,200);
  const first=await post('sign-in/email',{email:emails[0],password});equal(first.status,200);const firstCookie=cookie(first);ok(firstCookie);
  const second=await post('sign-in/email',{email:emails[1],password});equal(second.status,200);const secondCookie=cookie(second);ok(secondCookie);notEqual(firstCookie,secondCookie);
  for(const [email,session] of [[emails[0],firstCookie],[emails[1],secondCookie]]){
    const response=await fetch(`${base}/api/me`,{headers:{Cookie:session}});equal(response.status,200);const actor=(await response.json()).user;equal(actor.email,email);equal(actor.role,'candidate');
  }
  equal((await post('email-otp/request-password-reset',{email:emails[0]})).status,200);
  equal((await post('email-otp/reset-password',{email:emails[0],otp:otp(emails[0]),password:newPassword})).status,200);
  equal((await fetch(`${base}/api/me`,{headers:{Cookie:firstCookie}})).status,401);
  equal((await post('sign-in/email',{email:emails[0],password})).status,401);
  equal((await post('sign-in/email',{email:emails[0],password:newPassword})).status,200);
  const staffId=randomUUID();
  await database.transaction(async client=>{
    await client.query('INSERT INTO "user"(id,name,email,"emailVerified","createdAt","updatedAt",role) VALUES($1,$2,$3,true,now(),now(),\'recruiter\')',[staffId,'Trusted staff fixture',emails[2]]);
    await client.query('INSERT INTO account(id,"accountId","providerId","userId",password,"createdAt","updatedAt") VALUES($1,$2,\'credential\',$2,$3,now(),now())',[randomUUID(),staffId,await hashPassword(password)]);
  });
  const staff=await post('sign-in/email',{email:emails[2],password});equal(staff.status,200);
  equal((await (await fetch(`${base}/api/me`,{headers:{Cookie:cookie(staff)}})).json()).user.role,'recruiter');
  // Public signup neither replaces a staff password nor promotes/demotes a role.
  equal((await post('sign-up/email',{email:emails[2],password:newPassword,name:'Overwrite attempt',role:'admin'})).status,200);
  equal((await database.query('SELECT role FROM "user" WHERE id=$1',[staffId])).rows[0].role,'recruiter');
  equal((await post('sign-in/email',{email:emails[2],password})).status,200);
  console.log('PASS: real password signup/verification, mailbox isolation, two distinct sessions, default candidate role, trusted staff credentials, reset/session revocation and duplicate signup protection.');
}finally{
  await database.query('DELETE FROM session WHERE "userId" IN(SELECT id FROM "user" WHERE email=ANY($1::text[]))',[emails]);
  await database.query('DELETE FROM account WHERE "userId" IN(SELECT id FROM "user" WHERE email=ANY($1::text[]))',[emails]);
  await database.query('DELETE FROM "user" WHERE email=ANY($1::text[])',[emails]);
  await database.query('DELETE FROM verification WHERE identifier LIKE $1',[`%${marker}%`]);
  await app.close();
}
