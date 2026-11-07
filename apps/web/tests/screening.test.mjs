import { test,afterEach } from 'node:test';
import { equal,ok } from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','File','FileList','FormData','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,cleanup,waitFor,fireEvent}=await import('@testing-library/react');
const {ScreeningImport}=await import('../src/screening-import.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;});
const id='11111111-1111-4111-8111-111111111111';
const valid={key:2,applicationId:id,email:'person@example.test',decision:'rejected',reason:'',state:'valid',issue:null,candidate:{name:'Synthetic',email:'person@example.test'},revision:1};
const json=(body,status=200)=>({ok:status<400,status,headers:new Headers(),async json(){return body;}});
async function upload(){fireEvent.change(screen.getByLabelText('Decision CSV'),{target:{files:[new File(['synthetic'], 'decisions.csv',{type:'text/csv'})]}});await screen.findByLabelText('Include record 2');}
test('invalid input and already-decided rows are distinct and cannot be selected',async()=>{
  globalThis.fetch=async()=>json({rows:[valid,{...valid,key:3,state:'invalid',candidate:null,issue:'Email mismatch.'},{...valid,key:4,state:'decided',issue:'Screening decision already recorded.'}]});
  render(React.createElement(ScreeningImport,{vacancyId:'vacancy',onClose(){},onApplied(){}}));await upload();
  equal(screen.getByLabelText('Include record 2').checked,true);equal(screen.getByLabelText('Include record 3').disabled,true);equal(screen.getByLabelText('Include record 4').disabled,true);
  ok(document.querySelector('.screening-invalid'));ok(document.querySelector('.screening-decided'));
});
test('decision race rolls back confirmation, preserves other edited choices, and requires reconfirmation',async()=>{
  let applied=0;let payload;
  globalThis.fetch=async(path,init)=>{
    if(path.endsWith('/apply')){applied++;payload=JSON.parse(init.body);return json({message:'Nothing from this confirmation was applied.',conflicts:[{applicationId:id,state:'decided',issue:'Screening decision already recorded.'}]},409);}
    return json({rows:[valid,{...valid,key:3,applicationId:'22222222-2222-4222-8222-222222222222',candidate:{name:'Other synthetic',email:'person@example.test'}}]});
  };
  render(React.createElement(ScreeningImport,{vacancyId:'vacancy',onClose(){},onApplied(){throw new Error('must not report success');}}));await upload();
  fireEvent.change(screen.getByLabelText('Decision for record 3'),{target:{value:'preselected'}});
  fireEvent.click(screen.getByText('Review confirmation'));await screen.findByText('Confirm decisions');fireEvent.click(screen.getByText('Confirm decisions'));
  await screen.findByText('Nothing from this confirmation was applied.');
  equal(applied,1);equal(payload.rows.length,2);equal(screen.getByLabelText('Decision for record 3').value,'preselected');equal(screen.getByLabelText('Include record 3').checked,true);equal(screen.getByLabelText('Include record 2').checked,false);
  equal(screen.queryByText('Confirm decisions'),null);
});
test('a decision made before final review is excluded without an apply request',async()=>{
  let previews=0;
  globalThis.fetch=async(path)=>{ok(path.endsWith('/preview'));previews++;return json({rows:[previews===1?valid:{...valid,state:'decided',issue:'Screening decision already recorded.'}]});};
  render(React.createElement(ScreeningImport,{vacancyId:'vacancy',onClose(){},onApplied(){}}));await upload();
  fireEvent.click(screen.getByText('Review confirmation'));await waitFor(()=>equal(screen.getByLabelText('Include record 2').disabled,true));
  equal(screen.queryByText('Confirm decisions'),null);equal(previews,2);
});
