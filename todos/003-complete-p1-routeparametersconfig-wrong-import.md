---
status: pending
priority: p1
issue_id: 003
tags: [code-review, docs, rust, api-correctness]
dependencies: []
---

# Rust `RouteParametersConfig` imported from the wrong module (won't compile)

## Problem Statement

The Rust "send a payment" sample imports `RouteParametersConfig` from
`lightning::ln::channelmanager`, where it does not exist in 0.2.2. A reader who
copies the snippet gets a compile error (`unresolved import`). This is the most
severe correctness issue from the review — shipped sample code that does not
build.

## Findings

- `docs/building-a-node-with-ldk/sending-payments.md`, Rust tab:
  ```rust
  use lightning::ln::channelmanager::{PaymentId, Retry, RouteParametersConfig};
  ```
- In lightning 0.2.2, `RouteParametersConfig` lives in
  `lightning::routing::router` (it implements `Default`). `PaymentId` and
  `Retry` are correctly in `lightning::ln::channelmanager`.
- Source: https://docs.rs/lightning/0.2.2/lightning/routing/router/struct.RouteParametersConfig.html
  and https://docs.rs/lightning/0.2.2/lightning/ln/channelmanager/index.html
  (RouteParametersConfig absent there).
- Confidence: Certain (verified against docs.rs).

## Proposed Solutions

### Option A: Split the import (recommended)

```rust
use lightning::ln::channelmanager::{PaymentId, Retry};
use lightning::routing::router::RouteParametersConfig;
```

**Pros:** Correct, minimal. **Cons:** none. **Effort:** Small. **Risk:** None.

## Recommended Action

_(triage)_

## Technical Details

- Affected file: `docs/building-a-node-with-ldk/sending-payments.md` (first code-group, Rust tab).

## Acceptance Criteria

- [ ] `RouteParametersConfig` is imported from `lightning::routing::router`.
- [ ] `PaymentId`/`Retry` remain imported from `lightning::ln::channelmanager`.

## Work Log

- 2026-06-04: Found during `/ce:review` (API-correctness agent).
