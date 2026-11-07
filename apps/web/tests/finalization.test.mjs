import { test,afterEach } from 'node:test';
import { equal,ok } from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:5173/'});
for(const key of ['window','document','HTMLElement','HTMLInputElement','Event','MouseEvent','File','FileList','location','sessionStorage'])globalThis[key]=dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const React=await import('react');
const {render,screen,cleanup,fireEvent}=await import('@testing-library/react');
const {ApplicationWorkflow}=await import('../src/interviews.tsx');
const originalFetch=globalThis.fetch;
afterEach(()=>{cleanup();globalThis.fetch=originalFetch;});
const allowed={allowed:true,visible:true,reason:null},hidden={allowed:false,visible:false,reason:'Unavailable'};
const blocked={allowed:false,visible:true,reason:'Every configured interview must pass before an offer.'};
const person={id:'owner',name:'Synthetic owner',email:'owner@example.test'};
function setup({isOwner=true,steps=[],offer=allowed,conflict=false}={}){
  let stage='preselected',revision=1;const writes=[];
  const flow=()=>({applicationId:'application',stage,revision,owner:person,isOwner,steps,interviews:[],actions:{preselect:hidden,reject:allowed,offer:isOwner&&stage==='preselected'?offer:hidden,hire:isOwner&&stage==='offer'?allowed:hidden,schedule:steps.length?hidden:allowed}});
  globalThis.fetch=async(path,init)=>{
    let body;
    if(init?.method==='POST'){
      body=JSON.parse(init.body);writes.push(body);
      if(conflict)return {ok:false,status:409,headers:new Headers(),async json(){return {message:'Record changed; refresh before retrying.'};}};
      stage=body.stage;revision++;
    }
    const result=path.endsWith('/interviews')||init?.method==='POST'?flow():{id:'application',vacancyId:'vacancy',candidate:{name:'Synthetic candidate',email:'candidate@example.test'},vacancy:{title:'Synthetic vacancy'}};
    return {ok:true,status:200,async json(){return result;}};
  };
  render(React.createElement(ApplicationWorkflow,{id:'application'}));return writes;
}
test('empty-plan Offer requires explicit owner confirmation; Hired is a separate later action',async()=>{
  const writes=setup();fireEvent.click(await screen.findByText('Record offer'));equal(writes.length,0);
  ok(screen.getByText(/No interviews are configured. Record the owner offer decision/));
  fireEvent.click(screen.getByText('Confirm decision'));await screen.findByText('Record hired');equal(writes.length,1);equal(writes[0].stage,'offer');
  fireEvent.click(screen.getByText('Record hired'));equal(writes.length,1);ok(screen.getByText(/Confirm the separate Hired decision/));
  fireEvent.click(screen.getByText('Confirm decision'));await screen.findByText('hired');equal(writes.length,2);equal(writes[1].stage,'hired');equal(writes[1].expectedRevision,2);
});
test('shared HR sees owner-only explanation but cannot finalize another owner application',async()=>{
  const writes=setup({isOwner:false});await screen.findByText('Synthetic candidate');
  ok(screen.getByText(/The vacancy owner can explicitly record an offer/));equal(screen.queryByText('Record offer'),null);equal(screen.queryByText('Record hired'),null);equal(screen.queryByText('Schedule interview'),null);equal(writes.length,0);
});
test('a configured incomplete plan keeps the Offer control disabled',async()=>{
  const writes=setup({steps:[{id:'planned',position:0,name:'Technical',instructions:''}],offer:blocked});
  equal((await screen.findByText('Record offer')).disabled,true);equal(writes.length,0);
});
test('stale Offer confirmation reports conflict without automatically retrying',async()=>{
  const writes=setup({conflict:true});fireEvent.click(await screen.findByText('Record offer'));fireEvent.click(screen.getByText('Confirm decision'));
  await screen.findByText('Record changed; refresh before retrying.');equal(writes.length,1);equal(screen.queryByText('Record hired'),null);
});
