---
title: "Release v0.7.0"
description: "Announcing the v0.7.0 release of BDK"
authors:
    - Alekos Filini
date: "2021-05-17"
tags: ["rust", "release"]
hidden: true
draft: false
---

A new release of BDK is out: [`v0.7.0`] improved APIs, a more robust signing process and various bugfixes and improvements.

You can find the full [v0.7.0 changelog][changelog] on GitHub.

## What's new in v0.7.0

Below are some highlights of the new release:

### New Signing API

The `Wallet::sign()` method has been updated to take a *mutable reference* to a PSBT rather than consuming it entirely. This makes it easier to sign the same PSBT multiple times with different signers:

```rust
let mut psbt = ...;

let alice_finalized = wallet_alice.sign(&mut psbt, SignOptions::default())?;
let bob_finalized = wallet_bob.sign(&mut psbt, SignOptions::default())?;
```

Under the hood, even more has changed around the way we make signatures: starting from this release, our signer will require by default that SegWit PSBTs also provide the `non_witness_utxo` to mitigate the fee bruning "[SegWit bug][segwit_bug]".

For this reason, the second argument of `Wallet::sign()`, which was initially used to optionally provide a different "current height" that the wallet would consider when trying to finalize the transaction, has been replaced with a more generic "options"
argument of type [`SignOptions`]. This allows setting a different assumed block height and also opting out of requiring `non_witness_utxo` by enabling the `trust_witness_utxo` flag.

As a result of these new more strict requirements, BDK will also, by default, fill-in the `non_witness_utxo` field when creating new PSBTs. The `TxBuilder::force_non_witness_utxo()` option has been removed and a new one called
`TxBuilder::only_witness_utxo()` has been added, to allow users to opt-out of this new default behavior.

```rust
// Make a transaction that only contains the `witness_utxo`
let (psbt, details) = {
    let mut builder = wallet.build_tx();
    builder
        .add_recipient(send_to.script_pubkey(), 50_000)
        .only_witness_utxo();
    builder.finish()?
};
// Sign it by explicitly trusting just the `witness_utxo`
let finalized = wallet.sign(&mut psbt, SignOptions { trust_witness_utxo: true, ..Default::default() })?;
```

### Support Timelocks in the `policy` Module

A less-known part of BDK is its "policy" module: its goal is to take a descriptor and encode the spending policy represented by that descriptor in a more "user-friendly" format. On top of that, the module
tries to provide a summary for what a user's descriptor can *contribute* to a transaction. For instance, given a 2-of-2 multisig policy, a descriptor that contains only the two public keys can't *contribute* anything,
while a descriptor that has one or both private keys can, respectively, *contribute to* and *satisfy* the policy by making signatures.

In release `v0.5.0` we added support for computing which parts of a policy are already satisfied by a given PSBT. This, combined with the contribution part, allow users to get a complete picture of what's already present
and what's missing to fully satisfy a descriptor.

In this release we are starting to take timelocks into consideration when computing the *satisfaction* component of a policy: this means that we can consider timelocks that are already expired as fully satisfied and also
exclude policy branches that require specific `nLockTime` or `nSequence` values, if those aren't correctly set in the transaction.

Ultimately with those changes we are able to give our users a more complete picture of the completion stage of a PSBT, which also takes into account the expiration of timelocks.

## Contributors

A huge thanks to everybody who contributed to this new release with suggestions, pull requests and bug reports.

Since the `v0.6.0` release around a month ago, we've had `39` new commits made by `6` different contributors for a total of `698` additions and `309` deletions. Here's the [full diff][gh_diff].

A special thanks to the new contributor for this release:

- [@rajarshimaitra][@rajarshimaitra] - Raj

[changelog]: https://github.com/bitcoindevkit/bdk/blob/aaa9943a5f614da522cdac44af80adf941879210/CHANGELOG.md#v070---v060
[gh_diff]: https://github.com/bitcoindevkit/bdk/compare/v0.6.0...v0.7.0

[segwit_bug]: https://blog.trezor.io/details-of-firmware-updates-for-trezor-one-version-1-9-1-and-trezor-model-t-version-2-3-1-1eba8f60f2dd
[`SignOptions`]: https://docs.rs/bdk/0.7.0/bdk/wallet/signer/struct.SignOptions.html
[`v0.7.0`]: https://crates.io/crates/bdk/0.7.0

[@rajarshimaitra]: https://github.com/rajarshimaitra
