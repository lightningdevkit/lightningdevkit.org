---
title: "Release v0.3.0"
description: "Announcing the v0.3.0 release of BDK"
authors: 
    - Alekos Filini
date: "2021-01-20"
tags: ["rust", "release"]
hidden: true
draft: false
---

A new release of BDK is out: the [`v0.3.0`] is a relatively small update compared to `v0.2.0`, but it still brings some nice APIs improvements and general bugfixes.

You can find the full [v0.3.0 changelog][changelog] on GitHub.

## What's new in v0.3.0

Below are some highlights of the new improved APIs coming with this release:

### Less verbosity when using `Wallet::new_offline()`

Now you don't have to explicitly provide the `OfflineWallet<_>` type anymore, saving you one import and making it much less verbose to use.

Where before you were doing:

```rust
let wallet: OfflineWallet<_> = Wallet::new_offline(...)?;
```

Now you can just write:

```rust
let wallet = Wallet::new_offline(...)?;
```

### No more error conversions in `DescriptorTemplate`

The `DescriptorTemplate` trait has been updated to return a [`descriptor::error::Error`] instead of a `KeyError`. The [`descriptor!()`] macro has been updated as well, which means that now you can use the macro inside a `DescriptorTemplate::build()` implementation
without having to [map the error](/blog/2020/12/release-v0.2.0/#descriptor-macro), like so:

```rust
pub struct TimeDecayingMultisig<K> {
    pk_a: K,
    pk_b: K,
    timelock: u32,
}

impl<K: ToDescriptorKey<Segwitv0>> DescriptorTemplate for TimeDecayingMultisig<K> {
    fn build(self) -> Result<DescriptorTemplateOut, descriptor::error::Error> {
        bdk::descriptor!(wsh(thresh(2,pk(self.pk_a),s:pk(self.pk_b),s:d:v:older(self.timelock))))
    }
}
```

### A new repo for the CLI

The `cli` module (and it's related `cli-utils` feature) have been removed from the main BDK repo and moved to their new home, the [bdk-cli] repo. The APIs exposed were mainly used internally, for the `repl` and the [playground](/bdk-cli/playground)
in our website, but in case you were using one of those keep that in mind.

## Contributors

A huge thanks to everybody who contributed to this new release with suggestions, pull requests and bug reports.

Since the `v0.2.0` release around a month ago, we've had `24` new commits made by `6` different contributors for a total of `404` additions and `1243` deletions. Here's the [full diff][gh_diff].

A special thanks to the new contributor for this release:

- [@tcharding][@tcharding] - Tobin C. Harding

[changelog]: https://github.com/bitcoindevkit/bdk/blob/75669049268bbc294564f8c6e0528e07a546258f/CHANGELOG.md#v030---v020
[gh_diff]: https://github.com/bitcoindevkit/bdk/compare/v0.2.0...v0.3.0
[bdk-cli]: https://github.com/bitcoindevkit/bdk-cli

[`descriptor!()`]: https://docs.rs/bdk/0.3.0/bdk/macro.descriptor.html
[`descriptor::error::Error`]: https://docs.rs/bdk/0.3.0/bdk/descriptor/error/enum.Error.html

[`v0.3.0`]: https://crates.io/crates/bdk/0.3.0

[@tcharding]: https://github.com/tcharding
