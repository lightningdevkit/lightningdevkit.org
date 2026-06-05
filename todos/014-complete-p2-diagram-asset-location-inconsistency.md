---
status: pending
priority: p2
issue_id: 014
tags: [code-review, docs, assets, consistency, maintainability]
dependencies: []
---

# Diagram assets are split across `docs/assets/` and `docs/public/img/` with inconsistent references

## Problem Statement

Commit `672e8af9` shipped the architecture and peer-management diagrams using
two *different* asset conventions for the same feature, and left dead/stale
duplicate copies in a second directory. Everything renders correctly today
(the production build passes and resolves both forms), so this is a
maintainability / source-of-truth issue, not a user-facing bug — but it is a
real foot-gun for the next person who edits these diagrams.

## Findings

- **Path convention split (same feature, two styles):**
  - `docs/introduction/architecture.md:2-3` → absolute public paths
    `src="/img/ldk-architecture.svg"` / `src="/img/ldk-architecture-dark.svg"`
  - `docs/introduction/peer-management.md:2-3` → relative paths
    `src="../assets/ldk-peer-management.svg"` / `src="../assets/ldk-peer-management-dark.svg"`
  - The relative `../assets/...` form is the repo standard: ~27 markdown
    references use it (all blog posts, e.g. `docs/blog/bolt12-has-arrived.md`,
    and the only other raw `<img>` in markdown, `docs/blog/announcing-vss.md:58`).
    Vite transforms + fingerprints these at build time (confirmed in dist:
    `assets/ldk-peer-management.BWhA4J-P.svg`). Files in `public/` bypass Vite —
    no hashing, no build-time "missing asset" error, and they break if a
    `base` sub-path is ever configured.

- **Dead duplicate (introduced by this commit):**
  `docs/assets/ldk-architecture-dark.svg` is byte-identical to
  `docs/public/img/ldk-architecture-dark.svg`, but architecture.md references
  the `/img/` (public) copy — so the `assets/` copy is unreferenced. The
  pre-existing light counterpart `docs/assets/ldk-architecture.svg` is *also*
  already dead for the same reason. Two sources of truth → silent drift on the
  next edit.

- **Stale duplicate (latent foot-gun):**
  `docs/public/img/ldk-peer-management.svg` (27,523 B, dated May) is the *old*
  diagram — it predates the OnionMessenger/RapidGossipSync work. The page
  renders fine because peer-management.md points at `../assets/`, but anyone who
  "normalizes" it to the `/img/` convention modeled by architecture.md would
  silently render the outdated diagram, and there is no
  `public/img/ldk-peer-management-dark.svg` at all (would 404).

- Confidence: Certain (verified by `git show 672e8af9`, `diff` of the copies,
  and inspecting `docs/.vitepress/dist/`).

## Proposed Solutions

### Option A: Standardize on `docs/assets/` + relative refs (recommended)

- Change `docs/introduction/architecture.md:2-3` to
  `src="../assets/ldk-architecture.svg"` and
  `src="../assets/ldk-architecture-dark.svg"`.
- Delete the now-unused `docs/public/img/ldk-architecture.svg`,
  `docs/public/img/ldk-architecture-dark.svg`, and the stale
  `docs/public/img/ldk-peer-management.svg` — **after** grepping
  `docs/.vitepress/theme/` to confirm no Vue component consumes the `/img/`
  paths.
- Pros: matches the dominant repo convention and the peer-management diagram;
  single source of truth; Vite catches missing assets at build; survives a
  future `base` change. Cons: must verify nothing else references `/img/` copies.
- Effort: Small. Risk: Low (build will fail loudly if a ref is missed).

### Option B: Standardize on `docs/public/img/` + absolute refs

- Move/refresh peer-management SVGs into `public/img/` (including the dark
  variant), change peer-management.md to `/img/...`, delete the `assets/` copies.
- Pros: consistent the other way. Cons: goes *against* the established
  convention used by ~28 other references; loses Vite asset processing.
- Effort: Small-Medium. Risk: Low-Medium.

### Option C: Minimal — fix only the stale/dead copies

- Keep the mixed conventions but delete the dead `assets/ldk-architecture*.svg`
  and re-sync or delete the stale `public/img/ldk-peer-management.svg`.
- Pros: smallest diff. Cons: leaves the convention split unresolved.
- Effort: Small. Risk: Low.

## Recommended Action

_(triage)_ — leaning Option A.

## Technical Details

Affected files:
- `docs/introduction/architecture.md` (lines 2-3)
- `docs/assets/ldk-architecture-dark.svg`, `docs/assets/ldk-architecture.svg` (dead)
- `docs/public/img/ldk-architecture.svg`, `docs/public/img/ldk-architecture-dark.svg`
- `docs/public/img/ldk-peer-management.svg` (stale)
- verify: `docs/.vitepress/theme/` (any `/img/` consumers)

## Acceptance Criteria

- [ ] Architecture and peer-management diagrams use one consistent asset
      location + reference style.
- [ ] No unreferenced/stale duplicate diagram SVGs remain (or they are the
      single intended source).
- [ ] `npm run build:vitepress` passes and both diagrams render in light and
      dark mode in the built site.

## Work Log

- 2026-06-05: Filed from `/ce:review` of commit `672e8af9`. Flagged by
  pattern-recognition, code-simplicity, performance, and learnings agents
  (consensus). Production build confirmed both reference styles currently
  resolve; this is consistency/maintainability, not a blocker.

- 2026-06-05: RESOLVED (Option A). architecture.md switched to relative `../assets/` references; deleted dead `public/img/ldk-architecture.svg`, `public/img/ldk-architecture-dark.svg`, and the stale `public/img/ldk-peer-management.svg`. `npm run build:vitepress` passes — dist now references Vite-fingerprinted `assets/ldk-architecture*.svg`, no `/img/` refs remain. All four architecture+peer diagrams now live in `docs/assets/` with relative refs.

## Resources

- Commit: `672e8af9`
- Repo convention sample: `docs/blog/announcing-vss.md:58` (relative `<img>`)
