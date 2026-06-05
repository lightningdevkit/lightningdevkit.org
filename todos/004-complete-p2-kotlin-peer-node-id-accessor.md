---
status: pending
priority: p2
issue_id: 004
tags: [code-review, docs, kotlin, api-correctness]
dependencies: []
---

# Kotlin `it._counterparty_node_id` does not resolve on `PeerDetails`

## Problem Statement

The Kotlin "connect to peers" sample reads the peer node id with a property
accessor that the ldk-java binding doesn't synthesize, so the snippet won't
compile as written.

## Findings

- `docs/building-a-node-with-ldk/connect-to-peers.md`, Kotlin tab:
  ```kotlin
  val peerNodeIds = peerManager.list_peers().map { it._counterparty_node_id }
  ```
- The v0.2.0.0 binding exposes `PeerDetails.get_counterparty_node_id()`. Kotlin
  only synthesizes property-style access for JavaBean getters of the form
  `getXxx()` (capital letter after `get`); `get_counterparty_node_id()` is not
  converted to a `_counterparty_node_id` property.
- Source: https://raw.githubusercontent.com/lightningdevkit/ldk-garbagecollected/v0.2.0.0/src/main/java/org/ldk/structs/PeerDetails.java
- Confidence: Likely. (Note: elsewhere the docs use the `_field` convention for
  generated getters that DO follow the JavaBean shape; this one does not.)

## Proposed Solutions

### Option A: Use the explicit getter (recommended)

```kotlin
val peerNodeIds = peerManager.list_peers().map { it.get_counterparty_node_id() }
```

**Effort:** Small. **Risk:** None.

## Recommended Action

_(triage)_

## Technical Details

- Affected file: `docs/building-a-node-with-ldk/connect-to-peers.md` (second code-group, Kotlin tab).

## Acceptance Criteria

- [ ] Kotlin sample uses `get_counterparty_node_id()`.

## Work Log

- 2026-06-04: Found during `/ce:review` (API-correctness agent).
