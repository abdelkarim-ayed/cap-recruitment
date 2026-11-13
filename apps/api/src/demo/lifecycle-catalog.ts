import { createHash } from 'node:crypto';
import { createVacancySchema, type Vacancy } from '@recruitment/domain/vacancies';
import type { Role } from '../auth/access.js';
import { demoCvQuestions } from './cv-fixture.js';
import { offlineProfiles } from './offline-profiles.js';

export const lifecycleNamespace = 'recruitment-lifecycle-v1';
export function lifecycleId(key: string) {
  const hex = createHash('sha256').update(`${lifecycleNamespace}:${key}`).digest('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20,32)}`;
}
export function lifecycleSafety(env: NodeJS.ProcessEnv) {
  if (!['development','test'].includes(env.NODE_ENV ?? '')) throw new Error('Lifecycle fixtures require NODE_ENV=development (or test).');
  if ((env.PROCESSING_EXECUTOR ?? 'disabled') !== 'disabled' || (env.PROCESSING_READER ?? 'disabled') !== 'disabled' || (env.PROCESSING_RUNNER??'disabled') !== 'disabled') {
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
  {key:'ready',job:'review',processing:'success',journey:'received',purpose:'Ready for shared HR review; declared five-family CV fixture.'},
  {key:'empty',job:'review',processing:'empty',journey:'received',purpose:'Nursing CV: zero programming coverage/non-mention, but an evidenced degree; not unavailable extraction.'},
  {key:'ordinary-failure',job:'review',processing:'ordinary',journey:'received',purpose:'Ordinary terminal failure permits partial/unknown review.'},
  {key:'operational-block',job:'review',processing:'operational',journey:'received',purpose:'Operational failure blocks review until explicit release.'},
  {key:'uncertain-block',job:'review',processing:'uncertain',journey:'received',purpose:'Synthetic uncertain failure; not a paid attempt or recovery test.'},
  {key:'released',job:'review',processing:'released',journey:'received',purpose:'Manually released pending evidence, unfinished review.'},
  {key:'corrected',job:'review',processing:'corrected',journey:'received',purpose:'Original machine fixture and independent HR category/unknown count corrections.'},
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
  const actor = (key: string, name: string, role: Role) => ({key,id:lifecycleId(`actor:${key}`),name,email:`${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]+/g,'.')}@example.test`,role,createdAt:at(-45*24)});
  const slug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]+/g,'.') || 'candidate';
  const staff = [actor('hr','Alex Martin','recruiter'),actor('hr2','Sam Bernard','recruiter'),actor('admin','Morgan Dubois','admin'),actor('interviewer','Jamie Rossi','interviewer'),actor('interviewer2','Robin Petit','interviewer')];
  const profileFor = (index: number) => lifecycleScenarios[index].processing === 'empty' ? offlineProfiles[2] : offlineProfiles[index % offlineProfiles.length];
  const candidates = lifecycleScenarios.map((scenario,index) => actor(scenario.key,profileFor(index).name,'candidate'));
  const seen: Record<string, number> = {};
  for (const candidate of candidates) { const base = slug(candidate.name); const n = (seen[base] = (seen[base] ?? 0) + 1); if (n > 1) candidate.email = `${base}.${n}@example.test`; }
  const actors = [...staff,actor('candidate','Taylor Nguyen','candidate'),...candidates];
  const jobs = (['draft','review','interviews','no-tasks','closed'] as const).map(key => {
    const processing = key === 'review' || key === 'interviews' || key === 'draft';
    const owner = key === 'no-tasks' ? staff[1] : staff[0];
    const roles = {
      draft: ['Data Analyst — Reporting', 'Maintain sales and operations reporting, investigate data-quality issues, and document SQL/Power BI dashboards for business teams.'],
      review: ['Backend Engineer — Platform', 'Build reliable TypeScript APIs and PostgreSQL services. Work with product and operations on imports, observability and safe releases. Python and cloud experience are useful; evidence is reviewed by people, not scored automatically.'],
      interviews: ['Senior Software Engineer', 'Own backend integrations, improve reliability and mentor engineers. Technical and HR interviews are configured separately from CV review.'],
      'no-tasks': ['Finance Operations Analyst', 'Support reconciliations, month-end reporting and audit documentation. This demonstration role has no automatic extraction or interviews.'],
      closed: ['Financial Accountant', 'Prepare month-end accounts, balance-sheet reconciliations and audit evidence. Applications are now closed; existing recruitment records remain inspectable.'],
    };
    const definition = createVacancySchema.parse({title:roles[key][0],description:roles[key][1],location:'Tunis · Hybrid',formDefinition:{version:1,inputs:[
      {id:'name',name:'full_name',label:'Full name',type:'text',required:true,args:{maxLength:200}},
      {id:'motivation',name:'motivation',label:'Motivation',type:'long_text',required:false,args:{maxLength:2000}},
      {id:'cv',name:'cv',label:'CV',type:'document',required:true,args:{accept:['.pdf']}},
    ]},processingDefinition:{version:2,tasks:processing?[{id:'cv_extract',sourceInputId:'cv',outputKey:'cv_facts',type:'cvExtractor',args:demoCvQuestions}]:[]}});
    const status = key === 'draft' ? 'draft' : key === 'closed' ? 'closed' : 'published';
    const vacancy: Vacancy = {...definition,id:lifecycleId(`vacancy:${key}`),ownerId:owner.id,status,revision:status==='draft'?1:status==='closed'?3:2,extractionReferenceDate:status==='draft'?null:at(-29*24).slice(0,10),createdAt:at(-30*24),updatedAt:at(status==='closed'?-24:-29*24)};
    const steps = key === 'interviews' ? ['Technical interview','HR interview'].map((name,position) => ({id:lifecycleId(`step:${key}:${position}`),name,position,instructions:'Assess the candidate against the requirements of this role.'})) : [];
    return {key,owner,vacancy,steps,publishedAt:at(-29*24),interviewRevision:steps.length?2:1};
  });
  const applications = lifecycleScenarios.map((scenario,index) => {
    const job = jobs.find(job => job.key === scenario.job)!;
    const candidate = candidates[index];
    const id = lifecycleId(`application:${scenario.key}`);
    const profile = profileFor(index);
    const lines = [profile.name, 'Curriculum vitae', 'Experience, education and skills.'];
    const screened = scenario.journey !== 'received';
    const rejected = scenario.journey === 'rejected';
    const interviewJourney = ['upcoming','feedback-due','reschedule','cancelled','partial-pass','all-passed','interview-failed'].includes(scenario.journey);
    const stage = rejected || scenario.journey === 'interview-failed' ? 'not_selected' : ['offer','hired'].includes(scenario.journey) ? scenario.journey : interviewJourney ? 'interview' : screened ? 'preselected' : 'received';
    const processingState = scenario.processing==='none'?'not_requested':['pending','released'].includes(scenario.processing)?'pending':['ordinary','operational','uncertain'].includes(scenario.processing)?'completed_with_errors':'completed';
    const reviewStatus = scenario.processing==='none'||scenario.processing==='reviewed'?'completed':scenario.processing==='corrected'?'in_review':'pending';
    return {scenario,job,candidate,id,lines,profile,stage,processingState,reviewStatus,screened,rejected,
      documentId:lifecycleId(`document:${scenario.key}`),fileId:lifecycleId(`file:${scenario.key}`),
      submittedAt:at(-14*24+index),processedAt:at(-12*24+index),reviewedAt:at(-10*24+index),screenedAt:at(-8*24+index),
      // Global unique slots for the shared interviewer; second interview uses another assignee.
      pastStart:at(-72+index),pastSecondStart:at(-48+index),futureStart:at(24+index),futureSecondStart:at(48+index),
    };
  });
  return {namespace:lifecycleNamespace,baseline:new Date(baseline).toISOString(),actors,jobs,applications};
}
export type LifecycleCatalog = ReturnType<typeof lifecycleCatalog>;
