# @misty-step/qa-users

MIT-licensed, Pi/OMP-compatible `qa-users` skill for exercising applications as configurable persona users. The canonical bytes live in `skills/qa-users/`; consumer harnesses link to that directory instead of copying it.

## Dry-run contract

A harness adapter invokes the skill with a versioned input document and an explicit dry-run flag:

```text
<harness> qa-users --input <run-input.json> --dry-run
```

The input document MUST satisfy [`input.schema.json`](skills/qa-users/references/input.schema.json). A dry run resolves personas, the effective entrypoint set, execution overrides, tracker selection, and ceilings without opening an application or writing tracker state. It emits [`output.schema.json`](skills/qa-users/references/output.schema.json) with `dry_run: true`, `phase: "planned"`, no findings/strengths/suppressed friction, zero tracker pages/creates/read-backs, and every persona `status: "planned"` with `evidence_count: 0`.

CLI flags outrank input fields; input fields outrank harness defaults. `--dry-run` wins over input `dry_run: false`, and conflicting mode flags are rejected. The winning source for every effective override is retained in `execution_overrides.provenance`. The normative resolution rules are in [`execution-overrides.md`](skills/qa-users/references/execution-overrides.md); adapters call `validateInputSemantics` once and consume its complete result.

A normal run uses the same command without `--dry-run`; lifecycle, safety, and tracker rules are in [`SKILL.md`](skills/qa-users/SKILL.md). OMP and Nen adapter notes are in [`adapters/omp.md`](skills/qa-users/references/adapters/omp.md) and [`adapters/nen.md`](skills/qa-users/references/adapters/nen.md).

## Integrity

`npm test` runs `scripts/check-integrity.mjs`, which uses AJV to validate golden input and dry-run/executed output documents against the versioned schemas, then runs semantic and fingerprint fixtures. It does not open an application or write tracker state.
