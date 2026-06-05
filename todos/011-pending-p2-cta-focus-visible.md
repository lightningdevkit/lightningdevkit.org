---
status: pending
priority: p2
issue_id: 011
tags: [code-review, frontend, accessibility, home]
dependencies: []
---

# Feature hero CTAs have no visible focus state

## Problem Statement

The two custom-styled anchor CTAs in the Feature hero (`.fh-cta`, `.fh-node-cta`)
define no `:focus-visible` styling, and the theme's `style.css` has no global
focus rule, so keyboard focus falls back to the browser default outline only —
which can be low-contrast on the brand-soft band. WCAG 2.4.7 (Focus Visible).

## Findings

- `docs/.vitepress/theme/components/HomeServerPromo.vue`: `.fh-cta` and
  `.fh-node-cta` style `:hover` but not `:focus-visible`.
- Source: frontend review agent (grep found no focus rule in `style.css`).

## Proposed Solutions

### Option A: Add an explicit focus-visible outline (recommended)

```css
.fh-cta:focus-visible,
.fh-node-cta:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
```

**Effort:** Small. **Risk:** None. (Consider whether a site-wide focus style is
warranted instead — out of scope here.)

## Recommended Action

_(triage)_

## Acceptance Criteria

- [ ] Both CTAs show a clear, on-brand focus ring when tabbed to.

## Work Log

- 2026-06-04: Found during `/ce:review` (frontend agent).
