import type { FormDefinition, ProcessingDefinition } from '@recruitment/domain/vacancies';
import { normalizeSkills } from '@recruitment/domain/vacancies';
import { processingClosed } from '../processing/processing-policy.js';

type Task={outputKey:string;status:string;result:{status:string};hasCorrection:boolean;provenance:{mode?:string}|null;skillResults:{skill:string;effective:boolean|null}[]};
type View={application:{candidate_identity:{name:string;email:string};submitted_at:string|Date;stage:string;review_status:string;review_editor?:{email:string}|null;answers:Record<string,unknown>;processing_released_at?:string|Date|null};tasks:Task[]};
const fields=(form:FormDefinition)=>form.inputs.filter(input=>input.type!=='separator');
export function decisionHeaders(form:FormDefinition,definition:ProcessingDefinition){
  return ['application_id','candidate_name','candidate_email','submitted_at','vacancy_title','vacancy_url','application_url','review',
    ...fields(form).map(input=>`${input.type==='document'?'document':'answer'}.${input.name}${input.type==='document'?'.url':''}`),
    ...definition.tasks.flatMap(task=>[`${task.outputKey}.result`,...normalizeSkills(task.args.skills).map(skill=>`${task.outputKey}.skill.${skill}`)]),'decision','reason'];
}
function reviewSummary(view:View){
  if(!view.tasks.length)return 'Not required';
  const {review_status:status,review_editor:editor}=view.application;
  const label=status==='completed'?'Reviewed':status==='in_review'?'In review':'Unreviewed';
  return `${label}${editor&&status!=='pending'?` by ${editor.email}`:''}${status!=='completed'&&view.tasks.some(task=>task.hasCorrection)?' · corrections saved':''}`;
}
function resultSummary(task:Task,closed:boolean){
  const fixture=task.provenance?.mode==='fixture';
  if(task.hasCorrection)return `HR correction${fixture?' (fixture source)':''}`;
  if(task.result.status==='completed')return fixture?'Fixture result':'Automated result';
  if(closed&&['pending','processing'].includes(task.status))return `${fixture?'Fixture · ':''}Processing closed; unavailable`;
  return `${fixture?'Fixture · ':''}${task.status==='failed'?'Processing failed; unavailable':task.status==='processing'?'Processing; unavailable':task.status==='pending'?'Not processed; unavailable':'Unavailable'}`;
}
export function decisionValues({id,vacancyId,title,webOrigin,form,view,documents}:{id:string;vacancyId:string;title:string;webOrigin:string;form:FormDefinition;view:View;documents:{id:string;input_id:string}[]}){
  // Configured web origin, never a Host header, cookie or signed/public object URL.
  const link=(path:string)=>new URL(path,webOrigin).toString();
  return [id,view.application.candidate_identity.name,view.application.candidate_identity.email,new Date(view.application.submitted_at).toISOString(),title,link(`/#/vacancies/${vacancyId}`),link(`/#/applications/${id}`),reviewSummary(view),
    ...fields(form).map(input=>{
      if(input.type==='document'){
        const doc=documents.find(doc=>doc.input_id===input.id);
        return doc?link(`/api/applications/${id}/documents/${doc.id}`):'';
      }
      const value=view.application.answers[input.id];
      if(value===undefined||value===null||value==='')return 'Not provided';
      const label=(value:unknown)=>input.type==='single_choice'||input.type==='multiple_choice'?input.args.choices.find(choice=>choice.value===value)?.label??String(value):String(value);
      if(Array.isArray(value))return value.length?value.map(label).join(', '):'None selected';
      return typeof value==='boolean'?(value?'Yes':'No'):label(value);
    }),
    ...view.tasks.flatMap(task=>[resultSummary(task,processingClosed(view.application)),...task.skillResults.map(skill=>skill.effective===null?'Unknown':skill.effective?'Yes':'No')]),'',''];
}
