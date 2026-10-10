import type { ReactNode } from 'react';
export function Badge({ children }: { children: ReactNode }) {
  const tone=typeof children!=='string'?'neutral':['completed','published'].includes(children)?'green':['failed','completed_with_errors','closed'].includes(children)?'red':['pending','draft','fixture','Mock extraction','Mock only'].includes(children)?'amber':['processing','in_review'].includes(children)?'blue':'neutral';
  return <span className={`badge badge-${tone}`}>{typeof children === 'string' ? children.replaceAll('_', ' ') : children}</span>;
}
export function Notice({ message, success = false }: { message: string; success?: boolean }) { return message ? <div className={`notice ${success ? 'success' : 'error'}`} role={success ? 'status' : 'alert'}>{message}</div> : null; }
export function Heading({ title, description, children }: { title: string; description?: string; children?: ReactNode }) { return <header className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div><div className="actions">{children}</div></header>; }
export function Empty({ children }: { children: ReactNode }) { return <div className="empty">{children}</div>; }
export function Loading() { return <div className="empty" role="status">Loading workspace…</div>; }
export function Pager({ offset, total, limit = 20, change }: { offset: number; total: number; limit?: number; change: (offset: number) => void }) { return <div className="pager"><span>{total ? `${offset + 1}–${Math.min(offset + limit, total)} of ${total}` : '0 records'}</span><div className="actions"><button disabled={!offset} onClick={() => change(Math.max(0, offset-limit))}>Previous</button><button disabled={offset+limit >= total} onClick={() => change(offset+limit)}>Next</button></div></div>; }
export function display(value: unknown) { return value === null || value === undefined ? '—' : typeof value === 'boolean' ? value ? 'Yes' : 'No' : typeof value === 'object' ? JSON.stringify(value) : String(value); }
