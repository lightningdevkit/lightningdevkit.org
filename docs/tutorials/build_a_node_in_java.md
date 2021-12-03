# Building a Node with LDK in Java

## Introduction

This document covers everything you need to make a node using LDK in Java.

* [Setup](#setup) covers everything you need to do to set up LDK on startup.
* [Running LDK](#running-ldk) covers everything you need to do while LDK is running to keep it operational.

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
        if (conf_target ==
            ConfirmationTarget.LDKConfirmationTarget_Background) {
            // <insert code to retrieve a background feerate>
        } else if (conf_target ==
            ConfirmationTarget.LDKConfirmationTarget_Normal) {
            // <insert code to retrieve a normal (i.e. within ~6 blocks) feerate>
        } else if (conf_target ==
            ConfirmationTarget.LDKConfirmationTarget_HighPriority) {
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
class YourLogger implements Logger.LoggerInterface {
    @Override
    public void log(String record) {
        // <insert code to print this log and/or write this log to a file>
    }
}

Logger logger = Logger.new_impl(new YourLogger());
```

**Implementation notes:** you'll most likely want to write the logs to a file for debugging purposes.

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/util/logger/trait.Logger.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Logger.java)

### 3. Initialize the `BroadcasterInterface`
**What it's used for:** broadcasting various Lightning transactions

**Example:**

```java
class YourBroadcaster implements
    BroadcasterInterface.BroadcasterInterfaceInterface {

    @Override
    public void broadcast_transaction(byte[] tx) {
        // <insert code to broadcast the given transaction here>
    }
}

BroadcasterInterface tx_broadcaster =
    BroadcasterInterface.new_impl(new YourBroadcaster());
```

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.BroadcasterInterface.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/BroadcasterInterface.java)

### 4. Optional: Initialize the `NetworkGraph`
**You must follow this step if:** you need LDK to provide routes for sending payments (i.e. you are *not* providing your own routes)

**What it's used for:** generating routes to send payments over

**Example:** initializing `NetworkGraph` on signet

```java
Network network = Network.LDKNetwork_Signet;

BestBlock genesisBlock = BestBlock.from_genesis(network);
final byte[] genesis_block_hash = genesisBlock.block_hash();

final NetworkGraph networkGraph = NetworkGraph.of(genesis_block_hash);
```

**Implementation notes:** this struct is not required if you are providing your own routes. It will be used internally in `ChannelManagerConstructor` to build a `NetGraphMsgHandler`. Other networking options are: `LDKNetwork_Bitcoin`, `LDKNetwork_Regtest` and `LDKNetwork_Testnet`.

**Dependencies:** *none*

**Optional dependency:** `BestBlock`, the best known block as identified by its hash and height. Recommended to retrieve the genesis block from the target network.

**References:** [`NetworkGraph` Rust docs](https://docs.rs/lightning/0.0.103/lightning/routing/network_graph/struct.NetworkGraph.html), [`NetworkGraph` Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/NetworkGraph.java), [`BestBlock` Rust docs](https://docs.rs/lightning/0.0.103/lightning/chain/struct.BestBlock.html), [`BestBlock` Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/BestBlock.java)

### 5. Initialize `Persist`
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
      //  new bytes, keyed by `id`>
  }
});
```

**Implementation notes:** `ChannelMonitor`s are objects which are capable of responding to on-chain
events for a given channel. Thus, you will have one `ChannelMonitor` per channel, identified by the
funding output `id`, above. They are persisted in real-time and the `Persist` methods will block
progress on sending or receiving payments until they return. You must ensure that
`ChannelMonitor`s are durably persisted to disk before returning or you may lose funds.

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/channelmonitor/trait.Persist.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Persist.java)

### 6. Initialize the `EventHandler`

**What it's used for:** (1) LDK produces events that must be handled by you,
such as telling you when a payment has been successfully received or when a
funding transaction is ready for broadcast. (2) After new event(s) are handled,
the `ChannelManager` must be re-persisted to disk and/or backups.

**Example:**
```java
class YourObj implements ChannelManagerConstructor.EventHandler {
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
        else if (e instanceof Event.PaymentPathFailed) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.PendingHTLCsForwardable) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.SpendableOutputs) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.PaymentForwarded) {
            // <insert code to handle this event>
        }
        else if (e instanceof Event.ChannelClosed) {
            // <insert code to handle this event>
        }
    }

    @Override
    public void persist_manager(byte[] channel_manager_bytes) {
        // <insert code to persist channel_manager_bytes to disk and/or backups>
    }
}

ChannelManagerConstructor.EventHandler customEventHandler = new YourObj();
```

**Dependencies:** *none*

**Implementation notes:**
* See References for an integrated example of handling LDK events (in Rust)
* It's important to read the documentation (linked in References) for each event
  to make sure you satisfy the API requirements for handling it

**References:** [Example of handling LDK events in Rust](https://github.com/lightningdevkit/ldk-sample/blob/bc07db6ca4a3323d8718a27f85182b8157a20750/src/main.rs#L101-L240),
[Rust docs for LDK events](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html)

### 7. Optional: Initialize the Transaction `Filter`
**You must follow this step if:** you are *not* providing full blocks to LDK,
i.e. if you're using BIP 157/158 or Electrum as your chain backend

**What it's used for:** if you are not providing full blocks, LDK uses this
object to tell you what transactions and outputs to watch for on-chain. You'll
inform LDK about these transactions/outputs in Step 14.

**Example:**
```java
Filter tx_filter = Filter.new_impl(new Filter.FilterInterface() {
    @Override
    public void register_tx(byte[] txid, byte[] script_pubkey) {
        // <insert code for you to watch for this transaction on-chain>
    }

    @Override
    public Option_C2Tuple_usizeTransactionZZ register_output(WatchedOutput output)
    {
        // <insert code for you to watch for any transactions that spend this
        //  output on-chain>
    }
});
```

**Implementation notes:** see the [Blockchain Data](/basic-features/blockchain_data.md) guide for more info

**Dependencies:** *none*

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Filter.java), [Blockchain Data guide](/basic-features/blockchain_data.md)

### 8. Initialize the `ChainMonitor`
**What it's used for:** monitoring the chain for lighting transactions that are relevant to our node, and broadcasting transactions if need be

**Example:**

```java
final filter = // leave this as `null` or insert the Filter object, depending on
               // what you did for Step 7
final chain_monitor = ChainMonitor.of(filter, tx_broadcaster, logger,
    fee_estimator, persister);
```

**Dependencies:** `FeeEstimator`, `Logger`, `BroadcasterInterface`, `Persist`

**Optional dependency:** `Filter`

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/struct.ChainMonitor.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChainMonitor.java)

### 9. Initialize the `KeysManager`
**What it's used for:** providing keys for signing Lightning transactions

**Example:**

```java
byte[] key_seed = new byte[32];
// <insert code to fill key_seed with random bytes OR if restarting, reload the
// seed from disk>
KeysManager keys_manager = KeysManager.of(key_seed,
    System.currentTimeMillis() / 1000,
    (int) (System.currentTimeMillis() * 1000));
```

**Implementation notes:**
* See the [Key Management](/basic-features/key_management.md) guide for more info
* Note that you must write the `key_seed` you give to the `KeysManager` on
  startup to disk, and keep using it to initialize the `KeysManager` every time
  you restart. This `key_seed` is used to derive your node's secret key (which
  corresponds to its node pubkey) and all other secret key material.
