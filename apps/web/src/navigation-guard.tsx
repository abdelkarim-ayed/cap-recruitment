import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const indexKey='recruitmentNavigationIndex';
export const navigateEvent='recruitment:navigate';
const route=()=>window.location.hash.slice(1)||'/vacancies';
const entryIndex=()=>Number.isSafeInteger(window.history.state?.[indexKey])?window.history.state[indexKey] as number:null;
const markedState=(index:number)=>({...window.history.state,[indexKey]:index});
export type EditorKind='review'|'vacancy'|'plan'|'application'|'import';
type Guard={owner:symbol;kind:EditorKind;dirty:boolean;pending:boolean};
type Destination={kind:'route';path:string;index?:number}|{kind:'action';run:()=>void|Promise<void>};
interface Navigation { path:string; register:(guard:Guard)=>()=>void; requestAction:(run:()=>void|Promise<void>)=>void }
const NavigationContext=createContext<Navigation|null>(null);
export function useNavigation(){const navigation=useContext(NavigationContext);if(!navigation)throw new Error('Navigation boundary required.');return navigation;}
export function useOptionalNavigation(){return useContext(NavigationContext);}
export function useNavigationGuard(dirty:boolean,pending=false,kind:EditorKind='review',enabled=true){
  const register=useContext(NavigationContext)?.register,owner=useRef(Symbol('editor-draft'));
  useLayoutEffect(()=>{
    if(!enabled)return;
    return register?.({owner:owner.current,kind,dirty,pending});
  },[register,kind,dirty,pending,enabled]);
}
const guardCopy:Record<EditorKind,{pendingTitle:string;dirtyTitle:string;dirtyDescription:string}>={
  review:{pendingTitle:'Review save in progress',dirtyTitle:'Leave with unsaved corrections?',dirtyDescription:'Leaving discards your local correction drafts. Saved results stay unchanged. Nothing will be saved automatically.'},
  vacancy:{pendingTitle:'Vacancy update in progress',dirtyTitle:'Leave with an unsaved vacancy draft?',dirtyDescription:'Leaving discards your local vacancy edits. The saved draft stays unchanged. Nothing will be saved automatically.'},
  plan:{pendingTitle:'Interview plan save in progress',dirtyTitle:'Leave with an unsaved interview plan?',dirtyDescription:'Leaving discards your local interview-plan edits. The saved plan stays unchanged. Nothing will be saved automatically.'},
  application:{pendingTitle:'Application submission in progress',dirtyTitle:'Leave with an unsaved application?',dirtyDescription:'Leaving discards your answers and selected documents. Nothing will be submitted automatically.'},
  import:{pendingTitle:'Screening check in progress',dirtyTitle:'Leave with unsaved screening decisions?',dirtyDescription:'Leaving discards this upload and its staged decisions. No decisions will be applied automatically.'}
};

