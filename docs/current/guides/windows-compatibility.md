# Windows portability notes

Source/dependency review, **not a Windows test report**. Current workflow was exercised on Linux; Windows setup and native tests remain unverified. No infrastructure/configuration changes are made by this note.

## Application and development

| Workflow | Expected Windows situation |
|---|---|
| React/Vite, NestJS, domain, migrations, seeds, mock processing, inbox cleanup | Node/TypeScript tooling is generally portable. Use Node **24** and pnpm **12.9.0**; reachable PostgreSQL/Redis and writable storage are prerequisites. Native execution still needs testing. |
| Browser use, CSV/PDF downloads, presentation PDF viewing | No Linux requirement for the client PC; API/web can run on another machine. Native file dialogs/PDF viewers vary by browser. |
| `pnpm build`, `typecheck`, tests | Build/typecheck are expected to be portable. The document-storage unit test falls back to the system temp directory when `/tmp/opencode` is absent. Applications/interviews smoke checks still hard-code that path; permission/symlink assertions also need native Windows review. The test suite is **not native-Windows-ready as written**. |
| Shell examples and RMUX | `MAIL_DRIVER=file command`, Bash captures and RMUX are Linux/operator conveniences, not application requirements. Use separate PowerShell terminals; set variables as below. WSL can provide a Linux shell, but does not alone validate networking. |

PowerShell example, from the repository root, after normal environment/infrastructure setup:
```powershell
pnpm install --frozen-lockfile
pnpm build
$env:MAIL_DRIVER = 'file'
pnpm --filter @recruitment/api start
```
In another terminal: `pnpm --filter @recruitment/web exec vite --host 127.0.0.1`. Keep `http://localhost:5173` consistent for sessions/Origin. File-mail mode replaces SMTP only; PostgreSQL/Redis are still required. Keep `.env` private, use real secrets outside the demo, and preserve documents alongside database data.

## Infrastructure: the main difference

- Windows can use **Podman Desktop**, a running Podman machine (WSL2 or Hyper-V) and a Compose provider. Desktop installation alone is insufficient. The infra wrapper invokes `podman compose`; it is not a Docker CLI wrapper.
- Current `compose.yaml` uses **host networking**, with services bound to `127.0.0.1` and **no published ports**. This is the approved Linux/LXC workaround. Under Podman on Windows, “host” refers to the Linux VM, not automatically the Windows PC; the native API cannot assume those ports are reachable at Windows localhost.
- A Windows setup needs a separately agreed/tested networking arrangement: application/infrastructure in a reachable Linux environment, or a dedicated Compose configuration with loopback port forwarding and suitable container listener addresses. Simply adding `ports:` to the host-network file is not a solution. No Windows override has been implemented.
- Verify connectivity before migrations/demo: PostgreSQL **55437**, Redis **56379**, SMTP **51025**, Mailpit UI **58025**. Do not change/reset the existing Linux host setup to accommodate a different PC.

See [local-networking.md](local-networking.md) and [Podman Desktop Windows installation](https://podman-desktop.io/docs/installation/windows-install).

## Presentation and optional authoring tools

- **PDF generation**: install official **Typst 0.15.1 for Windows**, not the ignored Linux binary. Put `typst.exe` on PATH or set `$env:TYPST_BIN = 'C:\path\to\typst.exe'`, then run `pnpm --filter @recruitment/presentation pdf:build`. Existing wrapper supports this override.
- **Fonts**: the deck/diagrams use Liberation Sans, available here but not guaranteed on Windows. Supply the same fonts to Typst (font directory via `TYPST_FONT_PATHS`) or intentionally choose an available font and recheck pagination/layout. PDF viewers do not need the authoring toolchain.
- **Diagrams/Reveal**: Mermaid/jsdom, Graphviz **WASM** (`@viz-js/viz`) and Vite are local npm development tools. No system Graphviz, Java or Linux browser required for the current SVG/PDF build. Native Windows build/layout remains untested.
- **Synthetic CV generation**: Python 3.12+ and optional RenderCV 2.8 authoring environment. Windows virtualenv uses `Scripts`, not `bin`; set `RENDERCV_BIN` to its `rendercv.exe`. Unix `chmod` in the generator/storage is not an equivalent Windows privacy boundary—use appropriate NTFS permissions and verify storage behaviour. These tools are not required just to view the app/PDF.
- `.local/`, generated `dist/`, secrets and temporary files are not committed; install tools/dependencies afresh. Source scripts, diagram definitions, images and metadata are tracked.

Typst: [official release](https://github.com/typst/typst/releases/tag/v0.15.1). Operational details: [demo-guide.md](demo-guide.md), [presentation README](../../../presentation/README.md). Before claiming Windows support, run a native checkpoint covering build/tests, infra connectivity, auth/upload/private files, persistence and PDF layout.
