import type { FormDefinition } from '@recruitment/domain/vacancies';

type Input=FormDefinition['inputs'][number];
// Submitted form answers only. Automated results retain their task-specific shape.
export function answerLabel(input:Input,value:unknown):string{
  if(value===null||value===undefined||value==='')return 'Not provided';
  if(input.type==='single_choice'||input.type==='multiple_choice'){
    const choice=(value:unknown)=>input.args.choices.find(choice=>choice.value===value)?.label??'Choice unavailable';
    return Array.isArray(value)?value.length?value.map(choice).join(', '):'None selected':choice(value);
  }
  if(typeof value==='boolean')return value?'Yes':'No';
  return String(value);
}
