# Setting up a ChannelManager

The `ChannelManager` is responsible for several tasks related to managing channel state. This includes keeping track of many channels, sending messages to appropriate channels, creating channels and more.

## Adding a ChannelManager

Adding a `ChannelManager` to your application should look something like this:

::: code-group

```rust [Rust]
use lightning::ln::channelmanager::ChannelManager;

// 0.2 adds a `message_router` argument (e.g. a `DefaultMessageRouter`) and
// takes the dependencies by value (pass your `Arc` handles / clones).
let channel_manager = ChannelManager::new(
  fee_estimator,
  chain_monitor,
  broadcaster,
  router,
  message_router,
  logger,
  entropy_source,
  node_signer,
  signer_provider,
  user_config,
  chain_params,
  current_timestamp,
);
```

```kotlin [Kotlin]
import org.ldk.batteries.ChannelManagerConstructor

val channelManagerConstructor = ChannelManagerConstructor(
    Network.LDKNetwork_Regtest,
    userConfig,
    latestBlockHash,
    latestBlockHeight,
    keysManager.as_EntropySource(),
    keysManager.as_NodeSigner(),
    keysManager.as_SignerProvider(),
    feeEstimator,
    chainMonitor,
    networkGraph,
    ProbabilisticScoringDecayParameters.with_default(),
    ProbabilisticScoringFeeParameters.with_default(),
    null, // routerWrapper (optional — null uses the default router)
    txBroadcaster,
    logger
)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// The TypeScript bindings have no ChannelManagerConstructor helper — call the
// raw constructor. (The sections below build each dependency.)
const params = ldk.ChainParameters.constructor_new(
  ldk.Network.LDKNetwork_Regtest,
  ldk.BestBlock.constructor_from_network(ldk.Network.LDKNetwork_Regtest)
);
const messageRouter = ldk.DefaultMessageRouter.constructor_new(
  networkGraph,
  keysManager.as_EntropySource()
);

const channelManager = ldk.ChannelManager.constructor_new(
  feeEstimator,
  chainMonitor.as_Watch(),
  txBroadcaster,
  router.as_Router(),
  messageRouter.as_MessageRouter(),
  logger,
  keysManager.as_EntropySource(),
  keysManager.as_NodeSigner(),
  keysManager.as_SignerProvider(),
  userConfig,
  params,
  Math.floor(Date.now() / 1000) // current_timestamp (seconds)
);
```

:::

There are a few dependencies needed to get this working. Let's walk through setting up each one so we can plug them into our `ChannelManager`.

### Initialize the `FeeEstimator`

**What it's used for:** estimating fees for on-chain transactions that LDK wants broadcasted.

::: code-group

```rust [Rust]
use lightning::chain::chaininterface::{ConfirmationTarget, FeeEstimator};

struct YourFeeEstimator();

impl FeeEstimator for YourFeeEstimator {
    fn get_est_sat_per_1000_weight(&self, confirmation_target: ConfirmationTarget) -> u32 {
        // 0.2 re-modeled `ConfirmationTarget` around anchor vs non-anchor
        // channels and specific spending scenarios. Return your own feerates;
        // the values below are illustrative (the floor is 253).
        match confirmation_target {
            ConfirmationTarget::MaximumFeeEstimate => 7500,
            ConfirmationTarget::UrgentOnChainSweep => 5000,
            ConfirmationTarget::MinAllowedAnchorChannelRemoteFee => 253,
            ConfirmationTarget::MinAllowedNonAnchorChannelRemoteFee => 253,
            ConfirmationTarget::AnchorChannelFee => 1000,
            ConfirmationTarget::NonAnchorChannelFee => 2000,
            ConfirmationTarget::ChannelCloseMinimum => 500,
            ConfirmationTarget::OutputSpendingFee => 1000,
        }
    }
}

let fee_estimator = YourFeeEstimator();
```

```java [Kotlin]
val feeEstimator = FeeEstimator.new_impl(object : FeeEstimator.FeeEstimatorInterface {
    override fun get_est_sat_per_1000_weight(confirmationTarget: ConfirmationTarget): Int {
        return when (confirmationTarget) {
            ConfirmationTarget.LDKConfirmationTarget_MaximumFeeEstimate -> 7500
            ConfirmationTarget.LDKConfirmationTarget_UrgentOnChainSweep -> 5000
            ConfirmationTarget.LDKConfirmationTarget_MinAllowedAnchorChannelRemoteFee -> 253
            ConfirmationTarget.LDKConfirmationTarget_MinAllowedNonAnchorChannelRemoteFee -> 253
            ConfirmationTarget.LDKConfirmationTarget_AnchorChannelFee -> 1000
            ConfirmationTarget.LDKConfirmationTarget_NonAnchorChannelFee -> 2000
            ConfirmationTarget.LDKConfirmationTarget_ChannelCloseMinimum -> 500
            ConfirmationTarget.LDKConfirmationTarget_OutputSpendingFee -> 1000
            else -> 2000
        }
    }
})
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const feeEstimator = ldk.FeeEstimator.new_impl({
  get_est_sat_per_1000_weight(target: ldk.ConfirmationTarget): number {
    // Return your own feerates per ConfirmationTarget (floor is 253).
    switch (target) {
      case ldk.ConfirmationTarget.LDKConfirmationTarget_UrgentOnChainSweep:
        return 5000;
      case ldk.ConfirmationTarget.LDKConfirmationTarget_ChannelCloseMinimum:
        return 253;
      default:
        return 2000;
    }
  },
} as ldk.FeeEstimatorInterface);
```

