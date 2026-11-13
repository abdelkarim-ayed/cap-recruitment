# CV extractor — selected direction and launch remainder

2026-11-13: bounded CV/key-control source `82698b8` locally merged into main;
the original transfer/plans are separately preserved in `a35a521`. No push.
The resumed `feat/cv-offline-demo` worktree is built/running with migrations
009/010 and reserved dataset recreation applied. Fixes are separately committed,
not merged/pushed. Current approved new synthetic submissions use real Jev after
user key loading, not canned answers. **No tests or agent live validation.** The
[current contract](../current/contracts/processing-review-api.md) owns exact
implemented wire/persistence/closure behavior; [checkpoint notes](research/cv-extraction-implementation.md)
separate earlier foundation evidence from later unverified integration.

## Selected feature boundary

Private PDF → native Markdown → **one task per configured CV extractor**, with
one hydrated multi-question Jev request → immutable raw/typed result → independent
HR field correction → effective CSV. Existing storage/auth, application leases,
review revisions/readiness, release/completion/screening fences and recruitment
commands remain independent. No extraction-driven ranking or candidate decisions.

The transferred schema/Jinja wording, optional clauses, aliases, IDs, choices and
ordering are the specification. Repeated education/certification/experience/
coverage/evidence families are allowed. String or `{name,aliases}` names retain
directional accepted terms; no automatic symmetric matching, dictionary, extra
questions, awarded-status field or validity checking. Education windows are
relative to first publication; draft question previews are visibly provisional.
Review must not call a window-qualified education level proof of an awarded degree.

First publication freezes the UTC reference date, carried in submission snapshots.
Draft edits, retries, close and processing time do not move it. Legacy development
records are not backdated or converted; recreation requires scoped consent.

Parser and validated-response caches now use private atomic **files**, superseding
the earlier memory choice. Parser identity includes PDF hash/version/options; Jev identity
hashes the actual fully hydrated effective serialized request. Raw distributions,
confidence/model/usage remain unmodified; no thresholds, caps or fabricated
non-mention/zero on failure. Success replay is not another billed observation.
Durable send guards remain separate from caches and are never reset with demo
data. Ambiguous sends/cache loss do not authorize another paid attempt.

## Current real-worker launch and remainder

Start at the [demo launch handoff](cv-demo-launch.md) for the user-manual
submission → native parse → real Jev → correction → CSV route. User explicitly
approved real new-synthetic-submission scope and restart, unchanged controls;
tests remain forbidden. Defaults stay disabled; current `jev` mode has a fixed
submission boundary, post-submit wake + 5s DB scan and serial work. Key-empty mode
makes no claims. Validated responses cache before DB settlement; interrupted
saves can replay locally without another paid send. Unknown send/cache loss never
permits a paid fallback. No current live acceptance/privacy/race pass. Additional
activation needs separate scope under [Jev safeguards](../current/jev-safety.md).

Full T2b service launcher and T1 mail-history/viewer remain unimplemented; a bounded
`demo:setup seed|reset` applies migrations and invokes scoped dataset setup, never
on normal server restart. File mail capture
and the latest-mail CLI exist. Old test/smoke/view fixtures and static OpenAPI
need new-contract alignment; no fresh all-suite, DB/HTTP/privacy/native/race or
Windows/quality pass exists. Existing Q-* gates remain open, not missing features.

No further corpus transfer/research/regeneration is a prerequisite. Highlighting,
OCR, validity, rolling dates, automatic dictionaries, rich numeric/date extraction,
additional families and calibrated quality/evaluation claims remain separately
scoped. Preserve the [frontend baseline](../current/guides/frontend-design.md),
[portable provenance](../../research/cv-extraction-lab/README.md), and unresolved
tool-linkage/date/qualification caveats; selected lab observations are not accuracy.
