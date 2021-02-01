---
id: build_node
title: Building a Node
---

## Introduction
In this guide, we'll be building a lightning node using LDK.

The completed sample node built in this guide is available at [TODO(val) insert link]. *Not intended for use in production.* This node is built using the Java bindings. See [TODO(val)] for all LDK language bindings options.

Whether your project is an existing bitcoin-only wallet or a lightning wallet, the core process for
integrating LDK is the same.

The process breaks down to 3 overarching steps:
1. Initializing LDK's channel, peer, chain monitoring, and (optionally) routing objects. 
   * These objects will be parameterized by various other objects that can be from either your custom logic or one of LDK's supplied modules.
<!-- 2. Starting loops to (a) poll for new peers and (b) tell LDK's channel and peer objects each time a minute passes, so they can properly maintain their state. -->
2. Starting loops to (a) poll for new peers and (b) periodically nudge the channel and peer objects so they can properly maintain their state.
   * Specific instructions for existing lightning wallets is found in the Lightning Wallet Integration Guide.
3. Connect and disconnect blocks to LDK as they come in.

## Requirements
0. Some basic lightning knowledge like e.g. what a channel is, what force-closing means.
1. A regtest bitcoind node (see [TODO(val) link to polar] for an easy way to spin this up)
2. Java (this was tested using Java 11)
<!-- 3. LDK's Java bindings jar [TODO link] in your class path -->
TODO revise requirements

## Part 0: Setup
Import the bindings to your Java file and define a `main()`:
```java
import org.ldk.impl.bindings;

public static void main(String[] args) {

}
```

## Part 1: Managing Channels
We'll start by initializing probably the most core struct to Rust-Lightning (see FAQs[TODO add link] for the difference between Rust-Lightning and LDK): the channel manager. 

First, we'll initialize the objects that the channel manager is parameterized by.
// fee estimator, chain_watch, tx broadcaster, logger, keys interface,

## Part 1: Chain Monitoring
Every lightning implementation needs a way to watch for relevant transactions appearing on-chain.

### Setup
But first, some housekeeping. 

1. Within `main`, initialize a logger. A logger can be anything that satisfies the `LoggerInterface` interface [TODO add link]. In this case, we'll just print to the console.

```java
public static void main(String[] args) { 
    // LoggerInterface is a functional interface, so we can implement it with a lambda
    final logger = Logger.new_impl((String log) -> System.out.println(log));
}
```

2. Add an on-chain fee estimator, which is anything that satisfies the `FeeEstimatorInterface` interface [TODO add link]. We need this because LDK's chain monitoring logic is responsible for broadcasting force-close transactions.

```java
    ..
    final fee_estimator = FeeEstimator.new_impl((
```

3. Add a transaction broadcaster, which is anything that satisfies the `TransactionBroadcasterInterface` interface. We need this to broadcast the force-closing transaction if need be.
```java
    ..
    final tx_broadcaster = 
```


4. Add a data persister, which is anything that satisfies the `PersisterInterface` interface. We need this because our chain monitoring system also needs to ensure that crucial channel data is pesisted to disk and/or backups.
```java
    ..
    final persister = 
```

We're now ready to initialize our chain monitor.

```java
    ..
    final chain_monitor = ChainMonitor.constructor_new(null, tx_broadcaster, logger, fee_estimator, persister);
```

Next, we'll add the feature of telling this object whenever we receive a connected or disconnected block.


## 
