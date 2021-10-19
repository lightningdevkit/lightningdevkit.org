# Building a Node

## Introduction
In this guide, we'll be walking through how to build a Lightning node using LDK in Java.

The process breaks down to 3 overarching steps:
1. Initializing LDK's channel, peer, chain monitoring, and (optionally) routing objects on startup.
   * These objects will be parameterized by various other objects that can be from either your custom logic or one of LDK's supplied modules.
2. Starting loops to (a) poll for new peers and (b) periodically nudge the channel and peer objects so they can properly maintain their state.
3. Connect and disconnect blocks to LDK as they come in.

## Part 1: Startup
// start w/ a diagram
// could use a mac to do that

### Chain Monitoring
At a high level, the first step is initializing a [`ChainMonitor` struct](https://docs.rs/lightning/0.0.12/lightning/chain/chainmonitor/struct.ChainMonitor.html) using [this]. See an example in one of our tests [in Java].

This will look something like this:
```java
  logger = Logger.new_impl((String arg) -> System.out.println(seed + ": " + arg));
  fee_estimator = FeeEstimator.new_impl((confirmation_target -> 253));
  tx_broadcaster = BroadcasterInterface.new_impl(tx -> {
    // bro
  });
```

<!-- At a high level, the first step is initiating the `ChainMonitor` struct. -->

<!-- For this step, you'll first need a few supporting objects that implements an interface. Each interface link is to the Rust docs which document the interface's requirements, and below is a sample of what the Java bindings should look like. -->
<!-- 1. a logger, which is something that implements `LoggerInterface` -->
<!-- ```java -->
<!-- public static void main(String[] args) {  -->
<!--     // LoggerInterface is a functional interface, so we can implement it with a lambda -->
<!--     final logger = Logger.new_impl((String log) -> System.out.println(log)); -->
<!-- } -->
<!-- ``` -->
<!-- 2. a fee estimator, which is something that implements `FeeEstimatorInterface` -->
<!-- ```java -->
<!--     .. -->
<!--     final fee_estimator = FeeEstimator.new_impl(( -->
<!-- ``` -->
<!-- 3. a transaction broadcaster, which is something that implements `TransactionBroadcasterInterface` -->

<!-- 4. a data persister, which is anything that implements `PersisterInterface` which is documented further [here], -->

<!-- We're now ready to initialize our chain monitor:  -->
<!-- ```java -->
<!--     .. -->
<!--     final chain_monitor = ChainMonitor.constructor_new(null, tx_broadcaster, logger, fee_estimator, persister); -->
<!-- ``` -->
