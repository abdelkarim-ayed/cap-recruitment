import { useState } from 'react';
import { api, post, go, errorMessage, type Actor } from './api';
import { Notice } from './ui';

export function Login({onLogin}:{onLogin:(actor:Actor)=>void}) {
  const [mode,setMode]=useState<'login'|'signup'|'verify'|'reset'>('login');
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[code,setCode]=useState('');
  const [sent,setSent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  function change(next:typeof mode){setMode(next);setPassword('');setCode('');setSent(false);setError('');setMessage('');}
  async function signedIn(){onLogin((await api<{user:Actor}>('me')).user);const returnTo=sessionStorage.getItem('returnTo');sessionStorage.removeItem('returnTo');go(returnTo||'/vacancies');}
  async function send(){
    if(mode==='reset')await post('auth/email-otp/request-password-reset',{email});
    else await post('auth/email-otp/send-verification-otp',{email,type:'email-verification'});
    setSent(true);setMessage(`If this address is eligible, a code was sent to ${email}. Check the recipient and timestamp.`);
  }
  const needsCode=mode==='verify'||(mode==='reset'&&sent);
  const title=mode==='login'?'Welcome back':mode==='signup'?'Create candidate account':mode==='verify'?'Verify your email':'Set a new password';
  return <div className="auth-wrap"><section className="card auth-card"><span className="eyebrow">SECURE WORKSPACE</span><h1>{title}</h1><p>{mode==='signup'?'Candidate signup only. Staff accounts are created internally.':mode==='login'?'Sign in with your email and password. Your role comes from your existing account.':`Verification is for ${email||'your email address'}, not a different account.`}</p><Notice message={error}/><Notice message={message} success/>
    <form onSubmit={async event=>{event.preventDefault();setBusy(true);setError('');setMessage('');try{
      if(mode==='login'){await post('auth/sign-in/email',{email,password});await signedIn();}
      else if(mode==='signup'){await post('auth/sign-up/email',{email,password,name});setMode('verify');setPassword('');setSent(true);setMessage('Check your email for a verification code. Existing accounts are not overwritten; use password reset if needed.');}
      else if(mode==='verify'){if(!sent)await send();else{await post('auth/email-otp/verify-email',{email,otp:code});change('login');setMessage('Email verified. Sign in with your password.');}}
      else if(!sent)await send();
      else{await post('auth/email-otp/reset-password',{email,otp:code,password});change('login');setMessage('Password saved. Sign in with the new password.');}
    }catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>
      <label>Email address<input type="email" autoComplete="email" value={email} readOnly={sent} onChange={e=>setEmail(e.target.value.trim().toLowerCase())} required placeholder="you@example.com"/></label>
      {mode==='signup'&&<label>Full name<input autoComplete="name" required maxLength={200} value={name} onChange={e=>setName(e.target.value)}/></label>}
      {needsCode&&sent&&<label>Verification code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} required placeholder="000000"/></label>}
      {(mode==='login'||mode==='signup'||(mode==='reset'&&sent))&&<label>{mode==='reset'?'New password':'Password'}<input aria-label={mode==='reset'?'New password':'Password'} type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?undefined:12} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/>{mode!=='login'&&<small>12–128 characters.</small>}</label>}
      <button className="primary full" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':mode==='signup'?'Create account':!sent?'Send verification code':mode==='reset'?'Save new password':'Verify email'}</button>
      {sent&&<button type="button" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await send();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}}>Resend code</button>}
    </form>
    <div className="actions">{mode!=='login'&&<button className="ghost" disabled={busy} onClick={()=>change('login')}>Back to sign in</button>}{mode==='login'&&<><button className="ghost" disabled={busy} onClick={()=>change('signup')}>Candidate signup</button><button className="ghost" disabled={busy} onClick={()=>change('reset')}>Forgot password?</button><button className="ghost" disabled={busy} onClick={()=>change('verify')}>Verify email</button></>}</div>
    <p className="small muted">Demo accounts have a documented demo-only password in <code>docs/demo-guide.md</code>. No code needed for their normal sign-in. New signup/reset mail can be read with the local mail command.</p>
  </section></div>;
}
