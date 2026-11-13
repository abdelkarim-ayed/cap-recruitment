import { emitKeypressEvents } from 'node:readline';
import { createConnection } from 'node:net';
import { jevBackendKeyAddress, jevKeyAddress, requirePrivateJevDirectory, requirePrivateJevSocket } from './jev-key-address.js';
import { JEV_KEY_MAX_BYTES, validJevKey } from './jev-key-value.js';
import { JEV_KEY_CONTROL_TIMEOUT_MS, JEV_KEY_MESSAGE_BYTES, JEV_KEY_REPLY_BYTES, jevKeyReplySchema, type JevKeyCommand, type JevKeyReply } from './jev-key-protocol.js';
import { exchangeWindowsJevKey } from './jev-key-windows.js';

const usage = 'Usage: jev:key set|clear|status [--pid EXPECTED_BACKEND_PID | --worker-pid CLI_PID] [--stdin (set only)]. Default: the single backend. Never pass a key as an argument.';
function options(args:string[]) {
  const [op,...rest]=args;
  if(!['set','clear','status'].includes(op))throw new Error(usage);
  let pid:number|undefined,workerPid:number|undefined,fromStdin=false;
  for(let i=0;i<rest.length;i++) {
    if(rest[i]==='--pid'&&pid===undefined&&workerPid===undefined&&/^\d+$/.test(rest[i+1]??''))pid=Number(rest[++i]);
    else if(rest[i]==='--worker-pid'&&pid===undefined&&workerPid===undefined&&/^\d+$/.test(rest[i+1]??''))workerPid=Number(rest[++i]);
    else if(rest[i]==='--stdin'&&!fromStdin&&op==='set')fromStdin=true;
    else throw new Error(usage);
  }
  if([pid,workerPid].some(value=>value!==undefined&&(!Number.isSafeInteger(value)||value<1)))throw new Error(usage);
  return {op:op as 'set'|'clear'|'status',pid,workerPid,fromStdin};
}
async function hiddenKey():Promise<string> {
  if(!process.stdin.isTTY||!process.stderr.isTTY)throw new Error('Use an interactive terminal, or --stdin with a trusted producer.');
  const input=process.stdin,wasRaw=input.isRaw;
  emitKeypressEvents(input);
  process.stderr.write('Jev API key (hidden): ');
  input.setRawMode(true); input.resume();
  try {
    return await new Promise<string>((resolve,reject)=>{
      let value='';
      const signal=()=>finish(new Error('Key input cancelled.'));
      const finish=(error?:Error)=>{
        input.removeListener('keypress',press); input.removeListener('error',failed); input.removeListener('end',ended);
        process.removeListener('SIGINT',signal);process.removeListener('SIGTERM',signal);
        const result=value;value=''; if(error)reject(error);else resolve(result);
      };
      const failed=()=>finish(new Error('Key input unavailable.'));
      const ended=()=>finish(new Error('Key input cancelled.'));
      const press=(text:string|undefined,key:{name?:string;ctrl?:boolean;meta?:boolean})=>{
        if(key?.ctrl&&(key.name==='c'||key.name==='d')){signal();return;}
        if(key?.name==='return'||key?.name==='enter'){finish();return;}
        if(key?.name==='backspace'){value=value.slice(0,-1);return;}
        if(key?.ctrl&&key.name==='u'){value='';return;}
        if(!key?.ctrl&&!key?.meta&&text&&/^[\x20-\x7e]+$/.test(text)) {
          if(value.length+text.length>JEV_KEY_MAX_BYTES){finish(new Error('Key input exceeds the local bound.'));return;}
          value+=text;
        } else if(!key?.ctrl&&!key?.meta&&text&&!text.startsWith('\u001b')&&key?.name!=='tab') {
          finish(new Error('Key input contains unsupported characters.'));
        }
      };
      input.on('keypress',press); input.once('error',failed); input.once('end',ended);
      process.once('SIGINT',signal);process.once('SIGTERM',signal);
    });
  } finally { input.setRawMode(wasRaw??false);input.pause();process.stderr.write('\n'); }
}
async function pipedKey():Promise<string> {
  if(process.stdin.isTTY)throw new Error('--stdin requires piped input; omit it for the hidden prompt.');
  let chunks:Buffer[]=[],length=0;
  const timeout=setTimeout(()=>process.stdin.destroy(new Error('Key input timed out.')),30000);
  try {
    for await(const chunk of process.stdin) {
      const buffer=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);
      length+=buffer.length;
      if(length>JEV_KEY_MAX_BYTES+2){buffer.fill(0);throw new Error('Key input exceeds the local bound.');}
      chunks.push(buffer);
    }
    const bytes=Buffer.concat(chunks);chunks=[];
    const key=bytes.toString('utf8').replace(/\r?\n$/,'');bytes.fill(0);
    return key;
  } finally { clearTimeout(timeout);for(const chunk of chunks)chunk.fill(0);chunks=[]; }
}
async function exchange(address:ReturnType<typeof jevKeyAddress>,command:JevKeyCommand):Promise<JevKeyReply> {
  const body=JSON.stringify(command);
  if(Buffer.byteLength(body)+1>JEV_KEY_MESSAGE_BYTES)throw new Error('Control input exceeds the local bound.');
  let response:Buffer;
  if(process.platform==='win32')response=await exchangeWindowsJevKey(address.path,body);
  else {
    await requirePrivateJevDirectory(address.directory!);
    await requirePrivateJevSocket(address.path);
    response=await new Promise<Buffer>((resolve,reject)=>{
      const socket=createConnection({path:address.path});
      let chunks:Buffer[]=[],bytes=0,settled=false;
      const finish=(error?:Error,value?:Buffer)=>{
        if(settled)return;settled=true;clearTimeout(timer);socket.destroy();chunks=[];
        if(error)reject(error);else resolve(value!);
      };
      const timer=setTimeout(()=>finish(new Error('Local key control timed out; outcome may be unconfirmed.')),JEV_KEY_CONTROL_TIMEOUT_MS);
      socket.once('connect',()=>socket.write(`${body}\n`));
      socket.on('data',(chunk:Buffer)=>{
        bytes+=chunk.length;
        if(bytes>JEV_KEY_REPLY_BYTES){finish(new Error('Invalid local control response.'));return;}
        chunks.push(chunk);
        if(chunk.includes(10))finish(undefined,Buffer.concat(chunks));
      });
      socket.on('error',()=>finish(new Error('Cannot contact the selected local backend; outcome may be unconfirmed.')));
      socket.once('close',()=>{if(!settled)finish(new Error('Local control response was not confirmed.'));});
    });
  }
  try { return jevKeyReplySchema.parse(JSON.parse(response.toString('utf8'))); }
  catch { throw new Error('Invalid local control response; outcome may be unconfirmed.'); }
}

