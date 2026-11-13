# RAM-only Jev key control

Source implementation in the unmerged CV worktree; **not built, tested or
activated**. Existing running main services are unchanged. No key was read/set,
provider request made or spending counter changed during implementation.

## Start empty, update locally

Each backend process starts with an empty credential holder. `JEV_API_KEY` is
ignored by the gateway: no environment/secret-file fallback. A restart, including
a development watch restart, loses the loaded key. Existing unrelated environment
loading is unchanged; remove an old environment key yourself if desired.

The backend logs its non-secret PID and control command. From the **same checkout
and OS user**, use these commands after separately building/starting the updated
source. Replace `12345` with the actual backend PID:

```sh
pnpm --filter @recruitment/api jev:key status --pid 12345
pnpm --filter @recruitment/api jev:key set --pid 12345
pnpm --filter @recruitment/api jev:key clear --pid 12345
```

`set` opens a hidden terminal prompt. Paste/type the key there, **not into chat,
a shell command, an argument, a file or an environment variable**. Ctrl-C cancels;
Backspace edits and Ctrl-U clears input. No key, suffix, fingerprint or length is
printed. Input is validated only as a bounded header-safe token, not by contacting
Jev; “loaded” does not mean the provider accepted it.

For a trusted program supplying the key through stdin, use `set --pid 12345
--stdin` as the receiving command. The producer must not echo/log/persist it or
put it in its own arguments. One terminal line ending is accepted; embedded
newlines/whitespace, empty or oversized input are rejected. No key is intentionally
written to disk. Do not pipe a literal key from a command saved in shell history.

## Rotation semantics

- Updates replace only this process's in-memory credential, not model/endpoint,
  admission limits, Redis namespace, counters, caches or request-attempt guards.
- A request captures its key once before gateway admission. Already-started
  requests keep that capture; subsequent requests use the replacement. Clearing
  blocks future sends; it is not a billing cancellation guarantee.
- Setting a key does not enable reader/executor/runner, enqueue work, retry
  failed tasks, reset a stopped invocation or perform a provider probe.
- Status exposes configured/empty, process instance and local revision only.
  Set/clear compare the instance/revision observed before prompting, refusing a
  competing update or process restart. Unknown acknowledgements are never retried
  automatically: inspect status and choose deliberately.
- Actual credential creation/revocation is still performed through the provider.
  Allow admitted requests to settle before revoking the old credential if needed.

The explicit live processing CLI is a **different process**, with its own empty
holder/PID. Once all existing selection/synthetic-consent gates pass, it waits up
to two minutes for local loading before any application claim/provider admission.
Loading its key lets that already-requested invocation continue; it does not
authorize a paid run. Loading the API server's key does not populate CLI workers.
Automatic live background processing remains refused.

## Local transport and security limits

No HTTP or TCP credential endpoint, ZeroMQ dependency or additional service.
Node `net` carries one bounded command/reply per local connection:

- Unix: per-project/user temporary directory, verified owner/mode `0700`, socket
  mode `0600`, PID-specific address. CLI verifies ownership/type/mode before
  sending. The socket inode is not a file containing the key. No automatic stale
  socket removal; startup refuses unsafe permissions or an occupied address.
- Windows: PID-specific local named pipe. Stock Windows PowerShell/.NET applies
  a current-user-only pipe DACL before command acceptance. The Windows CLI helper
  verifies the same pipe handle's owner before sending the command. Key bytes
  travel through stdin, never PowerShell arguments/environment/files. The helper
  is bounded and emits only the restricted control reply. Missing ACL support,
  owner mismatch or helper failure fails closed—no TCP/unchecked-pipe fallback.
  Windows behavior has **not been runtime-verified**; use the same user/elevation.

Connection count, message/reply size and lifetime are bounded. Malformed input,
parser errors and input values are never logged/reflected. Shutdown clears the
holder and closes only the process's own control listener/connections.

This trusts processes running under the same OS account and privileged OS
administrators. RAM-only is not protection from debuggers, dumps, swap, clipboard
history or forced OS logging; JavaScript strings cannot guarantee secure erasure.
No agent/global secret-access restrictions were changed. Do not supply real keys
to agent tools. Existing [Jev safeguards](../jev-safety.md) still apply.
