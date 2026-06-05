---
status: pending
priority: p3
issue_id: 013
tags: [code-review, cleanup, home]
dependencies: []
---

# Delete orphaned HomePromo.vue

## Problem Statement

The standalone LDK Node promo (`HomePromo.vue`) was folded into the Feature
hero and removed from the theme render, but the file remains on disk with no
references — dead code.

## Findings

- `docs/.vitepress/theme/components/HomePromo.vue` is no longer imported in
  `theme/index.ts` (import + slot entry removed in 02b11881). Grep finds no other
  references except a `docs/plans/*.md` pipeline artifact (do not touch).
- Source: frontend + simplicity review agents (both flagged it).

## Proposed Solutions

### Option A: Delete the file (recommended)

`git rm docs/.vitepress/theme/components/HomePromo.vue`. Its content lives in the
Node strip of `HomeServerPromo.vue` now. **Effort:** Small. **Risk:** None.

## Recommended Action

_(triage)_

## Acceptance Criteria

- [ ] `HomePromo.vue` is removed; build still passes.

## Work Log

- 2026-06-04: Found during `/ce:review` (frontend + simplicity agents).
