---
title: "Release v0.2.0"
description: "Announcing the v0.2.0 release of BDK"
authors: 
    - Alekos Filini
date: "2020-12-21"
tags: ["rust", "release"]
hidden: true
draft: false
---

A new release of BDK is finally out! The `v0.2.0` release contains many exciting new features, bug fixes and overall improvements. This release also marks the beginning of our new regular [release schedule][release_schedule], which will see us pushing
out a new release every four weeks. We think this is a good compromise to ensure that developers using BDK have access to all the new features and fixes as soon as possible, at least while the library is still evolving very fast as it is
right now. After `v1.0.0` we will increase this time to a more relaxed 6 weeks.

You can find the full [v0.2.0 changelog][changelog] on GitHub.

## What's new in v0.2.0

Considering the sheer amount of new things being added we don't have room here to explain every new feature in detail, but below is a quick overview of some you could find useful in your projects.

### A new name

The `0.1.0-beta.1` release was tagged right before the project was renamed `bdk`: at that time the library was still called "Magical Bitcoin Library", or `magical` for short. With this release we have now renamed it to `bdk`. If you were using the library
before, it should only be a matter of renaming the imports to match the new name. Alternatively you can also rename `bdk` to `magical` in your Cargo.toml, but you'll still have to do some changes here and there because the APIs have been changed in a few
places.

This release being particularly large contains a few different API-breaking changes: going forward we expect to make the interface more and more stable, which in turn will make applying updates easier.

### Branch and Bound coin selection

We now support the state-of-the-art coin selection algorithm called "branch and bound", with an implementation derived straight from Bitcoin Core. This algorithm is now enabled by default, but it can be replaced with a different one (either
the old default, [`LargestFirstCoinSelection`][`LargestFirstCoinSelection`] or a custom [`CoinSelectionAlgorithm`][`CoinSelectionAlgorithm`]) by using the [`TxBuilder::coin_selection()`][`TxBuilder::coin_selection()`] option.

Branch and bound works by trying to find a set of inputs that perfectly matches the amount being sent by a transaction, to avoid making an extra change output which takes up more space in the transaction, requires more fees, and in general lowers the privacy
of a user if the change is later spent together with other outputs.

### Key generation

If you need to generate a new `bip32::ExtendedPrivKey`, or perhaps a new BIP39 mnemonic, you can use the unified [`GeneratableKey`][`GeneratableKey`] trait to do so: paired with [`GeneratableDefaultOptions`][`GeneratableDefaultOptions`] they provide many different ways to generate keys,
with or without a custom source of entropy, and with or without customized options.

```rust
use bdk::bitcoin::PrivateKey;
use bdk::keys::{GeneratableKey, GeneratableDefaultOptions, PrivateKeyGenerateOptions};

let default_options_key = PrivateKey::generate_default()?;
let custom_options_key = PrivateKey::generate(PrivateKeyGenerateOptions { compressed: false })?;
```

### Generic key types

With this update there's now a generalized trait for keys that can be used in descriptors, which is called [`ToDescriptorKey`][`ToDescriptorKey`]. This trait is already implemented for the native `rust-bitcoin` key types, like `PrivateKey`, `PublicKey`, `bip32::ExtendedPrivKey`
and `bip32::ExtendedPubKey`. It's also implemented for BIP39 mnemonic and seeds, when the the opt-in `keys-bip39` feature is enabled. As always, being this a public trait, you can also implement it for custom types to better suit your needs.

```rust
impl<Ctx: ScriptContext> ToDescriptorKey<Ctx> for MyKeyType {
    fn to_descriptor_key(self) -> Result<DescriptorKey<Ctx>, KeyError> {
        // Custom conversion to `bitcoin::PrivateKey`
        let privkey: bitcoin::PrivateKey = ... ;
        privkey.to_descriptor_key()
    }
}
```

If your custom key type is simply a different representation of an `xprv` or `xpub`, you can also consider implementing the [`DerivableKey`][`DerivableKey`] trait instead: for a type `K` that implements [`DerivableKey`][`DerivableKey`], the [`ToDescriptorKey`][`ToDescriptorKey`] trait is automatically
implemented for the [`(K, bip32::DerivationPath)`][K_path] and [`(K, bip32::KeySource, bip32::DerivationPath)`][K_src_path] tuples.