* The current time is part of the `KeysManager`'s parameters because it is used to derive
random numbers from the seed where required, to ensure all random
generation is unique across restarts.

**Dependencies:** random bytes

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html), [Java bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/KeysManager.java), [Key Management guide](/basic-features/key_management.md)

### 10. Read `ChannelMonitor`s from disk

**What it's used for:** if LDK is restarting and has at least 1 channel, its channel state will need to be read from disk and fed to the `ChannelManager` on the next step.

**Example:** reading `ChannelMonitor`s from disk, where each `ChannelMonitor`'s file is named after its funding outpoint:

```java
// Initialize the array where we'll store the `ChannelMonitor`s read from disk.
final ArrayList channel_monitor_list = new ArrayList<>();

// For each monitor stored on disk, deserialize it and place it in
// `channel_monitors`.
for (... : monitor_files) {
    byte[] channel_monitor_bytes = // read the bytes from disk the same way you
                                   // wrote them in Step 5
	channel_monitor_list.add(channel_monitor_bytes);
}

// Convert the ArrayList into an array so we can pass it to
// `ChannelManagerConstructor` in Step 11.
final byte[][] channel_monitors = (byte[][])channel_monitor_list.toArray(new byte[1][]);
```

**Dependencies:** *none*

### 11. Initialize the `ChannelManager`
**What it's used for:** managing channel state

