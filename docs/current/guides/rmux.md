# Shared RMUX terminals — operator guide

Combined with the user's `~/rmux.md` guidance on 2026-11-07. Use normal shell execution for builds, migrations, seeds and short checks. Use RMUX for persistent/user-visible services, one named window per process, no splits. Terminal captures are screen snapshots, not command-scoped stdout.

## Shared session and services

Discover `rmux list-sessions` first; reuse the shared **`workspace`** session. Create it only when absent:

```sh
rmux new-session -d -s workspace -n home -c /home/ubuntu/code
rmux attach-session -t workspace
```

On 2026-11-07 the authorized demo launch created `workspace:backend` and `workspace:frontend`, both in `/home/ubuntu/code`. `home` is left untouched. These names are the launch observation, not proof the services are still running later. Redis/PostgreSQL/Mailpit run in existing host-network Podman containers with volumes preserved; they are not extraction workers.

The backend command is `NODE_ENV=development MAIL_DRIVER=file EXTRACTION_DRIVER=disabled PROCESSING_READER=disabled PROCESSING_EXECUTOR=disabled pnpm --filter @recruitment/api start`. The frontend command is `pnpm --filter @recruitment/web exec vite --host 127.0.0.1`. No processing/retention runner is launched. Keep the services alive after the task.

## Agent workflow

1. Discover windows with `rmux list-windows -t workspace -F '#{window_id} #{window_name} panes=#{window_panes}'` and exact targets with `rmux list-panes -a -F '#{session_name}:#{window_name} #{pane_id} #{pane_current_command}'`. IDs change after server restarts. Inspect targets before sending input; never type a command into a busy foreground process.
2. Announce the target/action. When authorized, create a detached tab without stealing focus: `rmux new-window -d -t workspace -n backend -c /home/ubuntu/code -P -F '#{window_id} #{pane_id}'`. Send literally with `rmux send-keys -t workspace:backend -l 'COMMAND'`, then `rmux send-keys -t workspace:backend Enter`.
3. Prefer specific HTTP readiness checks over terminal captures: backend `http://127.0.0.1:3000/api/health/ready`, proxied backend `http://127.0.0.1:5173/api/health/ready`, frontend `http://127.0.0.1:5173/`. Launching a command is not proof it is ready. Do not start duplicates.
4. For terminal waits consult `rmux wait-pane --help`. Use one condition, e.g. `rmux wait-pane -t workspace:frontend --text 'Local:' --timeout 30s --json`. **`--quiet` is itself a wait condition**, not a silent-output modifier; do not combine it with `--text`. Wrapped text can make a startup-text wait time out even when HTTP readiness succeeds.
5. If needed, bounded plain text only: `rmux capture-pane -p -t workspace:backend -S -10 | tail -n 12`. No full scrollback, ANSI-preserving capture or `pane-snapshot`. Never expose credentials/cookies/codes. Preserve relevant diagnostics; only unrelated RMUX scrollback may be cleared, never shell history.
6. Do not stop/reset sessions or send Ctrl-C without approval, except authorized management of agent-launched dev processes. Preserve user windows. Do not launch extraction/retention runners merely because API/web are running. A future launcher remains a separate task.

## User controls

Attach with `rmux attach-session -t workspace`. Press **Ctrl+B**, release, then `n`/`p` to switch tabs, `w` for the chooser, or `d` to detach without stopping services. `c` creates a tab and `,` renames it. Optional session-only mouse support: `rmux set-option -t workspace mouse on`; no global configuration is required. RMUX survives disconnects, not machine reboots.
