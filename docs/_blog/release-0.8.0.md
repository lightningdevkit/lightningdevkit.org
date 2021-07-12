---
title: "Release v0.8.0"
description: "Announcing the v0.8.0 release of BDK"
authors:
    - Alekos Filini
date: "2021-06-14"
tags: ["rust", "release"]
hidden: true
draft: false
---

A new release of BDK is out: [`v0.8.0`] brings new APIs and other minor bugfixes and internal improvements.

You can find the full [v0.8.0 changelog][changelog] on GitHub.

## What's new in v0.8.0

Below are some highlights of the new release:

### Getting the Derivation Index

The `Wallet::get_address()` method now returns an [`AddressInfo`] structure, rather than a simple `Address`. This new structure contains the address but also the derivation index, which can be useful in some contexts.

Since the structure implements `Deref<Target=Address>` it can be used directly as a `&Address`, which simplifies migrating to this change a little bit.

```rust
let address_info = wallet.get_address(AddressInfo::New)?;

// Print the address and derivation index
println!("Address #{}: {}", address_info.index, address_info.address);

// Use the `AddressInfo` structure directly like an `Address`
let script_pubkey = address_info.script_pubkey();
```

### Explicitly Enable non-ALL Sighashes

To mitigate potential attacks in multiparty protocols, this release includes a new [`SignOptions::allow_all_sighashes`][sign_option] option that must be explicitly enabled to let the signers produce signatures
with any non-ALL sighash.

```rust
let mut psbt = ...;

// Fails if the psbt uses non-ALL sighashes
let finalized = wallet.sign(&mut psbt, SignOptions::default())?;

// Produces a signature successfully
let finalized = wallet.sign(&mut psbt, SignOptions { allow_all_sighashes: true, ..Default::default() })?;
```

## Contributors

A huge thanks to everybody who contributed to this new release with suggestions, pull requests and bug reports.

Since the `v0.7.0` release around a month ago, we've had `39` new commits made by `6` different contributors for a total of `1540` additions and `1380` deletions. Here's the [full diff][gh_diff].

A special thanks to the new contributor for this release:

- [@futurepaul][@futurepaul] - Paul Miller

[changelog]: https://github.com/bitcoindevkit/bdk/blob/67714adc80669129eff2cad8991609d3b1c41cb9/CHANGELOG.md
[gh_diff]: https://github.com/bitcoindevkit/bdk/compare/v0.7.0...v0.8.0

[`AddressInfo`]: https://docs.rs/bdk/0.8.0/bdk/wallet/struct.AddressInfo.html
[sign_option]: https://docs.rs/bdk/0.8.0/bdk/wallet/signer/struct.SignOptions.html#structfield.allow_all_sighashes
[`v0.8.0`]: https://crates.io/crates/bdk/0.8.0
