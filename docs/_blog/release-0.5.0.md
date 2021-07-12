---
title: "Release v0.5.0"
description: "Announcing the v0.5.0 release of BDK"
authors: 
    - Alekos Filini
date: "2021-03-18"
tags: ["rust", "release"]
hidden: true
draft: false
---

A new release of BDK is out: [`v0.5.0`] is our first release licensed under Apache 2.0 and MIT, brings new features, bugfixes and some internal refactoring.

You can find the full [v0.5.0 changelog][changelog] on GitHub.

## What's new in v0.5.0

Below are some highlights of the new release:

### Dual Licensing

From now on BDK will be released under both Apache 2.0 and MIT, at your discretion. This change aligns our project with many other Rust crates and reiterates our commitment to a permissive licensing model.

### Spending *foreign* UTXOs

This release adds a new `TxBuilder` method called [`add_foreign_utxo()`], which can be used to spend UTXOs that don't belong to the `Wallet`. We think this is going to be very useful to developers working on multiparty
protocols like CoinJoins, Pay Join, etc.

It's as easy as giving the library a PSBT input and the satisfaction cost for that input:

```rust
let mut builder = wallet.build_tx();
builder
    .add_recipient(addr.script_pubkey(), 60_000)
    .add_foreign_utxo(foreign_utxo.outpoint, foreign_utxo_psbt_input, foreign_utxo_satisfaction_weight)?
```

## Contributors

A huge thanks to everybody who contributed to this new release with suggestions, pull requests and bug reports.

Since the `v0.4.0` release around a month ago, we've had `54` new commits made by `7` different contributors for a total of `1430` additions and `1212` deletions. Here's the [full diff][gh_diff].

A special thanks to the new contributor for this release:

- [@davemo88][@davemo88]

[changelog]: https://github.com/bitcoindevkit/bdk/blob/f786f0e6241a3df47b96bbb07f1aba374bc73b2f/CHANGELOG.md#v050---v040
[gh_diff]: https://github.com/bitcoindevkit/bdk/compare/v0.4.0...v0.5.0

[`add_foreign_utxo()`]: https://docs.rs/bdk/0.5.0/bdk/wallet/tx_builder/struct.TxBuilder.html#method.add_foreign_utxo
[`v0.5.0`]: https://crates.io/crates/bdk/0.5.0

[@davemo88]: https://github.com/davemo88