```rust
impl<Ctx: ScriptContext> DerivableKey<Ctx> for MyKeyType {
     fn add_metadata(
        self, 
        origin: Option<KeySource>, 
        derivation_path: DerivationPath
    ) -> Result<DescriptorKey<Ctx>, KeyError> {
        // Custom conversion to `bip32::ExtendedPrivKey`
        let xprv: bip32::ExtendedPrivKey = ... ;
        xprv.add_metadata(origin, derivation_path)
    }
}
```

### Descriptor templates

Instead of having to serialize keys to strings using `format!()` just to place them somewhere inside a descriptor, you can now use descriptor templates to build a descriptor starting from a key and some other options
in a couple of lines of code. You can use one of the [provided templates][desc_templates_mod] or make a custom one by implementing the [`DescriptorTemplate`][`DescriptorTemplate`] trait on a `struct` or `enum`.

```rust
let key = bip32::ExtendedPrivKey::from_str("...")?;
let wallet: OfflineWallet<_> = Wallet::new_offline(
    BIP84(key.clone(), KeychainKind::External),
    Some(BIP84(key, KeychainKind::Internal)),
    Network::Testnet,
    MemoryDatabase::default(),
)?;
```

### Easier creation of `Blockchain` and `Database`

We've added a new way to create a [`Blockchain`][`Blockchain`] instance from a configuration, with the [`ConfigurableBlockchain`][`ConfigurableBlockchain`] trait. All the [`Blockchain`][`Blockchain`] types provided by the library implement this trait, which allows you to easily build an
instance of them starting from a configuration `struct`: moreover, the configuration structures implement `Serialize` and `Deserialize`, so that they can be easily stored/loaded using `serde`.

We've also added a new [`Blockchain`][`Blockchain`] type called [`AnyBlockchain`][`AnyBlockchain`], which is essentially an `enum` that wraps all the [`Blockchain`][`Blockchain`] types exposed by the library. This allows you to build a [`Wallet`][`Wallet`] that always has the same
Rust type, but that can internally use different [`Blockchain`][`Blockchain`] backends chosen at runtime.

```rust
use bdk::blockchain::{AnyBlockchain, AnyBlockchainConfig, ConfigurableBlockchain, ElectrumBlockchainConfig};

let config = r#"{"Electrum":{"url":"ssl://electrum.blockstream.info:50002","socks5":null,"retry":3,"timeout":5}}"#;
let config = serde_json::from_str(config)?;
let blockchain = AnyBlockchain::from_config(&config)?;
```

The same is true for [`Database`][`Database`] types, thanks to the [`ConfigurableDatabase`][`ConfigurableDatabase`] trait and the [`AnyDatabase`][`AnyDatabase`] `enum`. While we think most people generally prefer to choose a single database type and then stick to it, it's still good
to offer the choice to switch them at runtime, should somebody need that.

### `descriptor!()` macro

If you start writing complex descriptor templates, you'll soon find yourself with the need of building large descriptor syntax trees: you can very easily do that with the [`descriptor!()`][`descriptor!()`] macro, with the added bonus that some additional checks on the
syntax of your descriptor will be performed at compile-time, rather than at runtime by. You can use any type that implements [`ToDescriptorKey`][`ToDescriptorKey`] (even strings!) as keys in `pk()`, `multi()` and `sortedmulti()` fragments, and you can even mix
them in the same descriptor.

The syntax supported by the macro is almost exactly the same as the standard descriptor syntax we all know, with the only difference that modifiers should be specified individually rather than
grouped in a series of characters (see the example below).

```rust
pub struct TimeDecayingMultisig<K> {
    pk_a: K,
    pk_b: K,
    timelock: u32,
}

impl<K: ToDescriptorKey<Segwitv0>> DescriptorTemplate for TimeDecayingMultisig<K> {
    fn build(self) -> Result<DescriptorTemplateOut, KeyError> {
        Ok(bdk::descriptor!(wsh(thresh(2,pk(self.pk_a),s:pk(self.pk_b),s:d:v:older(self.timelock))))
           .map_err(|e| KeyError::Message(e.to_string()))?)
    }
}
```

### Support for `sortedmulti()`

Thanks to the addition of `sortedmulti()` in `rust-miniscript`, we can now also support them in BDK, which means we are getting more and more compatible with other descriptor-based wallets out there like Bitcoin Core.

## Contributors

