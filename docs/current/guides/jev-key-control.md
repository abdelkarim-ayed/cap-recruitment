# RAM-only Jev key control

The API has one owner-restricted **stable backend socket/pipe**, acquired by root
bootstrap before workers initialize. It is also the single-instance lock across
checkouts/HTTP ports. An occupied/stale address refuses startup; no automatic
unlinking, PID stealing, TCP credential route or key persistence.

## Commands

Use the built CLI directly, avoiding recursive package-name selection. Current
checkout (works from any directory as the same OS user):

```sh
node /home/ubuntu/cv-offline-demo/apps/api/dist/integrations/jev/jev-key-cli.js status
node /home/ubuntu/cv-offline-demo/apps/api/dist/integrations/jev/jev-key-cli.js set
node /home/ubuntu/cv-offline-demo/apps/api/dist/integrations/jev/jev-key-cli.js clear
```

No PID is required for the one backend. Optional `--pid PID` checks the expected
backend PID before prompting/updating. Non-HTTP explicit processing CLI workers
retain separate PID-specific controls: use `--worker-pid PID` for those, from
their checkout. An API key is not shared with separate CLI workers.

`set` opens a hidden prompt. Never place a key in chat, arguments, files, shell
history or an environment variable. Ctrl-C cancels, Backspace edits, Ctrl-U clears.
No key/fingerprint/length is printed. A trusted nonlogging producer can use
`set --stdin`; this is not permission to pipe a literal key saved in history.
All success/status replies expose PID, instance, revision and loaded/empty only.
The same observed instance/revision fences updates across races/restarts.

## Semantics and safety

- Every process starts empty, including after development watch restarts.
  Gateway ignores `JEV_API_KEY`; no secret-file/environment fallback.
- Rotation changes only RAM credentials. An admitted request keeps its captured
  key; later requests use the replacement. Clear is not billing cancellation.
- No provider probe, mode change, limit change, cache/ledger/counter reset or
  automatic retry is caused by the control command.
- **If live mode was explicitly enabled**, the periodic worker can process its
  already-authorized cohort once a key is loaded. Setting a key is then sufficient
  to unblock those submissions, not a separate authorization for arbitrary work.
- Unknown control acknowledgements are not retried automatically. Inspect status
  and choose deliberately. Provider key creation/revocation remains outside this
  tool; never supply real keys to agent tools.

Unix directory/socket modes are verified 0700/0600 with current-user ownership.
Windows uses a local named pipe, current-user DACL before command acceptance and
same-handle owner verification in the helper; no unchecked/TCP fallback. Windows
is source-only/unverified. Both API and worker controls use bounded messages,
connections and timeouts, without payload/parser logging. Graceful shutdown clears
credentials and closes its own listener. Hard crashes can leave stale state;
cleanup needs an explicit operator decision after checking live processes.

RAM-only does not defeat same-user debuggers, privileged administrators, dumps,
swap or clipboard history; JavaScript strings cannot promise secure erasure.
No global secret-access restrictions changed. [Jev safeguards](../jev-safety.md)
and [launch scope/PID](../../../LAUNCH.md) remain authoritative. No real rotation
or provider verification was performed by the agent.
