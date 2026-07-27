# Nen adapter

Nen consumes the canonical `skills/qa-users/` directory through `nen/skills/qa-users` and must not copy or fork its files.

- Coordinator: `agents/qa-users-coordinator.md` consumes a scoped root artifact containing validated input, semantic resolution, and schemas; it plans app-user leaves and returns raw plan/evidence to the Nen root without tracker state mutation. Before report emission, the Nen root MUST run [`output-semantic.mjs`](../output-semantic.mjs) against the resolved input and output so every selected input persona appears exactly once by `persona_id`; JSON Schema cannot express this cross-document equality.
- App-user leaf: no live Nen persona leaf is enabled yet. `agents/qa-user.md` is a blocked planning role with no application, filesystem, tracker, issue, or child tools; it reports unsupported execution rather than widening authority.
- Authority: the Nen root owns RCA, triage, suppression, and the serialized Powder tracker writer and must perform exhaustive cursor/page query, canonical fingerprint deduplication, creation, and read-back itself after planned/persona evidence is available. The coordinator and blocked app-user do not receive tracker tools.
- Fresh RCA: a read-only `nen.scout` child may start only after the root confirms a reproduction. RCA cannot mutate application or tracker state.
- Depth: Nen root -> `qa-users-coordinator` -> `qa-user` planning leaf; the root may separately dispatch `nen.scout` for RCA. Neither branch may dispatch deeper.
- Unsupported entrypoints: browser, CLI, HTTP, desktop, MCP, and other live surfaces are planned and reported blocked until Nen supplies an application-specific constrained tool. No raw `bash` fallback is permitted.
- Handoff: `fix-and-pr` requires explicit authorization and a post-filing read-back issue ID; it never runs inside a user session.

Nen role declarations keep the coordinator and blocked app-user tool envelopes explicit. Execution overrides are recorded in `output.v1`, not inferred from role defaults.
- Resolution: the Nen root MUST call `@misty-step/qa-users/input-semantic` `validateInputSemantics(input, { cli, harnessDefaults })` once, then pass its returned `execution_overrides`, effective entrypoints, and threshold into the coordinator artifact. CLI and harness-default objects use the output-field namespace, including `selected_tracker`; no second resolver call or aliasing is allowed.
