import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { JEV_KEY_CONTROL_TIMEOUT_MS, JEV_KEY_REPLY_BYTES } from './jev-key-protocol.js';

function pipeName(path: string) {
  const prefix = '\\\\.\\pipe\\';
  const name = path.startsWith(prefix) ? path.slice(prefix.length) : '';
  if (!/^[A-Za-z0-9-]+$/.test(name)) throw new Error('Invalid local named pipe address.');
  return name;
}
const prelude = `
$ErrorActionPreference='Stop'
[Console]::InputEncoding=New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$pipe=$null
`;

// Stock Windows PowerShell/.NET supplies pipe ACL APIs that Node net does not
// expose. Script/pipe name are non-secret; command payload travels via stdin.
// No key on argv, environment, files, stdout or stderr. Fail closed if missing.
async function run(script: string, input?: string): Promise<Buffer> {
  if (process.platform !== 'win32' || !process.env.SystemRoot) throw new Error('Windows local pipe support is unavailable.');
  return new Promise((resolve, reject) => {
    const systemRoot = process.env.SystemRoot!;
    const child = spawn(join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),
      ['-NoLogo','-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],
      { windowsHide:true, stdio:['pipe','pipe','ignore'], env:{SystemRoot:systemRoot,WINDIR:systemRoot} });
    let output: Buffer[] = [], bytes = 0, settled = false;
    const finish = (failed: boolean) => {
      if (settled) return;
      settled=true; clearTimeout(timer);
      if(failed) { output=[]; child.kill(); reject(new Error('Windows local pipe operation failed; outcome may be unconfirmed.')); }
      else { resolve(Buffer.concat(output)); output=[]; }
    };
    const timer=setTimeout(()=>finish(true),JEV_KEY_CONTROL_TIMEOUT_MS);
    child.stdout.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>JEV_KEY_REPLY_BYTES)finish(true);else output.push(chunk);});
    child.stdin.on('error',()=>finish(true));
    child.on('error',()=>finish(true));
    child.once('close',code=>finish(code!==0));
    child.stdin.end(input===undefined?undefined:`${input}\n`);
  });
}

export async function restrictWindowsJevPipe(path: string) {
  await run(`${prelude}
try {
  $rights=[System.IO.Pipes.PipeAccessRights]([int][System.IO.Pipes.PipeAccessRights]::ReadWrite -bor [int][System.IO.Pipes.PipeAccessRights]::ReadPermissions -bor [int][System.IO.Pipes.PipeAccessRights]::ChangePermissions)
  $pipe=[System.IO.Pipes.NamedPipeClientStream]::new('.', '${pipeName(path)}', $rights, [System.IO.Pipes.PipeOptions]::None, [System.Security.Principal.TokenImpersonationLevel]::Identification, [System.IO.HandleInheritability]::None)
  $pipe.Connect(3000)
  $sid=[System.Security.Principal.WindowsIdentity]::GetCurrent().User
  $security=New-Object System.IO.Pipes.PipeSecurity
  $security.SetAccessRuleProtection($true,$false)
  $security.AddAccessRule([System.IO.Pipes.PipeAccessRule]::new($sid,[System.IO.Pipes.PipeAccessRights]::FullControl,[System.Security.AccessControl.AccessControlType]::Allow))
  $pipe.SetAccessControl($security)
} catch { exit 1 } finally { if($null -ne $pipe){$pipe.Dispose()} }
`);
}

export function exchangeWindowsJevKey(path: string, body: string) {
  return run(`${prelude}
try {
  $pipe=[System.IO.Pipes.NamedPipeClientStream]::new('.', '${pipeName(path)}', [System.IO.Pipes.PipeDirection]::InOut, [System.IO.Pipes.PipeOptions]::None, [System.Security.Principal.TokenImpersonationLevel]::Identification)
  $pipe.Connect(3000)
  $identity=[System.Security.Principal.WindowsIdentity]::GetCurrent()
  $owner=$pipe.GetAccessControl().GetOwner([System.Security.Principal.SecurityIdentifier])
  if($owner.Value -ne $identity.User.Value -and $owner.Value -ne $identity.Owner.Value){throw 'Pipe owner mismatch'}
  # Verify the same handle's owner BEFORE sending any command/key bytes.
  $line=[Console]::In.ReadLine()
  if($null -eq $line -or $line.Length -gt 16384){throw 'Invalid input'}
  $request=[System.Text.Encoding]::UTF8.GetBytes($line+[char]10)
  $pipe.Write($request,0,$request.Length)
  [Array]::Clear($request,0,$request.Length)
  $line=$null
  $reply=New-Object System.Collections.Generic.List[byte]
  while($true){
    $value=$pipe.ReadByte()
    if($value -lt 0){throw 'Unconfirmed response'}
    if($value -eq 10){break}
    if($reply.Count -ge 2048){throw 'Oversized response'}
    $reply.Add([byte]$value)
  }
  [Console]::Out.Write([System.Text.Encoding]::UTF8.GetString($reply.ToArray()))
} catch { exit 1 } finally { if($null -ne $pipe){$pipe.Dispose()} }
`,body);
}
