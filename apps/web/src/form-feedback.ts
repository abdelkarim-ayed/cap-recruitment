import type { FormDefinition, ProcessingDefinition } from '@recruitment/domain/vacancies';
import { errorMessage } from './api';
import { cvFamilyLabels } from '@recruitment/domain';

type Issue={path:string|readonly PropertyKey[];message:string};
export function formIssues(issues:readonly Issue[],form:FormDefinition,processing?:ProcessingDefinition){
  return issues.map(issue=>{
    const path=typeof issue.path==='string'?issue.path.split('.'):issue.path.map(String);
    let label='Application form';
    if(path[0]==='answers'||path[0]==='files')label=form.inputs.find(input=>input.id===path[1])?.label??(path[0]==='files'?'Documents':'Submitted answers');
    else if(path[0]==='formDefinition'){
      const input=form.inputs[Number(path[2])];
      label=input?.label||'Application form';
      if(path.includes('name'))label+=' · answer column name';
      if(path.includes('value'))label+=' · stored choice value';
    }else if(path[0]==='processingDefinition'){
      const task=processing?.tasks[Number(path[2])],source=form.inputs.find(input=>input.id===task?.sourceInputId);
      const questionIndex=path.indexOf('questions');
      const question=questionIndex<0?undefined:task?.args.questions[Number(path[questionIndex+1])];
      label=`CV extractor${source?` for ${source.label}`:''}${question?` · ${cvFamilyLabels[question.type]} ${Number(path[questionIndex+1])+1}`:''}${path.includes('aliases')?' · accepted term':''}${path.includes('outputKey')?' · result column prefix':''}`;
    }else if(path[0]==='title')label='Position title';
    else if(path[0]==='description')label='Description';
    else if(path[0]==='location')label='Location';
    return `${label}: ${issue.message}`;
  }).join('\n');
}
export function formError(error:unknown,form:FormDefinition,processing?:ProcessingDefinition){
  const issues=(error as {issues?:Issue[]}|null)?.issues;
  return Array.isArray(issues)&&issues.length>0&&issues.every(issue=>issue&&typeof issue.message==='string'&&(typeof issue.path==='string'||Array.isArray(issue.path)))?formIssues(issues,form,processing):errorMessage(error);
}
