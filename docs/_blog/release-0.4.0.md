---
title: "Release v0.4.0"
description: "Announcing the v0.4.0 release of BDK"
authors: 
    - Alekos Filini
date: "2021-02-17"
tags: ["rust", "release"]
hidden: true
draft: false
---

A new release of BDK is out: the [`v0.4.0`] release brings updated dependencies, more sanity checks and an overhauled API to build transactions.

You can find the full [v0.4.0 changelog][changelog] on GitHub.

## What's new in v0.4.0

Below are some highlights of the new improved APIs coming with this release:

### A new API to build transaction

The star of this release is the new API designed and implemented by [@llfourn] that brings much more flexibility to the way we create transactions: originally the process of making a transaction involved the creation of a `TxBuilder` which was used
to configure *how* the wallet should build the transaction. Things like which outputs to create, what `nLockTime` to use, which UTXOs to spend, and much more.

Once fully configured, this builder was then given to the `Wallet` itself in a `Wallet::create_tx()` or `Wallet::bump_fee()` call: the `Wallet` would try to follow the *instructions* given by the builder, but in
case of conflicting or straight-up wrong options it would have to fail and force the user to start over.

The new API maintains the concept of a *builder*, but it changes the way it's created so that it always contains a reference to the main `Wallet` instance. What this means is that most checks can now be performed right
when something is added to the builder, not at the end, allowing the user to recover from errors instead of having to start over.

This also opens the door to even more improvements and additions, such as a way to [spend foreign utxos][foreign_utxo] in a transaction, or even a way to [bump the fees of multiple transactions at once][bump_fee_batched] by batching them together, which
saves a bit of space and money.

```rust
let send_to = wallet.get_new_address()?;
let (psbt, details) = {
    let mut builder = wallet.build_tx();
    builder
        .add_recipient(send_to.script_pubkey(), 50_000)
        .enable_rbf()
        .do_not_spend_change()
        .fee_rate(FeeRate::from_sat_per_vb(5.0));
    builder.finish()?
};
```

### Upgraded dependencies

This release also brings many updates to our dependencies, including:

- `bitcoin` to `v0.26`
- `miniscript` to `v5.1`
- `electrum-client` to `v0.6`
- `tokio` to `v1`
- `reqwest` to `v0.11`
- `cc` to `>= v1.0.64`

### Compact Filters example

Thanks to the upgrade to `bitcoin v0.26` all the issues related to new networking messages in the P2P Bitcoin network have been fixed, which means that we can finally use our (experimental) compact filters `Blockchain` with
standard Bitcoin Core 0.21 full nodes.

The following example has also been added to the repository and can be run with `cargo run --features=compact_filters --example compact_filters_balance`.

```rust
/// This will return wallet balance using compact filters
/// Requires a synced local bitcoin node 0.21 running on testnet with blockfilterindex=1 and peerblockfilters=1
fn main() -> Result<(), CompactFiltersError> {
    env_logger::init();
    info!("start");

    let num_threads = 4;
    let mempool = Arc::new(Mempool::default());
    let peers = (0..num_threads)
        .map(|_| Peer::connect("localhost:18333", Arc::clone(&mempool), Network::Testnet))
        .collect::<Result<_, _>>()?;
    let blockchain = CompactFiltersBlockchain::new(peers, "./wallet-filters", Some(500_000))?;
    info!("done {:?}", blockchain);
    let descriptor = "wpkh(tpubD6NzVbkrYhZ4X2yy78HWrr1M9NT8dKeWfzNiQqDdMqqa9UmmGztGGz6TaLFGsLfdft5iu32gxq1T4eMNxExNNWzVCpf9Y6JZi5TnqoC9wJq/*)";

    let database = MemoryDatabase::default();
    let wallet =
        Arc::new(Wallet::new(descriptor, None, Network::Testnet, database, blockchain).unwrap());
    wallet.sync(noop_progress(), None).unwrap();
    info!("balance: {}", wallet.get_balance()?);
    Ok(())
}
```

## Contributors

A huge thanks to everybody who contributed to this new release with suggestions, pull requests and bug reports.

Since the `v0.3.0` release around a month ago, we've had `59` new commits made by `8` different contributors for a total of `2463` additions and `1991` deletions. Here's the [full diff][gh_diff].

A special thanks to the new contributor for this release:

- [@luckysori][@luckysori] - Lucas Soriano

[changelog]: https://github.com/bitcoindevkit/bdk/blob/5e352489a0ac9dd92002a73aa64789a9ae2f0794/CHANGELOG.md#v040---v030
[foreign_utxo]: https://github.com/bitcoindevkit/bdk/pull/279
[bump_fee_batched]: https://github.com/bitcoindevkit/bdk/issues/280
[gh_diff]: https://github.com/bitcoindevkit/bdk/compare/v0.3.0...v0.4.0

[`v0.4.0`]: https://crates.io/crates/bdk/0.4.0

[@luckysori]: https://github.com/luckysori
[@llfourn]: https://github.com/llfourn
