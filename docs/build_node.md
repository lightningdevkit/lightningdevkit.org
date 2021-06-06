---
id: build_node
title: "Building a Node with LDK in Java"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Introduction

This document covers everything you need to make a node using LDK in Java.

* [Setup](#setup) covers everything you need to do to set up LDK on startup.
* [Running LDK](#running-ldk) covers everything you need to do while LDK is running to keep it operational.
* [Using LDK](#using-ldk) covers most lightning operations you'll want to use,
  such as opening a channel. Sending and receiving payments are supported but
  not yet a part of this guide.

Note that LDK does not assume that safe shutdown is available, so there is no 
shutdown checklist.

## Setup
### 1. Initialize the `FeeEstimator`

**What it's used for:** estimating fees for on-chain transactions that LDK wants broadcasted.

**Example:**

```java
class YourFeeEstimator implements FeeEstimator.FeeEstimatorInterface {
    @Override
    public int get_est_sat_per_1000_weight(LDKConfirmationTarget conf_target) {
        if (conf_target == LDKConfirmationTarget.LDKConfirmationTarget_Background) {
            // <insert code to retrieve a background feerate>
        } else if (conf_target == LDKConfirmationTarget.LDKConfirmationTarget_Normal) {
            // <insert code to retrieve a normal (i.e. within ~6 blocks) feerate>
        } else if (conf_target == LDKConfirmationTarget.LDKConfirmationTarget_HighPriority) {
            // <insert code to retrieve a high-priority feerate>
        }
    }
}

FeeEstimator fee_estimator = FeeEstimator.new_impl(new YourFeeEstimator());
```

**Implementation notes:** 
1. Fees must be returned in: satoshis per 1000 weight units
2. Fees returned must be no smaller than 253 (equivalent to 1 satoshi/vbyte, rounded up)
3. To reduce network traffic, you may want to cache fee results rather than
retrieving fresh ones every time

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.FeeEstimator.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/FeeEstimator.java)

### 2. Initialize the `Logger`
**What it's used for:** LDK logging

**Example:**

```java
/* EXAMPLE THAT PRINTS LOGS TO CONSOLE */

// `LoggerInterface` is a functional interface, so we can implement it with a
// lambda.
final logger = Logger.new_impl((String arg) -> System.out.println(arg));
```

**Implementation notes:** You'll most likely want to write the logs to a file for debugging purposes.

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/util/logger/trait.Logger.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Logger.java)

### 3. Initialize the `BroadcasterInterface`
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

### 4. Initialize `Persist`
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
progress on sending or receiving payments until they return. You must ensure that any
`ChannelMonitor`s are durably persisted to disk before returning or you may lose funds.

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/channelmonitor/trait.Persist.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Persist.java)

### 5. Initialize the `ChannelManagerPersister`

**What it's used for:** (1) LDK produces events that must be handled by you,
such as telling you when a payment has been successfully received or when a
funding transaction is ready for broadcast. (2) After new event(s) are handled,
the `ChannelManager` must be re-persisted to disk and/or backups.

**Example:**
```java
class YourObj implements ChannelManagerConstructor.ChannelManagerPersister {
    @Override
    public void handle_event(Event e) {
        if (e instanceof Event.FundingGenerationReady) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.PaymentReceived) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.PaymentSent) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.PaymentFailed) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.PendingHTLCsForwardable) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.SpendableOutputs) {
            // <insert code to handle this event>
        }
    }
    
    @Override
    public void persist_manager(byte[] channel_manager_bytes) {
        // <insert code to persist channel_manager_bytes to disk and/or backups>
    }
}

ChannelManagerConstructor.ChannelManagerPersister channel_manager_persister = new YourObj();
```

**Dependencies:** *none*

**Implementation notes:**
* See References for an integrated example of handling LDK events (in Rust)
* It's important to read the documentation (linked in References) for each event
  to make sure you satisfy the API requirements for handling it

**References:** [Example of handling LDK events in Rust](https://github.com/lightningdevkit/ldk-sample/blob/bc07db6ca4a3323d8718a27f85182b8157a20750/src/main.rs#L101-L240), 
[Rust docs for LDK events](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html)

### 6. Optional: Initialize the transaction `Filter`
**You must follow this step if:** you are *not* providing full blocks to LDK,
i.e. if you're using BIP 157/158 or Electrum as your chain backend

**What it's used for:** if you are not providing full blocks, LDK uses this
object to tell you what transactions and outputs to watch for on-chain. You'll 
inform LDK about these transactions/outputs in Step 15.

**Example:**
```java
Filter tx_filter = Filter.new_impl(new Filter.FilterInterface() {
    @Override
    public void register_tx(byte[] txid, byte[] script_pubkey) {
        // <insert code for you to watch for this transaction on-chain>
    }

    @Override
    Option_C2Tuple_usizeTransactionZZ register_output(WatchedOutput output) {
        // <insert code for you to watch for any transactions that spend this
        // output on-chain>
        // See blockdata.md for more info. XXX HOW2LINK???
    }
});
```

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Filter.java)

