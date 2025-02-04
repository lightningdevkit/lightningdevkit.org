---
title: "How we built our Sparknodes using LDK"
description: "Learn how Lightspark used LDK to build their Lightning Network infrastructure"
date: "2025-02-04"
authors:
  - Lightspark Engineering
tags:
  - Case-Studies
---

When we started building Lightspark's Lightning Network infrastructure, we needed an architecture that could scale as customer demand grew. Our system needed to be flexible and capable of scaling with the growth.

After evaluating various Lightning implementations, we chose Lightning Development Kit (LDK) for two key reasons: its unique ability to manage multiple nodes in a single process and its customizability, which later allowed us to build our remote signing functionality.

# Implementation Journey

Our primary technical requirement was the ability to run multiple Lightning Nodes as efficiently as possible to enable us to scale to customer demand. Traditional Lightning implementations require each node to run in its own process, which would have made scaling to thousands or millions of nodes complicated. LDK's flexible architecture allowed us to optimize system resources in ways that weren't possible with other implementations.

We designed our system to share resources when handling common operations. For example, instead of having each node individually query bitcoind for updates, we implemented a single observer process that polls bitcoind for block updates and fee estimates, then updates all nodes while caching results in memory. This pattern was applied to other aspects of our nodes, such as how we sync the network graph for routing payments. This architectural choice significantly reduced system overhead and improved performance.

# Flexibility and Customization

LDK offers several APIs, allowing developers to implement their own custom signing behavior. This was crucial to support remote signing, where the Lightning Node runs on Lightspark infrastructure while the keys never leave the customer’s infrastructure. With help from the LDK team, we’ve been able to upstream most of the asynchronous signing functionality, reducing our own maintenance burden and making it available for all LDK users.

We store all node and channel data in our database in a way that's agnostic to any specific Lightning implementation, giving us the flexibility to adapt our architecture as needed. LDK's extensive APIs for various events, messages, and updates made it straightforward to integrate into our existing services while maintaining implementation flexibility. With other implementations, we need to patch on external jobs or maintain changes on a fork, whereas it was easy to hook LDK into our existing services with what was provided out of the box.

# Evolution and Current Status

While our initial vision focused on scaling to millions of non-custodial nodes, our design needs have evolved. We have pivoted to focus on remote signing capabilities, where LDK's flexible interface gave us a head start and enabled us to build precisely the architecture we needed for customers like Coinbase. Today, our infrastructure uses both LND and LDK nodes, each serving different purposes, and we continue to onboard additional customers as we scale our services.