**Example:**

```java
/* FRESH CHANNELMANAGER */

int block_height = // <insert current chain tip height>;
byte[] best_block_hash = // <insert current chain tip block hash>;
ChannelManagerConstructor channel_manager_constructor = new ChannelManagerConstructor(
  Network.LDKNetwork_Bitcoin, UserConfig.default(), best_block_hash,
  block_height, keys_manager.as_KeysInterface(), fee_estimator, chain_monitor,
  router, tx_broadcaster, logger);

/* RESTARTING CHANNELMANAGER */

byte[] serialized_channel_manager = // <insert bytes as written to disk in Step 6>
ChannelManagerConstructor channel_manager_constructor = new ChannelManagerConstructor(
  serialized_channel_manager, channel_monitors, keys_manager.as_KeysInterface(),
  fee_estimator, chain_monitor, filter, router, tx_broadcaster, logger);

final ChannelManager channel_manager = channel_manager_constructor.channel_manager;
```

**Implementation notes:** No methods should be called on `ChannelManager` until
*after* Step 12.

**Dependencies:** `KeysManager`, `FeeEstimator`, `ChainMonitor`, `BroadcasterInterface`, `Logger`, and `ChannelMonitor`s and `ChannelManager` bytes from Step 10 and Step 6 respectively, if restarting

