# UI/UX follow-ups and implementation boundaries

The implemented overhaul's decisions live in the **[durable frontend design baseline](../current/guides/frontend-design.md)**. Read it before changing existing screens; it replaces the earlier competing examples/proposals as current guidance. Keep API rules in [current contracts](../current/README.md), verification on the [task board](tasks.md), and dated evidence in [status](../current/status.md). Do not append a chronological implementation diary to the style guide or reopen settled choices as unspecified design.

## Implemented decisions to preserve

| Area | Current source of truth |
| --- | --- |
| Entity/role/intent layout, native navigation, concise HR copy, restrained state/metadata, labelled icons and focused dialogs | [Design baseline](../current/guides/frontend-design.md#design-and-interaction-rules) |
| Vacancy title-first lists, My drafts/owner filters, owner draft editing versus readable inspection, saved-plan publication and close confirmations | [Vacancy contract](../current/contracts/vacancy-api.md) |
| Information-first applications, independent Work to do / Recruitment status, source PDF beside per-field review, explicit completion/release and recruitment dialogs | [Application contract](../current/contracts/application-api.md), [review](../current/contracts/processing-review-api.md), [interviews](../current/contracts/interview-api.md) |
| Candidate summary → checked separate apply entry, existing-submission navigation and safe public outcomes | [Candidate access](../current/contracts/candidate-access.md), [public statuses](../current/contracts/application-api.md#candidate-public-status) |
| Browser-local displayed times; Monday-first Upcoming / Past / Cancelled with movement at start, Past-only awaiting feedback | [Agenda contract](../current/contracts/agenda-navigation.md) |
| Account/role-scoped session filter/sort/page memory, no elaborate history or persisted editor drafts | [List preferences](../current/guides/frontend-design.md#list-filter-memory) |
| Compact effective-result decision file, authenticated links, explicit duplicate resolution, barred/grey errors/exclusions and file-error/final-confirmation dialogs | [Screening contract](../current/contracts/screening-api.md); [original CSV feedback](hr-export-import-ux.md) is context, not a competing spec |
| Human form/automation wording, secondary technical settings, fixed read-only account email in builder/preview/intake | [Form authoring](../current/guides/frontend-design.md#decision-files-and-form-authoring) |

## Remaining bounded work

- **Consistency feedback/manual review:** the approved source-review slice addresses plan inspect/edit separation, scope headings, topbar-only Inbox, navigation/status labels, readable submitted choices, validation/retry copy and grouped import ambiguity. Review remaining labels/icons/contacts/spacing/ownership/read-state cues in actual use; preserve useful failures/unknowns/fixture provenance. Examples guide scanability, not a mechanical checklist or permission to rewrite every surface.
- **UX-NAV reproduction:** the reported missing interview sidebar item still needs actor/session/discoverability confirmation; source already has eligible-staff navigation. Do not invent a new permission or candidate appointment projection.
- **Manual UX and regression catch-up:** narrow/responsive layouts, native dialog focus/inertness/Escape, dirty/pending/conflict navigation, account isolation, local-time/DST boundaries, real list/count parity and decision CSV round trips. Older DOM fixtures need adaptation. Source/build evidence is not a passed native/authenticated/race gate.
- **Separate product work, not incidental polish:** broader candidate appointment/timeline/notification effects, Inbox counts/hide/retention, background polling and AI quotations/evidence/template expansion remain separately scoped. No new provider execution or fabricated past events.

## Working boundaries

Choose a bounded approved slice on the [board](tasks.md). Inspect entity, actor, primary action, related navigation, secondary details and confirmation boundaries before editing. Preserve server privacy/authority, immutable submissions/results, independent state dimensions, separate revision checks, no-op attribution, explicit saves/confirmations and refresh after unknown/conflicting writes. Screening must not become review-gated.

Retain React/Vite/hash routing/local components; no framework/platform migration is selected. No browser automation/screenshots, data reset, live-provider/spending changes or worker/retention runner follows from UI work. Prefer scoped builds/static/offline checks during churn; native UI is checked manually by the user.

Keep the UI work in its existing separate worktree. **Local commits are authorized; do not merge to main or push until the user explicitly authorizes that step.** Preserve unfamiliar changes and leave preview services alive; rediscover RMUX/listeners before managing agent-launched services.
