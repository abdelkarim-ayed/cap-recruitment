import type { Actor } from './api';

export type AgendaContext={start:string;view:'upcoming'|'past'|'cancelled';awaitingFeedback:boolean;offset:number};
type Memory={scope:string;context:AgendaContext;scrollY:number};
const storageKey='recruitmentAgendaContext';
export const actorScope=(actor:Pick<Actor,'id'|'role'>)=>`${actor.id}:${actor.role}`;
export function localDate(date:Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function mondayOfWeek(value:Date|string){
  const date=typeof value==='string'?new Date(`${value}T12:00:00`):new Date(value);
  date.setHours(12,0,0,0);date.setDate(date.getDate()-(date.getDay()+6)%7);
  return localDate(date);
}
export const defaultAgenda=():AgendaContext=>({start:mondayOfWeek(new Date()),view:'upcoming',awaitingFeedback:false,offset:0});
function validDate(value:string|null):value is string {
  if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'1900-01-01'||value>'9998-12-31')return false;
  const date=new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime())&&localDate(date)===value;
}
export function parseAgenda(query:string,defaults=defaultAgenda()):AgendaContext {
  const params=new URLSearchParams(query),rawStart=params.get('start'),rawView=params.get('view'),offset=params.get('offset');
  const currentWeek=mondayOfWeek(new Date()),requestedStart=validDate(rawStart)?mondayOfWeek(rawStart):mondayOfWeek(defaults.start);
  // Old detail links remain safe/useful; the UI only offers the new view model.
  const view=rawView==='agenda'?(requestedStart<currentWeek?'past':'upcoming'):rawView==='feedback'?'past':rawView==='upcoming'||rawView==='past'||rawView==='cancelled'?rawView:defaults.view;
  const start=view==='upcoming'&&requestedStart<currentWeek||view==='past'&&requestedStart>currentWeek?currentWeek:requestedStart;
  return {
    start,view,awaitingFeedback:view==='past'&&(rawView==='feedback'||params.get('awaitingFeedback')==='true'),
    offset:start!==requestedStart?0:offset!==null&&/^\d+$/.test(offset)&&Number.isSafeInteger(Number(offset))&&Number(offset)<=100000&&Number(offset)%20===0?Number(offset):defaults.offset,
  };
}
export const agendaQuery=(context:AgendaContext)=>new URLSearchParams({start:context.start,view:context.view,...(context.view==='past'&&context.awaitingFeedback?{awaitingFeedback:'true'}:{}),offset:String(context.offset)}).toString();
export const agendaPath=(context:AgendaContext)=>`/interviews?${agendaQuery(context)}`;
// Detail links carry only the allowlisted list parameters, never a redirect URL.
export function agendaReturnPath(path:string) {
  const query=path.split('?')[1];
  return query&&['start','view','awaitingFeedback','offset'].some(key=>new URLSearchParams(query).has(key))?agendaPath(parseAgenda(query)):'/interviews';
}
export function clearAgendaMemory(){try{window.sessionStorage.removeItem(storageKey);}catch{/* Storage is optional. */}}
export function readAgendaMemory(scope:string):Memory|null {
  try{
    const value=JSON.parse(window.sessionStorage.getItem(storageKey)||'null');
    if(!value)return null;
    if(value.scope!==scope){clearAgendaMemory();return null;}
    const saved=value.context;
    if(!saved||!validDate(saved.start)||!['upcoming','past','cancelled','agenda','feedback'].includes(saved.view)||!Number.isSafeInteger(saved.offset)||saved.offset<0||saved.offset>100000||saved.offset%20!==0||(saved.awaitingFeedback!==undefined&&typeof saved.awaitingFeedback!=='boolean'))return null;
    const context=parseAgenda(new URLSearchParams(saved).toString());
    const same=context.start===saved.start&&context.view===saved.view&&context.offset===saved.offset;
    return {scope,context,scrollY:same&&Number.isFinite(value.scrollY)&&value.scrollY>=0?value.scrollY:0};
  }catch{return null;}
}
export function rememberAgenda(scope:string,context:AgendaContext,scrollY:number){
  try{window.sessionStorage.setItem(storageKey,JSON.stringify({scope,context,scrollY:Math.max(0,scrollY)}));}catch{/* URL context still works without storage. */}
}
