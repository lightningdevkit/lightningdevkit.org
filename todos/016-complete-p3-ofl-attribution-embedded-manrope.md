---
status: pending
priority: p3
issue_id: 016
tags: [code-review, docs, licensing, fonts, compliance]
dependencies: []
---

# Embedded Manrope subset has no SIL OFL attribution/notice

## Problem Statement

Commit `672e8af9` embeds a subset of the Manrope font (as base64 woff2) directly
inside the peer-management SVGs. Manrope is licensed under the SIL Open Font
License 1.1, which permits embedding and redistribution but requires the
copyright/license notice to travel with the font. The repo currently ships the
font bytes with no OFL notice anywhere. This is compliance hygiene, not a
security or functional issue.

## Findings

- `docs/assets/ldk-peer-management.svg` / `...-dark.svg`: `@font-face` with an
  embedded `data:font/woff2;base64,...` Manrope subset.
- `grep` for `OFL` / `SIL Open Font` across the repo: no matches.
- The author already renamed the embedded family to `RGSManrope` (good — OFL
  forbids reusing the "Manrope" Reserved Font Name for a modified/subset font).
- Pre-existing context: `docs/assets/cash-app-architecture.svg` (and its
  public/img copy) also *reference* Manrope by name, so attribution was already
  absent — but this commit is the first to **embed and redistribute** actual
  font bytes, which makes the OFL notice requirement directly applicable.
- Confidence: High (OFL terms are well-known; verify exact requirements against
  the Manrope license file).

## Proposed Solutions

### Option A: Add an OFL notice file (recommended)

- Add `docs/assets/fonts/Manrope-OFL.txt` (or a `LICENSES/` entry) containing
  the Manrope OFL 1.1 copyright + license text, and reference it from a brief
  note where the font is embedded.
- Pros: satisfies OFL with minimal effort. Cons: one extra file to keep.
- Effort: Small. Risk: None.

### Option B: Stop embedding font bytes (convert labels to paths)

- See todo 015 Option B — outlining the text removes the embedded font entirely,
  sidestepping the redistribution clause.
- Pros: no bundled font to attribute. Cons: more work; see 009 caveats.
- Effort: Medium. Risk: Low-Medium.

## Recommended Action

_(triage)_ — Option A unless 009 Option B is chosen.

## Technical Details

Affected files:
- `docs/assets/ldk-peer-management.svg`, `docs/assets/ldk-peer-management-dark.svg`
- new: an OFL license/attribution file

## Acceptance Criteria

- [ ] Manrope OFL 1.1 notice present in the repo and discoverable from where the
      font is used, OR the embedded font removed (see 009).

## Work Log

- 2026-06-05: Filed from `/ce:review` of `672e8af9` (security-sentinel,
  flagged as compliance/P3, explicitly *not* a security vulnerability).

- 2026-06-05: RESOLVED (Option A). Added `docs/assets/fonts/Manrope-OFL.txt` (official SIL OFL 1.1, Copyright 2018 The Manrope Project Authors) and referenced it from the comment embedded in both peer-management SVGs.

## Resources

- Commit: `672e8af9`
- SIL Open Font License 1.1
