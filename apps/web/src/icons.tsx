import type { ButtonHTMLAttributes } from 'react';

const paths={
  check:'m5 12 4 4L19 6',close:'m6 6 12 12 M18 6 6 18',
  previous:'m15 18-6-6 6-6',next:'m9 18 6-6-6-6',up:'m6 15 6-6 6 6',down:'m6 9 6 6 6-6',
  refresh:'M20 7v5h-5 M4 17v-5h5 M6 7a7 7 0 0 1 12-1l2 2 M4 16l2 2a7 7 0 0 0 12-1',
  remove:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  alert:'M12 3 2 21h20L12 3 M12 9v5 M12 17v1',edit:'m15 4 5 5 M4 20l5-1L21 7l-5-5L4 14v6',
} as const;
export function Icon({name}:{name:keyof typeof paths}){return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;}
export function IconButton({icon,label,className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{icon:keyof typeof paths;label:string}){
  return <button type="button" className={`icon-button ${icon==='refresh'?'icon-refresh':''} ${className}`} title={label} aria-label={label} {...props}><Icon name={icon}/></button>;
}
