# Safety and tool ceilings

Persona leaves are users, not reviewers. Their tool allowlist contains only the adapter's named application entrypoint tools. They receive no source-reader, editor, tracker, issue-writer, or generic filesystem authority. A shell-backed CLI or HTTP entrypoint MUST be a predeclared command/URL in `entrypoints`; the leaf cannot use the shell as a second way to browse source or reach a tracker.

The adapter MUST enforce these ceilings, not rely on persona prose:

- `source_read: false`, `tracker_read: false`, and `issue_write: false` are required by `persona.v1`.
- A leaf may act only on `entrypoint_ids` present in the run input and marked `real: true`.
- A leaf records runtime evidence and returns control; it cannot create, edit, close, or comment on tracker items.
- A fresh RCA leaf starts only after the harness root confirms a reproduction. RCA is read-only and cannot broaden the entrypoint set or mutate app/tracker state.
- Coordinators have no application, tracker, or file mutation authority; they may dispatch only the adapter-approved persona/planning leaves and return evidence to the root.
- The harness root owns the one serialized tracker writer, which alone may query, create, or read back tracker issues. No coordinator, persona, or RCA leaf may call those operations.
- Credentials remain in the harness or credential broker. Input, evidence, and reports contain references and identifiers, never secret values.

If a tool or entrypoint cannot enforce one of these boundaries, stop the run and report a blocked safety condition rather than silently widening authority.
