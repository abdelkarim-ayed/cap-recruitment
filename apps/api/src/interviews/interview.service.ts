import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { DatabaseService } from '../database/database.service.js';
import type { AuthenticatedRequest } from '../auth/access.js';
import type { InterviewCause } from './interview-cause.js';
import { staffInterviewNotifications, type StaffInterviewNotificationEvent } from './interview-notification.policy.js';

type Actor = AuthenticatedRequest['actor'];
export type { InterviewCause } from './interview-cause.js';
const revision = z.number().int().positive();
const scheduleFields = {
  interviewerId: z.string().min(1).max(200), startsAt: z.iso.datetime({ offset: true }),
  durationMinutes: z.union([z.literal(30),z.literal(60),z.literal(90),z.literal(120)]),
  timezone: z.string().min(1).max(100), meeting: z.string().trim().min(1).max(1000),
};
const pipelineSchema = z.strictObject({ expectedRevision: revision, steps: z.array(z.strictObject({ name:z.string().trim().min(1).max(100), instructions:z.string().trim().max(4000).default('') })).max(10) });
const createSchema = z.strictObject({ stepId:z.uuid(), expectedRevision:revision, ...scheduleFields });
const editSchema = z.strictObject({ expectedRevision:revision, ...scheduleFields });
const feedbackSchema = z.strictObject({ expectedRevision:revision, notes:z.string().trim().min(1).max(10000), score:z.number().int().min(0).max(10).nullable().default(null), outcome:z.enum(['pass','fail']) });
const reasonSchema = z.strictObject({ expectedRevision:revision, reason:z.string().trim().min(1).max(2000) });
const stageSchema = z.strictObject({ expectedRevision:revision, stage:z.enum(['preselected','not_selected','offer','hired']), reason:z.string().trim().min(1).max(2000).optional() });
const listSchema = z.strictObject({ from:z.iso.datetime({offset:true}), to:z.iso.datetime({offset:true}), view:z.enum(['agenda','feedback','cancelled']).default('agenda'), limit:z.coerce.number().int().min(1).max(100).default(50), offset:z.coerce.number().int().min(0).max(100000).default(0) });
const pageSchema = z.strictObject({ limit:z.coerce.number().int().min(1).max(100).default(20), offset:z.coerce.number().int().min(0).max(100000).default(0), read:z.enum(['unread','all']).default('unread') });
function parse<T>(schema:z.ZodType<T>, raw:unknown):T { const result=schema.safeParse(raw);if(!result.success)throw new BadRequestException('Invalid interview request.');return result.data; }
function staff(actor:Actor) { if(!['admin','recruiter'].includes(actor.role))throw new ForbiddenException('Recruiter access required.'); }
function sameRevision(actual:number, expected:number) { if(actual!==expected)throw new ConflictException('Record changed; refresh before retrying.'); }
const person = (id:string,name:string,email:string) => ({id,name,email});

