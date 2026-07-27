---
name: qa-users
description: Run bounded persona-driven QA sessions against real application entrypoints, preserve evidence and strengths, deduplicate tracker findings, and serialize actionable issue creation.
---

# qa-users

`qa-users` is a portable Pi/OMP skill. It is one canonical skill consumed by OMP and Nen; consumer adapters link to these bytes and add only harness role/routing declarations.

## Contract

The coordinator MUST validate and freeze [`input.v1`](references/input.schema.json) before dispatch. Semantic validation MUST use [`input-semantic.mjs`](references/input-semantic.mjs) and its [`input-semantic-fixtures.v1`](references/input-semantic-fixtures.json) contract to reject duplicate `personas[].id` values, duplicate `entrypoints[].id` values, undeclared `execution_overrides.entrypoints` values, invalid defined override entrypoint lists, and any persona `entrypoint_ids` value that is not an exact member of the effective entrypoint ID set after `execution_overrides.entrypoints` is applied; JSON Schema cannot express those object-ID and cross-array membership rules. Before emitting any report, output semantic validation MUST use [`output-semantic.mjs`](references/output-semantic.mjs) and its fixtures to require exactly one report for every selected input persona, with no missing, wrong, or duplicate `persona_id`; JSON Schema cannot express this cross-document equality. The input supports 1..N personas and explicit `harness`, `provider`, `model`, `reasoning`, `concurrency`, `session_length_seconds`, `seed`, named real `entrypoints`, `issue_threshold`, `maximum_creates`, and a selected [`tracker.v1`](references/tracker.schema.json) adapter. Persona definitions are strict [`persona.v1`](references/persona.schema.json); reports are strict [`output.v1`](references/output.schema.json).

Every report MUST include the effective execution overrides, including values inherited from a harness default. Overrides are not implicit: list each resolved harness, provider, model, reasoning, concurrency, session length, seed, entrypoint set, threshold, create ceiling, and selected tracker in `execution_overrides`; require a structured `execution_overrides.provenance.<field>.source` for every field, with `cli` taking precedence over `input`, and `input` over `harness-default`.

## Run lifecycle

Follow [`references/lifecycle.md`](references/lifecycle.md) in order. The cheapest valid invocation contract is:

```text
<harness> qa-users --input <run-input.json> --dry-run
```

The input and mode precedence, dry-run guarantees, effective overrides, and threshold rules are normative in [`execution-overrides.md`](references/execution-overrides.md). Adapters call the exported `@misty-step/qa-users/input-semantic` validator once and consume its complete `execution_overrides` result; they do not recreate or separately resolve these rules.

## User leaves

Dispatch one user leaf per configured persona, bounded by `concurrency` and `session_length_seconds`. A leaf uses only the assigned, predeclared application entrypoints. It may use a browser, CLI, HTTP, desktop, MCP, or other entrypoint only when that surface is explicitly named and marked `real: true` in the input. It cannot read product source, read tracker state, file issues, edit source, or invent an entrypoint. The adapter enforces the ceiling described in [`references/safety.md`](references/safety.md); persona prose is not an authority grant.

Each leaf returns runtime evidence, the user steps taken, and any strengths or friction. Every accepted finding records the `affected_entrypoint`, expected behavior, observed behavior, evidence, severity/confidence, category, and a root cause only when runtime evidence directly establishes it. A candidate finding enters triage only after confirmed reproduction. A fresh RCA leaf may start only after that confirmation and is read-only. A failed persona status MUST include `failure_reason`.

## Triage and tracker writes

The harness root alone applies triage and suppression. It keeps strengths and suppressed friction in the final report, suppressing observations that are unconfirmed, non-actionable, below threshold, unsafe to write, or over the create ceiling, with the reason preserved.

Exactly one serialized harness-root tracker writer may invoke the selected adapter. It exhaustively scans every tracker page/cursor with no bounded result mode, blocks on ambiguous or truncated results, deduplicates by the canonical SHA-256 finding fingerprint from [`finding-fingerprint.mjs`](references/finding-fingerprint.mjs) and required `affected_entrypoint`, files only actionable evidence-backed findings, respects `maximum_creates`, and reads every created issue back. Accepted and deduplicated findings MUST carry `tracker_issue_id` after filing or deduplication. Follow [`references/tracker.md`](references/tracker.md). Persona, RCA, and coordinator leaves never call tracker operations or apply triage.

`fix-and-pr` is optional and separate. It requires explicit authorization, runs only after issue filing and read-back, and has `inside_user_session: false`. It is never a user-session action.

## Harness adapters

Read [`adapters/omp.md`](references/adapters/omp.md) when loading this skill in OMP and [`adapters/nen.md`](references/adapters/nen.md) when loading it in Nen. The adapters define the coordinator/root authority, user-leaf tool ceilings, blocked unsupported surfaces, and depth limits without copying or changing this skill.
