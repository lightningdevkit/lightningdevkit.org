---
id: build_node
title: "Building a Node: Checklist"
---

## Introduction

This document is a few checklists for everything you need to make a node using LDK.

* The first checklist is everything you need to do on startup.
* The second checklist is everything you need to do while LDK is running to keep it operational.
* The third checklist covers most lightning operations you'll want to use, such as opening a channel

Note that LDK does not assume that safe shutdown is available, so there is no 
shutdown checklist.

This guide covers all major LDK operations besides sending and receiving payments,
which are supported but not yet part of this guide.

## Startup Checklist
- [ ] Initialize the fee estimator
  * What it's used for: estimating fees for on-chain transactions that LDK wants broadcasted.
  * Dependencies: none
  * References: [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/chaininterface/trait.FeeEstimator.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/FeeEstimator.java)

Example fee estimator that always returns `253` satoshis:
```java
// FeeEstimatorInterface is a functional interface, so we can implement it with a lambda
final fee_estimator = FeeEstimator.new_impl((confirmation_target -> 253));
```
Rather than using static fees, you'll want to fill in the lambda with fetching up-to-date fees from a source like bitcoin core or your own API endpoint.
- [ ] Initialize the logger

Example logger that prints to the console:
```java
// LoggerInterface is a functional interface, so we can implement it with a lambda
final logger = Logger.new_impl((String arg) -> System.out.println(arg));
```
- [ ] Initialize the transaction broadcaster
  * What it's used for: broadcasting various lightning transactions 
  * Dependencies: none
  * References: [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/chaininterface/trait.BroadcasterInterface.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/BroadcasterInterface.java)

Example transaction broadcaster skeleton:
```java
// Note that the `tx` argument is a []byte type. 
final tx_broadcaster = BroadcasterInterface.new_impl(tx -> {
    <insert code to actually broadcast the given transaction here>
});
```
- [ ] Initialize the channel data persister
  * What it's used for: persisting crucial channel data in a timely manner
  * Dependencies: none
  * References: [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/channelmonitor/trait.Persist.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Persist.java)
  * Example:
```java
Persist persister = Persist.new_impl(new Persist.PersistInterface() {
  @Override
  public Result_NoneChannelMonitorUpdateErrZ persist_new_channel(OutPoint id, ChannelMonitor data) {
      byte[] channel_monitor_bytes = data.write();
      <insert code to write these bytes to disk, keyed by `OutPoint`>
  }

  @Override
  public Result_NoneChannelMonitorUpdateErrZ update_persisted_channel(OutPoint id, ChannelMonitorUpdate update, ChannelMonitor data) {
      byte[] channel_monitor_bytes = data.write();
      <insert code to update the channel monitor's file on disk with these new bytes, keyed by `OutPoint`>
  }
});
```
- [ ] Initialize the chain monitor
  * What it's used for: monitoring the chain for lighting transactions that are relevant to our node, and broadcasting force close transactions if need be
  * Dependencies: fee estimator, logger, transaction broadcaster, channel data persister
  * Optional dependency: a chain filter that allows LDK to let you know what transactions you should filter blocks for. This is useful if you pre-filter blocks or use compact filters. Otherwise, LDK will need full blocks.
  * References: [Rust docs](https://docs.rs/lightning/0.0.12/lightning/chain/chainmonitor/struct.ChainMonitor.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChainMonitor.java), [Rust `Filter` docs](https://docs.rs/lightning/0.0.12/lightning/chain/trait.Filter.html)
  * Example:
```java
// Example of a ChainMonitor if you *are* running a light client or filtering for transactions:
Filter tx_filter = Filter.new_impl(new Filter.FilterInterface() {
    @Override
    public void register_tx(byte[] txid, byte[] script_pubkey) {
        <insert code for you to watch for this transaction on-chain>
    }
    
    @Override
    void register_output(OutPoint outpoint, byte[] script_pubkey) {
        <insert code for you to watch for any transactions that spend this output on-chain>
    }
});
final chain_monitor = ChainMonitor.constructor_new(tx_filter, tx_broadcaster, logger, fee_estimator, persister);

// Example of a ChainMonitor if you are *not* running a light client and can provide
full blocks:
final chain_monitor = ChainMonitor.constructor_new(null, tx_broadcaster, logger, fee_estimator, persister);
```
- [ ] Initialize the keys manager
  * What it's used for: providing keys for signing lightning transactions
  * Dependencies: random bytes, the current bitcoin network
  * Example:
```java
byte[] key_seed = new byte[32];
<insert code to fill key_seed with random bytes>
// Notes about this KeysManager:
// * it is parameterized by the mainnet bitcoin network, but this should be 
//   swapped out for testnet or regtest as needed.
// * the current time is part of the parameters because it is used to derive random
//   numbers from the seed where required, to ensure all random generation is
//   unique across restarts.
KeysManager keys = KeysManager.constructor_new(key_seed, LDKNetwork.LDKNetwork_Bitcoin, System.currentTimeMillis() / 1000, (int) (System.currentTimeMillis() * 1000));
```

See the Key Management guide for more information.
- [ ] Initialize the channel manager
    * What it's used for: managing channel state
    * Dependencies: keys manager, fee estimator, chain monitor, transaction broadcaster, logger, channel configuration info, and the set of channel monitors we read from disk in the previous step

Example of initializing a channel manager on a fresh node:
```java
final chain_watch = chain_monitor.as_Watch();
int block_height = <insert current chain tip height>;
final channel_manager = ChannelManager.constructor_new(
    LDKNetwork.LDKNetwork_Bitcoin, fee_estimator, chain_monitor.as_Watch(), 
    tx_broadcaster, logger, keys_manager.as_KeysInterface(), 
    UserConfig.constructor_default(), block_height);
```
Example of initializing a channel manager on restart:
```java
byte[] serialized_channel_manager = <insert bytes you would have written in following the later step "Persist channel manager">;
Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ channel_manager_read_result =
  UtilMethods.constructor_BlockHashChannelManagerZ_read(serialized_channel_manager, 
  keys_interface, fee_estimator, chain_monitor.as_Watch(), tx_broadcaster, logger,
  UserConfig.constructor_default(), channel_monitors);

// Assert we were able to read successfully.
assert channel_manager_read_result instanceof Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ.Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ_OK;

final channel_manager = ((Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ
    .Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ_OK) channel_manager_read_result)
    .res.b;
```
- [ ] If LDK is restarting, fill in the chain monitor's existing channel monitor state
  * Dependencies: keys manager, chain monitor, and channel manager should be initialized before this step
  * If LDK is restarting and has existing channels, then it's very important to read its current channel state off of disk during the restart process.
  * Equally important: when you read each channel monitor off of disk, it comes with a blockhash which was the last block the channel monitor saw. So it's very important to take this blockhash, and:
    1. If the blockhash is on a fork that's no longer current to the chain, then first you need to disconnect blocks until the channel monitor gets to the common ancestor with the main chain
    2. Then after this disconnection happens if it needs to, you then need to connect recent blocks until the channel monitor is at the current chain tip.

Example of reading channel monitors from disk, where each channel monitor's file is named after its funding outpoint:
```java
byte[] channel_monitor_bytes = <read the bytes from disk the same way you wrote them in step "Initialize the channel data persister">;
Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ channel_monitor_read_result = 
    UtilMethods.constructor_BlockHashChannelMonitorZ_read(monitor_bytes, keys_interface);

// Assert that the result of reading bytes from disk is OK.
assert channel_monitor_read_result instanceof Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ.Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK;

// Cast the result of reading bytes from disk into its type in the `success` read case.
TwoTuple<OutPoint, byte[]> funding_txo_and_monitor = 
    ((Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ
    .Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK) channel_monitor_read_result)

// Take the ChannelMonitor out of the result, ignoring the latest block hash.
ChannelMonitor monitor = ((Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ
    .Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK) res).res.b;

<insert code here to bring the channel monitor up to chain tip>

// Give the channel monitor to the chain monitor.
final chain_watch = chain_monitor.as_Watch();
chain_watch.watch_channel(mon.get_funding_txo().a, mon);
```

Rust example of bringing a channel monitor up to chain tip: https://github.com/rust-bitcoin/rust-lightning/pull/763/files#diff-f457bab978fc8b89ad308d5195f99d7b65a4a6ba1673c5f164104b2dda9a0db6R251 where the channel monitor is the `chain_listener` parameter. See the linked function and the `find_fork` function within it.
- [ ] Optional: initialize the router (which we call the `NetGraphMsgHandler`)
    * What it's used for: generating routes to send payments over
    * Dependencies: logger
    * Optional dependency: source of chain information, recommended for light clients to be able to verify channels
    * Example:
```java
final router = NetGraphMsgHandler.constructor_new(new byte[32], null, logger);
```
- [ ] Initialize the peer manager using LDK's `PeerManager` struct combined with LDK's supplied `NioPeerHandler` networking battery
  * What it's used for: connecting to peers, facilitating peer data to and from LDK
  * Dependencies: channel manager, router (optional), keys manager, random bytes, logger
  * Example:
```java
byte[] random_data = new byte[32];
<insert code to fill in `random_data` with random bytes>
final nio_peer_handler;
final peer_manager = PeerManager.constructor_new(chan_manager.as_ChannelMessageHandler(),
    router.as_RoutingMessageHandler(), keys_interface.get_node_secret(), random_data, logger);
try { nio_peer_handler = new NioPeerHandler(peer_manager); } catch (IOException e) { assert false; }

// Finally, start NioPeerHandler listening for connections.
final port = 9735;
nio_peer_handler.bind_listener(new InetSocketAddress("127.0.0.1", port));
```

## Running LDK Checklist
- [ ] Connect and disconnect blocks to LDK as they come in. Note that blocks must be connected and disconnected in chain order.
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
- [ ] Handle the channel manager's generate events as they come in
    * What it's used for: the channel manager and chain monitor generate events that must be handled by you, such as telling you when a payment has been successfully received or when a funding transaction is ready for broadcast.
    * Dependencies: channel manager and chain monitor
    * References: [events to handle in Java](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java), [Rust example of handling events](https://github.com/TheBlueMatt/rust-lightning-bitcoinrpc/blob/master/src/main.rs#L122)

Example:
```java
// On startup, start this loop:
while(true) {
    Event[] channel_manager_events = channel_manager.as_EventsProvider().get_and_clear_pending_events();
    Event[] chain_monitor_events = chain_watch.as_EventsProvider().get_and_clear_pending_events();
    Event[] all_events = ArrayUtils.addAll(channel_manager_events, chain_monitor_events);
    for (Event e: all_events) {
        <insert code to handle each event>
    }
}
```
- [ ] Persist channel manager: in the loop you started in the previous step, add the feature of persisting the channel manager after each event.
  * If the channel manager does not get persisted properly to disk, there is risk of channels force closing the next time LDK starts up. However, in this situation, no funds other than those used to pay force-closed channel fees are at risk of being lost.
```java
while (true) {
    <code from the previous step that handles channel manager events>
    ...
    byte[] channel_manager_bytes_to_write = channel_manager.write();
    <insert code that writes these bytes to disk and/or backups>
}
```
- [ ] Call the channel manager's `timer_chan_freshness_every_min()` every minute
  * What it's used for: the channel manager needs to be told every time a minute passes so that it can broadcast fresh channel updates if needed
Example:
```java
while (true) {
    <wait 60 seconds>
    channel_manager.timer_chan_freshness_every_min();
}
```

## Using LDK
- [ ] Opening a channel: see the "Opening a Channel" guide
- [ ] Closing a channel
  * Dependencies: channel manager
```java
// Cooperative close:
// Assuming 1 open channel
byte[] channel_id = channel_manager.list_channels()[0].get_channel_id();
Result_NoneAPIErrorZ close_result = channel_manager.close_channel(
    channel_id);
assert close_result instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;
// Make sure the peer manager processes this new event.
nio_peer_handler.check_events();
// LDK should give the transaction broadcaster a closing transaction to broadcast
// after this

// Force close:
// Assuming 1 open channel
byte[] channel_id = channel_manager.list_channels()[0].get_channel_id();
Result_NoneAPIErrorZ channel_manager.force_close_channel(channel_id);
```
- [ ] List open channels
```java
ChannelDetails[] channels = channel_manager.list_channels();
```
- [ ] Sending/receiving payments **NOTE: CURRENTLY UNSUPPORTED IN JAVA**
  * Currently unsatisfied dependencies:
    1. a way of constructing `NodeFeatures` and `ChannelFeatures` LDK structs (which should be exposed soon)
    2. a way to parse invoices (we need to generate bindings for the `rust-invoices` crate)
- [ ] Connect to a peer
  * Dependencies: peer manager, peer's pubkey, peer's host and port

Example:
```java
byte[] peer_pubkey = <peer's pubkey bytes>
int peer_port = 9745;
SocketAddress peer_socket_addr = new InetSocketAddress("192.168.1.2", peer_port);
nio_peer_handler.connect(peer_pubkey, peer_socket_address);
```
- [ ] List peers
// TODO
