---
status: pending
priority: p2
issue_id: 006
tags: [code-review, docs, typescript, api-correctness]
dependencies: []
---

# Invalid TypeScript placeholder in Key Management (comment is not an expression)

## Problem Statement

The TypeScript "Creating a Unified Wallet" sample assigns a block comment as a
value, which is not valid TypeScript — a reader copying it gets a syntax error.

## Findings

- `docs/key_management.md`, TypeScript tab of the Unified Wallet code-group:
  ```ts
  const ldkSeed: Uint8Array = /* 32 bytes derived at m/535h */;
  ```
- A `/* ... */` comment is not an expression, so the assignment doesn't parse.
- Confidence: Certain.

## Proposed Solutions

### Option A: Use a real placeholder value (recommended)

```ts
// 32 bytes derived from your HD wallet at m/535h
const ldkSeed = new Uint8Array(32);
```

**Pros:** Compiles; intent preserved via comment. **Effort:** Small. **Risk:** None.

### Option B: Declare with a clearly-stubbed function

```ts
const ldkSeed: Uint8Array = deriveLdkSeedAtPath("m/535h"); // your derivation
```

**Pros:** Reads as real code. **Cons:** introduces an undefined helper. **Effort:** Small.

## Recommended Action

_(triage)_

## Technical Details

- Affected file: `docs/key_management.md` (Unified Wallet code-group, TS tab).

## Acceptance Criteria

- [ ] The TS snippet parses as valid TypeScript (no comment-as-value).

## Work Log

- 2026-06-04: Found during `/ce:review` (docs-quality agent).
