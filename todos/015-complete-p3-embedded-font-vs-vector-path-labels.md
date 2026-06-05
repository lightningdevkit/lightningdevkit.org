---
status: pending
priority: p3
issue_id: 015
tags: [code-review, docs, svg, diagrams, consistency]
dependencies: []
---

# Peer-management diagram mixes embedded-font `<text>` labels with vector-path labels

## Problem Statement

The two new labels added in `672e8af9` (`OnionMessenger`, `RapidGossipSync`) are
live SVG `<text>` elements backed by an embedded `@font-face` (a base64 woff2
Manrope subset, family `RGSManrope`). Every *other* label in the same diagram
(`PeerManager`, `ChannelManager`, `P2PGossipSync`, `Peer []`, `Net I/O`) is a
pre-outlined vector `<path>`. So one diagram now renders text two different ways.
This is cosmetically invisible (the embedded subset matches Manrope Medium/500,
verified by overlay during authoring) but is a minor maintainability wrinkle.

## Findings

- `docs/assets/ldk-peer-management.svg` and `...-dark.svg` each contain one
  `@font-face{font-family:'RGSManrope';font-weight:500;src:url(data:font/woff2;base64,...)}`
  (decoded payload ~1,920 B) plus `<text font-family="RGSManrope">` elements.
- The same font payload is embedded in **both** files (byte-identical), so it
  ships twice (~2.6 KB base64 ×2; compresses away under gzip — see todo 017).
- Risk noted by reviewer: if someone later edits the diagram in a vector tool
  and "converts text to outlines" (as the original labels were), the embedded
  `@font-face` becomes dead weight that lingers.
- Background: the embedded-font route was chosen deliberately because SVGs
  loaded via `<img>` cannot use page/web fonts, and the available text→path
  tooling (opentype.js `toPathData`) produced truncated glyph paths during
  authoring. The font subset guarantees identical cross-browser rendering.
- Confidence: Certain.

## Proposed Solutions

### Option A: Keep as-is, document the rationale (recommended)

- Leave the embedded subset; add a short SVG comment noting the family,
  weight (500), and that it is a Manrope subset for the two `<text>` labels.
- Pros: zero risk, preserves guaranteed rendering, tiny byte cost. Cons: the
  two-strategy inconsistency remains.
- Effort: Small. Risk: None.

### Option B: Convert the two `<text>` labels to vector `<path>` outlines

- Generate outlined paths for both strings in Manrope Medium and replace the
  `<text>` elements; drop the `@font-face` from both files.
- Pros: all labels rendered identically (paths); removes embedded font from
  both files; no font dependency. Cons: requires a *reliable* text→path tool
  (the one tried during authoring truncated output — would need verification
  via render-compare); paths are larger/opaque to edit.
- Effort: Medium. Risk: Low-Medium (must visually verify the generated paths).

## Recommended Action

_(triage)_ — leaning Option A; the current approach is defensible and the
inconsistency is invisible to readers.

## Technical Details

Affected files:
- `docs/assets/ldk-peer-management.svg`
- `docs/assets/ldk-peer-management-dark.svg`

## Acceptance Criteria

- [ ] Decision recorded (keep + document, or convert to paths).
- [ ] If converted: both labels render pixel-consistent with the other labels
      in light and dark mode, verified by screenshot, and no `@font-face`
      remains.

## Work Log

- 2026-06-05: Filed from `/ce:review` of `672e8af9` (code-simplicity agent).
  Noted the embedded-font choice was intentional (cross-browser `<img>`
  rendering); flagged as low-priority consistency only.

- 2026-06-05: RESOLVED (Option A — keep + document). Added an XML comment to both peer-management SVGs explaining the embedded `RGSManrope` Manrope-500 subset and why (`<img>`-loaded SVGs can't use page fonts), pointing to the OFL file. Embedded-font approach kept; build verified.

## Resources

- Commit: `672e8af9`
