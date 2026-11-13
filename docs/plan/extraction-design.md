# CV extractor — selected direction and launch remainder

2026-11-13: bounded CV/key-control source `82698b8` locally merged into main;
the original transfer/plans are separately preserved in `a35a521`. No push.
**Final source is unbuilt/untested by instruction, not deployed or live-validated.**
Migrations 009/010 and legacy dataset recreation have not run. The
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

Parser and validated-response caches are bounded **in memory**, not filesystem/
durable caches. Parser identity includes PDF hash/version/options; Jev identity
hashes the actual fully hydrated effective serialized request. Raw distributions,
confidence/model/usage remain unmodified; no thresholds, caps or fabricated
non-mention/zero on failure. Success replay is not another billed observation.
Durable send guards, unlike caches, survive restart and are never reset with demo
data. Ambiguous sends/cache loss do not authorize another paid attempt.

## Next discussion, not automatic implementation/execution

Start at the [demo launch handoff](cv-demo-launch.md): agree a bounded build,
current-schema fixture dataset/data scope and named-service startup before one
user-manual fixture → correction → CSV demonstration. The user stopped tests;
neither a merge nor this plan authorizes them or any data/process/provider action.
Automatic runner supports trusted fixtures only and stays disabled by default.
Live activation requires separate consent and operational/safety resolution under
[Jev safeguards](../current/jev-safety.md). RAM-only key loading is not spending
permission and does not enable extraction or reset counters.

T2b launcher and T1 mail-history/viewer remain unimplemented; file mail capture
and the latest-mail CLI exist. Old test/smoke/view fixtures and static OpenAPI
need new-contract alignment; no fresh all-suite, DB/HTTP/privacy/native/race or
Windows/quality pass exists. Existing Q-* gates remain open, not missing features.

No further corpus transfer/research/regeneration is a prerequisite. Highlighting,
OCR, validity, rolling dates, automatic dictionaries, rich numeric/date extraction,
additional families and calibrated quality/evaluation claims remain separately
scoped. Preserve the [frontend baseline](../current/guides/frontend-design.md),
[portable provenance](../../research/cv-extraction-lab/README.md), and unresolved
tool-linkage/date/qualification caveats; selected lab observations are not accuracy.
