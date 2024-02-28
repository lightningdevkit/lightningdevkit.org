---
title: 'Unleashing Liquidity on the Lightning Network with "lightning-liquidity"'
description: "The lightning-liquidity crate is an easy-to-integrate rust library that wallet developers and LSP operators can use to implement the LSP specification"
date: "2024-02-28"
authors:
  - John Cantrell
tags:
  - liquidity
--- 

The [lightning-liquidity](https://github.com/lightningdevkit/lightning-liquidity) crate is an easy-to-integrate rust library that wallet developers and LSP operators can use to implement the LSP specification. The initial alpha release supports the core functionality of JIT channels under the [LSPS2 specification](https://github.com/BitcoinAndLightningLayerSpecs/lsp/tree/main/LSPS2), with plans to expand support to other key areas such as the [Channel Request protocol (LSPS1)](https://github.com/BitcoinAndLightningLayerSpecs/lsp/tree/main/LSPS1), [Webhook Notifications (LSPS5)](https://github.com/BitcoinAndLightningLayerSpecs/lsp/blob/edf3d925ed67405963421e7228897a343ecd53ee/LSPS5/README.md), and the next iteration of [JIT Channels (LSPS4 - Continuous JIT Channels)](https://github.com/BitcoinAndLightningLayerSpecs/lsp/blob/db0e99e8b65641a18c2d9b9fdf22c2dbae2af32d/LSPS4/README.md).

The lightning-liquidity release marks a significant milestone in ongoing efforts to make the Lightning Network more accessible and user-friendly. 

## How It All Started: Lightning's Liquidity Problem

The Lightning Network offers some relief from bitcoin’s inherent transaction speed and cost limitations. Lightning relies on a network of payment channels facilitating nearly instant, low-fee transactions. However, the promise of this technology comes with its own [set of challenges](https://lightningdevkit.org/blog/the-challenges-of-developing-non-custodial-lightning-on-mobile), particularly around obtaining inbound liquidity.

To receive a payment, a user must have a payment channel with sufficient funds on the counterparty's side. This upfront liquidity requirement demands coordination with a counterparty willing to sell said liquidity, which has historically posed a significant barrier to entry for new users.


## Current Approaches and Their Shortcomings

Wallet developers often implement their own Lightning Service Provider (LSP) to distribute inbound liquidity to their users. LSPs work by agreeing to lock up their funds in channels for a fee. While this model enables more users to more easily participate in the network, it also has several problems:

 - **Lack of Interoperability**: Each wallet developer has to build their own LSP protocols and infrastructure, leading to a fragmented ecosystem where users are tied to specific wallets or services.


 - **Reliability**: A single LSP means a single point of failure. An LSP with poorly managed liquidity could render users unable to send and receive payments.

 - **Privacy**: Centralizing payments raises the potential for surveillance and data collection.

 - **Censorship**: LSPs can block or be forced to block payments at their discretion.

 - **Cost**: With limited competition, users could face high, non-market fees for obtaining liquidity.

 ## A Unified Solution: The Standardization Effort

[A consortium of Lightning developers](https://github.com/BitcoinAndLightningLayerSpecs/lsp) recognized these challenges and came together with a mission to standardize a protocol for acquiring inbound liquidity. This effort aimed to create a blueprint that any wallet or LSP could adopt, fostering interoperability and competition.

The benefits of this standardization are:

 - **Efficiency**: A single, well-defined protocol simplifies the development process, enabling wallet and LSP creators to focus on innovation rather than reinventing the wheel.

 - **Choice and Flexibility**: Users gain the freedom to switch between LSPs seamlessly, promoting a competitive market that drives up service quality and drives down costs.

 - **Addressing Core Issues**: Diversifying the ecosystem tackles the fundamental concerns of reliability, privacy, censorship, and monopolistic practices.

## Just-In-Time Channels: A Cornerstone of the New Protocol

Just-In-Time (JIT) channels are the heart of the standardized protocol. These channels lower the barrier to entry for new users by allowing anyone to receive bitcoin payments over the Lightning Network without bitcoin or liquidity management. 

Here's how it works: a user requests a Lightning invoice for an incoming payment. Upon payment, the LSP intercepts this payment, opens a 0-conf channel to the user, deducts their fee and forwards the rest of the payment to the user. This process happens almost instantaneously, removing the need for users to understand or manage liquidity themselves.

## Introducing `lightning-liquidity`

`lightning-liquidity` provides a comprehensive toolkit for implementing the JIT channel protocol and other aspects of the LSP specification. This open standard streamlines the development process and ensures that a broader audience can access the benefits of the Lightning Network. 

## How It Works: For Developers and Businesses

For wallet developers, integrating "lightning-liquidity" offers users immediate access to the Lightning Network's capabilities without the traditional hurdles of securing inbound liquidity. Developers can embed the library into their applications, making receiving payments seamless and efficient.

The “lightning-liquidity” crate is already integrated directly into the [ldk-node](https://github.com/lightningdevkit/ldk-node) project allowing for an extremely easy way to get started.  Here’s a short example of how to get inbound liquidity using the new liquidity functionality of ldk-node: 

```rust
use ldk_node::Builder;
use ldk_node::lightning_invoice::Bolt11Invoice;
use ldk_node::lightning::ln::msgs::SocketAddress;
use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::Network;
use std::str::FromStr;

fn main() {
	let lsp_node_id = PublicKey::from_str("LSP_NODE_ID").unwrap();
	let lsp_node_addr = SocketAddress::from_str("LSP_IP_ADDR:LSP_PORT").unwrap();
	let lsp_token = Some(“LSP_TOKEN”.to_string());

	let mut builder = Builder::new();

	// tell ldk-node we want to source liquidity using LSPS2
	builder.set_liquidity_source_lsps2(lsp_node_addr, lsp_node_id, lsp_token)
	
	let node = builder.build().unwrap();
	node.start().unwrap();
	
	// how much I want to receive
	let invoice_amount_msat = 500_000_000;

	// the maximum I’m willing to pay in fees for the channel from the LSP
	let max_total_fee_limit_msat = 5_000_000;
	
	// the invoice I receive will be valid for this many seconds
	let invoice_expiry_seconds = 3600;
	
	// get an invoice I can have paid without needing to set up any channels
	let invoice = node.receive_payment_via_jit_channel(invoice_amount_msat, “invoice description”, invoice_expiry_seconds, Some(max_total_fee_limit_msat)).unwrap();

}

```

If you are not using ldk-node then here is some example code that will help you get started implementing “lightning-liquidity” into your LDK based wallet: https://gist.github.com/johncantrell97/1d869aedcb8aef3f69874c15a0793dae

Businesses looking to operate as LSPs can easily leverage "lightning-liquidity" to offer liquidity services. The library simplifies the technical complexities involved in channel management, allowing businesses to focus on providing value to their customers rather than dealing with the intricacies of the Lightning Network protocol.

The LSPS2 protocol enables LSPs to earn a fee from every channel sold to wallet users. This fee consists of a minimum fee and a proportional fee. The proportional fee allows LSPs to earn a fee proportional to the payment size they need to route over the new channel. In contrast, the minimum fee ensures the fees they earn are guaranteed to be enough to cover their costs regardless of the payment size.

The protocol also allows LSPs to require and offer unique tokens that users or wallet developers can supply when requesting liquidity. The LSP can then dynamically adjust fees and channel parameters based on these tokens, allowing them to broker unique deals that cater to a wide range of potential requirements.

LDK LSP Server Example: https://gist.github.com/johncantrell97/dc682d2d75a0331fa83cb10a54f62b74

## Join Us in Shaping the Future

The launch of "lightning-liquidity" is just the beginning. We are committed to continuous improvement and expansion of the library to meet the evolving needs of the Lightning Network community. We encourage feedback, contributions, and collaboration from developers, businesses, and users. Together, we can unlock the full potential of the Lightning Network, making instant, low-cost Bitcoin transactions a reality for users worldwide.

For more information on the `lightning-liquidity` library, the LSP specification, and how you can contribute to this transformative project, visit [the specification repository](https://github.com/BitcoinAndLightningLayerSpecs/lsp) and [lightning-liquidity GitHub repository](https://github.com/lightningdevkit/lightning-liquidity). Together, we can build a more robust, efficient, and open Lightning Network.
