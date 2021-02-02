---
id: build_node
title: "Building a Node: Checklist"
---

## Introduction

This document is a few checklists for everything you need to make a node using LDK.

* The first checklist is everything you need to do on startup.
* The second checklist is everything you need to do while LDK is running to keep it operational.
* The third checklist covers lightning operations you'll want to use.

Note that LDK does not assume that safe shutdown is available, so there is no 
shutdown checklist.

## Startup Checklist
- [ ] Initialize the fee estimator
  * What it's used for: estimating fees for on-chain transactions that LDK wants broadcasted.
  * Dependencies: none
  * Example fee estimator that always returns `253` satoshis:
```java
// FeeEstimatorInterface is a functional interface, so we can implement it with a lambda
final fee_estimator = FeeEstimator.new_impl((confirmation_target -> 253));
```
    Rather than using static fees, you'll want to fill in the lambda with fetching up-to-date fees from a source like bitcoin core or your own API endpoint.
- [ ] Initialize the logger
- [ ] Initialize the transaction broadcaster
  * What it's used for: 
  * Dependencies: none
  * Example transaction broadcaster skeleton:
```java
final tx_broadcaster = BroadcasterInterface.new_impl(tx -> {
    // <insert code to actually broadcast the given transaction here>
});
```
- [ ] Initialize the channel data persister
  * What it's used for: 
  * Dependencies: none
  * Example:
```java
Persist persister = Persist.new_impl(new Persist.PersistInterface() {
  @Override
  public Result_NoneChannelMonitorUpdateErrZ persist_new_channel(OutPoint id, ChannelMonitor data) {
    TODO fill this in
  }

  @Override
  public Result_NoneChannelMonitorUpdateErrZ update_persisted_channel(OutPoint id, ChannelMonitorUpdate update, ChannelMonitor data) {
    // TODO fill this in
  }
});
```
- [ ] Initialize the chain monitor
  * What it's used for: 
  * Dependencies: fee estimator, logger, transaction broadcaster, channel data persister
  * Optional dependency: ChainSource
  * Example:
```java
// The `null` here must be filled in with a struct if you are running a light client.
final chain_monitor = ChainMonitor.constructor_new(null, tx_broadcaster, logger, fee_estimator, persister);
```
- [ ] Fill in the chain monitor's channel monitor state if LDK is restarting
// TODO: add reading existing monitors from disk and handling replaying blocks, handling forks
- [ ] Initialize the keys manager
  * What it's used for: 
  * Dependencies: random bytes, the current bitcoin network
  * Example:
```java
byte[] key_seed = new byte[32];
// <insert code to fill key_seed with random bytes>
// Notes about this KeysManager:
// * it is parameterized by the mainnet bitcoin network, but this should be swapped out for testnet or regtest as needed.
// * TODO document why the current time is part of the parameters
KeysManager keys = KeysManager.constructor_new(key_seed, LDKNetwork.LDKNetwork_Bitcoin, System.currentTimeMillis() / 1000, (int) (System.currentTimeMillis() * 1000));
```
- [ ] Initialize the router (which we call the `NetGraphMsgHandler`)
// TODO add reading router data from disk if restarting
    * What it's used for: 
    * Dependencies: logger
    * Optional dependency: source of chain information, recommended for light clients to be able to verify channels
    * Example:
```java
// TODO: have the example include reading from disk OR starting a new one
final router = NetGraphMsgHandler.constructor_new(new byte[32], null, logger);
```
- [ ] Initialize the channel manager
// TODO add stuff if we're restarting/reading from disk
    * What it's used for: 
    * Dependencies: 
    * Optional dependency: 
    * Example:
```java
```
- [ ] Initialize the peer manager using LDK's `PeerManager` struct combined with LDK's supplied `NioPeerHandler` networking module
  * What it's used for: 
  * Dependencies: channel manager, router, keys manager, random bytes, logger
  * Example:
```java
byte[] random_data = new byte[32];
// <insert code to fill in `random_data` with random bytes>
final nio_peer_handler;
final peer_manager = PeerManager.constructor_new(chan_manager.as_ChannelMessageHandler(), router.as_RoutingMessageHandler(), keys_interface.get_node_secret(), random_data, logger);
try { nio_peer_handler = new NioPeerHandler(peer_manager); } catch (IOException e) { assert false; }
```
- [ ] Start a loop for the peer manager to accept new connections.
  * What it's used for: 
  * Dependencies: 
  * Optional dependency: 
  * Example:
```java
        TODO fix this example
            for (short i = 10_000; true; i++) {
                try {
                    nio_peer_handler.bind_listener(new InetSocketAddress("127.0.0.1", i));
                    nio_port = i;
                    break;
                } catch (IOException e) { assert i < 10_500; }
            }
```
- [ ] Start a loop for processing the peer manager's events.
  * What it's used for: 
  * Dependencies: 
  * Example:
```java
```
- [ ] Connect to peers on startup
  * What it's used for: 
  * Dependencies: 
  * Example:
```java
```
- [ ] Start a loop to handle the channel manager's generated events
// TODO add persisting the channel manager after handling each event
    * What it's used for: 
    * Dependencies: 
    * Example:
```java
```
- [ ] Persist router data in a background loop
- [ ] Start a loop to call `timer_chan_freshness_every_min` every minute