:::

**Implementation notes:**
1. Fees must be returned in: satoshis per 1000 weight units
2. Fees must be no smaller than 253 (equivalent to 1 satoshi/vbyte, rounded up)
3. To reduce network traffic, you may want to cache fee results rather than
retrieving fresh ones every time

**Dependencies:** *none*

**References:** [Rust `FeeEstimator` docs](https://docs.rs/lightning/0.2.2/lightning/chain/chaininterface/trait.FeeEstimator.html), [Java/Kotlin `FeeEstimator` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/FeeEstimator.java)

### Initialize the `Router`

**What it's used for:** Finds a Route for a payment between the given payer and a payee.

::: code-group

```rust [Rust]
// The 3rd argument is now an `EntropySource` (e.g. your KeysManager), not a
// raw byte array.
let router = DefaultRouter::new(
  network_graph.clone(),
  logger.clone(),
  keys_manager.clone(),
  scorer.clone(),
  ProbabilisticScoringFeeParameters::default(),
);
```

```kotlin [Kotlin]
// If you use the ChannelManagerConstructor it builds the router for you. The
// NetworkGraph it needs is created like so:
val networkGraph = NetworkGraph.of(Network.LDKNetwork_Regtest, logger)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const router = ldk.DefaultRouter.constructor_new(
  networkGraph,
  logger,
  keysManager.as_EntropySource(),
  multiThreadedScorer.as_LockableScore(),
  ldk.ProbabilisticScoringFeeParameters.constructor_default()
);
```

:::

**Dependencies:** `P2PGossipSync`, `Logger`, `KeysManager`, `Scorer`

**References:** [Rust `Router` docs](https://docs.rs/lightning/0.2.2/lightning/routing/router/trait.Router.html), [Java/Kotlin `Router` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Router.java)

### Initialize the `Logger`

**What it's used for:** LDK logging

::: code-group

```rust [Rust]
use lightning::util::logger::{Logger, Record};

struct YourLogger();

impl Logger for YourLogger {
    // Note: `log` now takes `Record` by value (was `&Record`).
    fn log(&self, record: Record) {
        let raw_log = record.args.to_string();
        let log = format!(
            "{:<5} [{}:{}] {}\n",
            record.level,
            record.module_path,
            record.line,
            raw_log
        );
        // <insert code to print this log and/or write this log to disk>
    }
}

let logger = YourLogger();
```

```kotlin [Kotlin]
object YourLogger : Logger.LoggerInterface {
    override fun log(record: Record) {
        // <insert code to print this log and/or write this log to a file>
    }
}

val logger: Logger = Logger.new_impl(YourLogger)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const logger = ldk.Logger.new_impl({
  log(record: ldk.Record): void {
    console.log(`${record.get_level()} [${record.get_module_path()}] ${record.get_args()}`);
  },
} as ldk.LoggerInterface);
```

:::

**Implementation notes:** you'll likely want to write the logs to a file for debugging purposes.

**Dependencies:** *none*

**References:** [Rust `Logger` docs](https://docs.rs/lightning/0.2.2/lightning/util/logger/trait.Logger.html), [Java/Kotlin `Logger` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Logger.java)

### Initialize the `BroadcasterInterface`
**What it's used for:** broadcasting various transactions to the bitcoin network

::: code-group

```rust [Rust]
struct YourTxBroadcaster();

impl BroadcasterInterface for YourTxBroadcaster {
    fn broadcast_transactions(&self, txs: &[&Transaction]) {
        // <insert code to broadcast a list of transactions>
    }
}

let broadcaster = YourTxBroadcaster();
```

```kotlin [Kotlin]
val txBroadcaster = BroadcasterInterface.new_impl { txs: Array<ByteArray> ->
    // <insert code to broadcast a list of transactions>
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const txBroadcaster = ldk.BroadcasterInterface.new_impl({
  broadcast_transactions(txs: Uint8Array[]): void {
    // <insert code to broadcast a list of transactions>
  },
} as ldk.BroadcasterInterfaceInterface);
```

:::

**Dependencies:** _none_

**References:** [Rust `BroadcasterInterface` docs](https://docs.rs/lightning/0.2.2/lightning/chain/chaininterface/trait.BroadcasterInterface.html), [Java/Kotlin `BroadcasterInterface` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/BroadcasterInterface.java)

### Initialize `Persist`

**What it's used for:** persisting `ChannelMonitor`s, which contain crucial channel data, in a timely manner

::: code-group

```rust [Rust]
use lightning::chain::ChannelMonitorUpdateStatus;
use lightning::util::persist::MonitorName;

struct YourPersister();

// In 0.2 monitors are keyed by `MonitorName` (not `OutPoint`), the methods
// return `ChannelMonitorUpdateStatus` (not a `Result`), the update is now
// `Option`al, and there is a new `archive_persisted_channel`.
impl<ChannelSigner: EcdsaChannelSigner> Persist<ChannelSigner> for YourPersister {
    fn persist_new_channel(
        &self, monitor_name: MonitorName, monitor: &ChannelMonitor<ChannelSigner>,
    ) -> ChannelMonitorUpdateStatus {
        // <insert code to persist the ChannelMonitor to disk and/or backups>
        // Note that monitor.encode() will get you the ChannelMonitor as a Vec<u8>.
        ChannelMonitorUpdateStatus::Completed
    }

    fn update_persisted_channel(
        &self, monitor_name: MonitorName, update: Option<&ChannelMonitorUpdate>,
        monitor: &ChannelMonitor<ChannelSigner>,
    ) -> ChannelMonitorUpdateStatus {
        // <insert code to persist either the ChannelMonitor or the
        //  ChannelMonitorUpdate to disk>
        ChannelMonitorUpdateStatus::Completed
    }

    fn archive_persisted_channel(&self, monitor_name: MonitorName) {
        // <optional: the monitor for `monitor_name` is now safe to archive>
    }
}

let persister = YourPersister();
```

```kotlin [Kotlin]
val persister = Persist.new_impl(object : Persist.PersistInterface {
    override fun persist_new_channel(
        monitorName: MonitorName, monitor: ChannelMonitor
    ): ChannelMonitorUpdateStatus {
        // <insert code to write monitor.write() to disk, keyed by `monitorName`>
        return ChannelMonitorUpdateStatus.LDKChannelMonitorUpdateStatus_Completed
    }

    override fun update_persisted_channel(
        monitorName: MonitorName, update: ChannelMonitorUpdate?, monitor: ChannelMonitor
    ): ChannelMonitorUpdateStatus {
        // <insert code to update the persisted `ChannelMonitor`, keyed by `monitorName`>
        return ChannelMonitorUpdateStatus.LDKChannelMonitorUpdateStatus_Completed
    }

    override fun archive_persisted_channel(monitorName: MonitorName) {}

    override fun get_and_clear_completed_updates(): Array<TwoTuple_ChannelIdu64Z> = arrayOf()
})
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const persister = ldk.Persist.new_impl({
  persist_new_channel(id: ldk.OutPoint, data: ldk.ChannelMonitor): ldk.ChannelMonitorUpdateStatus {
    // <insert code to persist data.write() to disk, keyed by `id`>
    return ldk.ChannelMonitorUpdateStatus.LDKChannelMonitorUpdateStatus_Completed;
  },
  update_persisted_channel(id: ldk.OutPoint, update: ldk.ChannelMonitorUpdate, data: ldk.ChannelMonitor): ldk.ChannelMonitorUpdateStatus {
    return ldk.ChannelMonitorUpdateStatus.LDKChannelMonitorUpdateStatus_Completed;
  },
  get_and_clear_completed_updates(): ldk.TwoTuple_ChannelIdu64Z[] {
    return [];
  },
} as ldk.PersistInterface);
```

:::

::: code-group

```rust [Using LDK Sample Filesystem Persistence Crate in Rust]
use lightning_persister::fs_store::FilesystemStore; // import LDK sample persist crate

// `FilesystemPersister` was replaced by `FilesystemStore`, which implements the
// `KVStore` trait and can be passed wherever a persister/KV store is expected.
let persister = Arc::new(FilesystemStore::new(ldk_data_dir_path.into()));
```

:::

**Implementation notes:**

- `ChannelMonitor`s are objects which are capable of
  responding to on-chain events for a given channel. Thus, you will have one
  `ChannelMonitor` per channel. They are persisted in real-time and the `Persist`
  methods will block progress on sending or receiving payments until they return.
  You must ensure that `ChannelMonitor`s are durably persisted to disk before
  returning or you may lose funds.
- If you implement a custom persister, it's important to read the trait docs (linked in References) to make sure you satisfy the API requirements, particularly for `update_persisted_channel`

**Dependencies:** _none_

**References:** [Rust `Persister` docs](https://docs.rs/lightning/0.2.2/lightning/chain/chainmonitor/trait.Persist.html), [Java/Kotlin `Persister` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Persist.java)

### Start Background Processing

**What it's used for:** running tasks periodically in the background to keep LDK operational.

::: code-group

```rust [Rust]
use lightning_background_processor::{process_events_async, GossipSync};

// The old `BackgroundProcessor::start(persister, invoice_payer, ..)` (with its
// `InvoicePayer`) is gone. Drive LDK with `process_events_async` — the event
// handler is now async, the scorer/sweeper/onion-messenger are passed directly,
// and `sleeper`/`fetch_time` closures control the loop.
process_events_async(
    Arc::clone(&persister),                  // a KVStore (e.g. FilesystemStore)
    event_handler,                           // async Fn(Event) -> Result<(), ReplayEvent>
    Arc::clone(&chain_monitor),
    Arc::clone(&channel_manager),
    Some(Arc::clone(&onion_messenger)),
    GossipSync::p2p(Arc::clone(&gossip_sync)),
    Arc::clone(&peer_manager),
    None,                                    // liquidity manager (NO_LIQUIDITY_MANAGER)
    Some(Arc::clone(&output_sweeper)),
    Arc::clone(&logger),
    Some(Arc::clone(&scorer)),
    sleeper,                                 // Fn(Duration) -> impl Future<Output = bool>
    false,                                   // mobile_interruptable_platform
    fetch_time,                              // Fn() -> Option<Duration>
)
.await;
```

```kotlin [Kotlin]
// The ChannelManagerConstructor runs the background tasks for you once you call
// `chain_sync_completed`, passing your event handler.
channelManagerConstructor.chain_sync_completed(
    kvStore,        // KVStoreSync
    eventHandler,   // ChannelManagerConstructor.EventHandler
    outputSweeper,  // OutputSweeperSync? (nullable)
    false           // use P2P gossip sync
)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// There is no BackgroundProcessor in the TypeScript bindings — drive everything
// yourself. Register a callback that fires when work is pending, then pull
// events and flush peer I/O (you must also run your own periodic timers).
const fut = channelManager.get_event_or_persistence_needed_future();
fut.register_callback_fn(
  ldk.FutureCallback.new_impl({
    call(): void {
      channelManager.as_EventsProvider().process_pending_events(eventHandler);
      chainMonitor.as_EventsProvider().process_pending_events(eventHandler);
      peerManager.process_events();
      // ...persist the ChannelManager / network graph / scorer as needed.
    },
  } as ldk.FutureCallbackInterface)
);
```

:::

**Dependencies:** `ChannelManager`, `ChainMonitor`, `PeerManager`, `Logger`, `Persister`/`KVStore` (plus, in Rust, the `OnionMessenger`, `GossipSync`, and optionally `Scorer`/`OutputSweeper`)

**References:** [Rust `process_events_async` docs](https://docs.rs/lightning-background-processor/0.2.0/lightning_background_processor/fn.process_events_async.html), [Java/Kotlin `ChannelManagerConstructor` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/batteries/ChannelManagerConstructor.java)

### Regularly Broadcast Node Announcement

**What it's used for:** if you have 1 or more public channels, you may need to announce your node and its channels occasionally. LDK will automatically announce channels when they are created, but there are no guarantees you have connected peers at that time or that your peers will propagate such announcements. The broader node-announcement message is not automatically broadcast.

::: code-group

```rust [Rust]
let mut interval = tokio::time::interval(Duration::from_secs(60));
loop {
	interval.tick().await;
	// `broadcast_node_announcement` lives on `PeerManager`, and addresses are
	// now `lightning::ln::msgs::SocketAddress` values.
	peer_manager.broadcast_node_announcement(
		[0; 3], // insert your node's RGB color
		node_alias,
		vec![ldk_announced_listen_addr],
	);
}
```

:::

**Dependencies:** `Peer Manager`

**References:** [`PeerManager::broadcast_node_announcement` docs](https://docs.rs/lightning/0.2.2/lightning/ln/peer_handler/struct.PeerManager.html#method.broadcast_node_announcement)

### Optional: Initialize the Transaction `Filter`

**You must follow this step if:** you are _not_ providing full blocks to LDK,
i.e. if you're using BIP 157/158 or Electrum as your chain backend

**What it's used for:** if you are not providing full blocks, LDK uses this
object to tell you what transactions and outputs to watch for on-chain.

::: code-group

```rust [Rust]
struct YourTxFilter();

impl Filter for YourTxFilter {
  fn register_tx(&self, txid: &Txid, script_pubkey: &Script) {
        // <insert code for you to watch for this transaction on-chain>
  }

  // In 0.2 `register_output` returns `()` (it no longer returns an Option).
  fn register_output(&self, output: WatchedOutput) {
        // <insert code for you to watch for any transactions that spend this
        // output on-chain>
    }
}

let filter = YourTxFilter();
```

```java [Kotlin]
object YourTxFilter : Filter.FilterInterface {
  override fun register_tx(txid: ByteArray, script_pubkey: ByteArray) {
      // <insert code for you to watch for this transaction on-chain>
  }

  override fun register_output(output: WatchedOutput) {
      // <insert code for you to watch for any transactions that spend this
      //  output on-chain>
  }
}

val txFilter: Filter = Filter.new_impl(YourTxFilter)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const filter = ldk.Filter.new_impl({
  register_tx(txid: Uint8Array, scriptPubkey: Uint8Array): void {
    // <insert code to watch for this transaction on-chain>
  },
  register_output(output: ldk.WatchedOutput): void {
    // <insert code to watch for any transaction that spends this output>
  },
} as ldk.FilterInterface);
```

:::

**Implementation notes:** see the [Blockchain Data](/blockchain_data/) guide for more info

**Dependencies:** _none_

**References:** [Rust `Filter` docs](https://docs.rs/lightning/0.2.2/lightning/chain/trait.Filter.html), [Java/Kotlin `Filter` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Filter.java)

### Initialize the `ChainMonitor`

**What it's used for:** tracking one or more `ChannelMonitor`s and using them to monitor the chain for lighting transactions that are relevant to our node, and broadcasting transactions if need be.

::: code-group

```rust [Rust]
let filter: Option<Box<dyn Filter>> = // leave this as None or insert the Filter trait object

// 0.2 adds an `entropy_source` and a peer-storage encryption key
// (obtained from your signer).
let chain_monitor = ChainMonitor::new(
    filter,
    &broadcaster,
    &logger,
    &fee_estimator,
    &persister,
    &keys_manager,
    keys_manager.get_peer_storage_key(),
);
```

```java [Kotlin]
// Pass `Option_FilterZ.none()` (or `.some(filter)`). 0.2 adds a trailing
// entropy source and peer-storage key.
val chainMonitor = ChainMonitor.of(
    Option_FilterZ.none(),
    txBroadcaster,
    logger,
    feeEstimator,
    persister,
    keysManager.as_EntropySource(),
    keysManager.get_peer_storage_key()
)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const chainMonitor = ldk.ChainMonitor.constructor_new(
  ldk.Option_FilterZ.constructor_none(), // or .constructor_some(filter)
  txBroadcaster,
  logger,
  feeEstimator,
  persister,
  keysManager.as_EntropySource(),
  keysManager.as_NodeSigner().get_peer_storage_key()
);
```

:::

**Implementation notes:** `Filter` must be non-`None` if you're using Electrum or BIP 157/158 as your chain backend

**Dependencies:** `FeeEstimator`, `Logger`, `BroadcasterInterface`, `Persist`

**Optional dependency:** `Filter`

**References:** [Rust `ChainMonitor` docs](https://docs.rs/lightning/0.2.2/lightning/chain/chainmonitor/struct.ChainMonitor.html), [Java/Kotlin `ChainMonitor` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/ChainMonitor.java)

### Initialize the `KeysManager`

**What it's used for:** providing keys for signing Lightning transactions

::: code-group

```rust [Rust]
let keys_seed_path = format!("{}/keys_seed", ldk_data_dir.clone());

// If we're restarting and already have a key seed, read it from disk. Else,
// create a new one.
let keys_seed = if let Ok(seed) = fs::read(keys_seed_path.clone()) {
    assert_eq!(seed.len(), 32);
    let mut key = [0; 32];
    key.copy_from_slice(&seed);
    key
} else {
    let mut key = [0; 32];
    thread_rng().fill_bytes(&mut key);
    match File::create(keys_seed_path.clone()) {
        Ok(mut f) => {
            f.write_all(&key)
                .expect("Failed to write node keys seed to disk");
            f.sync_all().expect("Failed to sync node keys seed to disk");
        }
        Err(e) => {
            println!(
                "ERROR: Unable to create keys seed file {}: {}",
                keys_seed_path, e
            );
            return;
        }
    }
    key
};

let cur = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
// 0.2 adds a `v2_remote_key_derivation` flag (pass `true` for new nodes).
let keys_manager = KeysManager::new(&keys_seed, cur.as_secs(), cur.subsec_nanos(), true);

```

```java [Kotlin]
val keySeed = ByteArray(32)
// <insert code to fill keySeed with random bytes OR if restarting, reload the
// seed from disk>
// 0.2 adds a `v2_remote_key_derivation` flag (pass `true` for new nodes).
val keysManager = KeysManager.of(
    keySeed,
    System.currentTimeMillis() / 1000,
    (System.currentTimeMillis() * 1000).toInt(),
    true
)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const seed = new Uint8Array(32); // fill with CSPRNG bytes, or reload from disk
const nowSecs = Math.floor(Date.now() / 1000);
const keysManager = ldk.KeysManager.constructor_new(
  seed,
  BigInt(nowSecs),                  // starting_time_secs (bigint)
  (Date.now() % 1000) * 1_000_000,  // starting_time_nanos
  true                              // v2_remote_key_derivation
);
```

:::

**Implementation notes:**

- See the [Key Management](/key_management.md) guide for more info
- Note that you must write the `key_seed` you give to the `KeysManager` on
  startup to disk, and keep using it to initialize the `KeysManager` every time
  you restart. This `key_seed` is used to derive your node's secret key (which
  corresponds to its node pubkey) and all other secret key material.
- The current time is part of the `KeysManager`'s parameters because it is used to derive
  random numbers from the seed where required, to ensure all random
  generation is unique across restarts.

**Dependencies:** random bytes

**References:** [Rust `KeysManager` docs](https://docs.rs/lightning/0.2.2/lightning/sign/struct.KeysManager.html), [Java/Kotlin `KeysManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/KeysManager.java)

### Read `ChannelMonitor` state from disk

**What it's used for:** if LDK is restarting and has at least 1 channel, its `ChannelMonitor`s will need to be (1) fed to the `ChannelManager` and (2) synced to chain.

::: code-group

```rust [Rust]
use lightning::util::persist::read_channel_monitors;

// Read the ChannelMonitors persisted to your KVStore. Returns a
// Vec<(BlockHash, ChannelMonitor)>.
let mut channel_monitors =
    read_channel_monitors(&persister, &keys_manager, &keys_manager).unwrap();

// If you are using Electrum or BIP 157/158, you must call load_outputs_to_watch
// on each ChannelMonitor to prepare for chain synchronization.
for (_, chan_mon) in channel_monitors.iter() {
    chan_mon.load_outputs_to_watch(&filter, &logger);
}
```

```java [Kotlin]
// Initialize the hashmap where we'll store the `ChannelMonitor`s read from disk.
// This hashmap will later be given to the `ChannelManager` on initialization.
var channelMonitors = arrayOf<ByteArray>();

val channelMonitorList = ArrayList<ByteArray>()
channelMonitorFiles.iterator().forEach {
    val channelMonitorBytes = it.hexStringToByteArray();
    channelMonitorList.add(channelMonitorBytes);
}
channelMonitors = channelMonitorList.toTypedArray();
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// Read the ChannelMonitors persisted to your KVStore. On success,
// `monitorsRes.res` is the array of ChannelMonitors to hand to the
// ChannelManager on restart.
const monitorsRes = ldk.UtilMethods.constructor_read_channel_monitors(
  kvStore,
  keysManager.as_EntropySource(),
  keysManager.as_SignerProvider()
);
```

:::

**Dependencies:** `KeysManager`

**References:** [Rust `load_outputs_to_watch` docs](https://docs.rs/lightning/0.2.2/lightning/chain/channelmonitor/struct.ChannelMonitor.html#method.load_outputs_to_watch)

### Initialize the `ChannelManager`

**What it's used for:** managing channel state

::: code-group

```rust [Rust]
let user_config = UserConfig::default();

/* RESTARTING */
let (channel_manager_blockhash, mut channel_manager) = {
    let mut channel_manager_file = fs::File::open(format!("{}/manager", ldk_data_dir.clone())).unwrap();

    // Use the `ChannelMonitor`s we read from disk.
    let mut channel_monitor_mut_references = Vec::new();
    for (_, channel_monitor) in channel_monitors.iter_mut() {
        channel_monitor_mut_references.push(channel_monitor);
    }
    // 0.2 reorders the args and adds `router` + `message_router`. The three
    // signer args are typically all the same `KeysManager`.
    let read_args = ChannelManagerReadArgs::new(
        &keys_manager, // entropy_source
        &keys_manager, // node_signer
        &keys_manager, // signer_provider
        &fee_estimator,
        &chain_monitor,
        &broadcaster,
        &router,
        &message_router,
        &logger,
        user_config,
        channel_monitor_mut_references,
    );
    <(BlockHash, ChannelManager)>::read(&mut channel_manager_file, read_args).unwrap()
};

/* FRESH CHANNELMANAGER */

let (channel_manager_blockhash, mut channel_manager) = {
    let best_blockhash = // insert the best blockhash you know of
    let best_chain_height = // insert the height corresponding to best_blockhash
    let chain_params = ChainParameters {
        network: Network::Testnet, // substitute this with your network
        best_block: BestBlock::new(best_blockhash, best_chain_height),
    };
    let fresh_channel_manager = ChannelManager::new(
        &fee_estimator,
        &chain_monitor,
        &broadcaster,
        &router,
        &message_router,
        &logger,
        &keys_manager, // entropy_source
        &keys_manager, // node_signer
        &keys_manager, // signer_provider
        user_config,
        chain_params,
        current_timestamp,
      );
    (best_blockhash, fresh_channel_manager)
};

```

```kotlin [Kotlin]
if (serializedChannelManager != null && serializedChannelManager.isNotEmpty()) {
    // Loading from disk (restarting)
    val channelManagerConstructor = ChannelManagerConstructor(
        serializedChannelManager,
        serializedChannelMonitors,
        userConfig,
        keysManager.as_EntropySource(),
        keysManager.as_NodeSigner(),
        keysManager.as_SignerProvider(),
        feeEstimator,
        chainMonitor,
        txFilter,
        networkGraph.write(),
        ProbabilisticScoringDecayParameters.with_default(),
        ProbabilisticScoringFeeParameters.with_default(),
        scorer.write(),
        null, // routerWrapper (optional)
        txBroadcaster,
        logger
    )
} else {
    // Fresh start
    val channelManagerConstructor = ChannelManagerConstructor(
        Network.LDKNetwork_Regtest,
        userConfig,
        latestBlockHash,
        latestBlockHeight,
        keysManager.as_EntropySource(),
        keysManager.as_NodeSigner(),
        keysManager.as_SignerProvider(),
        feeEstimator,
        chainMonitor,
        networkGraph,
        ProbabilisticScoringDecayParameters.with_default(),
        ProbabilisticScoringFeeParameters.with_default(),
        null, // routerWrapper (optional)
        txBroadcaster,
        logger
    )
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// FRESH start: build the ChannelManager directly (see "Adding a ChannelManager").
// RESTART: deserialize it together with its ChannelMonitors. There is no
// ChannelManagerConstructor helper in the TypeScript bindings.
const read = ldk.UtilMethods.constructor_C2Tuple_ThirtyTwoBytesChannelManagerZ_read(
  serializedChannelManager,
  keysManager.as_EntropySource(),
  keysManager.as_NodeSigner(),
  keysManager.as_SignerProvider(),
  feeEstimator,
  chainMonitor.as_Watch(),
  txBroadcaster,
  router.as_Router(),
  messageRouter.as_MessageRouter(),
  logger,
  userConfig,
  channelMonitors // ChannelMonitor[]
);
if (read instanceof ldk.Result_C2Tuple_ThirtyTwoBytesChannelManagerZDecodeErrorZ_OK) {
  const channelManager = read.res.get_b(); // get_a() is the latest block hash
}
```

:::

**Implementation notes:** No methods should be called on `ChannelManager` until
_after_ the `ChannelMonitor`s and `ChannelManager` are synced to the chain tip (next step).

**Dependencies:** `KeysManager`, `FeeEstimator`, `ChainMonitor`, `BroadcasterInterface`, `Logger`

**References:** [Rust `ChannelManager` docs](https://docs.rs/lightning/0.2.2/lightning/ln/channelmanager/struct.ChannelManager.html), [Java/Kotlin `ChannelManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/ChannelManager.java)

### Sync `ChannelMonitor`s and `ChannelManager` to chain tip

**What it's used for:** this step is only necessary if you're restarting and have open channels. This step ensures that LDK channel state is up-to-date with the bitcoin blockchain

**Example:**

::: code-group

```rust [Rust]
  // Full Blocks or BIP 157/158

use lightning_block_sync::init;
use lightning_block_sync::poll;
use lightning_block_sync::UnboundedCache;

impl lightning_block_sync::BlockSource for YourChainBackend {
    fn get_header<'a>(
        &'a mut self, header_hash: &'a BlockHash, height_hint: Option<u32>,
    ) -> AsyncBlockSourceResult<'a, BlockHeaderData> {
        // <insert code to retrieve the header corresponding to header_hash>
    }

    fn get_block<'a>(
        &'a mut self, header_hash: &'a BlockHash,
    ) -> AsyncBlockSourceResult<'a, BlockData> {
        // <insert code to retrieve the block corresponding to header_hash>
        // Note: `get_block` now returns `BlockData` (was `Block`).
    }

    fn get_best_block<'a>(&'a mut self) ->
        AsyncBlockSourceResult<(BlockHash, Option<u32>)> {
        // <insert code to retrieve your best-known block hash and height>
    }
}

let block_source = YourChainBackend::new();

let mut chain_listener_channel_monitors = Vec::new();
let mut cache = UnboundedCache::new();
let mut chain_tip: Option<poll::ValidatedBlockHeader> = None;
let mut chain_listeners = vec![(
    channel_manager_blockhash,
    &mut channel_manager as &mut dyn chain::Listen,
)];

for (blockhash, channel_monitor) in channel_monitors.drain(..) {
    let outpoint = channel_monitor.get_funding_txo().0;
    chain_listener_channel_monitors.push((
        blockhash,
        (
            channel_monitor,
            &broadcaster,
            &fee_estimator,
            &logger,
        ),
        outpoint,
    ));
}

for monitor_listener_info in chain_listener_channel_monitors.iter_mut() {
    chain_listeners.push((
        monitor_listener_info.0,
        &mut monitor_listener_info.1 as &mut dyn chain::Listen,
    ));
}

// Save the chain tip to be used in future steps
chain_tip = Some(
    init::synchronize_listeners(
        &mut block_source,
        Network::Testnet,
        &mut cache,
        chain_listeners,
    )
    .await
    .unwrap(),
);

  
````

```java [Kotlin]
// Electrum/Esplora

// Retrieve transaction IDs to check the chain for un-confirmation.
val relevantTxIdsFromChannelManager: Array<ByteArray> = channelManager .as_Confirm().get_relevant_txids()
val relevantTxIdsFromChannelManager: Array<ByteArray> = chainMonitor.as_Confirm().get_relevant_txids()
val relevantTxIds = relevantTxIdsFromChannelManager + relevantTxIdsFromChainMonitor

val unconfirmedTxs: Array<ByteArray> = // <insert code to find out from your chain source
                                      //  if any of relevant_txids have been reorged out
                                      //  of the chain>

for (txid in unconfirmedTxs) {
    channelManager .transaction_unconfirmed(txid)
    chainMonitor.transaction_unconfirmed(txid)
}

// Retrieve transactions and outputs that were registered through the `Filter`
// interface.

// If any of these txs/outputs were confirmed on-chain, then:
val header: Array<ByteArray> = // insert block header from the block with confirmed tx/output
val height: Int = // insert block height of `header`
val txIndex: Long = // insert tx index in block
val serializedTx: Array<ByteArray> = // insert tx hex as byte array
val tx: TwoTuple_usizeTransactionZ = TwoTuple_usizeTransactionZ.of(txIndex, serializedTx);

// Marshall all TwoTuples you built right above into an array
val txList = arrayOf<TwoTuple_usizeTransactionZ>(TwoTuple_usizeTransactionZ.of(tx.., ..));

channelManager.transactions_confirmed(header, height, txList);
chainMonitor.transactions_confirmed(header, height, txList);

val bestHeader: Array<ByteArray> = // <insert code to get your best known header>
val bestHeight: Int = // <insert code to get your best known block height>
channelManager.update_best_block(bestHeader, bestHeight);
chainMonitor.update_best_block(bestHeader, bestHeight);

// Finally, tell LDK that chain sync is complete. This also starts the
// background tasks. Note the new signature: a KVStoreSync, your event handler,
// an optional OutputSweeperSync, and whether to use P2P gossip sync.
channelManagerConstructor.chain_sync_completed(kvStore, eventHandler, outputSweeper, false)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// The TypeScript bindings have no block-sync helper — drive the `Confirm`
// interface yourself. Both the ChannelManager and ChainMonitor implement it
// (via `as_Confirm()`); as you learn of confirmed/unconfirmed transactions and
// new tips from your chain source, forward them to both:
//
//   const confirm = channelManager.as_Confirm();
//   confirm.transactions_confirmed(header, txdata, height);
//   confirm.transaction_unconfirmed(txid);
//   confirm.best_block_updated(header, height);
//
// Use `confirm.get_relevant_txids()` to learn which transactions to monitor for
// reorgs. Repeat for `chainMonitor.as_Confirm()`.
```

:::

**Implementation notes:**

There are 2 main options for synchronizing to chain on startup:

**Full Blocks or BIP 157/158**

If you are connecting full blocks or using BIP 157/158, then it is recommended to use
LDK's `lightning_block_sync` crate as in the example above: the high-level steps that must be done for both `ChannelManager` and each `ChannelMonitor` are as follows:

1. Get the last blockhash that each object saw.
   - Receive the latest block hash when through [deserializtion](https://docs.rs/lightning/0.2.2/lightning/ln/channelmanager/struct.ChannelManagerReadArgs.html) of the `ChannelManager` via `read()`
   - Each `ChannelMonitor`'s is in `channel_manager.channel_monitors`, as the 2nd element in each tuple
2. For each object, if its latest known blockhash has been reorged out of the chain, then disconnect blocks using `channel_manager.as_Listen().block_disconnected(..)` or `channel_monitor.block_disconnected(..)` until you reach the last common ancestor with the main chain.
3. For each object, reconnect blocks starting from the common ancestor until it gets to your best known chain tip using `channel_manager.as_Listen().block_connected(..)` and/or `channel_monitor.block_connected(..)`.
4. Call `channel_manager.chain_sync_completed(..)` to complete the initial sync process.

**Electrum/Esplora**

Alternatively, you can use LDK's `lightning-transaction-sync` crate. This provides utilities for syncing LDK via the transaction-based `Confirm` interface.

### Optional: Initialize `P2PGossipSync or RapidGossipSync`

**You must follow this step if:** you need LDK to provide routes for sending payments (i.e. you are _not_ providing your own routes)

**What it's used for:** generating routes to send payments over

::: code-group

```rust [Rust]
let network_graph_path = format!("{}/network_graph", ldk_data_dir.clone());
let network_graph = Arc::new(disk::read_network(Path::new(&network_graph_path), Network::Testnet, logger.clone()));
// `chain::Access` was replaced by `UtxoLookup`; pass `None` or a UTXO source.
let gossip_sync = Arc::new(P2PGossipSync::new(
  Arc::clone(&network_graph),
  None::<Arc<dyn UtxoLookup + Send + Sync>>,
  logger.clone(),
));
```

```java [Kotlin]
val serializedNetworkGraph = // Read network graph bytes from file
val readResult = NetworkGraph.read(serializedNetworkGraph, logger)
val networkGraph = (readResult as Result_NetworkGraphDecodeErrorZ.Result_NetworkGraphDecodeErrorZ_OK).res

// `Option_AccessZ` was replaced by `Option_UtxoLookupZ`.
val p2pGossip = P2PGossipSync.of(networkGraph, Option_UtxoLookupZ.none(), logger)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// Read an existing graph from disk, or create a new one.
const readResult = ldk.NetworkGraph.constructor_read(serializedNetworkGraph, logger);
const networkGraph =
  readResult instanceof ldk.Result_NetworkGraphDecodeErrorZ_OK
    ? readResult.res
    : ldk.NetworkGraph.constructor_new(ldk.Network.LDKNetwork_Testnet4, logger);

const p2pGossip = ldk.P2PGossipSync.constructor_new(
  networkGraph,
  ldk.Option_UtxoLookupZ.constructor_none(),
  logger
);
```

:::

**Implementation notes:** this struct is not required if you are providing your own routes. It will be used internally in `ChannelManager` to build a `NetworkGraph`. Network options include: `Mainnet`,`Regtest`,`Testnet`,`Signet`

**Dependencies:** `Logger`

**Optional dependency:** `Access`, a source of chain information. Recommended to be able to verify channels before adding them to the internal network graph.

**References:** [Rust `P2PGossipSync` docs](https://docs.rs/lightning/0.2.2/lightning/routing/gossip/struct.P2PGossipSync.html), [`Access` docs](https://docs.rs/lightning/0.2.2/lightning/chain/trait.Access.html), [Java/Kotlin `P2PGossipSync` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/P2PGossipSync.java), [Rust `RapidGossipSync` docs](https://docs.rs/lightning-rapid-gossip-sync/*/lightning_rapid_gossip_sync/), [Java/Kotlin `RapidGossipSync` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/RapidGossipSync.java)

### Optional: Initialize `Probabilistic Scorer`

**What it's used for**: to find a suitable payment path to reach the destination.

::: code-group

```rust [Rust]
let network_graph_path = format!("{}/network_graph", ldk_data_dir.clone());
let network_graph = Arc::new(disk::read_network(Path::new(&network_graph_path), args.network, logger.clone()));

let scorer_path = format!("{}/scorer", ldk_data_dir.clone());
let scorer = Arc::new(RwLock::new(disk::read_scorer(
    Path::new(&scorer_path),
    Arc::clone(&network_graph),
    Arc::clone(&logger),
)));

```

```kotlin [Kotlin]
if (scorerFile.exists()) {
    val scorerReaderResult = ProbabilisticScorer.read(scorerFile.readBytes(), ProbabilisticScoringDecayParameters.with_default(), networkGraph, logger)
    if (scorerReaderResult.is_ok) {
        val probabilisticScorer = (scorerReaderResult as Result_ProbabilisticScorerDecodeErrorZ.Result_ProbabilisticScorerDecodeErrorZ_OK).res
        scorer = MultiThreadedLockableScore.of(probabilisticScorer.as_Score())
        Log.i(LDKTAG, "LDK: Probabilistic Scorer loaded and running")
    } else {
        Log.i(LDKTAG, "LDK: Couldn't load Probabilistic Scorer")
        val decayParams = ProbabilisticScoringDecayParameters.with_default()
        val probabilisticScorer = ProbabilisticScorer.of(decayParams, networkGraph, logger)
        scorer = MultiThreadedLockableScore.of(probabilisticScorer.as_Score())
        Log.i(LDKTAG, "LDK: Creating a new Probabilistic Scorer")
    }
} else {
    val decayParams = ProbabilisticScoringDecayParameters.with_default()
    val probabilisticScorer = ProbabilisticScorer.of(decayParams, networkGraph, logger)
    scorer = MultiThreadedLockableScore.of(probabilisticScorer.as_Score())
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

const decayParams = ldk.ProbabilisticScoringDecayParameters.constructor_default();

// Read an existing scorer from disk, or create a new one.
const readResult = ldk.ProbabilisticScorer.constructor_read(
  serializedScorer,
  decayParams,
  networkGraph,
  logger
);
const scorer =
  readResult instanceof ldk.Result_ProbabilisticScorerDecodeErrorZ_OK
    ? readResult.res
    : ldk.ProbabilisticScorer.constructor_new(decayParams, networkGraph, logger);

// Wrap it so it can be shared with the router (see "Initialize the Router").
const multiThreadedScorer = ldk.MultiThreadedLockableScore.constructor_new(scorer.as_Score());
```

:::

**Dependencies:** `NetworkGraph`

**References:** [Rust `ProbabilisticScorer` docs](https://docs.rs/lightning/0.2.2/lightning/routing/scoring/struct.ProbabilisticScorer.html), [Java/Kotlin `ProbabilisticScorer` docs](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/ProbabilisticScorer.java)