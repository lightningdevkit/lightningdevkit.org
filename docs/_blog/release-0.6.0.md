---
title: "Release v0.6.0"
description: "Announcing the v0.6.0 release of BDK"
authors:
    - Alekos Filini
date: "2021-04-15"
tags: ["rust", "release"]
hidden: true
draft: false
---

A new release of BDK is out: [`v0.6.0`] brings some new API calls, renamed types and some bugfixes.

You can find the full [v0.6.0 changelog][changelog] on GitHub.

## What's new in v0.6.0

Below are some highlights of the new release:

### A new way to generate addresses

The old `get_new_address()` method has been upgraded into a more generic `get_address()`, which takes a [`AddressIndex`] argument. `AddressIndex` is defined as an enum with the following variants:
- `AddressIndex::New` increments the derivation index stored in the database and returns a new address. It's equivalent to the old `get_new_address()`.
- `AddressIndex::LastUnused` returns the address for the current derivation index if no usage has been detected. `sync()` should be called to ensure the internal database is up to date.
- `AddressIndex::Peek(index)` returns the address at a given derivation index, without updating the database.
- `AddressIndex::Reset(index)` returns the address at a given derivation index, and stores that value in the database.

```rust
// Prints the first ten addresses without updating the derivation index
for index in 0..10 {
    println!("Address #{}: {}", index, wallet.get_address(AddressIndex::Peek(index)?));
}
```

### Easier multiparty transaction creation

A new method called [`get_psbt_input()`] has been added to the `Wallet` structure, and it makes it very easy to get a complete PSBT input with all the required metadata for a given UTXO. This can be very convenient
when working with `add_foreign_utxo()`, which was added in the previous release:

```rust
// On Alice's wallet
let alice_utxo = LocalUtxo { ... };
let alice_psbt_input = wallet_alice.get_psbt_input(alice_utxo.clone())?;
send_input_to_bob(alice_utxo.outpoint, alice_psbt_input)?;

// On Bob's wallet
let mut builder = wallet_bob.build_tx();
builder
    .add_recipient(addr.script_pubkey(), 60_000)
    .add_foreign_utxo(alice_outpoint, alice_psbt_input, satisfaction_weight)?
    ....
```

### Renamed types

To keep our coding style in line with the best practices defined by the Rust language, we've renamed some of our types and enum variants to avoid using [upper case acronyms](https://rust-lang.github.io/rust-clippy/master/index.html#upper_case_acronyms).

Some examples are:
- `UTXO` -> `Utxo`
- `RBFValue` -> `RbfValue`
- `BIP69Lexicographic` -> `Bip69Lexicographic`
- `P2PKH` -> `P2Pkh`
- `BIP44Public` -> `Bip44Public`

### New MSRV

Due to some changes in one of our dependency, our MSRV has been bumped up from `1.45` to `1.46`, which was released in August 2020. The last release fully supporting `1.45` is `v0.5.1`.

## Contributors

A huge thanks to everybody who contributed to this new release with suggestions, pull requests and bug reports.

Since the `v0.5.1` release around a month ago, we've had `37` new commits made by `7` different contributors for a total of `1092` additions and `548` deletions. Here's the [full diff][gh_diff].

A special thanks to the new contributor for this release:

- [@da-kami][@da-kami] - Daniel Karzel

[changelog]: https://github.com/bitcoindevkit/bdk/blob/2bddd9baedc3744cd7647176c2f31405ee7bb54a/CHANGELOG.md#v060---v051
[gh_diff]: https://github.com/bitcoindevkit/bdk/compare/v0.5.1...v0.6.0

[`AddressIndex`]: https://docs.rs/bdk/0.6.0/bdk/wallet/enum.AddressIndex.html
[`get_psbt_input()`]: https://docs.rs/bdk/0.6.0/bdk/wallet/struct.Wallet.html#method.get_psbt_input
[`v0.6.0`]: https://crates.io/crates/bdk/0.6.0

[@da-kami]: https://github.com/da-kami
