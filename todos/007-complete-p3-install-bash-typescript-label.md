---
status: pending
priority: p3
issue_id: 007
tags: [code-review, docs, quality]
dependencies: []
---

# Installation TypeScript tab uses `bash` highlighting

## Problem Statement

In `installation.md` the TypeScript install tab is fenced as ```` ```bash [TypeScript] ````
— a shell `npm install` command highlighted as bash but labelled TypeScript.
Likely intentional (the install step is a shell command, grouped under the
TypeScript ecosystem tab), but flagged for consistency.

## Findings

- `docs/building-a-node-with-ldk/installation.md`, installation code-group:
  ```` ```bash [TypeScript] ````
  `npm install lightningdevkit@{VERSION}`
- The other install tabs use ecosystem-appropriate languages (`toml [Rust]`,
  `java [Kotlin]`).

## Proposed Solutions

### Option A: Leave as-is (likely correct)

`npm install` is a shell command; bash highlighting is accurate, and the tab
label correctly groups it under TypeScript. **Effort:** none.

### Option B: Relabel the fence language to `sh`/`shell`

Cosmetic only. **Effort:** Small. **Risk:** None.

## Recommended Action

_(triage — may be dismissed as intentional)_

## Acceptance Criteria

- [ ] Decision recorded: keep `bash` highlighting or switch.

## Work Log

- 2026-06-04: Found during `/ce:review` (docs-quality agent). Likely won't-fix.
