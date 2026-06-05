---
status: pending
priority: p3
issue_id: 017
tags: [code-review, docs, performance, dark-mode]
dependencies: []
---

# Both light and dark diagram variants are downloaded on every page load

## Problem Statement

The light/dark diagram swap uses two real `<img>` elements with the inactive
one hidden via `display:none` (`docs/.vitepress/theme/style.css` `.light-only` /
`.dark-only` rules). Per spec, `display:none` does **not** prevent an `<img>`
from being fetched — so every visitor downloads *both* variants regardless of
theme. For a static docs site with caching this is minor, but it is the one
genuine inefficiency in the change.

## Findings

- `docs/introduction/peer-management.md:2-3` and
  `docs/introduction/architecture.md:2-3` each render two `<img>` variants.
- Swap CSS: `docs/.vitepress/theme/style.css` (`img.dark-only{display:none}`,
  `.dark img.light-only{display:none}`, `.dark img.dark-only{display:initial}`).
- Measured cost of the hidden (wasted) fetch per page load:
  - Peer-management: ~13 KB gzip (the hidden variant; embedded font is a
    rounding error after gzip).
  - Architecture: a hidden **~72 KB** SVG (no embedded font) — the larger waste.
- Important: this `.light-only`/`.dark-only` pattern is **pre-existing and
  site-wide** (it predates this commit; see `style.css` comment and
  `learnings-researcher` notes). Changing it affects more than these diagrams.
- Confidence: Certain (spec behaviour; sizes measured from the built assets).

## Proposed Solutions

### Option A: Leave as-is (reasonable for a docs site)

- Pros: matches the established site pattern; bytes are within docs-page noise
  and cached after first load. Cons: redundant fetch persists.
- Effort: None. Risk: None.

### Option B: Use `<picture>` with theme-conditioned `<source>` (only fetches one)

- Replace the dual-`<img>` + CSS pattern with a `<picture>` whose `<source
  media="(prefers-color-scheme: dark)">` selects the variant, so the browser
  fetches exactly one. Biggest payoff on the architecture page (~72 KB saved).
- Pros: eliminates the wasted fetch. Cons: `prefers-color-scheme` tracks the OS
  theme, which may not match VitePress's in-app `.dark` toggle — needs
  verification; and to stay consistent it should arguably be applied site-wide,
  expanding scope beyond this commit.
- Effort: Medium (and a convention decision). Risk: Medium (theme-source mismatch).

## Recommended Action

_(triage)_ — likely Option A for now; revisit Option B only as a deliberate
site-wide image-theming change.

## Technical Details

Affected files:
- `docs/introduction/peer-management.md`, `docs/introduction/architecture.md`
- `docs/.vitepress/theme/style.css`

## Acceptance Criteria

- [ ] Decision recorded. If Option B: only the active-theme variant is fetched
      (verify in DevTools Network) and the variant correctly follows VitePress's
      dark toggle, not just OS preference.

## Work Log

- 2026-06-05: Filed from `/ce:review` of `672e8af9` (performance-oracle).
  Noted as the established site-wide pattern; low priority for a docs site.

- 2026-06-05: RESOLVED — accepted as-is (Option A). Kept the `.light-only`/`.dark-only` pattern. Option B (`<picture>` + `prefers-color-scheme`) was rejected: it tracks the OS theme, not VitePress's JS `.dark` toggle, so it would break in-app theme switching. No code change.

## Resources

- Commit: `672e8af9`