// One small boundary for the existing hash router, not a permission/workflow
// engine. History markers contain only a position, never review or identity data.
export function NavigationBoundary({children}:{children:ReactNode}){
  const current=useRef({path:route(),index:entryIndex()??0});
  const [path,setPath]=useState(current.current.path),[guard,setGuard]=useState<Guard|null>(null),[destination,setDestination]=useState<Destination|null>(null);
  const guardRef=useRef<Guard|null>(null),destinationRef=useRef<Destination|null>(null),restoring=useRef(false),approved=useRef<{path:string;index:number}|null>(null),executing=useRef(false);
  const [waitingHistory,setWaitingHistory]=useState(false),[leaving,setLeaving]=useState(false);
  const dialog=useRef<HTMLElement|null>(null),stay=useRef<HTMLButtonElement|null>(null);
  const queue=useCallback((value:Destination|null)=>{destinationRef.current=value;setDestination(value);},[]);
  const register=useCallback((value:Guard)=>{
    guardRef.current=value;setGuard(value);
    return()=>{if(guardRef.current?.owner===value.owner){guardRef.current=null;setGuard(null);}};
  },[]);
  const commit=useCallback((nextPath:string,index:number)=>{current.current={path:nextPath,index};setPath(nextPath);},[]);
  const push=useCallback((nextPath:string)=>{
    const index=current.current.index+1;window.history.pushState({[indexKey]:index},'',`#${nextPath}`);commit(nextPath,index);
  },[commit]);
  const perform=useCallback((next:Destination)=>{
    if(next.kind==='route'){push(next.path);queue(null);return;}
    executing.current=true;setLeaving(true);
    // Sign-out handles its own API error. Only the explicitly approved action's
    // redirect may bypass this guard; no save/cancel/retry request is generated.
    void Promise.resolve().then(next.run).finally(()=>{executing.current=false;setLeaving(false);queue(null);});
  },[push,queue]);
  const request=useCallback((next:Destination)=>{
    if(next.kind==='route'&&next.path===current.current.path)return;
    if(executing.current){if(next.kind==='route')push(next.path);return;}
    if(destinationRef.current)return;
    const active=guardRef.current;
    if(active?.dirty||active?.pending)queue(next);else perform(next);
  },[perform,push,queue]);
  const requestAction=useCallback((run:()=>void|Promise<void>)=>request({kind:'action',run}),[request]);
  useEffect(()=>{
    if(entryIndex()===null)window.history.replaceState(markedState(current.current.index),'',window.location.href);
    const changed=()=>{
      const nextPath=route(),index=entryIndex();
      if(restoring.current){if(index===current.current.index){restoring.current=false;setWaitingHistory(false);}return;}
      if(approved.current){if(index===approved.current.index&&nextPath===approved.current.path){commit(nextPath,index);approved.current=null;setLeaving(false);queue(null);}return;}
      if(nextPath===current.current.path){if(index!==null)current.current.index=index;return;}
      const active=guardRef.current;
      if(!executing.current&&(active?.dirty||active?.pending||destinationRef.current)){
        if(!destinationRef.current)queue({kind:'route',path:nextPath,...(index!==null&&index!==current.current.index?{index}:{})});
        if(index!==null&&index!==current.current.index){restoring.current=true;setWaitingHistory(true);window.history.go(current.current.index-index);}
        else {
          // Unmanaged fragments have no trustworthy traversal direction. Keep
          // the mounted review/URL; confirmation opens a fresh managed entry.
          const restoredIndex=index??current.current.index+1;
          window.history.replaceState(markedState(restoredIndex),'',`#${current.current.path}`);current.current.index=restoredIndex;
        }
        return;
      }
      const nextIndex=index??current.current.index+1;
      if(index===null)window.history.replaceState(markedState(nextIndex),'',window.location.href);
      commit(nextPath,nextIndex);
    };
    const clicked=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const anchor=(event.target as HTMLElement|null)?.closest?.('a[href]');
      if(!(anchor instanceof window.HTMLAnchorElement)||anchor.hasAttribute('download')||anchor.target&&anchor.target!=='_self')return;
      const url=new URL(anchor.href,window.location.href);
      if(url.origin!==window.location.origin||url.pathname!==window.location.pathname||url.search!==window.location.search||!url.hash.startsWith('#/'))return;
      event.preventDefault();request({kind:'route',path:url.hash.slice(1)});
    };
    const requested=(event:Event)=>{const path=(event as CustomEvent<unknown>).detail;if(typeof path==='string'&&path.startsWith('/')){event.preventDefault();request({kind:'route',path});}};
    const unload=(event:BeforeUnloadEvent)=>{if(guardRef.current?.dirty||guardRef.current?.pending){event.preventDefault();event.returnValue='';}};
    window.addEventListener('hashchange',changed);window.addEventListener('popstate',changed);document.addEventListener('click',clicked,true);window.addEventListener(navigateEvent,requested);window.addEventListener('beforeunload',unload);
    return()=>{window.removeEventListener('hashchange',changed);window.removeEventListener('popstate',changed);document.removeEventListener('click',clicked,true);window.removeEventListener(navigateEvent,requested);window.removeEventListener('beforeunload',unload);};
  },[commit,queue,request]);
  const cancel=useCallback(()=>{
    if(executing.current||approved.current||restoring.current)return;
    queue(null);
  },[queue]);
  const open=destination!==null;
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement as HTMLElement|null;stay.current?.focus();
    const keyboard=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();cancel();}
      if(event.key==='Tab'){
        const buttons=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]);
        if(!buttons.length){event.preventDefault();return;}
        const first=buttons[0],last=buttons[buttons.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',keyboard);return()=>{document.removeEventListener('keydown',keyboard);if(previous?.isConnected)previous.focus();};
  },[open,cancel]);
  function confirm(){
    const next=destinationRef.current;if(!next||guardRef.current?.pending||restoring.current||executing.current||approved.current)return;
    if(next.kind==='route'&&next.index!==undefined){approved.current={path:next.path,index:next.index};setLeaving(true);window.history.go(next.index-current.current.index);}
    else perform(next);
  }
  const value=useMemo(()=>({path,register,requestAction}),[path,register,requestAction]);
  const copy=guardCopy[guard?.kind??'review'];
  return <NavigationContext.Provider value={value}><div inert={open}>{children}</div>{open&&<section ref={dialog} className="card review-leave-dialog" role="alertdialog" aria-modal="true" aria-labelledby="review-leave-title" aria-describedby="review-leave-description"><h2 id="review-leave-title">{guard?.pending?copy.pendingTitle:guard?.dirty?copy.dirtyTitle:'Leave this page?'}</h2><p id="review-leave-description">{guard?.pending?'Wait for the current request to finish. Leaving cannot cancel a server write.':guard?.dirty?copy.dirtyDescription:'The current request has finished. You can now leave, or stay to check the result.'}</p>{waitingHistory&&<p role="status">Restoring the current page before choosing…</p>}<div className="actions"><button ref={stay} disabled={leaving||waitingHistory} onClick={cancel}>Stay</button><button className="danger" disabled={!!guard?.pending||waitingHistory||leaving} onClick={confirm}>{leaving?'Leaving…':guard?.dirty?'Discard and leave':'Leave page'}</button></div></section>}</NavigationContext.Provider>;
}
