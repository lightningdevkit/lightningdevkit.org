---
status: pending
priority: p2
issue_id: 010
tags: [code-review, frontend, dark-mode, accessibility, home]
dependencies: []
---

# LDK Node ghost CTA hover is unreadable in dark mode

## Problem Statement

In the new Feature hero, the compact LDK Node strip's outline ("ghost") CTA
turns white text on a mint fill on hover in dark mode — near-invisible.

## Findings

- `docs/.vitepress/theme/components/HomeServerPromo.vue`, `.fh-node-cta:hover`:
  ```css
  .fh-node-cta:hover { background: var(--vp-c-brand-1); color: var(--vp-c-white); }
  ```
- In **dark mode** `--vp-c-brand-1` is the mint accent (~`#76f3cd`) while
  `--vp-c-white` stays `#ffffff` → white-on-mint contrast ≈ 1.2:1 (the label
  effectively disappears on hover). In light mode it's white-on-blue (fine).
- The primary `.fh-cta` already handles this correctly with
  `color: var(--vp-button-brand-text, var(--vp-c-white))` (resolves to a dark
  ink in dark mode).
- Source: frontend review agent.

## Proposed Solutions

### Option A: Use the brand-text token for hover (recommended)

```css
.fh-node-cta:hover {
  background: var(--vp-c-brand-1);
  color: var(--vp-button-brand-text, var(--vp-c-white));
}
```

Matches `.fh-cta`; readable in both themes. **Effort:** Small. **Risk:** None.

## Recommended Action

_(triage)_

## Acceptance Criteria

- [ ] Node strip CTA hover label is legible in both light and dark mode.

## Work Log

- 2026-06-04: Found during `/ce:review` (frontend agent).
