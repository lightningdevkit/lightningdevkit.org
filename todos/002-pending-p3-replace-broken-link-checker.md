---
status: pending
priority: p3
issue_id: 002
tags: [code-review, dependencies, technical-debt]
dependencies: []
---

# Replace unmaintained `broken-link-checker`

## Problem Statement

`broken-link-checker@0.7.8` is the only tool wired into `npm run linkcheck`. The package has had **no releases since 2017** and depends on an ancient pre-fetch stack (`bhttp`, `request`, etc. — visible in the npm deprecation warnings during install). It is the largest single source of the 142 transitive vulnerabilities reported by `npm audit`, and the only realistic mitigation path is replacement.

This is not blocking the dep-upgrade PR — `broken-link-checker` was already at 0.7.8 on `main`, and the PR even reduced the vuln count by leaving its tree untouched while modernizing other deps. But it should be tracked as a follow-up.

## Findings

- Latest release of `broken-link-checker`: `0.7.8` — published 2017-09-19.
- The GitHub repo (https://github.com/stevenvachon/broken-link-checker) shows the last commit was years ago; no active maintenance.
- Used only by the CI link-check step, which has `continue-on-error: true` — so the immediate functional risk is low, but the supply-chain risk (audit noise, transitive vulns) is high.
- `npm run linkcheck` runs successfully today against the current install.

## Proposed Solutions

### Option A: `lychee` (recommended for docs sites)

[lychee](https://github.com/lycheeverse/lychee) is a fast Rust-based link checker with a dedicated GitHub Action (`lycheeverse/lychee-action`). Replaces both `broken-link-checker` and the `start-server-and-test`/`serve` plumbing if used against the built static site (or directly against URLs in markdown).

**Pros:** Actively maintained, fast, no npm transitive vulns, GitHub Action integrates into workflow with a few lines.
**Cons:** Different output format — the workflow's `grep "Getting links from\|BROKEN"` filter would need to change.
**Effort:** Medium. **Risk:** Low — linkcheck is already non-blocking in CI.

### Option B: `linkinator`

[linkinator](https://github.com/JustinBeckwith/linkinator) is a Node-based crawler maintained by Google. Drop-in API similar to `blc` but with active maintenance.

**Pros:** Stays in the npm ecosystem; CLI shape close to `blc`.
**Cons:** Still ships its own transitive deps; less of a reduction in npm audit noise than lychee.
**Effort:** Small. **Risk:** Low.

### Option C: Status quo (defer)

Leave `broken-link-checker` as-is until it actually breaks. Acceptable since linkcheck is `continue-on-error: true`.

**Pros:** Zero work. **Cons:** Tech debt accrues; npm audit noise stays elevated. **Effort:** None.

## Recommended Action

_(Triage decision — leave blank initially)_

## Technical Details

- **Files affected (Option A):** `.github/workflows/build.yml` (replace linkcheck step + remove sst/serve deps when no longer needed); `package.json` config block.
- **Files affected (Option B):** `package.json` (swap dep); workflow needs minor command change.

## Acceptance Criteria

- [ ] CI link-check step runs successfully against the deployed/staged site
- [ ] `npm audit` vulnerability count reduced (concrete number depends on chosen replacement)
- [ ] No regression in detection coverage for the docs site's external links

## Work Log

_(populate as work progresses)_

## Resources

- Brainstorm: `docs/brainstorms/2026-05-13-dependency-upgrade-brainstorm.md` (local, gitignored) — `broken-link-checker` retention was an explicit decision deferred to follow-up
- lychee: https://github.com/lycheeverse/lychee
- linkinator: https://github.com/JustinBeckwith/linkinator
