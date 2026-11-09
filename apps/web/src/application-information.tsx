import type { ApplicationView } from '@recruitment/domain';
import type { FormDefinition } from '@recruitment/domain/vacancies';
import { display } from './ui';

type AnswerInput=Exclude<FormDefinition['inputs'][number],{type:'separator'|'document'}>;
export function submittedAnswerGroups(inputs:FormDefinition['inputs']){
  const groups:{key:string;label:string|null;inputs:AnswerInput[]}[]=[{key:'initial',label:null,inputs:[]}];
  for(const input of inputs){
    if(input.type==='separator')groups.push({key:`section:${input.id}`,label:input.label,inputs:[]});
    else if(input.type!=='document')groups[groups.length-1].inputs.push(input);
  }
  return groups.filter(group=>group.inputs.length>0);
}

export function ApplicationInformation({record,onPreview,onDownload}:{
  record:ApplicationView;onPreview:(document:ApplicationView['documents'][number])=>void;
  onDownload:(document:ApplicationView['documents'][number])=>void;
}){
  const groups=submittedAnswerGroups(record.vacancy.formDefinition.inputs);
  return <section className="application-section application-information" aria-labelledby="application-information-heading">
    <h2 id="application-information-heading">Application information</h2>
    <h3>Submitted answers</h3>
    {!groups.length?<p className="muted">No answer fields in this application form.</p>:groups.map(group=><div className="application-answer-group" key={group.key}>
      {group.label&&<h4>{group.label}</h4>}
      <dl className="application-answers">{group.inputs.map(input=><div key={input.id}><dt>{input.label}</dt><dd>{display(record.answers[input.id])}</dd></div>)}</dl>
    </div>)}
    <h3>Documents</h3>
    {!record.documents.length?<p className="muted">No documents submitted.</p>:<ul className="application-documents">{record.documents.map(document=>{
      const source=record.vacancy.formDefinition.inputs.find(input=>input.id===document.inputId);
      return <li key={document.id}>
        <div><span className="application-document-name">{document.filename}</span><p className="application-document-meta">{source?.label&&`${source.label} · `}{Math.ceil(document.byteCount/1024)} KB</p></div>
        <div className="document-actions">
          {document.filename.toLowerCase().endsWith('.pdf')&&<button onClick={()=>onPreview(document)}>Preview {document.filename}</button>}
          <button onClick={()=>onDownload(document)}>Download {document.filename}</button>
        </div>
      </li>;
    })}</ul>}
  </section>;
}

// Presentation only: the server's workflow availability and the destination
// workflow still own all eligibility, ownership and transition checks.
export function applicationJourney(stage:string){
  if(['received','review_ready'].includes(stage))return {heading:'Screening',link:'Screening decision'};
  return {heading:'Recruitment',link:['preselected','interview'].includes(stage)?'Interviews & next steps':'View recruitment progress'};
}
