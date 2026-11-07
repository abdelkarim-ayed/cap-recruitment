import { createHash } from 'node:crypto';
import { createVacancySchema, type Vacancy } from '@recruitment/domain/vacancies';
import type { Role } from '../auth/access.js';

export const lifecycleNamespace = 'recruitment-lifecycle-v1';
export function lifecycleId(key: string) {
  const hex = createHash('sha256').update(`${lifecycleNamespace}:${key}`).digest('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20,32)}`;
}
export function lifecycleSafety(env: NodeJS.ProcessEnv) {
  if (!['development','test'].includes(env.NODE_ENV ?? '')) throw new Error('Lifecycle fixtures require NODE_ENV=development (or test).');
  if ((env.PROCESSING_EXECUTOR ?? 'disabled') !== 'disabled' || (env.PROCESSING_READER ?? 'disabled') !== 'disabled') {
    throw new Error('Lifecycle fixtures require disabled processing reader/executor; no live fallback.');
  }
}
export function lifecycleMode(args: string[]) {
  if (args.length !== 1 || !['plan','seed','reset'].includes(args[0])) throw new Error('Usage: demo:lifecycle plan|seed|reset');
  return args[0] as 'plan'|'seed'|'reset';
}
type JobKey = 'draft'|'review'|'interviews'|'no-tasks'|'closed';
type Processing = 'pending'|'success'|'empty'|'ordinary'|'operational'|'uncertain'|'released'|'corrected'|'reviewed'|'none';
type Journey = 'received'|'preselected'|'rejected'|'upcoming'|'feedback-due'|'reschedule'|'cancelled'|'partial-pass'|'all-passed'|'interview-failed'|'offer'|'hired';
export interface LifecycleScenario { key: string; job: JobKey; processing: Processing; journey: Journey; purpose: string }
export const lifecycleScenarios: readonly LifecycleScenario[] = [
  {key:'pending',job:'review',processing:'pending',journey:'received',purpose:'Pending extraction; screening and manual release remain available.'},
  {key:'ready',job:'review',processing:'success',journey:'received',purpose:'Ready for shared HR review; original fixture skills.'},
  {key:'empty',job:'review',processing:'empty',journey:'received',purpose:'Successful empty skills differs from unavailable evidence.'},
  {key:'ordinary-failure',job:'review',processing:'ordinary',journey:'received',purpose:'Ordinary terminal failure permits partial/unknown review.'},
  {key:'operational-block',job:'review',processing:'operational',journey:'received',purpose:'Operational failure blocks review until explicit release.'},
  {key:'uncertain-block',job:'review',processing:'uncertain',journey:'received',purpose:'Synthetic uncertain failure; not a paid attempt or recovery test.'},
  {key:'released',job:'review',processing:'released',journey:'received',purpose:'Manually released pending evidence, unfinished review.'},
  {key:'corrected',job:'review',processing:'corrected',journey:'received',purpose:'Original machine fixture and separate HR correction/unknown skill.'},
  {key:'reviewed',job:'review',processing:'reviewed',journey:'received',purpose:'Completed review locks corrections but does not decide screening.'},
  {key:'screened-pending',job:'review',processing:'pending',journey:'preselected',purpose:'Screening freezes unfinished review; empty plan permits explicit owner Offer.'},
  {key:'screening-rejected',job:'review',processing:'success',journey:'rejected',purpose:'Screening rejection and candidate notice; evidence remains read-only.'},
  {key:'no-task-received',job:'no-tasks',processing:'none',journey:'received',purpose:'No human review required or attributed.'},
  {key:'zero-plan-offer',job:'no-tasks',processing:'none',journey:'offer',purpose:'Explicit empty-plan Offer, not Hired.'},
  {key:'zero-plan-hired',job:'no-tasks',processing:'none',journey:'hired',purpose:'Separate Hired after explicit empty-plan Offer.'},
  {key:'preselected',job:'interviews',processing:'reviewed',journey:'preselected',purpose:'Two-interview plan; not yet scheduled.'},
  {key:'upcoming',job:'interviews',processing:'success',journey:'upcoming',purpose:'Future appointment; feedback time gate.'},
  {key:'feedback-due',job:'interviews',processing:'success',journey:'feedback-due',purpose:'Past scheduled interview ready for assignee feedback.'},
  {key:'reschedule',job:'interviews',processing:'success',journey:'reschedule',purpose:'Assignee rescheduling request with staff notifications.'},
  {key:'cancelled',job:'interviews',processing:'success',journey:'cancelled',purpose:'Cancelled-only assignment has no candidate-document access.'},
  {key:'partial-pass',job:'interviews',processing:'corrected',journey:'partial-pass',purpose:'First interview passed; second future; Offer unavailable.'},
  {key:'all-passed',job:'interviews',processing:'reviewed',journey:'all-passed',purpose:'All configured interviews passed; owner may explicitly Offer.'},
  {key:'interview-failed',job:'interviews',processing:'reviewed',journey:'interview-failed',purpose:'Final Fail rejects application and cancels remaining appointment.'},
  {key:'interview-offer',job:'interviews',processing:'reviewed',journey:'offer',purpose:'All-passed explicit Offer; Hired remains separate.'},
  {key:'interview-hired',job:'interviews',processing:'reviewed',journey:'hired',purpose:'All-passed then Offer then Hired.'},
  {key:'closed-intake',job:'closed',processing:'none',journey:'preselected',purpose:'Closed intake does not stop owner finalization.'},
];

export function lifecycleCatalog(now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid lifecycle baseline.');
  // UTC half-hour boundary: deterministic relative dates, independent of host DST.
  const baseline = Math.floor(now.getTime() / 1800000) * 1800000;
  const at = (hours: number) => new Date(baseline + hours * 3600000).toISOString();
  const actor = (key: string, name: string, role: Role) => ({key,id:lifecycleId(`actor:${key}`),name,email:`lifecycle.${key}@example.test`,role,createdAt:at(-45*24)});
  const staff = [actor('hr','Alex Lifecycle','recruiter'),actor('hr2','Sam Lifecycle','recruiter'),actor('admin','Morgan Lifecycle','admin'),actor('interviewer','Jamie Lifecycle','interviewer'),actor('interviewer2','Robin Lifecycle','interviewer')];
  const candidates = lifecycleScenarios.map((scenario,index) => actor(scenario.key,`Demo ${String(index+1).padStart(2,'0')} ${scenario.key.replaceAll('-',' ')}`,'candidate'));
  const actors = [...staff,actor('candidate','Taylor Lifecycle Intake','candidate'),...candidates];
  const jobs = (['draft','review','interviews','no-tasks','closed'] as const).map(key => {
    const processing = key === 'review' || key === 'interviews' || key === 'draft';
    const owner = key === 'no-tasks' ? staff[1] : staff[0];
    const definition = createVacancySchema.parse({title:`[DEMO lifecycle] ${key}`,description:`Synthetic lifecycle fixtures (${lifecycleNamespace}). Not extraction-quality or workflow execution evidence.`,location:'Tunis · Hybrid',formDefinition:{version:1,inputs:[
      {id:'name',name:'full_name',label:'Full name',type:'text',required:true,args:{maxLength:200}},
      {id:'motivation',name:'motivation',label:'Motivation',type:'long_text',required:false,args:{maxLength:2000}},
      {id:'cv',name:'cv',label:'Synthetic CV',type:'document',required:true,args:{accept:['.pdf']}},
    ]},processingDefinition:{version:1,tasks:processing?[{id:'skills',sourceInputId:'cv',outputKey:'skills',type:'extractSkills',args:{skills:['SQL','TypeScript','Python'],evidence:false}}]:[]}});
    const status = key === 'draft' ? 'draft' : key === 'closed' ? 'closed' : 'published';
    const vacancy: Vacancy = {...definition,id:lifecycleId(`vacancy:${key}`),ownerId:owner.id,status,revision:status==='draft'?1:status==='closed'?3:2,createdAt:at(-30*24),updatedAt:at(status==='closed'?-24:-29*24)};
    const steps = key === 'interviews' ? ['Technical interview','HR interview'].map((name,position) => ({id:lifecycleId(`step:${key}:${position}`),name,position,instructions:'SYNTHETIC FIXTURE: assess only this demonstration application.'})) : [];
    return {key,owner,vacancy,steps,publishedAt:at(-29*24),interviewRevision:steps.length?2:1};
  });
  const applications = lifecycleScenarios.map((scenario,index) => {
    const job = jobs.find(job => job.key === scenario.job)!;
    const candidate = candidates[index];
    const id = lifecycleId(`application:${scenario.key}`);
    const profile = index % 5;
    const claimedSkills = [['SQL','TypeScript'],['SQL'],['Python','SQL'],[],['TypeScript','Python']][profile];
    // Date-free document text keeps bytes stable across resets; event dates live in metadata.
    const lines = ['SYNTHETIC DEMO CV - NOT A REAL PERSON',candidate.name,'Contact: synthetic@example.test',
      `Profile ${profile+1}: fictional software and operations experience.`,
      'Experience: Cedar Demo Labs (fictional), project contributor.',
      'Work: API maintenance, reporting and documented team handoffs.',
      `Skills claimed in this fictional CV: ${claimedSkills.join(', ') || 'No programming skills claimed'}.`,
      'Education: Example Institute (fictional), applied technology.',
      'Languages: Arabic, French, English (fictional profile).',
      'Fixture outputs are declared independently; no AI evaluation performed.'];
    const screened = scenario.journey !== 'received';
    const rejected = scenario.journey === 'rejected';
    const interviewJourney = ['upcoming','feedback-due','reschedule','cancelled','partial-pass','all-passed','interview-failed'].includes(scenario.journey);
    const stage = rejected || scenario.journey === 'interview-failed' ? 'not_selected' : ['offer','hired'].includes(scenario.journey) ? scenario.journey : interviewJourney ? 'interview' : screened ? 'preselected' : 'received';
    const processingState = scenario.processing==='none'?'not_requested':['pending','released'].includes(scenario.processing)?'pending':['ordinary','operational','uncertain'].includes(scenario.processing)?'completed_with_errors':'completed';
    const reviewStatus = scenario.processing==='none'||scenario.processing==='reviewed'?'completed':scenario.processing==='corrected'?'in_review':'pending';
    return {scenario,job,candidate,id,lines,stage,processingState,reviewStatus,screened,rejected,
      documentId:lifecycleId(`document:${scenario.key}`),fileId:lifecycleId(`file:${scenario.key}`),
      submittedAt:at(-14*24+index),processedAt:at(-12*24+index),reviewedAt:at(-10*24+index),screenedAt:at(-8*24+index),
      // Global unique slots for the shared interviewer; second interview uses another assignee.
      pastStart:at(-72+index),pastSecondStart:at(-48+index),futureStart:at(24+index),futureSecondStart:at(48+index),
    };
  });
  return {namespace:lifecycleNamespace,baseline:new Date(baseline).toISOString(),actors,jobs,applications};
}
export type LifecycleCatalog = ReturnType<typeof lifecycleCatalog>;
