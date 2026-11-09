import { useEffect, useState } from 'react';

const storageKey='recruitmentListFilters';
type Memory={scope:string;lists:Record<string,unknown>};
function memory():Memory|null {
  try{
    const value=JSON.parse(window.sessionStorage.getItem(storageKey)||'null');
    return value&&typeof value.scope==='string'&&value.lists&&typeof value.lists==='object'&&!Array.isArray(value.lists)?value:null;
  }catch{return null;}
}
// Called by the account lifecycle, never by a stale list component.
export function activateListMemory(scope:string|null){
  try{
    if(!scope)window.sessionStorage.removeItem(storageKey);
    else if(memory()?.scope!==scope)window.sessionStorage.setItem(storageKey,JSON.stringify({scope,lists:{}}));
  }catch{/* Storage is optional. */}
}
export function useListFilters<T extends object>(scope:string|undefined,key:string,parse:(value:Record<string,unknown>)=>T){
  const [filters,setFilters]=useState<T>(()=>{
    const saved=scope&&memory();
    const value=saved&&saved.scope===scope?saved.lists[key]:null;
    return parse(value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{});
  });
  useEffect(()=>{
    if(!scope)return;
    const saved=memory();
    if(saved?.scope!==scope)return;
    try{window.sessionStorage.setItem(storageKey,JSON.stringify({scope,lists:{...saved.lists,[key]:filters}}));}catch{/* Storage is optional. */}
  },[scope,key,filters]);
  const change=(patch:Partial<T>)=>setFilters(current=>({...current,...patch}));
  return [filters,change] as const;
}
function choice(value:unknown,allowed:string[],fallback=''){return typeof value==='string'&&allowed.includes(value)?value:fallback;}
function offset(value:unknown){return typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=2147483620&&value%20===0?value:0;}
function date(value:unknown){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return '';
  const parsed=new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value?value:'';
}
export function applicationFilters(value:Record<string,unknown>){
  let from=date(value.from),before=date(value.before);
  if(from&&before&&from>=before){from='';before='';}
  return {offset:offset(value.offset),sort:choice(value.sort,['newest','oldest','candidate','position'],'newest'),work:choice(value.work,['processing','for_review','for_screening','interviewing','awaiting_offer','offer_recorded','hired','not_selected','other']),recruitmentStatus:choice(value.recruitmentStatus,['received','preselected','interview','offer','hired','not_selected']),undecided:value.undecided===true,from,before};
}
export function vacancyFilters(value:Record<string,unknown>){
  return {offset:offset(value.offset),sort:choice(value.sort,['newest','oldest','title'],'newest'),status:choice(value.status,['draft','published','closed']),owner:typeof value.owner==='string'&&value.owner.trim().length>0&&value.owner.length<=200?value.owner:'',notApplied:value.notApplied===true};
}
export function inboxFilters(value:Record<string,unknown>){return {offset:offset(value.offset),read:choice(value.read,['unread','all'],'unread')};}
