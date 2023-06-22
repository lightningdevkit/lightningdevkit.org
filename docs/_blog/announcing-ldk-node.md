---
title: "Announcing LDK Node"
description: "A ready-to-go Lightning node library built using LDK and BDK."
date: "2023-06-22"
authors:
  - Elias Rohrer
tags:
  - Self-custody
  - Mobile
---

[LDK Node][github_repo] is a ready-to-go Lightning node library built using [LDK][ldk] and [BDK][bdk]. LDK Node provides a straightforward interface and an integrated on-chain wallet, enabling users to quickly and easily set up a self-custodial Lightning node. With LDK Node, developers can get a Lightning Node up and running within a day.

## A Lightweight Solution
LDK fully implements the Lightning protocol as a highly modular Rust library. LDK's flexibility allows developers to integrate Lightning functionality into [many types of applications][ldk_case_studies], including those with pre-existing infrastructure or complex architectures. The public API comprises more than 900 exposed methods, letting users adjust and interact with protocol layers in great detail. While this customization is great for builders, it often comes with the added cost of increased complexity.

LDK provides sane defaults where possible. However, correctly and effectively setting up all interconnected modules requires a deeper understanding of protocol fundamentals and some familiarity with the LDK API. Moreover, because LDK adheres to the separation-of-concerns principle, it is wallet-agnostic and deliberately doesn't come with an included on-chain wallet. Therefore, the integration with a suitable on-chain wallet is left to the user.

As a result, it can take a bit of effort to get started with LDK. That's why we created LDK Node, a more fully-baked solution.

## LDK Node: Simplifying Self-custodial Lightning Integration
LDK Node was designed to hide protocol complexities without infringing on usability. LDK Node's much smaller API surface makes its reduced complexity evident. Compared to LDK's above 900 exposed methods, LDK Node's API currently only encompasses around 30 API calls. While simplicity and minimalism are at its core, LDK Node remains configurable enough to operate a fully functional self-custodial Lightning node in various use cases.

There is a trade-off between simplicity and expressiveness when designing an API while handling protocol complexity. The API needs to become more complicated to increase configurability and the interconnectivity of components. As a result, the user must spend more time examining, learning, and scrutinizing the API before finally being able to use it. While the LDK API errs on the side of expressiveness, LDK Node leans towards simplicity.

This first release of LDK Node comes with an opinionated set of design choices and ready-to-go modules:

- The integrated [BDK][bdk] wallet handles on-chain data.
- Chain data is sourced from an [Esplora][esplora] server, while support for Electrum and `bitcoind` RPC will follow soon.
- Wallet and channel state may be persisted to an [SQLite][sqlite] database, to file system, or to a custom back-end to be implemented by the user. Support for [Versioned Storage Service (VSS)][vss] will follow soon.
- Gossip data may be sourced via Lightning's peer-to-peer network or the [Rapid Gossip Sync (RGS)][rgs] protocol.
- Entropy for Lightning and on-chain wallets may be sourced from raw bytes or a [BIP39][bip39] mnemonic. In addition, LDK Node offers the means to generate and persist the entropy bytes to disk.

## Mobile-first Self-Custody
The main goal of the Lightning protocol is to enable fast, private, and secure Bitcoin transactions for the end-user. However, today most Lightning deployments are custodial services that may only be queried by the client device in the end-user's hands. This is understandable: deploying self-custodial Lightning nodes on end-user devices can take a lot of work to get right, as there are many pitfalls to avoid.

To this end, one of the primary goals of LDK Node is to simplify the integration of self-custodial Lightning nodes in mobile applications. The features of the initial release are centered around mobile deployments. The integration with an Esplora chain data source and a Rapid Gossip Sync server allows the node to operate in mobile environments that may be limited in terms of bandwidth and overall traffic quota.

