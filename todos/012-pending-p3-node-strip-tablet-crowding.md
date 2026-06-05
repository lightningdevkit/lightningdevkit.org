---
status: pending
priority: p3
issue_id: 012
tags: [code-review, frontend, responsive, home]
dependencies: []
---

# Node strip can crowd at tablet widths (721–900px)

## Problem Statement

The compact Node strip uses `grid-template-columns: 84px 1fr auto` from 721px
up, with the only stack breakpoint at `max-width: 720px`. Between ~721–900px the
icon + copy + nowrap "Get Started" pill compete for space and the copy can wrap
awkwardly.

## Findings

- `docs/.vitepress/theme/components/HomeServerPromo.vue`: `.fh-node` grid is
  three-column above 721px; `.fh-node-cta` has `white-space: nowrap`.
- Source: frontend review agent.

## Proposed Solutions

### Option A: Raise the stacking breakpoint

Change the `@media (max-width: 720px)` stack rule for `.fh-node` to
`max-width: 860px` so the strip collapses to a centered single column on small
tablets. **Effort:** Small. **Risk:** None.

### Option B: Let the icon drop sooner / allow CTA wrap

More targeted but fiddlier. **Effort:** Small.

## Recommended Action

_(triage)_

## Acceptance Criteria

- [ ] Node strip reads cleanly across 721–900px (no cramped/overlapping copy).

## Work Log

- 2026-06-04: Found during `/ce:review` (frontend agent).
