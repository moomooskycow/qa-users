# OMP adapter

OMP consumes the canonical `skills/qa-users/` directory through `global/skills/qa-users` and must not copy or fork its files.

- Coordinator: `global/agents/qa-user.md` is non-writing, non-tracker-writing, and has no raw read authority. The OMP root supplies a scoped artifact containing the validated input, semantic resolution, and schemas; the coordinator dispatches dedicated browser-only persona leaves and returns raw evidence to the OMP root. Before report emission, the root MUST run [`output-semantic.mjs`](../output-semantic.mjs) against the resolved input and output so every selected input persona appears exactly once by `persona_id`; JSON Schema cannot express this cross-document equality.
- User leaf: `global/agents/qa-user-leaf.md` is the only `qa-users` persona leaf. It has browser authority only, uses only predeclared real browser entrypoints, and cannot access source, filesystem, tracker, issue, edit, write, bash, grep, read, or child tools. Existing `global/agents/qa.md` remains a general verifier and is not reused for persona sessions.
- Authority: the OMP root owns RCA, triage, suppression, and the serialized tracker writer. It alone performs exhaustive Powder query, deduplication, issue creation, and read-back after persona/coordinator evidence is complete.
- Depth: OMP root -> `qa-user` coordinator -> `qa-user-leaf`. RCA, if required, is a separate root-controlled read-only handoff after confirmed reproduction; a persona leaf never starts RCA.
- Unsupported entrypoints: browser is the only live OMP persona surface in this adapter. CLI, HTTP, desktop, MCP, and other kinds are planned and reported as blocked until an application-specific constrained leaf exists.
- Handoff: `fix-and-pr` is a separately authorized post-filing handoff and never runs inside a user session.

The coordinator's adapter-level tool ceiling is exactly `none`; the OMP root artifact is its only input and its declared spawn mechanism dispatches `qa-user-leaf` without granting raw read or tracker tools. The browser-only leaf has exactly `browser`.
- Resolution: the OMP root MUST call `@misty-step/qa-users/input-semantic` `validateInputSemantics(input, { cli, harnessDefaults })` once, then pass its returned `execution_overrides`, effective entrypoints, and threshold into the coordinator artifact. CLI and harness-default objects use the output-field namespace, including `selected_tracker`; no second resolver call or aliasing is allowed.