**Optional dependencies:** `Filter`, `NetGraphMsgHandler` (can be left as `null` if you're not providing them)

**References:** [Rust `ChannelManager` docs](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html), [Java `ChannelManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChannelManager.java)

### 12. Sync `ChannelMonitor`s and `ChannelManager` to chain tip
**What it's used for:** this step is only necessary if you're restarting and have open channels. This step ensures that LDK channel state is up-to-date with the bitcoin blockchain

**Example:** with Electrum backend

```java
// Retrieve transaction IDs to check the chain for un-confirmation.
byte[][] relevant_txids_1 = channel_manager.as_Confirm().get_relevant_txids();
byte[][] relevant_txids_2 = chain_monitor.as_Confirm().get_relevant_txids();
byte[][] relevant_txids = ArrayUtils.addAll(relevant_txids_1, relevant_txids_2);

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
TwoTuple_usizeTransactionZ tx = TwoTuple_usizeTransactionZ.of(tx_index, serialized_tx);

// Marshall all TwoTuples you built right above into an array
TwoTuple_usizeTransactionZ[] tx_list = new TwoTuple_usizeTransactionZ[]{tx, .. };

channel_manager.transactions_confirmed(header, height, tx_list);
chain_monitor.transactions_confirmed(header, height, tx_list);

byte[] best_header = // <insert code to get your best known header>
int best_height = // <insert code to get your best known block height>
channel_manager.update_best_block(best_header, best_height);
chain_monitor.update_best_block(best_header, best_height);

// Finally, tell LDK that chain sync is complete. This will also spawn several
// background threads to handle networking and event processing.
channel_manager_constructor.chain_sync_completed(customEventHandler);
```

**Implementation notes:**

* There are 2 main options for synchronizing to chain on startup:
  * If you are connecting full blocks or using BIP 157/158: the high-level steps that must be done for both `ChannelManager` and each `ChannelMonitor` are as follows:
    1. Get the last blockhash that each object saw.
      * `ChannelManager`'s is in `channel_manager_constructor.channel_manager_latest_block_hash`
      * Each `ChannelMonitor`'s is in `channel_manager_constructor.channel_monitors`, as the 2nd element in each tuple
    2. For each object, if its latest known blockhash has been reorged out of the chain, then disconnect blocks using `channel_manager.as_Listen().block_disconnected(..)` or `channel_monitor.block_disconnected(..)` until you reach the last common ancestor with the main chain.
    3. For each object, reconnect blocks starting from the common ancestor until it gets to your best known chain tip using `channel_manager.as_Listen().block_connected(..)` and/or `channel_monitor.block_connected(..)`.
    4. Call `channel_manager_constructor.chain_sync_completed(..)` to complete the initial sync process.

  * Otherwise, you can use LDK's `Confirm` interface as in the example above. The high-level steps are as follows:
    1. Tell LDK about relevant confirmed and unconfirmed transactions.
    2. Tell LDK what your best known block header and height is.
    3. Call `channel_manager_constructor.chain_sync_completed(..)` to complete the initial sync process.
* More details about LDK's interfaces to provide chain info in Step 14.

**References:** [Rust `Listen` docs](https://docs.rs/lightning/*/lightning/chain/trait.Listen.html), [Rust `Confirm` docs](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html)

**Dependencies:** `ChannelManager`, `ChainMonitor`

### 13. Optional: Bind a Listening Port
**You must follow this step if:** you want to listen for incoming peer connections

**What it's used for:** accepting incoming peer connections

**Example:**

```java
final NioPeerHandler nio_peer_handler = channel_manager_constructor.nio_peer_handler;
final int port = 9735;
nio_peer_handler.bind_listener(new InetSocketAddress("0.0.0.0", port));
```

**Dependencies:** `ChannelManagerConstructor` (*after* `chain_sync_completed(..)` has been called on it)

**References:** [Java `NioPeerHandler` sample networking module](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/batteries/NioPeerHandler.java)

## Running LDK

This section assumes you've already run all the steps in [Setup](#setup).

### 14. Keep LDK Up-to-date with Chain Info
**What it's used for:** LDK needs to know when blocks are newly connected and disconnected and when relevant transactions are confirmed and/or reorged out.

**Example:**

:::: tabs
::: tab "Java with Full Blocks or BIP 157/158"

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

:::
:::tab "Java with Electrum"

```java
// For each connected and disconnected block, and in chain-order, call these
// methods.
// If you're using BIP 157/158, then `txdata` below should always include any
// transactions and/our outputs spends registered through the `Filter` interface,
// Transactions and outputs are registered both on startup and as new relevant
// transactions/outputs are created.

// header is a []byte type, height is `int`, txdata is a 
// TwoTuple_usizeTransactionZ[], where the 0th element is the transaction's
// position in the block (with the coinbase transaction considered position 0)
// and the 1st element is the transaction bytes
channel_manager.as_Listen().block_connected(header, txdata, height);
chain_monitor.block_connected(header, txdata, height);

channel_manager.as_Listen().block_disconnected(header, height);
chain_monitor.block_disconnected(header, height);
```

:::
::::

**Implementation notes:**
* If you're using the `Listen` interface: blocks must be connected and disconnected in chain order
* If you're using the `Confirm` interface: it's important to read the `Confirm` docs linked in References, to make sure you satisfy the interface's requirements

**Dependencies:** `ChannelManager`, `ChainMonitor`

**References:** [Rust `Listen` docs](https://docs.rs/lightning/*/lightning/chain/trait.Listen.html), [Rust `Confirm` docs](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html)
