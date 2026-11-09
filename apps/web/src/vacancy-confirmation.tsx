import type { ReactNode, RefObject } from 'react';
import { IntentDialog } from './intent-dialog';

// Native modal supplies background inertness and focus containment. JSDOM tests
// can check the lifecycle, not prove browser top-layer/keyboard behavior.
export function VacancyConfirmation({title,description,busy,confirmDisabled,onConfirm,onCancel,fallbackFocus,children}:{
  title:string;description:string;busy:boolean;confirmDisabled:boolean;onConfirm:()=>void;onCancel:()=>void;
  fallbackFocus:RefObject<HTMLElement|null>;children?:ReactNode;
}){
  return <IntentDialog title={title} description={description} busy={busy} confirmDisabled={confirmDisabled} onConfirm={onConfirm} onCancel={onCancel} fallbackFocus={fallbackFocus}>{children}</IntentDialog>;
}
