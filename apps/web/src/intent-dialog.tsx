import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { useOptionalNavigation } from './navigation-guard';

// A focused native modal, not an action/workflow engine. Native focus containment
// and inertness still need manual checks; JSDOM stubs lifecycle only.
export function IntentDialog({title,description,busy,confirmDisabled=false,confirmLabel='Confirm',cancelLabel='Cancel',onConfirm,onCancel,fallbackFocus,children}:{
  title:string;description:string;busy:boolean;confirmDisabled?:boolean;confirmLabel?:string;cancelLabel?:string;
  onConfirm?:()=>void;onCancel:()=>void;fallbackFocus:RefObject<HTMLElement|null>;children?:ReactNode;
}){
  const dialog=useRef<HTMLDialogElement>(null),cancel=useRef<HTMLButtonElement>(null),id=useId();
  const suspended=useOptionalNavigation()?.confirmingLeave??false;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null,element=dialog.current!;
    return()=>{
      if(element.open)element.close();
      if(previous?.isConnected&&previous!==document.body&&previous!==document.documentElement)previous.focus();else fallbackFocus.current?.focus();
    };
  },[fallbackFocus]);
  useEffect(()=>{
    const element=dialog.current!;
    // Let the existing leave-warning UI take precedence over the native top
    // layer, retaining the proposal and any pending request when suspended.
    if(suspended){if(element.open)element.close();return;}
    if(!element.open){element.showModal();cancel.current?.focus();}
  },[suspended]);
  return <dialog ref={dialog} className="intent-dialog vacancy-confirmation" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={event=>{event.preventDefault();if(!busy)onCancel();}}>
    <h2 id={`${id}-title`}>{title}</h2><p id={`${id}-description`}>{description}</p>
    {children}
    <div className="actions">{onConfirm&&<button className="primary" disabled={busy||confirmDisabled} onClick={onConfirm}>{busy?'Working…':confirmLabel}</button>}<button ref={cancel} disabled={busy} onClick={onCancel}>{cancelLabel}</button></div>
  </dialog>;
}
