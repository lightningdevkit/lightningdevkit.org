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
  * Example transaction broadcaster skeleton:
```java
// Note that the `tx` argument is a []byte type. 
final tx_broadcaster = BroadcasterInterface.new_impl(tx -> {
    // <insert code to actually broadcast the given transaction here>
});
```
- [ ] Initialize the channel data persister
  * What it's used for: persisting crucial channel data in a timely manner
  * Dependencies: none
  * Example:
```java
let 
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
  * What it's used for: monitoring the chain for lighting transactions that are relevant to our node, and broadcasting force close transactions if need be
  * Dependencies: fee estimator, logger, transaction broadcaster, channel data persister
  * Optional dependency: a chain filter that allows LDK to let you know what transactions you should filter blocks for. This is useful if you pre-filter blocks or use compact filters. Otherwise, LDK will need full blocks.
  * Example:
```java
// The `null` here must be filled in with a struct if you are running a light client.
final chain_monitor = ChainMonitor.constructor_new(null, tx_broadcaster, logger, fee_estimator, persister);
```
- [ ] Initialize the keys manager
  * What it's used for: providing keys for signing lightning transactions
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
- [ ] If LDK is restarting, fill in the chain monitor's existing channel monitor state
  * Dependencies: the keys manager
  * If LDK is restarting and has existing channels, then it's very important to read its current channel state off of disk during the restart process.
  * Equally important: when you read each channel monitor off of disk, it comes with a blockhash which was the last block the channel monitor saw. So it's very important to take this blockhash, and:
    1. If the blockhash is on a fork that's no longer current to the chain, then first you need to disconnect blocks until the channel monitor gets to the common ancestor with the main chain
    2. Else, you just need to connect recent blocks until the channel monitor is at the current chain tip.
Example of reading channel monitors from disk, where each channel monitor's file is named after its funding outpoint: // TODO matt plz check this
```java
// Initialize the HashMap where we'll store the channel monitors we read from disk.
final HashMap<String, ChannelMonitor> monitors = new HashMap<>();

byte[] monitor_bytes = [];
// TODO fix this line to read from a file on disk
Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ monitor_read_result = UtilMethods.constructor_BlockHashChannelMonitorZ_read(monitor_bytes, keys_interface);

// Assert that the result of reading bytes from disk is OK.
assert monitor_read_result instanceof Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ.Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK;

TwoTuple<OutPoint, byte[]> funding_txo_and_monitor = ((Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ.Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK) roundtrip_monitor)

// Cast the bytes as a ChannelMonitor.
ChannelMonitor mon = ((Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ.Result_C2Tuple_BlockHashChannelMonitorZDecodeErrorZ_OK) res).res.b;

// <insert code here to bring the channel monitor up to chain tip>

// Save the monitor in our hashmap.
monitors.put(mon.get_funding_txo().a, mon);

// Give the monitor to the chain monitor.
final chain_watch = chain_monitor.as_Watch();
chain_watch.watch_channel(mon.get_funding_txo().a, mon);
```

Rust example of bringing a channel monitor up to chain tip: https://github.com/rust-bitcoin/rust-lightning/pull/763/files#diff-f457bab978fc8b89ad308d5195f99d7b65a4a6ba1673c5f164104b2dda9a0db6R251 where the channel monitor is the `chain_listener` parameter. See the linked function and the `find_fork` function within it.
- [ ] Initialize the router (which we call the `NetGraphMsgHandler`)
// TODO add docs for reading router data from disk if restarting
    * What it's used for: 
    * Dependencies: logger
    * Optional dependency: source of chain information, recommended for light clients to be able to verify channels
    * Example:
```java
final router = NetGraphMsgHandler.constructor_new(new byte[32], null, logger);
```
- [ ] Initialize the channel manager
// TODO add stuff if we're restarting/reading from disk
    * What it's used for: managing channel state
    * Dependencies: keys manager, fee estimator, chain monitor, transaction broadcaster, logger, channel configuration info, and the set of channel monitors we read from disk in the previous step
Example of initializing a channel manager on a fresh node:
```java
final chain_watch = chain_monitor.as_Watch();
final channel_manager = ChannelManager.constructor_new(LDKNetwork.LDKNetwork_Bitcoin, FeeEstimator.new_impl(confirmation_target -> 0), chain_watch, tx_broadcaster, logger, keys_interface, UserConfig.constructor_default(), 1);
```
Example of initializing a channel manager on restart: // TODO: fix
```java
byte[] serialized_channel_manager = [];
Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ read_res =
  UtilMethods.constructor_BlockHashChannelManagerZ_read(serialized_channel_manager, keys_interface, fee_estimator, chain_watch, tx_broadcaster, logger, UserConfig.constructor_default(), monitors);

// Assert we were able to read successfully.
assert read_res instanceof Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ.Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ_OK;

final channel_manager = ((Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ.Result_C2Tuple_BlockHashChannelManagerZDecodeErrorZ_OK) read_res).res.b;
```
- [ ] Initialize the peer manager using LDK's `PeerManager` struct combined with LDK's supplied `NioPeerHandler` networking module
  * What it's used for: connecting to peers, facilitating peer data to and from LDK
  * Dependencies: channel manager, router, keys manager, random bytes, logger
  * Example:
```java
byte[] random_data = new byte[32];
// <insert code to fill in `random_data` with random bytes>
final nio_peer_handler;
final peer_manager = PeerManager.constructor_new(chan_manager.as_ChannelMessageHandler(), router.as_RoutingMessageHandler(), keys_interface.get_node_secret(), random_data, logger);
try { nio_peer_handler = new NioPeerHandler(peer_manager); } catch (IOException e) { assert false; }

// Finally, start NioPeerHandler listening for connections.
final port = 9735;
nio_peer_handler.bind_listener(new InetSocketAddress("127.0.0.1", port));
```
- [ ] Start a loop to handle the channel manager's generated events
// TODO add persisting the channel manager after handling each event
    * What it's used for: the channel manager and chain monitor generate events that must be handled by you, such as telling you when a payment has been successfully received or when a funding transaction is ready for broadcast.
    * Dependencies: channel manager and chain monitor
Rust example: https://github.com/TheBlueMatt/rust-lightning-bitcoinrpc/blob/master/src/main.rs#L122
- [ ] Persist router data in a background loop // TODO
- [ ] Start a loop to call the channel manager's `timer_chan_freshness_every_min()` every minute
  * What it's used for: the channel manager needs to be told every time a minute passes so that it can broadcast fresh channel updates if needed
Example:
```java
while (true) {
    <wait 60 seconds>
    channel_manager.timer_chan_freshness_every_min();
}
```

## Running LDK Checklist
- [ ] Connect and disconnect blocks to LDK as they come in
```java
// header is a []byte type, txdata is TwoTuple<Long, byte[]>[], height is `int`
channel_manager.block_connected(header, txn, height);
chain_monitor.block_connected(header, txn, height);

channel_manager.block_disconnected(header);
chain_monitor.block_disconnected(header);
```

## Using LDK
- [ ] opening/closing and listing channels
- [ ] sending and listing payments and getting the result of the payment (and storing preimages etc)
- [ ] connecting/disconnecting and listing peers
