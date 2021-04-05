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
// Note that 253 is the minimum which can be returned (1 sat/vbyte, rounded up).
final fee_estimator = FeeEstimator.new_impl((confirmation_target -> 253));
```

**Implementation notes:** Rather than using static fees, you'll want to fill in
the lambda with fetching up-to-date fees from a source like Bitcoin Core or your
own API endpoint. To reduce network traffic, you may wish to cache the results.

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.FeeEstimator.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/FeeEstimator.java)

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

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/util/logger/trait.Logger.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Logger.java)

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

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.BroadcasterInterface.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/BroadcasterInterface.java)

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

**Implementation notes:** `ChannelMonitor`s are objects which are capable of responding to on-chain
events for a given channel. Thus, you will have one `ChannelMonitor` per channel, identified by the
funding output `id`, above. They are persisted in real-time and the `Persist` methods will block
progress on sending or receiving payments until they return.

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/channelmonitor/trait.Persist.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Persist.java)

### Initialize the `ChainMonitor`
**What it's used for:** Tracking one or more `ChannelMonitor`s and using them to monitor the chain for lighting transactions that are relevant to our node, and broadcasting transactions if need be

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

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/struct.ChainMonitor.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChainMonitor.java), [Rust `Filter` docs](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html)

### Initialize the `KeysManager`
**What it's used for:** providing keys for signing lightning transactions

**Example:**
```java
byte[] key_seed = new byte[32];
// <insert code to fill key_seed with random bytes OR if restarting, reload the
// seed from disk>
// Notes about this `KeysManager`:
// * the current time is part of the parameters because it is used to derive
//   random numbers from the seed where required, to ensure all random
//   generation is unique across restarts.
KeysManager keys_manager = KeysManager.constructor_new(key_seed,
    System.currentTimeMillis() / 1000,
    (int) (System.currentTimeMillis() * 1000));
```
**Implementation notes:**
* See [Key Management](key_mgmt.md) for more information.
* Note that you must write the `key_seed` you give to the `KeysManager` on
  startup to disk, and keep using it to initialize the `KeysManager` every time
  you restart. This `key_seed` is used to derive your node's secret key (which
  corresponds to its node pubkey) and all other secret key material.

**Dependencies:** random bytes

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/KeysManager.java)

### Read `ChannelMonitor` state from disk
**What it's used for:** if LDK is restarting, its channel state will need to be read from disk and fed to the `ChannelManager` on the next step, as well as the `ChainMonitor` in the following step.

**Example:** reading `ChannelMonitor`s from disk, where each `ChannelMonitor`'s file is named after its funding outpoint:

```java
// Initialize the array where we'll store the `ChannelMonitor`s read from disk.
final ArrayList channel_monitor_list = new ArrayList<>();

// For each monitor stored on disk, deserialize it and place it in `channel_monitors`.
for (... : monitor_files) {
    byte[] channel_monitor_bytes = // read the bytes from disk the same way you
                                   // wrote them in step "Initialize `Persist`"
	channel_monitor_list.add(channel_monitor_bytes);
}

// Convert the ArrayList into an array so we can pass it to `ChannelManagerConstructor` in the next step.
final byte[][] channel_monitors = channel_monitor_list.toArray(new byte[1][]);
```

**Dependencies:** `KeysManager`

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
ChannelManagerConstructor channel_manager_constructor = new ChannelManagerConstructor(
  serialized_channel_manager, channel_monitors, keys_manager.as_KeysInterface(),
  fee_estimator, chain_monitor.as_Watch(), tx_broadcaster, logger);

final channel_manager = channel_manager_constructor.channel_manager;
```

**Implementation notes:** No methods should be called on `ChannelManager` until
after it has been synced and its `chain::Watch` has been given the
`ChannelMonitor`s as described in the next two steps.

**Dependencies:** `KeysManager`, `FeeEstimator`, `ChainMonitor`, `BroadcasterInterface`, `Logger`, channel configuration info, and the set of `ChannelMonitor`s we read from disk in the previous step if restarting

