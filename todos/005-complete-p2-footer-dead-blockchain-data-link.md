---
status: pending
priority: p2
issue_id: 005
tags: [code-review, docs, vitepress, dead-link]
dependencies: []
---

# Site footer links to deleted `/blockchain_data/introduction/`

## Problem Statement

Consolidating the seven Blockchain Data pages into `/blockchain_data/` updated
the sidebar (`config.mts`) but missed the site footer, which still points at the
now-deleted `/blockchain_data/introduction/`. This is a broken link rendered on
**every page** of the site. VitePress's build-time dead-link check only covers
markdown relative links, not Vue component `href`s, so the build passed despite
this.

## Findings

- `docs/.vitepress/theme/components/SiteFooter.vue:26`:
  ```js
  { text: 'Blockchain Data', link: '/blockchain_data/introduction/' },
  ```
- The page now lives at `/blockchain_data/` (see `docs/blockchain_data/index.md`);
  the `introduction.md` sub-page was deleted in commit 925dd716.
- Confidence: Certain (grep-verified).

## Proposed Solutions

### Option A: Point the footer at the consolidated page (recommended)

```js
{ text: 'Blockchain Data', link: '/blockchain_data/' },
```

**Effort:** Small. **Risk:** None.

## Recommended Action

_(triage)_

## Technical Details

- Affected file: `docs/.vitepress/theme/components/SiteFooter.vue:26`.
- Worth a quick grep of the footer for any other stale links while here.

## Acceptance Criteria

- [ ] Footer "Blockchain Data" link resolves to `/blockchain_data/`.
- [ ] No other footer links point at removed pages.

## Work Log

- 2026-06-04: Found during `/ce:review` (simplicity agent). Verified at SiteFooter.vue:26.