## Running LDK Checklist
- [ ] Connect and disconnect blocks to LDK as they come in
```java
channel_manager.block_connected(header, txn, height);
chain_monitor.block_connected(header, txn, height);
```

## Using LDK
- [ ] opening/closing channels
- [ ] sending payments and getting the result of the payment
- [ ] connecting/disconnecting peers


<!-- In this guide, we'll be building a lightning node using LDK. -->

<!-- The completed sample node built in this guide is available at [TODO(val) insert link]. *Not intended for use in production.* This node is built using the Java bindings. See [TODO(val)] for all LDK language bindings options. -->

<!-- Whether your project is an existing bitcoin-only wallet or a lightning wallet, the core process for -->
<!-- integrating LDK is the same. -->

<!-- The process breaks down to 3 overarching steps: -->
<!-- 1. Initializing LDK's channel, peer, chain monitoring, and (optionally) routing objects.  -->
<!--    * These objects will be parameterized by various other objects that can be from either your custom logic or one of LDK's supplied modules. -->
<!-- 2. Starting loops to (a) poll for new peers and (b) tell LDK's channel and peer objects each time a minute passes, so they can properly maintain their state. -->
<!-- 2. Starting loops to (a) poll for new peers and (b) periodically nudge the channel and peer objects so they can properly maintain their state. -->
<!-- 3. Connect and disconnect blocks to LDK as they come in. -->

<!-- ## Requirements -->
<!-- 0. Some basic lightning knowledge like e.g. what a channel is, what force-closing means. -->
<!-- 1. A regtest bitcoind node (see [TODO(val) link to polar] for an easy way to spin this up) -->
<!-- 2. Java (this was tested using Java 11) -->
<!-- 3. LDK's Java bindings jar [TODO link] in your class path -->
<!-- TODO revise requirements -->

<!-- ## Part 0: Setup -->
<!-- Import the bindings to your Java file and define a `main()`: -->
<!-- ```java -->
<!-- import org.ldk.impl.bindings; -->

<!-- public static void main(String[] args) { -->

<!-- } -->
<!-- ``` -->

<!-- ## Part 1: Managing Channels -->
<!-- We'll start by initializing probably the most core struct to Rust-Lightning (see FAQs[TODO add link] for the difference between Rust-Lightning and LDK): the channel manager.  -->

<!-- First, we'll initialize the objects that the channel manager is parameterized by. -->
<!-- // fee estimator, chain_watch, tx broadcaster, logger, keys interface, -->

<!-- ## Part 1: Set up Objects Used For Chain Monitoring -->
<!-- Every lightning implementation needs a way to watch for relevant transactions appearing on-chain. -->

<!-- ### Setup -->
<!-- But first, some housekeeping.  -->

<!-- 1. Within `main`, initialize a logger. A logger can be anything that satisfies the `LoggerInterface` interface [TODO add link]. In this case, we'll just print to the console. -->

<!-- ```java -->
<!-- public static void main(String[] args) {  -->
<!--     // LoggerInterface is a functional interface, so we can implement it with a lambda -->
<!--     final logger = Logger.new_impl((String log) -> System.out.println(log)); -->
<!-- } -->
<!-- ``` -->

<!-- 2. Add an on-chain fee estimator, which is anything that satisfies the `FeeEstimatorInterface` interface [TODO add link]. We need this because LDK's chain monitoring logic is responsible for broadcasting force-close transactions. -->

<!-- ```java -->
<!--     .. -->
<!--     final fee_estimator = FeeEstimator.new_impl(( -->
<!-- ``` -->

<!-- 3. Add a transaction broadcaster, which is anything that satisfies the `TransactionBroadcasterInterface` interface. We need this to broadcast the force-closing transaction if need be. -->
<!-- ```java -->
<!--     .. -->
<!--     final tx_broadcaster =  -->
<!-- ``` -->


<!-- 4. Add a data persister, which is anything that satisfies the `PersisterInterface` interface. We need this because our chain monitoring system also needs to ensure that crucial channel data is pesisted to disk and/or backups. -->
<!-- ```java -->
<!--     .. -->
<!--     final persister =  -->
<!-- ``` -->

<!-- We're now ready to initialize our chain monitor. -->

<!-- ```java -->
<!--     .. -->
<!--     final chain_monitor = ChainMonitor.constructor_new(null, tx_broadcaster, logger, fee_estimator, persister); -->
<!-- ``` -->

<!-- Next, we'll add the feature of telling this object whenever we receive a connected or disconnected block. -->


<!-- ##  -->

<!-- // do it in the checklist format` -->

<!-- [ ] fee estimator -->
<!-- < code sample> -->

<!-- [ ] tx broadcaster and a brief "what it's used for/context/info for each one -->
<!-- <Desription> -->
<!-- What it's used for: ... -->
<!-- What it depends on: ... -->

<!-- < code sample w/ comments AND commentary>  -->

<!-- [ ] this depend son these items -->
<!-- ... -->
<!-- [ ] start loop to receive new peers -->
<!-- [ ] start loop to persist (these can be combined.. with these) -->
<!-- [ ]  -->


<!-- get a meeting w/ matt -->
<!-- - write the checklist and then check w/ him -->
<!-- just the checklist itself -->
