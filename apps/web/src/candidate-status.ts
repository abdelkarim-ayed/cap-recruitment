export function candidateStatus(stage:string){
  return ({received:'Application received',preselected:'Preselected',interview:'Interviewing',offer:'Offer recorded',hired:'Hired',not_selected:'Not selected'} as Record<string,string>)[stage]??'Application received';
}
