# Shared RMUX terminals

Use the user's existing RMUX session for persistent development terminals. Prefer separate tabs/windows, not split panes. User and agent can inspect the same terminals; the agent need not own the attached client.

Prefer normal shell execution for routine commands, installs and checks. Use RMUX mainly to launch persistent processes, monitor them later (including after dependency changes), or show work the user should inspect.

## User quick reference

Start in another terminal:
```sh
rmux new-session -s recruitment -n home -c /home/ubuntu/code
```
Reconnect after detaching: `rmux attach-session -t recruitment`.
Give the agent the session name or `rmux display-message -p '#{session_id} #{session_name}'` output, plus any custom `-L`/`-S` socket. Session/window/pane IDs must be rediscovered after server restarts.

Verified bindings: press **Ctrl+B**, release, then:
- `c`: new tab/window.
- `,`: rename current tab.
- `n` / `p`: next / previous tab.
- `0`–`9`: select tab by index.
- `w`: window/session chooser.
- `d`: detach without stopping running processes.

Enable mouse for this session only: `rmux set-option -t recruitment mouse on`. Click bottom status-bar tab names to switch. This session option was enabled during the demo; it is not global/persistent configuration. Reapply after recreating the session. RMUX preserves terminals across client disconnects, not machine reboots.

## Agent workflow

1. Discover with `rmux list-sessions` and `rmux list-windows -t recruitment -F '#{window_id} #{window_name} panes=#{window_panes}'`; inspect targets before sending input. Use `list-panes` for exact terminal IDs.
2. State the target and intended action before sending commands. Prefer existing user-started tabs. Only create/stop/reset terminals when authorized. Never send Ctrl-C or terminate processes without approval.
3. When authorized, create a detached tab without stealing focus:
   `rmux new-window -d -t recruitment -n api -c /home/ubuntu/code -P -F '#{window_id} #{pane_id}'`.
4. Send a command literally with `rmux send-keys -t '%ID' -l 'COMMAND'`, then `rmux send-keys -t '%ID' Enter`. Target IDs are examples, not persistent constants. Avoid typing into a busy foreground process unintentionally.
5. Do not use `pane-snapshot`: user requested low-token output. Prefer health checks or bounded plain text: `rmux capture-pane -p -t recruitment:web.0 -S -20 | sed '/^[[:space:]]*$/d' | tail -n 8`. This is screen/scrollback text, not append-only stdout. `stream-pane --lines` offers incremental streaming; no resumable cursor verified. Check `--help` before using streams/waits, bound output/time, and ask the user to paste output if needed. User authorizes clearing unrelated **RMUX tab scrollback**, not Bash/shell command history, when useful to start focused debugging; preserve relevant diagnostics and announce the target/action. Do not expose credentials or sensitive terminal output.
6. Leave infrastructure/API/web tabs alive while editing. Do not start extraction processing unless explicitly requested; current processing is manual.

Development tabs use names `api`, `web`, and optionally `inbox-retention`. Target by `recruitment:api.0` rather than hardcoding runtime IDs. The retention tab runs `pnpm --filter @recruitment/api inbox:cleanup --watch` (notification rows only); it is not an extraction worker or reminder scheduler. User authorizes management/restarts of agent-launched dev processes; their `home` tab remains untouched.

Verified demo: two separate UUID/hash tabs received commands and their results were read back through snapshots. Both temporary tabs were removed at the user's request; `home` was preserved. No app processes were started during this demonstration.