**References:** [Rust `ChannelManager` docs](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html), [Java `ChannelManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChannelManager.java)

### Sync `ChannelMonitor`s and `ChannelManager` to chain tip
**What it's used for:** ensuring the channel data state is up-to-date with the bitcoin blockchain

**Example:** [Rust docs](https://github.com/rust-bitcoin/rust-lightning/blob/c42ea50cc703f03465d52b5fccfc4a90466d9fea/lightning-block-sync/src/init.rs#L95-L103)

**Implementation notes:**
* When you read each `ChannelMonitor` off of disk, it comes with a blockhash,
  which was the last block the `ChannelMonitor` saw. The same is true for the
  `ChannelManager`.
* If the blockhash is on a fork of the main chain, then first you need to
  disconnect blocks until the `ChannelMonitor` or `ChannelManager` gets to a
  common ancestor with the main chain.
* Then you need to connect recent blocks until the `ChannelMonitor` or
  `ChannelManager` is at the current chain tip.

### Give `ChannelMonitor`s to `ChainMonitor`
** What it's used for:** `ChainMonitor` is responsible for updating the `ChannelMonitor`s during LDK node operation.

**Example:**
```java
// Note that if you use the ChannelManagerConstructor utility,
// it handles this for you in chain_sync_completed().
channel_manager_constructor.chain_sync_completed();
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

**References:** [`NetGraphMsgHandler` Rust docs](https://docs.rs/lightning/*/lightning/routing/network_graph/struct.NetGraphMsgHandler.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/NetGraphMsgHandler.java), [`Access` Rust docs](https://docs.rs/lightning/*/lightning/chain/trait.Access.html), [`Access` Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Access.java)

### Initialize the `PeerManager`

**What it's used for:** managing peer data

**Example:**
```java
byte[] random_bytes = new byte[32];
// <insert code to fill in `random_data` with random bytes>

final peer_manager = PeerManager.constructor_new(
    channel_manager.as_ChannelMessageHandler(), router.as_RoutingMessageHandler(),
    keys_manager.as_KeysInterface().get_node_secret(), random_bytes, logger);
```
**Implementation notes:** if you did not initialize `NetGraphMsgHandler` in the previous step, you can initialize your own struct (which can be a dummy struct) that implements `RoutingMessageHandlerInterface`

**Dependencies:** `ChannelManager`, `RoutingMessageHandlerInterface`, `KeysManager`, random bytes, `Logger`

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/ln/peer_handler/struct.PeerManager.html), [Java `PeerManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/PeerManager.java), [Rust `RoutingMessageHandler` docs](https://docs.rs/lightning/*/lightning/ln/msgs/trait.RoutingMessageHandler.html), [Java `RoutingMessageHandler` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/RoutingMessageHandler.java)

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
chain_monitor.block_disconnected(header, height);
```
**Implementation notes:** blocks must be connected and disconnected in chain order.

**Dependencies:** `ChannelManager`, `ChainMonitor`

**References:** [Rust `ChainMonitor` `block_(dis)connected` docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/struct.ChainMonitor.html#method.block_connected), [Rust `ChannelManager` `block_(dis)connected`](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html#method.block_connected), [Java `ChainMonitor` `block_(dis)connected` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/51638b0070b47ec83459dc7fa74aa823dd890f58/src/main/java/org/ldk/structs/ChainMonitor.java#L17), [Java `ChannelManager` `block_(dis)connected` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/51638b0070b47ec83459dc7fa74aa823dd890f58/src/main/java/org/ldk/structs/ChannelManager.java#L136)

### Handle LDK Events
**What it's used for:** `ChannelManager` and `ChainMonitor` generate events that
must be handled by you, such as telling you when a payment has been successfully
received or when a funding transaction must be generated.

**Example:** in Rust, of handling these events: https://github.com/TheBlueMatt/rust-lightning-bitcoinrpc/blob/master/src/main.rs#L122

**Example:**
```java
// On startup, start this loop:
while(true) {
    Event[] channel_manager_events = 
        channel_manager.as_EventsProvider().get_and_clear_pending_events();
    Event[] chain_monitor_events = 
        chain_monitor.as_EventsProvider().get_and_clear_pending_events();

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

### Background Processing

**What it's used for:** running tasks periodically that aren't high-priority:
* `ChannelManager`'s `timer_chan_freshness_every_min()` to broadcast fresh
  channel updates if needed
* `PeerManager`'s `timer_tick_occurred()` to ping peers and disconnect from
  those who haven't responded with pongs

**Example:**
```java
while (true) {
    // <wait 60 seconds>
    channel_manager.timer_chan_freshness_every_min();
    // Note: NioPeerHandler handles calling timer_tick_occurred
}
```

**Dependencies:** `ChannelManager`

## Using LDK
This section assumes you've followed the steps of the [Setup](#setup) and [Running LDK](#running-ldk).

### Opening a Channel

**Example:**
```java
// <insert code to connect to peer via
// NioPeerHandler.connect(byte[] their_node_id, SocketAddress remote)>

// Create the initial channel of 10000 sats with a push_msat of 1000 and make
// sure the result is successful. The `42` here can be any value, and it is not
// used internally in LDK. It will be provided back to you in the
// `Event.FundingGenerationReady` event as `user_channel_id`.
byte[] peer_node_pubkey = <peer node pubkey bytes>;
Result_NoneAPIErrorZ create_channel_result = channel_manager.create_channel(
    peer_node_pubkey, 10000, 1000, 42, null);
assert create_channel_result instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;

// Ensure we immediately send a `create_channel` message to the counterparty.
nio_peer_handler.check_events();

// After the peer responds with an `accept_channel` message, an
// Event.FundingGenerationReady event will be generated.

// In the background event handler thread (see "Handle LDK Events" section
// above), the FundingGenerationReady event should be handled like this:
if (e instanceof Event.FundingGenerationReady) {
	byte[] funding_scriptpubkey = ((Event.FundingGenerationReady) e).output_script;
	long output_value = ((Event.FundingGenerationReady) e).channel_value_satoshis;
	// This is the same channel we just created, above:
	assert ((Event.FundingGenerationReady) e).user_channel_id == 42;
	// The output is always a P2WSH:
	assert funding_scriptpubkey.length == 34 && funding_scriptpubkey[0] == 0 &&
		funding_scriptpubkey[1] == 32;

	// Generate the funding transaction for the channel based on the channel amount
	NetworkParameters bitcoinj_net =
		NetworkParameters.fromID(NetworkParameters.ID_MAINNET);
	Transaction funding_tx = new Transaction(bitcoinj_net);
	funding_tx.addInput(new TransactionInput(bitcoinj_net, funding, new byte[0]));
	// Note that all inputs in the funding transaction MUST spend SegWit outputs
	// (and have witnesses)
	funding_tx.getInputs().get(0).setWitness(new TransactionWitness(2));
	funding_tx.getInput(0).getWitness().setPush(0, new byte[]{0x1});
	funding_tx.addOutput(Coin.SATOSHI.multiply(output_value),
		new Script(funding_scriptpubkey));
	short funding_output_index = (short) 0;

	// Give the funding transaction back to the ChannelManager.
	byte[] chan_id = ((Event.FundingGenerationReady) e).temporary_channel_id;
	Result_NoneAPIErrorZ funding_res =
		channel_manager.funding_transaction_generated(chan_id,
			funding_tx.bitcoinSerialize(), funding_output_index);
	// funding_transaction_generated should only generate an error if the
	// transaction didn't meet the required format (or the counterparty already
	// closed the channel on us):
    assert funding_res instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;

	// Ensure we immediately send a `funding_created` message to the counterparty.
	nio_peer_handler.check_events();

	// At this point LDK will exchange the remaining channel open messages with
	// the counterparty and, when appropriate, broadcast the funding transaction
	// provided.
	// Once it confirms, the channel will be open and available for use (indicated
	// by its presence in `channel_manager.list_usable_channels()`).
}
```

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
