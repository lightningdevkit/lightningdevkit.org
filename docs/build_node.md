---
id: build_node
title: "Building a Node with LDK"
---

## Introduction

This document covers everything you need to make a node using LDK.

* [Setup](#setup) covers everything you need to do to set up LDK on startup.
* [Running LDK](#running-ldk) covers everything you need to do while LDK is running to keep it operational.
* [Using LDK](#using-ldk) covers most lightning operations you'll want to use,
  such as opening a channel. Sending and receiving payments are supported but
  not yet a part of this guide.

Note that LDK does not assume that safe shutdown is available, so there is no 
shutdown checklist.

## Setup
### Initialize the `FeeEstimator`
**What it's used for:** estimating fees for on-chain transactions that LDK wants broadcasted.

**Example:** `FeeEstimator` that returns static fees
```java
// `FeeEstimatorInterface` is a functional interface, so we can implement it
// with a lambda.
final fee_estimator = FeeEstimator.new_impl((confirmation_target -> 253));
```

**Implementation notes:** Rather than using static fees, you'll want to fill in
the lambda with fetching up-to-date fees from a source like bitcoin core or your
own API endpoint.

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/chaininterface/trait.FeeEstimator.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/FeeEstimator.java)

### Initialize the `Logger`
**What it's used for:** LDK logging

**Example:** `Logger` that prints to the console:
```java
// `LoggerInterface` is a functional interface, so we can implement it with a
// lambda.
final logger = Logger.new_impl((String arg) -> System.out.println(arg));
```
**Implementation notes:** You'll most likely want to write the logs to a file for debugging purposes.

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/0.0.12/lightning/util/logger/trait.Logger.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Logger.java)

### Initialize the `BroadcasterInterface`
**What it's used for:** broadcasting various lightning transactions 

**Example:**
```java
// Note that the `tx` argument is a []byte type. 
final tx_broadcaster = BroadcasterInterface.new_impl(tx -> {
    // <insert code to actually broadcast the given transaction here>
});
```
**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/chaininterface/trait.BroadcasterInterface.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/BroadcasterInterface.java)

### Initialize `Persist`
**What it's used for:** persisting crucial channel data in a timely manner

**Example:**
```java
Persist persister = Persist.new_impl(new Persist.PersistInterface() {
  @Override
  public Result_NoneChannelMonitorUpdateErrZ persist_new_channel(OutPoint id, 
    ChannelMonitor data) {
      byte[] channel_monitor_bytes = data.write();
      // <insert code to write these bytes to disk, keyed by `id`>
  }

  @Override
  public Result_NoneChannelMonitorUpdateErrZ update_persisted_channel(
    OutPoint id, ChannelMonitorUpdate update, ChannelMonitor data) {
      byte[] channel_monitor_bytes = data.write();
      // <insert code to update the `ChannelMonitor`'s file on disk with these
      // new bytes, keyed by `id`>
  }
});
```
**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/channelmonitor/trait.Persist.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Persist.java)

### Initialize the `ChainMonitor`
**What it's used for:** monitoring the chain for lighting transactions that are relevant to our node, and broadcasting force close transactions if need be

**Example:** how to initialize a `ChainMonitor` if you *are* running a light client or filtering for transactions
```java
Filter tx_filter = Filter.new_impl(new Filter.FilterInterface() {
    @Override
    public void register_tx(byte[] txid, byte[] script_pubkey) {
        // <insert code for you to watch for this transaction on-chain>
    }
    
    @Override
    void register_output(OutPoint outpoint, byte[] script_pubkey) {
        // <insert code for you to watch for any transactions that spend this
        // output on-chain>
    }
});
final chain_monitor = ChainMonitor.constructor_new(tx_filter, tx_broadcaster, 
    logger, fee_estimator, persister);
```

**Example:** how to initialize a `ChainMonitor` if you're providing full blocks
```java
final chain_monitor = ChainMonitor.constructor_new(null, tx_broadcaster, logger,
    fee_estimator, persister);
```
**Dependencies:** `FeeEstimator`, `Logger`, `BroadcasterInterface`, `Persist`

**Optional dependency:** `Filter` allows LDK to let you know what transactions you should filter blocks for. This is useful if you pre-filter blocks or use compact filters. Otherwise, LDK will need full blocks.