@Injectable()
export class InterviewService {
  constructor(private readonly database:DatabaseService) {}
  private async vacancy(client:PoolClient,id:string,lock='FOR SHARE') {
    const result=await client.query(`SELECT v.*,u.name AS owner_name,u.email AS owner_email FROM vacancies v JOIN "user" u ON u.id=v.owner_id WHERE v.id=$1 ${lock} OF v`,[id]);
    if(!result.rows[0])throw new NotFoundException('Vacancy not found.');return result.rows[0];
  }
  private async lockApplication(client:PoolClient,id:string) {
    const ref=await client.query('SELECT vacancy_id FROM applications WHERE id=$1',[id]);
    if(!ref.rows[0])throw new NotFoundException('Application not found.');
    const vacancy=await this.vacancy(client,ref.rows[0].vacancy_id);
    const row=(await client.query('SELECT * FROM applications WHERE id=$1 FOR UPDATE',[id])).rows[0];
    return {row,vacancy};
  }
  private async lockInterview(client:PoolClient,id:string,actor:Actor,hr=false) {
    const ref=(await client.query('SELECT application_id,interviewer_id FROM interviews WHERE id=$1',[id])).rows[0];
    if(!ref||(!['admin','recruiter'].includes(actor.role)&&ref.interviewer_id!==actor.id))throw new NotFoundException('Interview not found.');
    if(hr)staff(actor);
    const context=await this.lockApplication(client,ref.application_id);
    const interview=(await client.query('SELECT i.*,s.name AS step_name FROM interviews i JOIN interview_steps s ON s.id=i.step_id WHERE i.id=$1 FOR UPDATE OF i',[id])).rows[0];
    if(!hr&&interview.interviewer_id!==actor.id&&!['admin','recruiter'].includes(actor.role))throw new NotFoundException('Interview not found.');
    return {...context,interview};
  }
  private active(row:any) { if(!['preselected','interview'].includes(row.stage))throw new ConflictException('Application is not available for interviews.'); }
  private scheduled(row:any) { if(row.status!=='scheduled')throw new ConflictException('Only scheduled interviews can be changed. Completed and cancelled interviews are final.'); }
  private async validateSlot(client:PoolClient,value:z.infer<typeof editSchema>|z.infer<typeof createSchema>,except?:string) {
    const date=new Date(value.startsAt);
    let local:string;
    try { local=new Intl.DateTimeFormat('en-GB',{timeZone:value.timezone,hour:'2-digit',minute:'2-digit'}).formatToParts(date).find(part=>part.type==='minute')!.value; }
    catch { throw new BadRequestException('Unknown timezone.'); }
    if(!['00','30'].includes(local)||date.getUTCSeconds()!==0||date.getUTCMilliseconds()!==0)throw new BadRequestException('Choose a half-hour start time.');
    if(date.getTime()<=Date.now())throw new BadRequestException('Choose a future interview time.');
    // Serialize appointments for this interviewer across applications/API instances.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[`interviewer:${value.interviewerId}`]);
    const user=(await client.query('SELECT role FROM "user" WHERE id=$1',[value.interviewerId])).rows[0];
    if(!user||!['interviewer','recruiter','admin'].includes(user.role))throw new BadRequestException('Select an existing staff interviewer.');
    const clash=await client.query(`SELECT id FROM interviews WHERE interviewer_id=$1 AND status='scheduled' AND ($4::uuid IS NULL OR id<>$4)
      AND starts_at<$2::timestamptz+make_interval(mins=>$3::integer) AND starts_at+make_interval(mins=>duration_minutes)>$2::timestamptz`,[value.interviewerId,value.startsAt,value.durationMinutes,except??null]);
    if(clash.rows.length)throw new ConflictException('The interviewer already has an overlapping appointment.');
  }
  private async notify(client:PoolClient,event:StaffInterviewNotificationEvent) {
    for(const notification of staffInterviewNotifications(event))await client.query('INSERT INTO inbox_notifications(id,recipient_id,interview_id,kind,title,body,cause) VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),notification.recipientId,notification.interviewId,notification.kind,notification.title,notification.body,JSON.stringify(notification.cause)]);
  }
  private async cancelRemaining(client:PoolClient,applicationId:string,cause:Extract<InterviewCause,{type:'interview_failed'}>|Extract<InterviewCause,{type:'hr_ended_application'}>) {
    const changed=await client.query(`UPDATE interviews SET status='cancelled',cancellation_cause=$2,change_cause=$2,updated_by=$3,updated_at=now(),revision=revision+1,scheduling_issue=NULL,issue_at=NULL WHERE application_id=$1 AND status='scheduled' RETURNING id,interviewer_id`,[applicationId,JSON.stringify(cause),cause.actorId]);
    for(const row of changed.rows) {
      const assignment={interviewId:row.id,interviewerId:row.interviewer_id};
      if(cause.type==='interview_failed')await this.notify(client,{type:'interview_failed',cause,...assignment});
      else await this.notify(client,{type:'hr_ended_application',cause,...assignment});
    }
  }
  async pipeline(id:string,actor:Actor) {
    staff(actor);return this.database.transaction(async client=>{
      const v=await this.vacancy(client,id);const steps=(await client.query('SELECT id,name,instructions,position FROM interview_steps WHERE vacancy_id=$1 ORDER BY position',[id])).rows;
      const exists=(await client.query('SELECT EXISTS(SELECT 1 FROM interviews WHERE vacancy_id=$1) AS frozen',[id])).rows[0].frozen;
      return {vacancyId:id,revision:v.interview_revision,owner:person(v.owner_id,v.owner_name,v.owner_email),editable:v.owner_id===actor.id&&!exists,frozen:exists,steps};
    });
  }
  async savePipeline(id:string,actor:Actor,raw:unknown) {
    staff(actor);const value=parse(pipelineSchema,raw);
    await this.database.transaction(async client=>{
      const v=await this.vacancy(client,id,'FOR UPDATE');if(v.owner_id!==actor.id)throw new ForbiddenException('Only the vacancy owner can edit interview steps.');
      sameRevision(v.interview_revision,value.expectedRevision);
      if((await client.query('SELECT id FROM interviews WHERE vacancy_id=$1 LIMIT 1',[id])).rows.length)throw new ConflictException('Interview steps are frozen once scheduling starts.');
      await client.query('DELETE FROM interview_steps WHERE vacancy_id=$1',[id]);
      for(const [index,step] of value.steps.entries())await client.query('INSERT INTO interview_steps(id,vacancy_id,position,name,instructions) VALUES($1,$2,$3,$4,$5)',[randomUUID(),id,index,step.name,step.instructions]);
      await client.query('UPDATE vacancies SET interview_revision=interview_revision+1 WHERE id=$1',[id]);
    });return this.pipeline(id,actor);
  }
  async staffDirectory(actor:Actor) { staff(actor);return {items:(await this.database.query('SELECT id,name,email FROM "user" WHERE role IN (\'interviewer\',\'admin\',\'recruiter\') ORDER BY name,id LIMIT 200')).rows}; }
  private projection(row:any) {
    return {id:row.id,applicationId:row.application_id,vacancyId:row.vacancy_id,stepId:row.step_id,stepName:row.step_name,instructions:row.instructions,
      vacancyTitle:row.title,candidate:row.candidate_identity,applicationStage:row.stage,revision:row.revision,status:row.status,startsAt:row.starts_at,durationMinutes:row.duration_minutes,timezone:row.timezone,meeting:row.meeting,
      interviewer:person(row.interviewer_id,row.interviewer_name,row.interviewer_email),owner:person(row.owner_id,row.owner_name,row.owner_email),
      notes:row.notes,score:row.score,outcome:row.outcome,submittedAt:row.submitted_at,cancellationCause:row.cancellation_cause,changeCause:row.change_cause,schedulingIssue:row.scheduling_issue,issueAt:row.issue_at,updatedAt:row.updated_at};
  }
  private select=`SELECT i.*,s.name AS step_name,s.instructions,a.candidate_identity,a.stage,v.title,v.owner_id,o.name AS owner_name,o.email AS owner_email,u.name AS interviewer_name,u.email AS interviewer_email
    FROM interviews i JOIN interview_steps s ON s.id=i.step_id JOIN applications a ON a.id=i.application_id JOIN vacancies v ON v.id=i.vacancy_id JOIN "user" o ON o.id=v.owner_id JOIN "user" u ON u.id=i.interviewer_id`;
  async get(id:string,actor:Actor) {
    const row=(await this.database.query(`${this.select} WHERE i.id=$1 AND ($2::boolean OR i.interviewer_id=$3)`,[id,['admin','recruiter'].includes(actor.role),actor.id])).rows[0];
    if(!row)throw new NotFoundException('Interview not found.');return {...this.projection(row),canAssess:row.interviewer_id===actor.id&&row.status==='scheduled'&&row.stage==='interview',canSchedule:['admin','recruiter'].includes(actor.role)&&row.status==='scheduled'&&row.stage==='interview'};
  }
  async application(id:string,actor:Actor) {
    staff(actor);return this.database.transaction(async client=>{
      const ref=(await client.query('SELECT * FROM applications WHERE id=$1',[id])).rows[0];if(!ref)throw new NotFoundException('Application not found.');
      const v=await this.vacancy(client,ref.vacancy_id);
      return {applicationId:id,stage:ref.stage,revision:ref.flow_revision,owner:person(v.owner_id,v.owner_name,v.owner_email),isOwner:actor.id===v.owner_id,
        steps:(await client.query('SELECT id,name,position,instructions FROM interview_steps WHERE vacancy_id=$1 ORDER BY position',[ref.vacancy_id])).rows,
        interviews:(await client.query(`${this.select} WHERE i.application_id=$1 ORDER BY s.position`,[id])).rows.map(row=>this.projection(row))};
    });
  }
  async create(id:string,actor:Actor,raw:unknown) {
    staff(actor);const value=parse(createSchema,raw);const interviewId=randomUUID();
    await this.database.transaction(async client=>{
      const {row,vacancy}=await this.lockApplication(client,id);this.active(row);sameRevision(row.flow_revision,value.expectedRevision);
      const step=(await client.query('SELECT * FROM interview_steps WHERE id=$1 AND vacancy_id=$2',[value.stepId,row.vacancy_id])).rows[0];if(!step)throw new BadRequestException('Step does not belong to this vacancy.');
      if((await client.query('SELECT id FROM interviews WHERE application_id=$1 AND step_id=$2',[id,value.stepId])).rows.length)throw new ConflictException('This application already has an interview for that step.');
      await this.validateSlot(client,value);
      const cause:InterviewCause={type:'hr_scheduled',actorId:actor.id};
      await client.query(`INSERT INTO interviews(id,vacancy_id,application_id,step_id,interviewer_id,created_by,updated_by,starts_at,duration_minutes,timezone,meeting,change_cause) VALUES($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,$10,$11)`,[interviewId,row.vacancy_id,id,value.stepId,value.interviewerId,actor.id,value.startsAt,value.durationMinutes,value.timezone,value.meeting,JSON.stringify(cause)]);
      await client.query("UPDATE applications SET stage='interview',flow_revision=flow_revision+1 WHERE id=$1",[id]);
      await this.notify(client,{type:cause.type,cause,interviewId,interviewerId:value.interviewerId,interviewName:step.name,vacancyTitle:vacancy.title});
    });return this.get(interviewId,actor);
  }
  async reschedule(id:string,actor:Actor,raw:unknown) {
    const value=parse(editSchema,raw);
    await this.database.transaction(async client=>{
      const {row,interview:i}=await this.lockInterview(client,id,actor,true);this.active(row);this.scheduled(i);sameRevision(i.revision,value.expectedRevision);
      await this.validateSlot(client,value,id);const cause:InterviewCause={type:'hr_rescheduled',actorId:actor.id};
      await client.query(`UPDATE interviews SET interviewer_id=$2,starts_at=$3,duration_minutes=$4,timezone=$5,meeting=$6,change_cause=$7,updated_by=$8,updated_at=now(),revision=revision+1,scheduling_issue=NULL,issue_at=NULL WHERE id=$1`,[id,value.interviewerId,value.startsAt,value.durationMinutes,value.timezone,value.meeting,JSON.stringify(cause),actor.id]);
      await this.notify(client,{type:cause.type,cause,interviewId:id,previousInterviewerId:i.interviewer_id,interviewerId:value.interviewerId});
    });return this.get(id,actor);
  }
  async cancel(id:string,actor:Actor,raw:unknown) {
    const value=parse(reasonSchema,raw);
    await this.database.transaction(async client=>{
      const {row,interview:i}=await this.lockInterview(client,id,actor,true);this.active(row);this.scheduled(i);sameRevision(i.revision,value.expectedRevision);
      const cause:InterviewCause={type:'hr_cancelled',actorId:actor.id,reason:value.reason};
      await client.query(`UPDATE interviews SET status='cancelled',cancellation_cause=$2,change_cause=$2,updated_by=$3,updated_at=now(),revision=revision+1,scheduling_issue=NULL,issue_at=NULL WHERE id=$1`,[id,JSON.stringify(cause),actor.id]);
      await this.notify(client,{type:cause.type,cause,interviewId:id,interviewerId:i.interviewer_id});
    });return this.get(id,actor);
  }
  async issue(id:string,actor:Actor,raw:unknown) {
    const value=parse(reasonSchema,raw);
    await this.database.transaction(async client=>{
      const {row,vacancy,interview:i}=await this.lockInterview(client,id,actor);if(i.interviewer_id!==actor.id)throw new ForbiddenException('Only the assigned interviewer can request rescheduling.');
      this.active(row);this.scheduled(i);sameRevision(i.revision,value.expectedRevision);
      const cause:InterviewCause={type:'reschedule_requested',actorId:actor.id};
      await client.query('UPDATE interviews SET scheduling_issue=$2,issue_at=now(),updated_by=$3,updated_at=now(),revision=revision+1,change_cause=$4 WHERE id=$1',[id,value.reason,actor.id,JSON.stringify(cause)]);
      await this.notify(client,{type:cause.type,cause,interviewId:id,createdBy:i.created_by,ownerId:vacancy.owner_id,reason:value.reason});
    });return this.get(id,actor);
  }
  async feedback(id:string,actor:Actor,raw:unknown) {
    const value=parse(feedbackSchema,raw);
    await this.database.transaction(async client=>{
      const {row,vacancy,interview:i}=await this.lockInterview(client,id,actor);if(i.interviewer_id!==actor.id)throw new ForbiddenException('Only the assigned interviewer can submit feedback.');
      this.active(row);this.scheduled(i);sameRevision(i.revision,value.expectedRevision);
      if(new Date(i.starts_at).getTime()>Date.now())throw new ConflictException('Feedback can be submitted once the interview starts.');
      const cause:InterviewCause={type:'feedback_submitted',actorId:actor.id};
      await client.query(`UPDATE interviews SET status='completed',notes=$2,score=$3,outcome=$4,submitted_at=now(),updated_at=now(),updated_by=$5,revision=revision+1,scheduling_issue=NULL,issue_at=NULL,change_cause=$6 WHERE id=$1`,[id,value.notes,value.score,value.outcome,actor.id,JSON.stringify(cause)]);
      await this.notify(client,{type:cause.type,cause,interviewId:id,createdBy:i.created_by,ownerId:vacancy.owner_id,interviewName:i.step_name,outcome:value.outcome});
      if(value.outcome==='fail'){
        await client.query("UPDATE applications SET stage='not_selected',flow_revision=flow_revision+1 WHERE id=$1",[row.id]);
        await this.cancelRemaining(client,row.id,{type:'interview_failed',actorId:actor.id,interviewId:id,stepName:i.step_name});
      } else await client.query('UPDATE applications SET flow_revision=flow_revision+1 WHERE id=$1',[row.id]);
    });return this.get(id,actor);
  }
  async stage(id:string,actor:Actor,raw:unknown) {
    staff(actor);const value=parse(stageSchema,raw);
    await this.database.transaction(async client=>{
      const {row,vacancy}=await this.lockApplication(client,id);sameRevision(row.flow_revision,value.expectedRevision);
      if(['hired','not_selected'].includes(row.stage))throw new ConflictException('This application is final. Reopening is not supported.');
      if(value.stage==='preselected') { if(!['received','review_ready'].includes(row.stage))throw new ConflictException('Application is already selected.'); }
      else if(value.stage==='not_selected') {
        if(!value.reason)throw new BadRequestException('Provide a reason.');
        if(!['received','review_ready','preselected'].includes(row.stage)&&actor.id!==vacancy.owner_id)throw new ForbiddenException('Only the owner can end an application after interviews start.');
        await this.cancelRemaining(client,id,{type:'hr_ended_application',actorId:actor.id,reason:value.reason});
      } else {
        if(actor.id!==vacancy.owner_id)throw new ForbiddenException('Only the owner can record offer/hired.');
        if(value.stage==='hired'&&row.stage!=='offer')throw new ConflictException('Record an offer before hiring.');
        if(value.stage==='offer') {
          if(row.stage!=='interview')throw new ConflictException('Complete the interview pipeline before an offer.');
          const check=(await client.query(`SELECT count(*)::integer AS total,count(*) FILTER(WHERE i.status='completed' AND i.outcome='pass')::integer AS passed FROM interview_steps s LEFT JOIN interviews i ON i.step_id=s.id AND i.application_id=$1 WHERE s.vacancy_id=$2`,[id,row.vacancy_id])).rows[0];
          if(!check.total||check.passed!==check.total)throw new ConflictException('Every interview step must pass before an offer.');
        }
      }
      await client.query('UPDATE applications SET stage=$2,flow_revision=flow_revision+1 WHERE id=$1',[id,value.stage]);
      if(value.stage!=='not_selected')await this.notify(client,{type:'stage_changed',stage:value.stage});
    });return this.application(id,actor);
  }
  async agenda(actor:Actor,raw:unknown) {
    const query=parse(listSchema,raw);const from=new Date(query.from),to=new Date(query.to);
    if(to<=from||to.getTime()-from.getTime()>93*86400000)throw new BadRequestException('Choose a range of at most 93 days.');
    const condition=query.view==='feedback'?"i.status='scheduled' AND i.starts_at<=now()":query.view==='cancelled'?"i.status='cancelled'":"i.status<>'cancelled'";
    const args=[['admin','recruiter'].includes(actor.role),actor.id,query.from,query.to];
    const where=`WHERE ($1::boolean OR i.interviewer_id=$2) AND i.starts_at>=$3 AND i.starts_at<$4 AND ${condition}`;
    const total=(await this.database.query(`SELECT count(*)::integer AS total FROM interviews i ${where}`,args)).rows[0].total;
    const items=(await this.database.query(`${this.select} ${where} ORDER BY i.starts_at,i.id LIMIT $5 OFFSET $6`,[...args,query.limit,query.offset])).rows.map(row=>this.projection(row));
    return {items,total,limit:query.limit,offset:query.offset};
  }
  async results(id:string,actor:Actor,raw:unknown) {
    staff(actor);const q=parse(pageSchema.omit({read:true}),raw);const pipeline=await this.pipeline(id,actor);
    const total=(await this.database.query('SELECT count(*)::integer AS total FROM applications WHERE vacancy_id=$1',[id])).rows[0].total;
    const items=(await this.database.query(`SELECT id,candidate_identity AS candidate,stage FROM applications WHERE vacancy_id=$1 ORDER BY submitted_at DESC,id LIMIT $2 OFFSET $3`,[id,q.limit,q.offset])).rows;
    const interviews=items.length?(await this.database.query(`${this.select} WHERE i.application_id=ANY($1::uuid[]) ORDER BY s.position`,[items.map(row=>row.id)])).rows:[];
    return {...pipeline,items:items.map(row=>({...row,interviews:interviews.filter(i=>i.application_id===row.id).map(i=>this.projection(i))})),total,limit:q.limit,offset:q.offset};
  }
  async inbox(actor:Actor,raw:unknown) {
    const q=parse(pageSchema,raw);
    const where=`WHERE recipient_id=$1 AND ($2='all' OR read_at IS NULL)`;
    const total=(await this.database.query(`SELECT count(*)::integer AS total FROM inbox_notifications ${where}`,[actor.id,q.read])).rows[0].total;
    const items=(await this.database.query(`SELECT n.id,n.kind,n.title,n.body,n.cause,n.created_at AS "createdAt",n.read_at AS "readAt",
      CASE WHEN $5::boolean OR i.interviewer_id=$1 THEN i.id ELSE NULL END AS "interviewId" FROM inbox_notifications n JOIN interviews i ON i.id=n.interview_id WHERE n.recipient_id=$1 AND ($2='all' OR n.read_at IS NULL) ORDER BY n.created_at DESC,n.id LIMIT $3 OFFSET $4`,[actor.id,q.read,q.limit,q.offset,['admin','recruiter'].includes(actor.role)])).rows;
    return {items,total,limit:q.limit,offset:q.offset};
  }
  async markRead(id:string,actor:Actor) {
    const row=(await this.database.query('UPDATE inbox_notifications SET read_at=coalesce(read_at,now()) WHERE id=$1 AND recipient_id=$2 RETURNING id,read_at AS "readAt"',[id,actor.id])).rows[0];
    if(!row)throw new NotFoundException('Notification not found.');return row;
  }
}