LDK Node itself is written in [Rust][rust] and may therefore be natively added as a library dependency to any `std` Rust program. However, beyond its Rust API, it offers [Swift][swift], [Kotlin][kotlin], and [Python][python] language bindings based on [UniFFI][uniffi]. Moreover, [Flutter][flutter_bindings] bindings are also available to allow usage of the LDK Node library in mobile environments.

## Getting Started

The primary abstraction of the library is the [`Node`][api_docs_node], which can be retrieved by setting up and configuring a [`Builder`][api_docs_builder] to your liking and calling one of the `build` methods. `Node` can then be controlled via commands such as `start`, `stop`, `connect_open_channel`, `send_payment`, etc.

[Read Full API Documentation][api_docs]

```rust
use ldk_node::{Builder, NetAddress};
use ldk_node::lightning_invoice::Invoice;
use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::Network;
use std::str::FromStr;

fn main() {
	let mut builder = Builder::new();
	builder.set_network(Network::Testnet);
	builder.set_esplora_server("https://blockstream.info/testnet/api".to_string());
	builder.set_gossip_source_rgs("https://rapidsync.lightningdevkit.org/testnet/snapshot".to_string());

	let node = builder.build().unwrap();

	node.start().unwrap();

	let funding_address = node.new_onchain_address();

	// .. fund address ..

	let node_id = PublicKey::from_str("NODE_ID").unwrap();
	let node_addr = NetAddress::from_str("IP_ADDR:PORT").unwrap();
	node.connect_open_channel(node_id, node_addr, 10000, None, false).unwrap();

	let event = node.wait_next_event();
	println!("EVENT: {:?}", event);
	node.event_handled();

	let invoice = Invoice::from_str("INVOICE_STR").unwrap();
	node.send_payment(&invoice).unwrap();

	node.stop().unwrap();
}
```

## Outlook
The 0.1 release is only the beginning for LDK Node. Development for the next release has already started, and we'll be looking to add support for sourcing chain data from Electrum or `bitcoind` RPC, and supporting persistence to a [VSS][vss] backend (see the [v0.2 tracking issue][v02tracking]). Additionally, integration with the [LSP specification][lsp_spec] is actively being worked on (see the [LSP Client][lsp_client] repository) and will come to LDK Node as soon as it's ready. Beyond these planned feature updates to the LDK Node library, we're also considering further deployment targets, including adding server-grade modules in the future.

## Further Resources
- [Github Repository][github_repo]
- [API Documentation][api_docs]
- [Rust Crate][rust_crate]

## Showcases
- [Monday Wallet: Example wallet built with on LDK Node Swift bindings][monday]

[github_repo]: https://github.com/lightningdevkit/ldk-node
[api_docs]: https://docs.rs/ldk-node/*/ldk_node/
[api_docs_node]: https://docs.rs/ldk-node/*/ldk_node/struct.Node.html
[api_docs_builder]: https://docs.rs/ldk-node/*/ldk_node/struct.Builder.html
[rust_crate]: https://crates.io/
[ldk]: https://lightningdevkit.org/
[bdk]: https://bitcoindevkit.org/
[esplora]: https://github.com/Blockstream/esplora
[sqlite]: https://sqlite.org/
[rust]: https://www.rust-lang.org/
[swift]: https://www.swift.org/
[kotlin]: https://kotlinlang.org/
[python]: https://www.python.org/
[flutter_bindings]: https://github.com/LtbLightning/ldk-node-flutter
[v02tracking]: https://github.com/lightningdevkit/ldk-node/issues/107
[ldk_case_studies]: https://lightningdevkit.org/case-studies/
[vss]: https://github.com/lightningdevkit/vss-server
[rgs]: https://docs.rs/lightning-rapid-gossip-sync/0.0.115/lightning_rapid_gossip_sync/
[bip39]: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
[monday]: https://github.com/reez/Monday
[lsp_spec]: https://github.com/BitcoinAndLightningLayerSpecs/lsp
[lsp_client]: https://github.com/lightningdevkit/ldk-lsp-client
[uniffi]: https://github.com/mozilla/uniffi-rs/