### 7. Initialize the `ChainMonitor`
**What it's used for:** monitoring the chain for lighting transactions that are relevant to our node, and broadcasting transactions if need be

**Example:**

```java
final filter = // leave this as `null` or insert the Filter object, depending on
               // what you did for Step 6
final chain_monitor = ChainMonitor.constructor_new(filter, tx_broadcaster, logger,
    fee_estimator, persister);
```

**Dependencies:** `FeeEstimator`, `Logger`, `BroadcasterInterface`, `Persist`

**Optional dependency:** `Filter`

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/struct.ChainMonitor.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChainMonitor.java)

### 8. Initialize the `KeysManager`
**What it's used for:** providing keys for signing lightning transactions

**Example:**

```java
byte[] key_seed = new byte[32];
// <insert code to fill key_seed with random bytes OR if restarting, reload the
// seed from disk>
KeysManager keys_manager = KeysManager.constructor_new(key_seed,
    System.currentTimeMillis() / 1000,
    (int) (System.currentTimeMillis() * 1000));
```

**Implementation notes:**
* See the Key Management guide for more information.
* Note that you must write the `key_seed` you give to the `KeysManager` on
  startup to disk, and keep using it to initialize the `KeysManager` every time
  you restart. This `key_seed` is used to derive your node's secret key (which
  corresponds to its node pubkey) and all other secret key material.
* The current time is part of the `KeysManager`'s parameters because it is used to derive
random numbers from the seed where required, to ensure all random
generation is unique across restarts.


**Dependencies:** random bytes

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/KeysManager.java)

### 9. Read `ChannelMonitor`s from disk

**What it's used for:** if LDK is restarting and has at least 1 channel, its channel state will need to be read from disk and fed to the `ChannelManager` on the next step.

**Example:** reading `ChannelMonitor`s from disk, where each `ChannelMonitor`'s file is named after its funding outpoint:

```java
// Initialize the array where we'll store the `ChannelMonitor`s read from disk.
final ArrayList channel_monitor_list = new ArrayList<>();

// For each monitor stored on disk, deserialize it and place it in 
// `channel_monitors`.
for (... : monitor_files) {
    byte[] channel_monitor_bytes = // read the bytes from disk the same way you
                                   // wrote them in Step 4
	channel_monitor_list.add(channel_monitor_bytes);
}

// Convert the ArrayList into an array so we can pass it to
// `ChannelManagerConstructor` in Step 10.
final byte[][] channel_monitors = channel_monitor_list.toArray(new byte[1][]);
```

**Dependencies:** in Rust: `KeysManager`

### 10. Initialize the `ChannelManager`
**What it's used for:** managing channel state

**Example:**

```java
/* FRESH CHANNELMANAGER */

int block_height = // <insert current chain tip height>;
final channel_manager = ChannelManager.constructor_new(
    LDKNetwork.LDKNetwork_Bitcoin, fee_estimator, chain_monitor.as_Watch(), 
    tx_broadcaster, logger, keys_manager.as_KeysInterface(), 
    UserConfig.constructor_default(), block_height);
    
/* RESTARTING CHANNELMANAGER */

byte[] serialized_channel_manager = // <insert bytes as written to disk in Step 5>
ChannelManagerConstructor channel_manager_constructor = new ChannelManagerConstructor(
  serialized_channel_manager, channel_monitors, keys_manager.as_KeysInterface(),
  fee_estimator, chain_monitor.as_Watch(), tx_broadcaster, logger);

final channel_manager = channel_manager_constructor.channel_manager;
```

**Implementation notes:** No methods should be called on `ChannelManager` until
*after* Step 11.

**Dependencies:** `KeysManager`, `FeeEstimator`, `ChainMonitor`, `BroadcasterInterface`, `Logger`, channel configuration info, and the set of `ChannelMonitor`s we read from disk in step 9, if restarting

