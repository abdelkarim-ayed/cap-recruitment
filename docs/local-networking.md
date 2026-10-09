# Local networking: host mode

## Current decision
User selects explicit `network_mode: host` after repeated rootless bridge failures in the LXC development container. Do not retry bridge/pasta or rebuild the host during ordinary project work.

Use `podman compose`, with the newer `.local/bin/podman-compose` provider. All services bind localhost and choose uncommon actual listening ports; no Compose `ports:` mappings:
- PostgreSQL: 55437
- Redis: 56379
- SMTP: 51025
- Mailpit UI: 58025

Host-run and host-networked container clients use `127.0.0.1:<port>`. There is no service-name DNS in this mode. Network isolation is reduced; this remains development configuration, not production deployment guidance.

## Reset and persistence verification
User explicitly authorized `podman system reset --force`; executed successfully. It removed this user's prior Podman containers/images/networks/volumes. No host rebuild, system package installation, or global config change.

Standalone test `/tmp/opencode/redis-volume-probe.py` (not Compose): Redis with host networking, localhost port 58961, named volume, AOF. Wrote a key, stopped/removed the container, created a fresh container on the same volume, and read the original value successfully. Only that test's container/volume were cleaned afterward. A system reset deletes volumes; ordinary container removal does not.

Actual recruitment stack started successfully with `podman compose`. Inspection confirms all three services use host networking. `pnpm infra:check` verifies PostgreSQL/Redis connectivity plus Mailpit HTTP and SMTP. Containers remain running; no further reset is authorized implicitly.

## Historical diagnosis
Compose normally places services on a shared bridge and supports container-to-container names. This host-mode choice is not a claim that rootless DNS is impossible. The current environment failed bridge startup with missing slirp4netns and stale/missing rootless runtime state. Saved history suggests it worked previously. Further recovery is deferred.
