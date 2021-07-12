---
title: "Hello World!"
description: "Getting started using the BDK library in a very simple Rust project"
authors: 
    - Alekos Filini
date: "2020-12-18"
tags: ["getting started", "rust"]
hidden: true
draft: false
---

## Introduction

This article should serve as a "getting started" guide for developers who are considering integrating BDK in their projects: it tries to introduce the reader to the basic concepts behind the library and some of its
modules and components that can be used to build a very simple functioning Bitcoin wallet. All the information written in this article are valid for the current `master` git branch, and should remain valid for the upcoming [`v0.2.0` release](https://github.com/bitcoindevkit/bdk/projects/1)
which is planned to be tagged pretty soon.

## Design Goals

The main goal of the library is to be a solid foundation for Bitcoin wallets of any kind, on any platform: in practice, this means that the library should be:

- Very *well-reviewed* and tested
- *Lightweight*, so that it can be used easily on mobile devices as well
- *Extendable*, so that it can be adapted to perfectly suit different use-cases
- *Generalized*, meaning that it supports different types of Bitcoin scripts and wallets through the use of [descriptors][descriptor]
- *Reasonably easy* to use, exposing a "high level" interface to the user and hiding all the complexity inside

These goals have a direct impact on the design of the internal components of the library, and as a consequence on the APIs that are exposed to the final user, which might in some cases feel counter-intuitive at first.
Throughout the article, I will try to focus on those points and try to explain them as best as I can.

## The `Wallet` Structure

The [`Wallet`][wallet] structure is in many ways the heart of the library: it represents an instance of a wallet and exposes some APIs to perform all the typical operations one might want to do with a Bitcoin wallet,
such as generating a new address, listing the transactions received, creating a transaction, etc.

A `Wallet` instance can be constructed given at least one [descriptor] which would be used to derive both [`External`][KeychainKind] and [`Internal`][KeychainKind] addresses, or two if one prefers to keep them separated. `External` addresses are the
ones returned by an explicit [`Wallet::get_new_address()`][get_new_address] call, while `Internal` addresses are generated internally to receive the change whenever a new transaction is created.

A `Wallet` also needs at least one other component to function properly, its [`Database`][Database]: it will be used as a *cache* to store the list of transactions synchronized with the blockchain, the UTXOs, the addresses generated, and a few other things. It's important
to note that the `Database` will never store any secret. Securely storing keys is explicitly left to the user of the library to implement, mainly because there isn't really one good way to do it, that would work reliably on every platform. On
mobile devices, for instance, the OS' keychain could be used, to allow unlocking the secrets with the use of biometric data (FaceID or fingerprint), while on desktop platform there isn't generally a similar
framework available and the user would have to implement something that meets their needs. It's not excluded that in the future we could provide a "reference implementation" of secure multi-platform storage for keys,
but that would very likely be released as a separate module outside of the `Wallet` structure, or potentially even as a separate library that could be reused for other applications as well.

Going back to our `Wallet`: given a descriptor and a `Database` we can build an "air-gapped", or "Offline" wallet: basically, a wallet that physically can't to connect to the Bitcoin network. It will still be able to generate addresses and
sign [PSBTs][PSBT], but with a greatly reduced attack surface because a sizable part of the code that handles the logic to synchronize with the network would be entirely omitted in the final executable binary.

This is how an `OfflineWallet` can be created. Notice that we are using [`MemoryDatabase`][MemoryDatabase] as our `Database`. We'll get to that in a second.

```rust
use bdk::{Wallet, OfflineWallet};
use bdk::database::MemoryDatabase;
use bdk::bitcoin::Network;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let external_descriptor = "wpkh(tprv8ZgxMBicQKsPdy6LMhUtFHAgpocR8GC6QmwMSFpZs7h6Eziw3SpThFfczTDh5rW2krkqffa11UpX3XkeTTB2FvzZKWXqPY54Y6Rq4AQ5R8L/84'/0'/0'/0/*)";
    let internal_descriptor = "wpkh(tprv8ZgxMBicQKsPdy6LMhUtFHAgpocR8GC6QmwMSFpZs7h6Eziw3SpThFfczTDh5rW2krkqffa11UpX3XkeTTB2FvzZKWXqPY54Y6Rq4AQ5R8L/84'/0'/0'/1/*)";

    let wallet: OfflineWallet<_> = Wallet::new_offline(
        external_descriptor,
        Some(internal_descriptor),
        Network::Testnet,
        MemoryDatabase::new(),
    )?;

    Ok(())
}
```

Once we have our `Wallet` instance we can generate a new address and print it out:

```rust
// ...

println!("Generated Address: {}", wallet.get_new_address()?);
```

Building and running this code will print out:

```text
Generated Address: tb1q7w0t936xp5p994qx506xj53gjdcmzjr2mkqghn
```

Before we've talked about the benefits of an air-gapped wallet, but we should also talk about the disadvantages: the biggest one is the fact that it cannot create new transactions because
it doesn't know which UTXOs belong to the wallet. To get this information we generally need to `sync` with the network, but this wallet can't physically do that.

To fix this we can add one more component to our `Wallet`: a [`Blockchain`][Blockchain] backend. In particular, we are going to use the [`ElectrumBlockchain`][ElectrumBlockchain] which syncs with an `Electrum` server,
since that's available out of the box in BDK and is pretty fast.

We can change our `Wallet` construction to look something like this:

```rust
use bdk::blockchain::ElectrumBlockchain;
use bdk::electrum_client::Client;

// ...

let wallet = Wallet::new(
    external_descriptor,
    Some(internal_descriptor),
    Network::Testnet,
    MemoryDatabase::new(),
    ElectrumBlockchain::from(Client::new("ssl://electrum.blockstream.info:60002").unwrap()),
)?;
```

This piece of code is very similar to the one we wrote before, but this time we are using the [`Wallet::new()`][Wallet_new] constructor instead of [`Wallet::new_offline()`][Wallet_new_offline], and this takes an extra argument for the `Blockchain` type to use.
Specifically here, we create an `ElectrumBlockchain` and connect to Blockstream's public Electrum Testnet servers over SSL.

Now, since we are running in the `Testnet` network, we can try to get some funds from a faucet online to this address we've generated. Once we have an incoming transaction we can do the first `sync` of our *online* wallet.
this is again something that might seem counterintuitive at first: why do we have to manually ask the `Wallet` to *sync* itself? Can't it do it periodically in background? The answer is that yes, that would definitely be possible,
but it would remove some control on what's happening inside the wallet from the user. This can be especially problematic on mobile platforms, where the OS tries very aggressively to suspend apps in background to save
battery. Having a thread running and trying to make network requests while the app is in background would very likely cause errors or potentially crashes somewhere. So for this reason this operation has to be performed manually,
to allow the user to call that function only at the right time.

```rust
use bdk::blockchain::noop_progress;

// ...

wallet.sync(noop_progress(), None)?;
```

In this case, we are not interested in receiving updates about the progress, and we just want to use the default settings, so we use [`noop_progress()`][noop_progress] and `None` as arguments. This will make queries to the Electrum server
and store the list of transactions and UTXOs in our `Database`. In this case, we are using a `MemoryDatabase`, so those data are only going to be kept in RAM and dropped once our `Wallet` is dropped. This is very useful
for playing around and experimenting, but not so great for real-world wallets: for that, you can use [sled][sled] which is supported out of the box, or even use a custom database. More on that later!

So now that we've synced with the blockchain we can create our first transaction. First of all, we will print out the balance of our wallet to make sure that our wallet has seen the incoming transaction. Then we
will create the actual transaction and we will specify some flags using the [`TxBuilder`][TxBuilder]. To finish it off, we will ask the wallet to sign the transaction and then broadcast it to the network.

Right now we will not get into details of all the available options in `TxBuilder` since that is definitely out of the scope of a "getting started" guide. For now, you can just imagine the builder as your way to tell the library
how to build transactions. We'll come back to this in a future article.

```rust
use std::str::FromStr;

use bdk::bitcoin::Address;
use bdk::TxBuilder;

// ...

let balance = wallet.get_balance()?;
println!("Wallet balance in SAT: {}", balance);

let faucet_address = Address::from_str("mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt")?;
let (unsigned_psbt, tx_details) = wallet.create_tx(
    TxBuilder::with_recipients(vec![(faucet_address.script_pubkey(), balance / 2)])
        .enable_rbf(),
)?;
println!("Transaction details: {:#?}", tx_details);
```

In this case, we are sending back half the balance to the faucet's address and we are also enabling RBF since the default fees are at 1 satoshi/vbyte. With RBF we will be able to *bump the fees* of the transaction, should it get
stuck in the mempool due to the low fee rate.

All that's left to do once we have our unsigned PSBT is to sign it:

```rust
// ...

let (signed_psbt, tx_finalized) = wallet.sign(unsigned_psbt, None)?;
assert!(tx_finalized, "Tx has not been finalized");
```

And then broadcast it:

```rust
// ...

let raw_transaction = signed_psbt.extract_tx();
let txid = wallet.broadcast(raw_transaction)?;
println!(
    "Transaction sent! TXID: {txid}.\nExplorer URL: https://blockstream.info/testnet/tx/{txid}",
    txid = txid
);
```

## Custom Database and Blockchain types

We briefly mentioned before that for our example we used the `MemoryDatabase`, but that it could also be swapped for a different one: this is one example of the *modularity* of BDK. By default, some database
types are implemented in the library, namely (as of now) the `MemoryDatabase` which only keeps data in RAM and the [sled][sled] database that can store data on a filesystem. But since the `Database` trait is public,
users of the library can also implement different database types more suitable for their use-case.

The same is true for the `Blockchain` types: the library provides (through the use of opt-in features) implementations for the `Electrum`, `Esplora` and `CompactFilters` (*Neutrino*) backends. Those again can also be
swapped with custom types if the user desires to do so.

## Conclusion

Hopefully, this article will help you get started with BDK! This is just a very quick and gentle introduction to the library, and only barely scratches the surface of what's inside: we will keep publishing more
articles in the future to explain some of the more advanced features of BDK, like key generation, using complex [descriptors][descriptor] with multiple keys and/or timelocks, using external signers, etc.

If you'd like to learn more about the library feel free to ask any questions in the comment section down below, or join our [Discord Community](https://discord.gg/d7NkDKm) to chat with us directly!


[descriptor]: /descriptors
[PSBT]: https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
[sled]: https://docs.rs/sled/

[Wallet]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/wallet/struct.Wallet.html
[KeychainKind]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/enum.KeychainKind.html
[get_new_address]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/wallet/struct.Wallet.html#method.get_new_address
[Database]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/database/trait.Database.html
[MemoryDatabase]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/database/memory/struct.MemoryDatabase.html
[Blockchain]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/blockchain/trait.Blockchain.html
[ElectrumBlockchain]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/blockchain/electrum/struct.ElectrumBlockchain.html
[Wallet_new]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/wallet/struct.Wallet.html#method.new
[Wallet_new_offline]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/wallet/struct.Wallet.html#method.new_offline
[noop_progress]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/blockchain/fn.noop_progress.html
[TxBuilder]: /docs-rs/bdk/nightly/b8c6732c74bf7d4558a85d39a9e423347acf5ea0/bdk/wallet/tx_builder/struct.TxBuilder.html
