---
status: pending
priority: p3
issue_id: 008
tags: [code-review, docs, quality, links]
dependencies: []
---

# Sibling-crate reference links still use `/*/` wildcard version

## Problem Statement

The 0.2 migration pinned `lightning` doc links to `/0.2.2/`, but some
sibling-crate reference links still use the `/*/` wildcard, which is an
internal inconsistency. (`/*/` resolves to "latest" on docs.rs, so the links
work — this is consistency polish, not a broken link.)

## Findings

- `docs/building-a-node-with-ldk/setting-up-a-channel-manager.md` (~line 1128):
  `https://docs.rs/lightning-rapid-gossip-sync/*/lightning_rapid_gossip_sync/`
- Other sibling crates (`lightning-net-tokio`, `lightning-background-processor`)
  may have similar `/*/` links; a grep will surface them.
- Sibling crates are at 0.2.0 (not 0.2.2).

## Proposed Solutions

### Option A: Pin siblings to `/0.2.0/`

Consistent with how `lightning` was pinned to `/0.2.2/`. **Effort:** Small.

### Option B: Standardize on `/latest/` for all docs.rs links

Auto-tracks future releases; less version drift to maintain. **Effort:** Small.

## Recommended Action

_(triage — pick one convention and apply repo-wide)_

## Acceptance Criteria

- [ ] docs.rs link versioning is consistent across the changed docs.

## Work Log

- 2026-06-04: Found during `/ce:review` (docs-quality agent).
