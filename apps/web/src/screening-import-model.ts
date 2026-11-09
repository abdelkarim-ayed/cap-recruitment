import type { ScreeningRow } from '@recruitment/domain';

export type ImportGroup={key:string;rows:ScreeningRow[];duplicate:boolean};
export type ImportChoice={included:boolean;decision:string;keepKey:number|null;reasonOverride?:string};
export function importGroups(rows:ScreeningRow[]):ImportGroup[]{
  const groups=new Map<string,ImportGroup>();
  for(const row of rows){
    // Malformed/mismatched and decided rows stay separately visible, never
    // hidden in a trusted group or repaired by selecting another person's row.
    const key=row.state==='valid'?`application:${row.applicationId}`:`record:${row.key}`;
    let group=groups.get(key);
    if(!group){group={key,rows:[],duplicate:false};groups.set(key,group);}
    group.rows.push(row);group.duplicate ||= (row.duplicateKeys?.length??0)>1||group.rows.length>1;
  }
  return [...groups.values()];
}
export function initialChoice(group:ImportGroup):ImportChoice{
  const first=group.rows[0],valid=first.state==='valid';
  const sameDecision=group.rows.every(row=>row.decision===first.decision);
  const identical=sameDecision&&group.rows.every(row=>row.reason===first.reason);
  return {included:valid&&identical,decision:valid&&sameDecision?first.decision:'',keepKey:valid&&identical?first.key:null};
}
export const retainedRow=(group:ImportGroup,choice:ImportChoice)=>group.rows.find(row=>row.key===choice.keepKey&&row.state==='valid');
export const resolvedChoice=(group:ImportGroup,choice:ImportChoice)=>!!retainedRow(group,choice)&&['preselected','rejected'].includes(choice.decision);
export function chooseDecision(group:ImportGroup,choice:ImportChoice,decision:string):ImportChoice{
  let keepKey=choice.keepKey;
  if(keepKey===null||group.duplicate&&retainedRow(group,choice)?.decision!==decision){
    const matching=group.rows.filter(row=>row.state==='valid'&&row.decision===decision);
    keepKey=matching.length?matching.every(row=>row.reason===matching[0].reason)?matching[0].key:null:group.rows.find(row=>row.state==='valid')?.key??null;
  }
  const row=group.rows.find(row=>row.key===keepKey);
  return {...choice,decision,keepKey,reasonOverride:row&&row.decision!==decision?'':undefined,included:keepKey!==null&&['preselected','rejected'].includes(decision)};
}
export function retainProposal(group:ImportGroup,key:number):ImportChoice{
  const row=group.rows.find(row=>row.key===key&&row.state==='valid');
  return row?{included:true,decision:row.decision,keepKey:row.key}:{included:false,decision:'',keepKey:null};
}
