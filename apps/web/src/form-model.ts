import type { FormDefinition, ProcessingDefinition } from '@recruitment/domain/vacancies';
export type Input = FormDefinition['inputs'][number];
export const inputTypes = ['text','long_text','number','yes_no','single_choice','multiple_choice','document','separator'] as const;
export const inputLabels:Record<Input['type'],string>={text:'Short answer',long_text:'Long answer',number:'Number',yes_no:'Yes / No',single_choice:'Single choice',multiple_choice:'Multiple choice',document:'File upload',separator:'Section heading'};
export function makeInput(type: Input['type'], id: string): Input {
  if(type==='separator') return {id,type,label:'New section',args:{}};
  const base={id,name:id,label:'New question',required:false};
  if(type==='single_choice'||type==='multiple_choice') return {...base,type,args:{choices:[{value:'option_one',label:'Option one'}]}};
  return {...base,type,args:{}} as Input;
}
export function removeInput(inputs: Input[], processing: ProcessingDefinition, id: string) { return {inputs:inputs.filter(input=>input.id!==id),processing:{...processing,tasks:processing.tasks.filter(task=>task.sourceInputId!==id)}}; }
export function moveInput(inputs: Input[], index: number, delta: number) { const next=[...inputs], target=index+delta; if(target<0||target>=next.length)return next; [next[index],next[target]]=[next[target],next[index]];return next; }