**References:** [Rust `ChannelManager` docs](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html), [Java `ChannelManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChannelManager.java)

### 11. Sync `ChannelMonitor`s and `ChannelManager` to chain tip
**What it's used for:** this step is only necessary if you're restarting and have open channels. This step ensures that LDK channel state is up-to-date with the bitcoin blockchain

**Example:** with Electrum backend

```java
// Retrieve transaction IDs to check the chain for un-confirmation.
byte[][] relevant_txids_1 = channel_manager.as_Confirm().get_relevant_txids();
byte[][] relevant_txids_2 = chain_monitor.as_Confirm().get_relevant_txids();
byte[][] relevant_txids = ArrayUtils.addAll(
	relevant_txids_1, relevant_txids_2
);

byte[][] unconfirmed_txids = // <insert code to find out from your chain source
                             //  if any of relevant_txids have been reorged out
                             //  of the chain>

for (byte[] txid : unconfirmed_txids) {
    channel_manager.transaction_unconfirmed(txid);
    chain_monitor.transaction_unconfirmed(txid);
}

// Retrieve transactions and outputs that were registered through the `Filter`
// interface.

// If any of these txs/outputs were confirmed on-chain, then:
byte[] header = // insert block header from the block with confirmed tx/output
int height = // insert block height of `header`
Long tx_index = // insert tx index in block
byte[] serialized_tx = // insert tx hex as byte array
TwoTuple<Long, byte[]> tx = new TwoTuple<>(tx_index, serialized_tx);

// Marshall all TwoTuples you built right above into an array
TwoTuple<Long, byte[]>[] tx_list = new TwoTuple[]{tx, .. };

channel_manager.transactions_confirmed(header, height, tx_list);
chain_monitor.transactions_confirmed(header, height, tx_list);

byte[] best_header = // <insert code to get your best known header>
int best_height = // <insert code to get your best known block height>
channel_manager.update_best_block(best_header, best_height);
chain_monitor.update_best_block(best_header, best_height);

// Finally, tell LDK that chain sync is complete.
channel_manager_constructor.chain_sync_completed(channel_manager_persister);
```

**Implementation notes:**

* There are 2 main options for synchronizing to chain on startup:
  * If you are connecting full blocks or using BIP 157/158: the high-level steps that must be done for both `ChannelManager` and each `ChannelMonitor` are as follows:
    1. Get the last blockhash that each object saw. 
      1. `ChannelManager`'s is in `channel_manager_constructor.channel_manager_latest_block_hash`
      2. Each `ChannelMonitor`'s is in `channel_manager_constructor.channel_monitors`, as the 2nd element in each tuple
    2. For each object, if its latest known blockhash has been reorged out of the chain, then disconnect blocks using `channel_manager.as_Listen().block_disconnected(..)` or `channel_monitor.block_disconnected(..)` until you reach the last common ancestor with the main chain.
    3. For each object, reconnect blocks until it gets to your best known chain tip using `channel_manager.as_Listen().block_connected(..)` and/or `channel_monitor.block_connected(..)`.
    4. Call `channel_manager_constructor.chain_sync_completed(..)` to complete the initial sync process.

  * Otherwise, you can use LDK's `Confirm` interface as in the example above. The high-level steps are as follows:
    1. Tell LDK about relevant confirmed and unconfirmed transactions.
    2. Tell LDK what your best known block header and height is.
    3. Call `channel_manager_constructor.chain_sync_completed(..)` to complete the initial sync process.
* More details about LDK's interfaces to provide chain info in Step 15.
  
**References:** [Rust docs for `Confirm` interface](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html)

**Dependencies:** `ChannelManager`, `ChainMonitor`, chain source

### 12. Optional: Initialize the `NetGraphMsgHandler`
**You must follow this step if:** you need LDK to provide routes for sending payments (i.e. you are *not* providing your own routes)

**What it's used for:** generating routes to send payments over

**Example:** initializing `NetGraphMsgHandler` without providing an `Access`

```java
final router = NetGraphMsgHandler.constructor_new(new byte[32], null, logger);
```

**Implementation notes:** this struct is not required if you are providing your own routes.

**Dependencies:** `Logger`

**Optional dependency:** `Access`, a source of chain information. Recommended to be able to verify channels before adding them to the internal network graph.

**References:** [`NetGraphMsgHandler` Rust docs](https://docs.rs/lightning/*/lightning/routing/network_graph/struct.NetGraphMsgHandler.html), [`NetGraphMsgHanler` Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/NetGraphMsgHandler.java), [`Access` Rust docs](https://docs.rs/lightning/*/lightning/chain/trait.Access.html), [`Access` Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Access.java)

### 13. Initialize the `PeerManager`

**What it's used for:** managing peer data and connections

**Example:**

```java
byte[] random_bytes = new byte[32];
// <insert code to fill in `random_data` with random bytes>

final peer_manager = PeerManager.constructor_new(
    channel_manager.as_ChannelMessageHandler(), router.as_RoutingMessageHandler(),
    keys_manager.as_KeysInterface().get_node_secret(), random_bytes, logger);
```

**Implementation notes:** if you did not initialize `NetGraphMsgHandler` in the previous step, you can initialize your own struct (which can be a dummy struct) that implements `RoutingMessageHandlerInterface` and pass that in instead

**Dependencies:** `ChannelManager`, `RoutingMessageHandlerInterface`, `KeysManager`, random bytes, `Logger`

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/ln/peer_handler/struct.PeerManager.html), [Java `PeerManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/PeerManager.java), [Rust `RoutingMessageHandler` docs](https://docs.rs/lightning/*/lightning/ln/msgs/trait.RoutingMessageHandler.html), [Java `RoutingMessageHandler` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/RoutingMessageHandler.java)

### 14. Initialize networking
**What it's used for:** making peer connections, facilitating peer data to and from LDK

**Example:**

```java

// Use LDK's supplied Java networking battery, `NioPeerHandler`.
final nio_peer_handler;
try { 
    nio_peer_handler = new NioPeerHandler(peer_manager); 
} catch (IOException e) { assert false; }

// Start `NioPeerHandler` listening for connections.
final port = 9735;
nio_peer_handler.bind_listener(new InetSocketAddress("0.0.0.0", port));
```

**Dependencies:** `PeerManager`

**References:** [Rust `lightning-net-tokio` sample networking module](https://docs.rs/lightning-net-tokio/0.0.14/lightning_net_tokio/), [Java `NioPeerHandler` sample networking module](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/batteries/NioPeerHandler.java)

## Running LDK

This section assumes you've already run all the steps in [Setup](#setup).

### 15. Keep LDK Up-to-date with Chain Info
**What it's used for:** LDK needs to know when blocks are newly connected and disconnected and when relevant transactions are confirmed and/or reorged out.

**Example:**

<Tabs
  defaultValue="java-blocks"
  values={[
    { label: 'Java with Full Blocks or BIP 157/158', value: 'java-blocks', },
    { label: 'Java with Electrum', value: 'java-electrum', },
  ]
}>
<TabItem value="java-electrum">

```java
/* UNCONFIRMED TRANSACTIONS */

// Retrieve transaction IDs to check the chain for un-confirmation.
byte[][] relevant_txids_1 = channel_manager.as_Confirm().get_relevant_txids();
byte[][] relevant_txids_2 = chain_monitor.as_Confirm().get_relevant_txids();
byte[][] relevant_txids = ArrayUtils.addAll(
	relevant_txids_1, relevant_txids_2
);

// If any txids `relevant_txids` gets reorged out, you must call:
channel_manager.as_Listen().transaction_unconfirmed(unconfirmed_txid);
chain_monitor.transaction_unconfirmed(unconfirmed_txid);

/* CONFIRMED TRANSACTIONS */

// Retrieve transactions and outputs to check the chain for confirmation.
// These should've been given to you for monitoring via the `Filter` interface.

// If any transactions or output spends appear on-chain, you must call:
channel_manager.as_Listen().transactions_confirmed(
    header, height, confirmed_txs_list);
chain_monitor.transactions_confirmed(header, height, confirmed_txs_list);

/* CONNECTED OR DISCONNECTED BLOCKS */

// Whenever there's a new chain tip or a block has been newly disconnected, you
// must call:
channel_manager.update_best_block(new_best_header, new_best_height);
chain_monitor.update_best_block(new_best_header, new_best_height);
```

</TabItem>
<TabItem value="java-blocks">

```java
// For each connected and disconnected block, and in chain-order, call these
// methods.
// If you're using BIP 157/158, then `txdata` below should always include any
// transactions and/our outputs spends registered through the `Filter` interface,
// Transactions and outputs are registered both on startup and as new relevant
// transactions/outputs are created.

// header is a []byte type, height is `int`, txdata is a 
// TwoTuple<Long, byte[]>[], where the 0th element is the transaction's position 
// in the block (with the coinbase transaction considered position 0) and the 1st 
// element is the transaction bytes
channel_manager.as_Listen().block_connected(header, txdata, height);
chain_monitor.block_connected(header, txdata, height);

channel_manager.as_Listen().block_disconnected(header, height);
chain_monitor.block_disconnected(header, height);
```

</TabItem>
</Tabs>

**Implementation notes:**
* If you're using the `Listen` interface: blocks must be connected and disconnected in chain order
* If you're using the `Confirm` interface: // TODO

**Dependencies:** `ChannelManager`, `ChainMonitor`

**References:** [Rust `Listen` docs](https://docs.rs/lightning/*/lightning/chain/trait.Listen.html), [Rust `Confirm` docs](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html)

### 16. Regularly Broadcast Node Announcement

**What it's used for:** if you have 1 or more public channels, you need to announce your node and its channels regularly (once per minute is recommended).

**Example:**

```java
// TODO(matt) :)
```

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
