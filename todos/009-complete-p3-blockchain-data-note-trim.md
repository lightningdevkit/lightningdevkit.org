---
status: pending
priority: p3
issue_id: 009
tags: [code-review, docs, quality, prose]
dependencies: []
---

# Trim redundant notes in consolidated Blockchain Data page

## Problem Statement

The consolidated `blockchain_data/index.md` has minor verbosity introduced
during the merge: a duplicated "only available in Rust" statement and three
stacked `::: tip Note` callouts in the Confirmed Transactions section.

## Findings

- `docs/blockchain_data/index.md`:
  - The `lightning-block-sync` "only available in Rust" point appears in a tip
    box (~line 47) and is then restated a few lines later (~line 53,
    "As noted above, ...").
  - Three consecutive `::: tip Note` blocks in Confirmed Transactions (~lines
    184–200); two open with "Note that ..." inside a box already titled "Note".

## Proposed Solutions

### Option A: Light trim (recommended)

- Drop the "As noted above, `lightning-block-sync` is only available in Rust"
  restatement.
- Merge the `Confirm` ordering note and the "call on both ChannelManager and
  ChainMonitor" note into one callout; drop redundant "Note that" prefixes.

**Effort:** Small. **Risk:** None (prose only).

## Recommended Action

_(triage)_

## Acceptance Criteria

- [ ] No duplicated "only available in Rust" sentence.
- [ ] Confirmed Transactions has at most two note callouts.

## Work Log

- 2026-06-04: Found during `/ce:review` (simplicity agent).