A huge thanks to everybody who contributed to this new release with suggestions, pull requests and bug reports.

Since the `0.1.0-beta.1` release over three months ago, we've had `213` new commits made by `10` different contributors for a total of `9990` additions and `2993` deletions. Here's the [full diff][gh_diff].

A special thanks to the `7` new contributors:

- [@eupn][@eupn]
- [@justinmoon][@justinmoon] - Justin Moon
- [@Xekyo][@Xekyo] - Mark Erhardt
- [@RCasatta][@RCasatta] - Riccardo Casatta
- [@ulrichard][@ulrichard] - Richard Ulrich
- [@notmandatory][@notmandatory] - Steve Myers
- [@willcl-ark][@willcl-ark] - Will Clark

[release_schedule]: https://github.com/bitcoindevkit/bdk/blob/7d6cd6d4f5a26194830f90e6460e0b82bddf9594/DEVELOPMENT_CYCLE.md
[changelog]: https://github.com/bitcoindevkit/bdk/blob/7d6cd6d4f5a26194830f90e6460e0b82bddf9594/CHANGELOG.md#v020---010-beta1
[gh_diff]: https://github.com/bitcoindevkit/bdk/compare/0.1.0-beta.1...v0.2.0

[`LargestFirstCoinSelection`]: https://docs.rs/bdk/0.2.0/bdk/wallet/coin_selection/struct.LargestFirstCoinSelection.html
[`CoinSelectionAlgorithm`]: https://docs.rs/bdk/0.2.0/bdk/wallet/coin_selection/trait.CoinSelectionAlgorithm.html
[`TxBuilder::coin_selection()`]: https://docs.rs/bdk/0.2.0/bdk/wallet/tx_builder/struct.TxBuilder.html#method.coin_selection
[`ToDescriptorKey`]: https://docs.rs/bdk/0.2.0/bdk/keys/trait.ToDescriptorKey.html
[`DerivableKey`]: https://docs.rs/bdk/0.2.0/bdk/keys/trait.DerivableKey.html
[K_path]: https://docs.rs/bdk/0.2.0/bdk/keys/trait.ToDescriptorKey.html#impl-ToDescriptorKey%3CCtx%3E-for-(T%2C%20DerivationPath)
[K_src_path]: https://docs.rs/bdk/0.2.0/bdk/keys/trait.ToDescriptorKey.html#impl-ToDescriptorKey%3CCtx%3E-for-(T%2C%20KeySource%2C%20DerivationPath)
[`GeneratableKey`]: https://docs.rs/bdk/0.2.0/bdk/keys/trait.GeneratableKey.html
[`GeneratableDefaultOptions`]: https://docs.rs/bdk/0.2.0/bdk/keys/trait.GeneratableDefaultOptions.html
[`DescriptorTemplate`]: https://docs.rs/bdk/0.2.0/bdk/descriptor/template/trait.DescriptorTemplate.html
[desc_templates_mod]: https://docs.rs/bdk/0.2.0/bdk/descriptor/template/index.html
[`Blockchain`]: https://docs.rs/bdk/0.2.0/bdk/blockchain/trait.Blockchain.html
[`ConfigurableBlockchain`]: https://docs.rs/bdk/0.2.0/bdk/blockchain/trait.ConfigurableBlockchain.html
[`Database`]: https://docs.rs/bdk/0.2.0/bdk/database/trait.Database.html
[`ConfigurableDatabase`]: https://docs.rs/bdk/0.2.0/bdk/database/trait.ConfigurableDatabase.html
[`AnyBlockchain`]: https://docs.rs/bdk/0.2.0/bdk/blockchain/any/enum.AnyBlockchain.html
[`AnyDatabase`]: https://docs.rs/bdk/0.2.0/bdk/database/any/enum.AnyDatabase.html
[`Wallet`]: https://docs.rs/bdk/0.2.0/bdk/wallet/struct.Wallet.html
[`descriptor!()`]: https://docs.rs/bdk/0.2.0/bdk/macro.descriptor.html

[@notmandatory]: https://github.com/notmandatory
[@willcl-ark]: https://github.com/willcl-ark
[@ulrichard]: https://github.com/ulrichard
[@Xekyo]: https://github.com/Xekyo
[@RCasatta]: https://github.com/RCasatta
[@justinmoon]: https://github.com/justinmoon
[@eupn]: https://github.com/eupn