**References:** [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/chainmonitor/struct.ChainMonitor.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChainMonitor.java), [Rust `Filter` docs](https://docs.rs/lightning/0.0.12/lightning/chain/trait.Filter.html)

### Initialize the `KeysManager`
**What it's used for:** providing keys for signing lightning transactions

**Example:**
```java
byte[] key_seed = new byte[32];
<insert code to fill key_seed with random bytes>
// Notes about this `KeysManager`:
// * it is parameterized by the mainnet bitcoin network, but this should be 
//   swapped out for testnet or regtest as needed.
// * the current time is part of the parameters because it is used to derive
//   random numbers from the seed where required, to ensure all random
//   generation is unique across restarts.
KeysManager keys = KeysManager.constructor_new(key_seed, 
    LDKNetwork.LDKNetwork_Bitcoin, System.currentTimeMillis() / 1000, 
    (int) (System.currentTimeMillis() * 1000));
```
**Implementation notes:** See the Key Management guide for more information.

**Dependencies:** random bytes, the current bitcoin network

**References:** [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/keysinterface/struct.KeysManager.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/KeysManager.java)

### Read `ChannelMonitor` state from disk
**What it's used for:** if LDK is restarting, its channel state will need to be read from disk and fed to the `ChannelManager` on the next step, as well as the `ChainMonitor` in the following step.

**Example:** reading `ChannelMonitor`s from disk, where each `ChannelMonitor`'s file is named after its funding outpoint:
```java
// Initialize the hashmap where we'll store the `ChannelMonitor`s read from disk.
// This hashmap will later be given to the `ChannelManager` on initialization.
final HashMap<String, ChannelMonitor> channel_monitors = new HashMap<>();

byte[] channel_monitor_bytes = // read the bytes from disk the same way you 
                               // wrote them in step "Initialize `Persist`"
Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ channel_monitor_read_result = 
    UtilMethods.constructor_BlockHashChannelMonitorZ_read(monitor_bytes, 
        keys_manager.as_KeysInterface());

// Assert that the result of reading bytes from disk is OK.
assert channel_monitor_read_result instanceof 
    Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ
    .Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK;

// Cast the result of reading bytes from disk into its type in the `success`
// read case.
TwoTuple<OutPoint, byte[]> funding_txo_and_monitor = 
    ((Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ
    .Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK) 
    channel_monitor_read_result)

// Take the `ChannelMonitor` out of the result (the other part of the result is
// the blockhash that the `ChannelMonitor` last saw).
ChannelMonitor channel_monitor = 
    ((Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ
    .Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK) res).res.b;

OutPoint channel_monitor_funding_txo = channel_monitor.get_funding_txo().a;
String channel_monitor_funding_txo_str = 
    Arrays.toString(channel_monitor_funding_txo.get_txid());
channel_monitors.put(channel_monitor_funding_txo_str, channel_monitor);
```
**Dependencies:** `KeysManager`

### Sync `ChannelMonitor`s to chain tip
**What it's used for:** ensuring the channel data state is up-to-date with the bitcoin blockchain

**Example:** in Rust, of bringing a `ChannelMonitor` up to chain tip: https://github.com/rust-bitcoin/rust-lightning/pull/763/files#diff-f457bab978fc8b89ad308d5195f99d7b65a4a6ba1673c5f164104b2dda9a0db6R251. The `ChannelMonitor` is the `chain_listener` parameter. See the linked function and the `find_fork` function within it.

**Implementation notes:** when you read each `ChannelMonitor` off of disk, it comes with a blockhash which was the last block the `ChannelMonitor` saw. If the blockhash is on a fork of the main chain, then first you need to disconnect blocks until the `ChannelMonitor` gets to a common ancestor with the main chain. Then after this disconnection happens if it needs to, you then need to connect recent blocks until the `ChannelMonitor` is at the current chain tip.

### Initialize the `ChannelManager`
**What it's used for:** managing channel state

**Example:** initializing `ChannelManager` on a fresh node:
```java
int block_height = // <insert current chain tip height>;
final channel_manager = ChannelManager.constructor_new(
    LDKNetwork.LDKNetwork_Bitcoin, fee_estimator, chain_monitor.as_Watch(), 
    tx_broadcaster, logger, keys_manager.as_KeysInterface(), 
    UserConfig.constructor_default(), block_height);
```
**Example:** initializing `ChannelManager` on restart:
```java
byte[] serialized_channel_manager = // <insert bytes you would have written in 
                                    // following the later step "Persist 
                                    // channel manager">
Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ channel_manager_read_result =
  UtilMethods.constructor_BlockHashChannelManagerZ_read(serialized_channel_manager, 
  keys_manager.as_KeysInterface(), fee_estimator, chain_monitor.as_Watch(), 
  tx_broadcaster, logger, UserConfig.constructor_default(), channel_monitors);

// Assert we were able to read successfully.
assert channel_manager_read_result instanceof 
    Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ
    .Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ_OK;

final channel_manager = ((Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ
    .Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ_OK) channel_manager_read_result)
    .res.b;
```

**Dependencies:** `KeysManager`, `FeeEstimator`, `ChainMonitor`, `BroadcasterInterface`, `Logger`, channel configuration info, and the set of `ChannelMonitor`s we read from disk in the previous step if restarting

**References:** [Rust `ChannelManager` docs](https://docs.rs/lightning/0.0.12/lightning/ln/channelmanager/struct.ChannelManager.html), [Java `ChannelManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChannelManager.java)

### Give `ChannelMonitor`s to `ChainMonitor`
** What it's used for:** `ChainMonitor` is responsible for updating the `ChannelMonitor`s during LDK node operation.

**Example:**
```java
// Give each `ChannelMonitor` to the `ChainMonitor`.
final chain_watch = chain_monitor.as_Watch();
chain_watch.watch_channel(channel_monitor.get_funding_txo().a, channel_monitor);
```

### Optional: Initialize the `NetGraphMsgHandler`
**What it's used for:** generating routes to send payments over

**Example:** initializing `NetGraphMsgHandler` without providing an `Access`
```java
final router = NetGraphMsgHandler.constructor_new(new byte[32], null, logger);
```
**Implementation notes:** this struct is not required if you are providing your own routes.

**Dependencies:** `Logger`

**Optional dependency:** `Access`, a source of chain information. Recommended to be able to verify channels before adding them to the internal network graph.

**References:** [`NetGraphMsgHandler` Rust docs](https://docs.rs/lightning/0.0.12/lightning/routing/network_graph/struct.NetGraphMsgHandler.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/NetGraphMsgHandler.java), [`Access` Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/trait.Access.html), [`Access` Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Access.java)

### Initialize the `PeerManager`

**What it's used for:** managing peer data

**Example:**
```java
byte[] random_bytes = new byte[32];
// <insert code to fill in `random_data` with random bytes>

final peer_manager = PeerManager.constructor_new(
    chan_manager.as_ChannelMessageHandler(), router.as_RoutingMessageHandler(), 
    keys_interface.get_node_secret(), random_bytes, logger);
```
**Implementation notes:** if you did not initialize `NetGraphMsgHandler` in the previous step, you can initialize your own struct (which can be a dummy struct) that implements `RoutingMessageHandlerInterface`

**Dependencies:** `ChannelManager`, `RoutingMessageHandlerInterface`, `KeysManager`, random bytes, `Logger`

**References:** [Rust docs](https://docs.rs/lightning/0.0.12/lightning/ln/peer_handler/struct.PeerManager.html), [Java `PeerManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/PeerManager.java), [Rust `RoutingMessageHandler` docs](https://docs.rs/lightning/0.0.12/lightning/ln/msgs/trait.RoutingMessageHandler.html), [Java `RoutingMessageHandler` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/RoutingMessageHandler.java)

### Initialize networking
**What it's used for:** making peer connections, facilitating peer data to and from LDK

**Example:**
```java
final nio_peer_handler;
try { 
    nio_peer_handler = new NioPeerHandler(peer_manager); 
} catch (IOException e) { assert false; }

// Start `NioPeerHandler` listening for connections.
final port = 9735;
nio_peer_handler.bind_listener(new InetSocketAddress("0.0.0.0", port));
```
**Implementation notes:** this code sample uses LDK's supplied Java networking battery `NioPeerHandler` wrapped around the core LDK object `PeerManager`.

**Dependencies:** `PeerManager`

**References:** [Java `NioPeerHandler`](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/batteries/NioPeerHandler.java)

## Running LDK

This section assumes you've already run all the steps in [Setup](#setup).

### Connected and Disconnected Blocks
**What it's used for:** LDK needs to know when blocks are newly connected and disconnected.

**Example:**
```java
// header is a []byte type, height is `int`, txdata is a 
// TwoTuple<Long, byte[]>[], where the 0th element is the transaction's position 
// in the block (with the coinbase transaction considered position 0) and the 1st 
// element is the transaction bytes
channel_manager.block_connected(header, txn, height);
chain_monitor.block_connected(header, txn, height);

channel_manager.block_disconnected(header);
chain_monitor.block_disconnected(header);
```
**Implementation notes:** blocks must be connected and disconnected in chain order.

**Dependencies:** `ChannelManager`, `ChainMonitor`

**References:** [Rust `ChainMonitor` `block_(dis)connected` docs](https://docs.rs/lightning/0.0.12/lightning/chain/chainmonitor/struct.ChainMonitor.html#method.block_connected), [Rust `ChannelManager` `block_(dis)connected`](https://docs.rs/lightning/0.0.12/lightning/ln/channelmanager/struct.ChannelManager.html#method.block_connected), [Java `ChainMonitor` `block_(dis)connected` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/51638b0070b47ec83459dc7fa74aa823dd890f58/src/main/java/org/ldk/structs/ChainMonitor.java#L17), [Java `ChannelManager` `block_(dis)connected` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/51638b0070b47ec83459dc7fa74aa823dd890f58/src/main/java/org/ldk/structs/ChannelManager.java#L136)

### Handle `ChannelManager` and `ChainMonitor`'s Generated Events
**What it's used for:** `ChannelManager` and `ChainMonitor` generate events that must be handled by you, such as telling you when a payment has been successfully received or when a funding transaction is ready for broadcast.

**Example:** in Rust, of handling these events: https://github.com/TheBlueMatt/rust-lightning-bitcoinrpc/blob/master/src/main.rs#L122

**Example:**
```java
// On startup, start this loop:
while(true) {
    Event[] channel_manager_events = 
        channel_manager.as_EventsProvider().get_and_clear_pending_events();
    Event[] chain_monitor_events = 
        chain_watch.as_EventsProvider().get_and_clear_pending_events();

    Event[] all_events = ArrayUtils.addAll(channel_manager_events, 
        chain_monitor_events);
    for (Event e: all_events) {
        // <insert code to handle each event>
    }
}
```
**Dependencies:** `ChannelManager`, `ChainMonitor`

**References:** [events to handle in Java](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java)

### Persist `ChannelManager`

**What it's used for:** keeping `ChannelManager`'s stored state up-to-date

**Example:** persist `ChannelManager` after each event you handled in the previous step
```java
while (true) {
    // <code from the previous step that handles `ChannelManager` and 
    // `ChainMonitor` events>

    // After the `for` loop in the previous step has handled `all_events`:
    byte[] channel_manager_bytes_to_write = channel_manager.write();
    // <insert code that writes these bytes to disk and/or backups>
}
```
**Implementation notes:** if the `ChannelManager` is not persisted properly to disk, there is risk of channels force closing the next time LDK starts up. However, in this situation, no funds other than those used to pay force-closed channel fees are at risk of being lost.

**Dependencies:** `ChannelManager`, `ChainMonitor`

### Once Per Minute: `ChannelManager`'s `timer_chan_freshness_every_min()`
**What it's used for:** `ChannelManager` needs to be told every time a minute passes so that it can broadcast fresh channel updates if needed

**Example:**
```java
while (true) {
    // <wait 60 seconds>
    channel_manager.timer_chan_freshness_every_min();
}
```

**Dependencies:** `ChannelManager`

## Using LDK
This section assumes you've followed the steps of the [Setup](#setup) and [Running LDK](#running-ldk).

### Opening a Channel

See the "Opening a Channel" guide.

### Closing a Channel

**Example:** cooperative close
```java
// Assuming 1 open channel
byte[] channel_id = channel_manager.list_channels()[0].get_channel_id();
Result_NoneAPIErrorZ close_result = channel_manager.close_channel(
    channel_id);
assert close_result instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;

// Make sure the peer manager processes this new event.
nio_peer_handler.check_events();
```

**Example:** force/unilateral close
```java
// Assuming 1 open channel
byte[] channel_id = channel_manager.list_channels()[0].get_channel_id();
Result_NoneAPIErrorZ channel_manager.force_close_channel(channel_id);

// Make sure the peer manager processes this new event.
nio_peer_handler.check_events();
```
**Dependencies:** `ChannelManager`, `NioPeerHandler`

### List Channels
**Example:**
```java
ChannelDetails[] channels = channel_manager.list_channels();
```

### WIP: Sending/Receiving Payments
**NOTE: CURRENTLY UNSUPPORTED IN JAVA**

Currently unsatisfied dependencies:
1. a way of constructing `NodeFeatures` and `ChannelFeatures` LDK structs (which should be exposed soon)
2. a way to parse invoices (we need to generate bindings for the `rust-invoices` crate)

### Connect to Peers

**Example:**
```java
byte[] peer_pubkey = // insert peer's pubkey bytes
int peer_port = 9735; // replace this with the peer's port number
String peer_host = "192.168.1.2"; // replace this with the peer's host
SocketAddress peer_socket_addr = new InetSocketAddress(peer_host, peer_port);
nio_peer_handler.connect(peer_pubkey, peer_socket_address);
```
**Dependencies:** `PeerManager`, peer's pubkey/host/port

### List Peers
**Example:**
```java
byte[][] peer_node_ids = peer_manager.get_peer_node_ids();
```
**Dependencies:** `PeerManager`
