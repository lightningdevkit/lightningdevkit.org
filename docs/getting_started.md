---
id: getting_started
title: Getting Started
---
import useBaseUrl from '@docusaurus/useBaseUrl';

## Introduction

This guide will give an entrypoint to LDK as a whole, an introduction to the architecture of LDK and what
batteries need to be plugged into it to get it working. These batteries
can be supplied by the user or by one of LDK's sample modules.

## How To Use These Docs
"Getting Started" + "Overview" provide an introduction to the architecture and
design philosophy of LDK. 

"Build a Node: Checklist" walks through how to specifically integrate LDK into
your application, as well as documentation for what features are currently available
and not available for LDK in Java. "Opening a Channel" is a follow-up to "Build a Node"
that walks through an example of opening a channel with LDK.

"Key Management", "Spending On-Chain Funds", and "Block Data" dive into more depth on their topics.

Throughout these docs, if any piece of code is used or mentioned, the most in-depth docs can be
found by searching [the Rust docs](https://docs.rs/lightning/0.0.12/lightning/index.html).

## Architecture
<img alt="LDK Architecture" src={useBaseUrl('img/ldk_arch.svg')} />

The big blue box in the center contains all of LDK's core objects.

The green boxes and Data Storage are all of LDK's batteries that must be provided.

## LDK Batteries

This section will be updated as support for LDK batteries changes.
* Networking (lightning-net-tokio in the diagram)
  * Sample modules are available in [Rust](https://github.com/rust-bitcoin/rust-lightning/tree/main/lightning-net-tokio) and [Java](https://github.com/lightningdevkit/ldk-garbagecollected/tree/main/src/main/java/org/ldk/batteries)
* KeysManager
  * LDK supplies an implementation called [KeysManager](https://docs.rs/lightning/0.0.10/lightning/chain/keysinterface/struct.KeysManager.html)
* Data storage
  * sample module is available in [Rust](https://github.com/rust-bitcoin/rust-lightning/tree/main/lightning-persister)
* BlockSource
  * sample module is almost available in [Rust](https://github.com/rust-bitcoin/rust-lightning/pull/763)
* Randomness
  * currently only supplied by the user
* FeeEstimator
  * currently only supplied by the user
* TxFilter
  * currently only supplied by the user
* TxBroadcaster
  * currently only supplied by the user
  
EventHandler in the diagram is not so much a necessary LDK battery, but instead
refers to the fact that LDK generates events that the user should handle (e.g.
the `PaymentReceived` event).