try {
  const {op,pid,workerPid,fromStdin}=options(process.argv.slice(2));
  const address=workerPid===undefined?jevBackendKeyAddress():jevKeyAddress(workerPid);
  const status=await exchange(address,{version:1,op:'status'});
  if(!status.ok||(pid??workerPid)!==undefined&&status.pid!==(pid??workerPid))throw new Error('Local credential status unavailable or selected PID changed.');
  if(op==='status')console.log(`PID ${status.pid}: key ${status.configured?'loaded':'empty'}; revision ${status.revision}; instance ${status.instanceId}.`);
  else {
    let key:string|undefined;
    try {
      if(op==='set') { key=fromStdin?await pipedKey():await hiddenKey();if(!validJevKey(key))throw new Error('Invalid key input; use one nonempty header-safe token.'); }
      const command:JevKeyCommand=op==='set'?{version:1,op,instanceId:status.instanceId,expectedRevision:status.revision,key:key!}:{version:1,op,instanceId:status.instanceId,expectedRevision:status.revision};
       const result=await exchange(address,command);
       if(!result.ok||result.pid!==status.pid)throw new Error('Credential update refused; run status and retry deliberately.');
       console.log(`PID ${result.pid}: key ${result.configured?'loaded in RAM':'cleared'}. No provider probe, mode change or spending reset.`);
    } finally { key=undefined; }
  }
} catch {
  // Do not print exception/parser/argument details that might contain a secret.
  console.error(`${usage}\nLocal update/input was refused, failed or unconfirmed. Run status before retrying; no automatic retry was made.`);
  process.exitCode=1;
}
