import type { Actor } from './api';
import type { StaffVacancy } from '@recruitment/domain';

export const vacancyStatusLabels={draft:'Draft',published:'Published',closed:'Closed'};
export function VacancyStatus({status}:{status:StaffVacancy['status']}){
  return <span className="vacancy-detail-status" data-state={status}>{vacancyStatusLabels[status]}</span>;
}
export function VacancyOwner({vacancy,actor}:{vacancy:StaffVacancy;actor:Actor}){
  return <p className="vacancy-owner">Owner: <span>{vacancy.owner?.name||vacancy.owner?.email||'Unknown owner'}</span>{vacancy.ownerId===actor.id&&' (you)'}</p>;
}
const fieldLabels={text:'Short answer',long_text:'Long answer',number:'Number',yes_no:'Yes / No',single_choice:'Choose one',multiple_choice:'Choose several',document:'Document',separator:'Section'};

// Inspection is text, not a disabled authoring form. The private configuration
// here comes only from the existing authorized staff detail projection.
export function VacancyInformation({vacancy}:{vacancy:StaffVacancy}){
  return <>
    <section className="vacancy-section" aria-labelledby="vacancy-role-heading">
      <h2 id="vacancy-role-heading">About the role</h2><p className="prewrap vacancy-description">{vacancy.description}</p>
    </section>
    <section className="vacancy-section" aria-labelledby="vacancy-form-heading">
      <h2 id="vacancy-form-heading">Application form</h2>
      <p className="vacancy-field-meta">Account email · Required, included automatically from the candidate’s verified account.</p>
      {!vacancy.formDefinition.inputs.length?<p className="muted">No questions configured.</p>:<ul className="vacancy-form-outline">{vacancy.formDefinition.inputs.map(input=><li key={input.id}>
        {input.type==='separator'?<h3>{input.label}</h3>:<>
          <div className="vacancy-field-label">{input.label}</div>
          <p className="vacancy-field-meta">{fieldLabels[input.type]} · {input.required?'Required':'Optional'}</p>
          {(input.type==='single_choice'||input.type==='multiple_choice')&&<ul className="vacancy-choice-outline">{input.args.choices.map(choice=><li key={choice.value}>{choice.label}</li>)}</ul>}
          {(input.type==='text'||input.type==='long_text')&&<p className="vacancy-field-meta">Up to {(input.args.maxLength??10000).toLocaleString()} characters</p>}
          {input.type==='number'&&<p className="vacancy-field-meta">{[
            input.args.min!==undefined?`Minimum ${input.args.min}`:null,
            input.args.max!==undefined?`Maximum ${input.args.max}`:null,
            input.args.step!==undefined?`Increments of ${input.args.step}`:null,
          ].filter(Boolean).join(' · ')||'No range specified'}</p>}
          {input.type==='document'&&<p className="vacancy-field-meta">{input.args.accept?.join(', ')||'Any extension'} · One file · Up to {Math.min(10*1024*1024,input.args.limit?.kind==='MAX_BYTES'?input.args.limit.bytes:Infinity).toLocaleString()} bytes</p>}
        </>}
      </li>)}</ul>}
    </section>
    <section className="vacancy-section" aria-labelledby="vacancy-automation-heading">
      <h2 id="vacancy-automation-heading">Automated document information</h2>
      {!vacancy.processingDefinition.tasks.length?<p className="muted">No automated checks configured.</p>:<ul className="vacancy-form-outline">{vacancy.processingDefinition.tasks.map(task=><li key={task.id}>
        <div className="vacancy-field-label">{vacancy.formDefinition.inputs.find(input=>input.id===task.sourceInputId)?.label||'Document'}</div>
        <p className="vacancy-field-meta">Skills to check: {task.args.skills.join(', ')}</p>
      </li>)}</ul>}
    </section>
  </>;
}
