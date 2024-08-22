---
title: "Mutiny uses LDK to create the first lightning wallet for the web"
description: "Learn how Mutiny built a lightning wallet for the web"
date: "2023-08-07"
authors:
  - Ben Carman
tags:
  - Case-Studies
---

Mutiny is a new lightning wallet for the web. It is the first self-custodial wallet to run directly in a user's browser. It’s built on top of LDK and [BDK](https://bitcoindevkit.org/), written in Rust, and compiled into WebAssembly. It offers a simple, intuitive interface for sending and receiving payments and other advanced features, such as Nostr Wallet Connect and subscription payments.

We chose to build on LDK and BDK because it wouldn’t have been possible to build a wallet like Mutiny in any other way. Since LDK is written in Rust, we were able to compile it into WebAssembly. Rust's unique combination of type-safety, memory-safety, and efficient runtime performance make it ideally suited to a lightning node that must be reliable, fast, and lightweight enough to run on a mobile phone. LDK's modular design means we can customize it to work within the specific constraints of a web browser. LDK also provides a robust API for building advanced features for our wallet that would otherwise not be possible.

# What we did?

We used LDK to make a crate called mutiny-node which holds all our main wallet logic. Then we used the wasm-bindgencrate to generate JavaScript bindings that can be imported into a regular web project. Thankfully, LDK supports no_std, so compiling it into WebAssembly without any modifications was possible.

Mutiny is a lite-client wallet, meaning it does not run a full bitcoin node. Instead, it gets its blockchain data from an esplora instance. LDK's Filter interface made it easy to implement this, allowing for a simple and efficient way to sync the wallet with the blockchain. [Rapid Gossip Sync](https://docs.rs/lightning-rapid-gossip-sync/0.0.115/) also helps make the wallet sync quickly, and RGS allows us to sync lightning gossip data nearly instantly without spending unnecessary bandwidth and CPU resources.

Local storage can be unreliable in web browsers, so we also want users to be able to recover their wallet in case they lose their device. We implemented the LDK project's [VSS](https://github.com/lightningdevkit/vss-server) specification to give our users encrypted cloud backups to support this.

While we're currently focused on the web, this architecture and the flexibility of LDK means we will be able to share most of our code with a mobile or even server version of Mutiny in the future.

# Results

LDK made building a lightning wallet that runs in the browser possible. Compiling to WebAssembly and LDK's various tools for lite clients allowed us to create an unstoppable, self-custodial wallet that anyone can use without downloading any software. We hope that Mutiny will help bring lightning to the masses, and we are excited to see what the future holds for LDK and lightning on the web.

You can learn more and try it out at [mutinywallet.com](https://www.mutinywallet.com/).
