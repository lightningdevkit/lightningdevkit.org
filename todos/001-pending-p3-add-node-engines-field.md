---
status: pending
priority: p3
issue_id: 001
tags: [code-review, quality, build-tooling]
dependencies: []
---

# Add `engines.node` field to package.json

## Problem Statement

After bumping the CI runtime to Node 22 (required by `start-server-and-test` v3), `package.json` still has no `engines` field. A contributor installing on Node 16 or 18 will get a successful `npm install` followed by confusing failures at build time. An `engines` declaration would surface the mismatch at install time with a clear message.

This is not a blocker for the upgrade PR — it's a small follow-up that closes a paper cut introduced by the runtime change.

## Findings

- `package.json` currently has no `engines` block (lines 30–38 contain only `devDependencies`).
- CI pins `node-version: 22` in `.github/workflows/build.yml`.
- `start-server-and-test@3.0.5` declares `engines: { node: "^22 || >=24" }`.
- npm respects `engines` strictly only when `engine-strict=true` is set in `.npmrc`; without it the field is advisory (still prints a warning, still useful).

## Proposed Solutions

### Option A: Add `engines` to package.json (minimal)

```json
"engines": {
  "node": ">=22"
}
```

**Pros:** One-line change, surfaces version mismatch at install. **Cons:** Advisory only without `.npmrc`. **Effort:** Small. **Risk:** None.

### Option B: Option A + `.nvmrc` file containing `22`

**Pros:** `nvm use` in repo root auto-selects the right Node. Standard convention.
**Cons:** Two files instead of one. **Effort:** Small. **Risk:** None.

### Option C: Option B + `.npmrc` with `engine-strict=true`

**Pros:** Hard-fails install on wrong Node version. **Cons:** Strict enforcement may surprise contributors. **Effort:** Small. **Risk:** Low — easy to opt out.

## Recommended Action

_(Triage decision — leave blank initially)_

## Technical Details

- **Files:** `package.json` (Option A); add `.nvmrc` (Option B); add `.npmrc` (Option C).
- **No build or CI changes required** (CI already uses Node 22).

## Acceptance Criteria

- [ ] `engines.node` field present in `package.json`
- [ ] `npm install` on Node <22 produces a clear warning or error
- [ ] If `.nvmrc` added: `nvm use` in repo root selects Node 22

## Work Log

_(populate as work progresses)_

## Resources

- Plan: `docs/plans/2026-05-13-001-refactor-upgrade-dev-dependencies-plan.md` (local, gitignored)
- npm docs: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#engines
