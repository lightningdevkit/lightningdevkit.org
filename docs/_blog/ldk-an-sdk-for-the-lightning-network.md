---
title: "LDK: An SDK for the Lightning Network"
description: "Learn how LDK improves DX, makes it easier to work with Lightning functionality, and makes building faster for your entire team in our newly launched blog."
date: "2022-06-20"
authors:
  - Conor Okus
tags:
  - Bitcoin
  - LDK
---  
We are excited to release our first blog post, we have a lot to share and a lot to build. We’ll be updating this blog regularly with what we’re working on, new features and the details on new releases. 
  
## LDWho?  

If you’re reading this, you probably know something about the Lightning Development Kit, the easy-to-use open-source tool that simplifies how developers add highly secure, privacy-preserving Lightning functionality to bitcoin applications. What you might not know is how it got started. 

If you’re reading this, you probably know something about the Lightning Development Kit, the easy-to-use open-source tool that simplifies how developers add highly secure, privacy-preserving Lightning functionality to bitcoin applications. What you might not know is how it got started. 

LDK began as a side project developed by Matt Corallo [@TheBlueMatt](https://twitter.com/TheBlueMatt) in [2018](https://github.com/lightningdevkit/rust-lightning/commit/6185a2819090bd077954244c5e2adaab5efcaa1a) called rust-lightning. One of Matt’s earliest rust-lightning [demos](https://www.youtube.com/watch?v=bfAz0vYlDAI) shows how you can take a full Lightning implementation (managing channels, generating messages to send to peers, signatures, on-chain punishment, etc), and use it to create a library with high-level APIs, so developers can build more and agonize less.

This highly specialized library needed to be flexible enough to let developers customize areas like on-chain wallet creation, sourcing blockchain data, and backing up channel states while paving the way for them to make those critical decisions at 10x speed. 

Initially supported by [Chaincode Labs](https://chaincode.com/) and then by [Spiral](https://spiral.xyz/), LDK has gone from a good idea to a mature, [open-source project](https://github.com/lightningdevkit) with [many contributors](https://github.com/lightningdevkit/rust-lightning/graphs/contributors) in just a few years. LDK is a robust, modular, mobile-friendly SDK that can be [integrated into existing bitcoin wallets](https://vimeo.com/showcase/8372504/video/412818125) while significantly [improving how developers integrate Lightning](https://bitcointv.com/w/sy6s9vVCmDvXr46YtbYcXM). 

Over time, we hope that LDK will become a public good that doesn’t rely on a single entity like Spiral to be sustainable, which is why we’re already fostering a community, empowering non-Spiral participants, and [gradually reducing Spiral’s influence](https://spiral.xyz/blog/a-framework-for-sustainable-open-source-bitcoin-development/). Like Bitcoin Core, we expect LDK to have a strong group of volunteers contributing to the project and many entities funding the project. 


## What advantages does LDK offer developers?

Before committing to LDK, we spoke with over 50 wallet developers to learn what challenges they faced. We learned that developing Lightning apps was a universally bad experience, especially in mobile environments, and that a small team of experienced engineers could take up to two years to build a basic Lightning application. So… not great. 

LDK is a flexible Lightning implementation that focuses on running the Lightning node on a mobile phone in a non-custodial manner, which has significant privacy and sovereignty benefits. While this presents some technical challenges, non-custodial mobile apps are where LDK specializes, whether someone is building a wallet from scratch or integrating LDK into one that already exists.

Before LDK, if your team wanted to add Lightning functionality to a mobile app, you most likely had to modify and customize an existing implementation like LND to make it suitable for mobile devices. Core Lightning is also hard to run on iPhones. Both of these implementations are out-of-the-box node solutions that provide solid RPC and HTTP interfaces, but are targeted for server environments or simply aren’t suited to mobile. 

Furthermore, if you want to turn your on-chain wallet into a unified wallet experience or source chain data from a third-party server using the Electrum protocol for resource-constrained devices, it’s complex, time-consuming, and a huge engineering undertaking.

Maintaining an LN implementation that you can trust with real money is challenging, and different needs exist for routing nodes and mobile nodes. Maintenance costs also increase over time due to ageing codebases, interactions with other layers, and new use cases with different performance and security trade-offs. We see this with [Breez](https://github.com/breez/breezmobile) forking [LND](https://github.com/breez/lnd) to make it suitable for mobile and ACINQ doing something similar with [Phoenix](https://github.com/ACINQ/phoenix) wallet and [lightning-kmp](https://github.com/ACINQ/lightning-kmp).  

We created LDK in multiple languages with an API-first approach designed to run at the application layer, like Rust’s [Persist](https://docs.rs/lightning/latest/lightning/chain/chainmonitor/trait.Persist.html) trait. Persist defines behaviour for persisting channel states but lets you specify whether you write this data to disk or another backup mechanism, such as the cloud. You don’t need to write an LN implementation from scratch or modify an existing one to use LN functionality. Just call our APIs from your app.

Finally (for this section), LDK’s flexibility enables several different architectures without sacrificing security. Its lightweight design can be optimized to run on embedded devices or HSMs (hardware security modules) and it doesn’t make system calls, so it can run in almost any OS environment. For example, you can opt to run some Lightning logic, such as signing transactions and updating channel states on an HSM that has specific [spending policies](https://gitlab.com/lightning-signer/docs/-/blob/master/README.md) and manages private keys. Then you connect it to a server with its own TCP/IP stack using a serial communication method such as USB. 

More on LDK use cases [here](https://lightningdevkit.org/introduction/use_cases/).

## Who uses LDK?

LDK supports applications that require running many nodes (such as server/custodial apps), letting users run nodes on mobile devices, integrating with existing infrastructure, broad customization options, and resource-constrained embedded systems such as point of sale, IoT, and so on and so on, etc.  

[Blue Wallet](https://bluewallet.io) was LDK’s patient zero and ideal first adopter since it is both non-custodial and mobile. Their team maintains [rn-ldk](https://github.com/BlueWallet/rn-ldk) and runs it on both Android and iOS.The wallet is likely to ship with LDK soon but not before some critical infrastructure is in place. While non-custodial mobile wallets are LDK’s primary use case, that doesn’t make it limited to them.

[CashApp](https://cash.app), one of the world’s most used payment apps, chose LDK for its Lightning implementation because of its customizability. While custodial server-based solutions are not the primary use case for LDK, it shows how adaptable the library is. Ryan Loomba recently explained some of the trade-offs their team had to think about when comparing LDK to other solutions [at bitcoin++](https://www.youtube.com/watch?v=5YmfEgh-LC8&t=2442s).

[Sensei](https://l2.technology/sensei), an out-of-the-box lightning node solution, is also powered by LDK. Its modular architecture enables a unique multi-node operation mode, letting nodes easily share a network graph, route scoring, and chain data which enables exciting new use cases.

We’re also talking to dozens of developers, some of whom we expect to adopt LDK soon. 

Know someone building a Lightning wallet or related application? Point them in [@moneyball’s](https://twitter.com/moneyball) direction. If you’re already using LDK and have questions, hop into our [Discord](https://twitter.com/moneyball) or [Slack](https://join.slack.com/t/lightningdevkit/shared_invite/zt-tte36cb7-r5f41MDn3ObFtDu~N9dCrQ).

## What are LDK’s engineering priorities?

`Offline Receive`  
A problem with Lightning UX is that mobile wallets can’t receive payments unless the user is using the app. We’re developing solutions in conjunction with the LN developer community that will let offline nodes receive payments. Spiral’s Matt Corallo has a pull request open that proposes a protocol to fix this exact problem. It includes his original post to the Lightning Devs mailing list which is a pretty good technical read on this issue if you’re in the mood for one of those.

`BOLT 12`  
This feature improves privacy by allowing reusable payments over blinded paths and provides a framework for future upgrades that support recurring payments. There’s still work to be done, and it includes implementing route blinding/blinded paths, an onion messages API for requesting invoices, and BOLT 12 invoice parsing. 

`Taproot`  
Taproot! People love it. We love it. It’s been several months since full activation, and LDK will start to take advantage of everything it offers. This includes improved on-chain privacy by making current funding channel outputs (2-of-2 multisig) indistinguishable from single sig outputs, and making channel opening and closing transactions look more like regular non-lightning transactions. In addition, we’re looking to support multi-sig channel capabilities as they allow for greater security, redundancy, and flexibility.

`Language Bindings`  
We’re making existing language integrations feel more native. We currently support Rust, C/C++, Swift, Java, & Kotlin. It’s now in the beta stage, but JavaScript/TypeScript/WASM is also supported, and we are prioritizing bug fixing for early adopters. In the future, expect support for C#, Python, Flutter/Dart, and possibly others.

Also in LDK’s future: a simplified API that makes opinionated decisions on behalf of developers that will accelerate getting their apps up and running. Think of it as a Rust crate but using UniFFI to auto-generate language bindings for Kotlin, Swift, Python, and Ruby that expedite basic send/receive functionality.

## Notable Updates
Phantom Node support is up and running (separate blog post coming soon…ish). This integration adds support for multi-node receive, which enables enterprise-level architecture. This is important since users might need production nodes to receive payments when load balancing is required.

We've introduced a new client-side pathfinding API to LDK that simplifies quickly downloading gossip data from a server. This means that servers can't know who you are paying or how much.

We now support zero conf channels, allowing immediate forwarding of payments after channel opening/receiving for those wanting to build inbound liquidity services.    

SCID Aliases (short channel IDs) were added in a recent release and may be negotiated when opening a channel with a peer. This has significant privacy benefits and will likely be the default in the future. 


Anything else?

Absolutely. But this post is long enough for now. Keep an eye out for announcements from [@spiralbtc](https://twitter.com/spiralbtc) and [@lightningdevkit](https://twitter.com/lightningdevkit).
