# Setting up a ChannelManager

The ChannelManager is responsible for several tasks related to managing channel state. This includes keeping track of many channels, sending messages to appropriate channels, creating channels and more.

## Adding a ChannelManager

To add a `ChannelManager` to your application, run:

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
use lightning::ln::channelmanager;

let channel_manager = ChannelManager::new(
  &fee_estimator,
  &chain_monitor,
  &broadcaster,
  &router,
  &logger,
  &entropy_source,
  &node_signer,
  &signer_provider,
  user_config,
  chain_params,
  current_timestamp
);
```

  </template>

  <template v-slot:kotlin>
 
  ```kotlin
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
router,
scoringParams,
routerWrapper, // optional
txBroadcaster,
logger
);

````

</template>

<template v-slot:swift>

```Swift
import LightningDevKit

let channelManagerConstructionParameters = ChannelManagerConstructionParameters(
    config: userConfig,
    entropySource: keysManager.asEntropySource(),
    nodeSigner: keysManager.asNodeSigner(),
    signerProvider: keysManager.asSignerProvider(),
    feeEstimator: feeEstimator,
    chainMonitor: chainMonitor,
    txBroadcaster: broadcaster,
    logger: logger,
    enableP2PGossip: true,
    scorer: scorer
)

let channelManagerConstructor = ChannelManagerConstructor(
    network: network,
    currentBlockchainTipHash: latestBlockHash,
    currentBlockchainTipHeight: latestBlockHeight,
    netGraph: netGraph,
    params: channelManagerConstructionParameters
)
````

  </template>

</CodeSwitcher>

There are a few dependencies needed to get this working. Let's walk through setting up each one so we can plug them into our `ChannelManager`.

### Initialize the `FeeEstimator`

**What it's used for:** estimating fees for on-chain transactions that LDK wants broadcasted.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>
 
  ```rust
  struct YourFeeEstimator();

impl FeeEstimator for YourFeeEstimator {
fn get_est_sat_per_1000_weight(
&self, confirmation_target: ConfirmationTarget,
) -> u32 {
match confirmation_target {
ConfirmationTarget::Background => // fetch background feerate,
ConfirmationTarget::Normal => // fetch normal feerate (~6 blocks)
ConfirmationTarget::HighPriority => // fetch high priority feerate
}
}
}

let fee_estimator = YourFeeEstimator();

````

</template>

<template v-slot:kotlin>

```java
object YourFeeEstimator : FeeEstimatorInterface {
  override fun get_est_sat_per_1000_weight(confirmationTarget: ConfirmationTarget?): Int {
      if (confirmationTarget == ConfirmationTarget.LDKConfirmationTarget_Background) {
          // <insert code to retrieve a background feerate>
      }

      if (confirmationTarget == ConfirmationTarget.LDKConfirmationTarget_Normal) {
          // <insert code to retrieve a normal (i.e. within ~6 blocks) feerate>
      }

      if (confirmationTarget == ConfirmationTarget.LDKConfirmationTarget_HighPriority) {
          // <insert code to retrieve a high-priority feerate>
      }
      // return default fee rate
  }
}

val feeEstimator: FeeEstimator = FeeEstimator.new_impl(YourFeeEstimator)
````

  </template>

  <template v-slot:swift>
 
  ```Swift
  class MyFeeEstimator: FeeEstimator {
    override func getEstSatPer1000Weight(confirmationTarget: Bindings.ConfirmationTarget) -> UInt32 {
        if confirmationTarget == .Background {
            // Fetch Background Feerate
        } else if confirmationTarget == .Normal {
            // Fetch Normal Feerate (~6 blocks)
        } else if confirmationTarget == .HighPriority {
            // Fetch High Feerate
        }
        // Fetch Default Feerate
    }
}

let feeEstimator = MyFeeEstimator()

````

  </template>

</CodeSwitcher>

**Implementation notes:**
1. Fees must be returned in: satoshis per 1000 weight units
2. Fees must be no smaller than 253 (equivalent to 1 satoshi/vbyte, rounded up)
3. To reduce network traffic, you may want to cache fee results rather than
retrieving fresh ones every time

**Dependencies:** *none*

**References:** [Rust `FeeEstimator` docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.FeeEstimator.html), [Java `FeeEstimator` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/FeeEstimator.java)

### Initialize the `Router`

**What it's used for:** Finds a Route for a payment between the given payer and a payee.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

  ```rust
  let router = DefaultRouter::new(
    network_graph.clone(),
    logger.clone(),
    keys_manager.get_secure_random_bytes(),
    scorer.clone(),
    ProbabilisticScoringFeeParameters::default()
  )
````

  </template>

  <template v-slot:kotlin>
 
  ```java
  
  ```

  </template>

  <template v-slot:swift>
 
  ```Swift
  
  ```

  </template>

</CodeSwitcher>

**Dependencies:** `P2PGossipSync`, `Logger`, `KeysManager`, `Scorer`

**References:** [Rust `Router` docs](https://docs.rs/lightning/*/lightning/routing/router/trait.Router.html), [Java `Router` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Router.java)

### Initialize the `Logger`

**What it's used for:** LDK logging

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>
 
  ```rust
  struct YourLogger();

impl Logger for YourLogger {
fn log(&self, record: &Record) {
let raw_log = record.args.to_string();
let log = format!(
"{} {:<5} [{}:{}] {}\n",
OffsetDateTime::now_utc().format("%F %T"),
record.level.to_string(),
record.module_path,
record.line,
raw_log
);
// <insert code to print this log and/or write this log to disk>
}
}

let logger = YourLogger();

````

</template>

<template v-slot:kotlin>

```java
object YourLogger : LoggerInterface {
    override fun log(record: Record?) {
        // <insert code to print this log and/or write this log to a file>
    }
}

val logger: Logger = Logger.new_impl(YourLogger)
````

  </template>

  <template v-slot:swift>
 
  ```Swift
  class MyLogger: Logger {
    override func log(record: Bindings.Record) {
        // Print and/or write the log to a file
    }
  }

let logger = MyLogger()

````

</template>

</CodeSwitcher>

**Implementation notes:** you'll likely want to write the logs to a file for debugging purposes.

**Dependencies:** *none*

**References:** [Rust `Logger` docs](https://docs.rs/lightning/*/lightning/util/logger/trait.Logger.html), [Java `Logger` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Logger.java)

### Initialize the `BroadcasterInterface`
**What it's used for:** broadcasting various transactions to the bitcoin network

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
<template v-slot:rust>

```rust
struct YourTxBroadcaster();

impl BroadcasterInterface for YourTxBroadcaster {
    fn broadcast_transactions(&self, txs: &[&Transaction]) {
        // <insert code to broadcast a list of transactions>
    }
}

let broadcaster = YourTxBroadcaster();
````

  </template>

  <template v-slot:kotlin>
 
  ```java
  object YourTxBroadcaster: BroadcasterInterface.BroadcasterInterfaceInterface {
      override fun broadcast_transactions(txs: Array<out ByteArray>??) {
        // <insert code to broadcast a list of transactions>
      }
  }

val txBroadcaster: BroadcasterInterface = BroadcasterInterface.new_impl(YourTxBroadcaster)

````

</template>

<template v-slot:swift>

```Swift
class YourTxBroacaster: BroadcasterInterface {
  override func broadcastTransactions(txs: [[UInt8]]) {
      // Insert code to broadcast a list of transactions
  }
}

let broadcaster = YourTxBroacaster()
````

</template>

</CodeSwitcher>

**Dependencies:** _none_

**References:** [Rust `BroadcasterInterface` docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.BroadcasterInterface.html), [Java `BroadcasterInterface` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/BroadcasterInterface.java)

### Initialize `Persist`

**What it's used for:** persisting `ChannelMonitor`s, which contain crucial channel data, in a timely manner

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
struct YourPersister();

impl<ChannelSigner: Sign> Persist for YourPersister {
    fn persist_new_channel(
        &self, id: OutPoint, data: &ChannelMonitor<ChannelSigner>
    ) -> Result<(), ChannelMonitorUpdateErr> {
        // <insert code to persist the ChannelMonitor to disk and/or backups>
        // Note that monitor.encode() will get you the ChannelMonitor as a
        // Vec<u8>.
    }

  fn update_persisted_channel(
        &self,
        id: OutPoint,
        update: &ChannelMonitorUpdate,
        data: &ChannelMonitor<ChannelSigner>
    ) -> Result<(), ChannelMonitorUpdateErr> {
        // <insert code to persist either the ChannelMonitor or the
        //  ChannelMonitorUpdate to disk>
    }
}

let persister = YourPersister();
```

  </template>

  <template v-slot:kotlin>

```java
object YourPersister: Persist.PersistInterface {
  override fun persist_new_channel(
      id: OutPoint?, data: ChannelMonitor?, updateId: MonitorUpdateId?
  ): Result_NoneChannelMonitorUpdateErrZ? {
      val channelMonitorBytes = data.write()
      // <insert code to write these bytes to disk, keyed by `id`>
  }

  override fun update_persisted_channel(
      id: OutPoint?, update: ChannelMonitorUpdate?, data: ChannelMonitor?,
      updateId: MonitorUpdateId
  ): Result_NoneChannelMonitorUpdateErrZ? {
      val channelMonitorBytes = data.write()
      // <insert code to update the `ChannelMonitor`'s file on disk with these
      //  new bytes, keyed by `id`>
  }
}

val persister: Persist = Persist.new_impl(YourPersister)
```

  </template>

  <template v-slot:swift>

```Swift
class MyPersister: Persist {
    override func persistNewChannel(channelId: OutPoint, data: ChannelMonitor, updateId: MonitorUpdateId) -> Bindings.ChannelMonitorUpdateStatus {
        // Insert the code to persist the ChannelMonitor to disk
    }

    override func updatePersistedChannel(channelId: OutPoint, update: ChannelMonitorUpdate, data: ChannelMonitor, updateId: MonitorUpdateId) -> ChannelMonitorUpdateStatus {
        // Insert the code to persist either ChannelMonitor or ChannelMonitorUpdate to disk
    }
}

let persister = MyPersister()
```

  </template>

</CodeSwitcher>

<CodeSwitcher :languages="{rust:'Using LDK Sample Filesystem Persistence Module in Rust'}">
  <template v-slot:rust>

```rust
use lightning_persister::FilesystemPersister; // import LDK sample persist module

let persister = FilesystemPersister::new(ldk_data_dir_path);
```

  </template>
</CodeSwitcher>

**Implementation notes:**

- `ChannelMonitor`s are objects which are capable of
  responding to on-chain events for a given channel. Thus, you will have one
  `ChannelMonitor` per channel. They are persisted in real-time and the `Persist`
  methods will block progress on sending or receiving payments until they return.
  You must ensure that `ChannelMonitor`s are durably persisted to disk before
  returning or you may lose funds.
- If you implement a custom persister, it's important to read the trait docs (linked in References) to make sure you satisfy the API requirements, particularly for `update_persisted_channel`

**Dependencies:** _none_

**References:** [Rust `Persister` docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/trait.Persist.html), [Java `Persister` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Persist.java)

### Optional: Initialize the Transaction `Filter`

**You must follow this step if:** you are _not_ providing full blocks to LDK,
i.e. if you're using BIP 157/158 or Electrum as your chain backend

**What it's used for:** if you are not providing full blocks, LDK uses this
object to tell you what transactions and outputs to watch for on-chain. You'll
inform LDK about these transactions/outputs in Step 14.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
struct YourTxFilter();

impl Filter for YourTxFilter {
  fn register_tx(&self, txid: &Txid, script_pubkey: &Script) {
        // <insert code for you to watch for this transaction on-chain>
  }

  fn register_output(&self, output: WatchedOutput) ->
        Option<(usize, Transaction)> {
        // <insert code for you to watch for any transactions that spend this
        // output on-chain>
    }
}

let filter = YourTxFilter();
```

  </template>

  <template v-slot:kotlin>

```java
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

  </template>

  <template v-slot:swift>

```Swift
class MyFilter: Filter {
    override func registerTx(txid: [UInt8]?, scriptPubkey: [UInt8]) {
        // Insert code to watch this transaction
    }

    override func registerOutput(output: Bindings.WatchedOutput) {
        // Insert code to watch for any transaction that spend this output
    }
}

let filter = MyFilter()
```

  </template>

</CodeSwitcher>

**Implementation notes:** see the [Blockchain Data](/blockchain_data/introduction.md) guide for more info

**Dependencies:** _none_

**References:** [Rust `Filter` docs](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html), [Java `Filter` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Filter.java)

### Initialize the `ChainMonitor`

**What it's used for:** tracking one or more `ChannelMonitor`s and using them to monitor the chain for lighting transactions that are relevant to our node, and broadcasting transactions if need be.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
let filter: Option<Box<dyn Filter>> = // leave this as None or insert the Filter trait object

let chain_monitor = ChainMonitor::new(filter, &broadcaster, &logger, &fee_estimator, &persister);
```

  </template>

  <template v-slot:kotlin>

```java
val filter : Filter = // leave this as `null` or insert the Filter object.

val chainMonitor = ChainMonitor.of(filter, txBroadcaster, logger, feeEstimator, persister)
```

  </template>

  <template v-slot:swift>

```Swift
let filter: Filter = // leave this as `nil` or insert the Filter object.

let chainMonitor = ChainMonitor(
  chainSource: filter,
  broadcaster: broadcaster,
  logger: logger,
  feeest: feeEstimator,
  persister: persister
)
```

  </template>

</CodeSwitcher>

**Implementation notes:** `Filter` must be non-`None` if you're using Electrum or BIP 157/158 as your chain backend

**Dependencies:** `FeeEstimator`, `Logger`, `BroadcasterInterface`, `Persist`

**Optional dependency:** `Filter`

**References:** [Rust `ChainMonitor` docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/struct.ChainMonitor.html), [Java `ChainMonitor` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChainMonitor.java)

### Initialize the `KeysManager`

**What it's used for:** providing keys for signing Lightning transactions

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
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
let keys_manager = KeysManager::new(&keys_seed, cur.as_secs(), cur.subsec_nanos());

```

  </template>

  <template v-slot:kotlin>

```java
val keySeed = ByteArray(32)
// <insert code to fill key_seed with random bytes OR if restarting, reload the
// seed from disk>
val keysManager = KeysManager.of(
      keySeed,
      System.currentTimeMillis() / 1000,
      (System.currentTimeMillis() * 1000).toInt()
  )
```

  </template>

  <template v-slot:swift>

```Swift
let seed = // Insert code to create seed with random bytes or if restarting, reload the seed from disk
let timestampSeconds = UInt64(NSDate().timeIntervalSince1970)
let timestampNanos = UInt32.init(truncating: NSNumber(value: timestampSeconds * 1000 * 1000))
let keysManager = KeysManager(seed: seed, startingTimeSecs: timestampSeconds, startingTimeNanos: timestampNanos)
```

  </template>

</CodeSwitcher>

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

**References:** [Rust `KeysManager` docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html), [Java `KeysManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/KeysManager.java)

### Read `ChannelMonitor` state from disk

**What it's used for:** if LDK is restarting and has at least 1 channel, its `ChannelMonitor`s will need to be (1) fed to the `ChannelManager` and (2) synced to chain.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
// Use LDK's sample persister module provided method
let mut channel_monitors =
  persister.read_channelmonitors(keys_manager.clone()).unwrap();

// If you are using Electrum or BIP 157/158, you must call load_outputs_to_watch
// on each ChannelMonitor to prepare for chain synchronization in Step 9.
for chan_mon in channel_monitors.iter() {
    chan_mon.load_outputs_to_watch(&filter);
}
```

  </template>

  <template v-slot:kotlin>

```java
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

  </template>

  <template v-slot:swift>

```Swift
// Initialize the array where we'll store the `ChannelMonitor`s read from disk.
// This array will later be given to the `ChannelManagerConstructor` on initialization.
var serializedChannelMonitors: [[UInt8]] = []
let allChannels = // Insert code to get a list of persisted channels
for channel in allChannels {
    let channelData = try Data(contentsOf: channel)
    let channelBytes = [UInt8](channelData)
    serializedChannelMonitors.append(channelBytes)
}
```

  </template>
</CodeSwitcher>

**Dependencies:** `KeysManager`

**References:** [Rust `load_outputs_to_watch` docs](https://docs.rs/lightning/*/lightning/chain/channelmonitor/struct.ChannelMonitor.html#method.load_outputs_to_watch)

### Initialize the `ChannelManager`

**What it's used for:** managing channel state

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
let user_config = UserConfig::default();

/* RESTARTING */
let (channel_manager_blockhash, mut channel_manager) = {
    let channel_manager_file =
        fs::File::open(format!("{}/manager", ldk_data_dir.clone())).unwrap();

    // Use the `ChannelMonitors` we read from disk in Step 7.
  let mut channel_monitor_mut_references = Vec::new();
  for (_, channel_monitor) in channel_monitors.iter_mut() {
    channel_monitor_mut_references.push(channel_monitor);
  }
  let read_args = ChannelManagerReadArgs::new(
    &keys_manager,
    &fee_estimator,
    &chain_monitor,
    &broadcaster,
    &logger,
    user_config,
    channel_monitor_mut_references,
  );
  <(BlockHash, ChannelManager)>::read(&mut channel_manager_file, read_args)
        .unwrap()
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
    &logger,
    &keys_manager,
    user_config,
    chain_params,
  );
  (best_blockhash, fresh_channel_manager)
};
```

  </template>

  <template v-slot:kotlin>

```java
    if (serializedChannelManager != "") {
        // loading from disk (restarting)
        channelManagerConstructor = ChannelManagerConstructor(
            serializedChannelManager,
            channelMonitors,
            userConfig,
            keysManager.as_KeysInterface(),
            feeEstimator,
            chainMonitor,
            txFilter,
            router.write(),
            txBroadcaster,
            logger
        );
    } else {
        // fresh start
        channelManagerConstructor = ChannelManagerConstructor(
            Network.LDKNetwork_Regtest,
            userConfig,
            latestBlockHash,
            latestBlockHeight,
            keysManager.as_KeysInterface(),
            feeEstimator,
            chainMonitor,
            router,
            txBroadcaster,
            logger
        );
    }
```

  </template>

<template v-slot:swift>

```Swift
if !serializedChannelManager.isEmpty {
    channelManagerConstructor = try ChannelManagerConstructor(
      channelManagerSerialized: serializedChannelManager,
      channelMonitorsSerialized: serializedChannelMonitors,
      networkGraph: NetworkGraphArgument.instance(netGraph),
      filter: filter,
      params: channelManagerConstructionParameters
  )
} else {
  channelManagerConstructor = ChannelManagerConstructor(
      network: network,
      currentBlockchainTipHash: latestBlockHash,
      currentBlockchainTipHeight: latestBlockHeight,
      netGraph: netGraph,
      params: channelManagerConstructionParameters
  )
}
```

  </template>

</CodeSwitcher>

**Implementation notes:** No methods should be called on `ChannelManager` until
_after_ the `ChannelMonitor`s and `ChannelManager` are synced to the chain tip (next step).

**Dependencies:** `KeysManager`, `FeeEstimator`, `ChainMonitor`, `BroadcasterInterface`, `Logger`

- If restarting: `ChannelMonitor`s and `ChannelManager` bytes from Step 7 and Step 18 respectively

**References:** [Rust `ChannelManager` docs](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html), [Java `ChannelManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChannelManager.java)

### Sync `ChannelMonitor`s and `ChannelManager` to chain tip

**What it's used for:** this step is only necessary if you're restarting and have open channels. This step ensures that LDK channel state is up-to-date with the bitcoin blockchain

**Example:**

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>
  
  ```rust
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
    ) -> AsyncBlockSourceResult<'a, Block> {
          // <insert code to retrieve the block corresponding to header_hash>
    }

    fn get_best_block<'a>(&'a mut self) ->
          AsyncBlockSourceResult<(BlockHash, Option<u32>)> {
          // <insert code to retrieve your best known block hash and height>
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

for monitor_listener_info in chain_listener_channel_monitors.iter_mut()
{
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

</template>

<template v-slot:kotlin>

```java
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

// Finally, tell LDK that chain sync is complete. This will also spawn several
// background threads to handle networking and event processing.
channelManagerConstructor.chain_sync_completed(customEventHandler);
````

  </template>

  <template v-slot:swift>

```Swift
// Electrum/Esplora

// Retrieve transaction IDs to check the chain for un-confirmation.
let relevantTxIds1 = channelManager?.asConfirm().getRelevantTxids() ?? []
let relevantTxIds2 = chainMonitor?.asConfirm().getRelevantTxids() ?? []

var relevantTxIds: [[UInt8]] = [[UInt8]]()
for tx in relevantTxIds1 {
    relevantTxIds.append(tx.0)
}
for tx in relevantTxIds2 {
    relevantTxIds.append(tx.0)
}

var unconfirmedTx: [[UInt8]] = // Insert code to find out from your chain source
                              // if any of relevantTxIds have been reorged out
                              // of the chain

for txid in unconfirmedTx {
    channelManager.asConfirm().transactionUnconfirmed(txid: txid)
    chainMonitor.asConfirm().transactionUnconfirmed(txid: txid)
}

// Retrieve transactions and outputs that were registered through the `Filter` interface.

var confirmedTx: [[UInt8]] = // Insert code to find out from your chain source
                            // if any of the `Filter` txs/outputs were confirmed
                            // on-chain

for txid in confirmedTx {
    let header: [UInt8] = // Insert code to fetch header
    let height: UInt32 = // Insert code to fetch height of the header
    let tx: [UInt8] = // Insert code to fetch tx
    let txIndex: UInt = // Insert code to fetch tx index

    var twoTuple: [(UInt, [UInt8])] = []
    twoTuple.append((UInt, [UInt8])(txIndex, tx))
    channelManager.asConfirm().transactionsConfirmed(header: header, txdata: twoTuple, height: height)
    chainMonitor.asConfirm().transactionsConfirmed(header: header, txdata: twoTuple, height: height)
}

let bestHeader = // Insert code to fetch best header
let bestHeight = // Insert code to fetch best height

channelManager.asConfirm().bestBlockUpdated(header: bestHeader, height: bestHeight)
chainMonitor.asConfirm().bestBlockUpdated(header: bestHeader, height: bestHeight)

// Finally, tell LDK that chain sync is complete. This will also spawn several
// background threads to handle networking and event processing.
channelManagerConstructor.chainSyncCompleted(persister: channelManagerPersister)
```

  </template>

</CodeSwitcher>

**Implementation notes:**

There are 2 main options for synchronizing to chain on startup:

**Full Blocks or BIP 157/158**

If you are connecting full blocks or using BIP 157/158, then it is recommended to use
LDK's `lightning_block_sync` sample module as in the example above: the high-level steps that must be done for both `ChannelManager` and each `ChannelMonitor` are as follows:

1. Get the last blockhash that each object saw.
   - Receive the latest block hash when through [deserializtion](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManagerReadArgs.html) of the `ChannelManager` via `read()`
   - Each `ChannelMonitor`'s is in `channel_manager.channel_monitors`, as the 2nd element in each tuple
2. For each object, if its latest known blockhash has been reorged out of the chain, then disconnect blocks using `channel_manager.as_Listen().block_disconnected(..)` or `channel_monitor.block_disconnected(..)` until you reach the last common ancestor with the main chain.
3. For each object, reconnect blocks starting from the common ancestor until it gets to your best known chain tip using `channel_manager.as_Listen().block_connected(..)` and/or `channel_monitor.block_connected(..)`.
4. Call `channel_manager.chain_sync_completed(..)` to complete the initial sync process.

**Esplora**

Alternatively, you can use LDK's `lightning-transaction-sync` crate. This provides utilities for syncing LDK via the transaction-based `Confirm` interface.

**Electrum/Esplora**

Otherwise, you can use LDK's `Confirm` interface directly as in the examples above. The high-level steps are as follows:

1. Tell LDK about relevant confirmed and unconfirmed transactions.
2. Tell LDK what your best known block header and height is.
3. Call `channel_manager_constructor.chain_sync_completed(..)` to complete the initial sync process.

**References:** [Rust `Confirm` docs](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html), [Rust `Listen` docs](https://docs.rs/lightning/*/lightning/chain/trait.Listen.html), [Rust `lightning_block_sync` module docs](https://docs.rs/lightning-block-sync/*/lightning_block_sync/), [Rust `lightning_transaction_sync` module docs](https://docs.rs/lightning-transaction-sync/*/lightning_transaction_sync/)

**Dependencies:** `ChannelManager`, `ChainMonitor`, `ChannelMonitor`s

- If providing providing full blocks or BIP 157/158: set of `ChannelMonitor`s
- If using Electrum: `ChainMonitor`

### Optional: Initialize `P2PGossipSync or RapidGossipSync`

**You must follow this step if:** you need LDK to provide routes for sending payments (i.e. you are _not_ providing your own routes)

**What it's used for:** generating routes to send payments over

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">

<template v-slot:rust>

```rust
let genesis = genesis_block(Network::Testnet).header.block_hash();
let network_graph_path = format!("{}/network_graph", ldk_data_dir.clone());
let network_graph = Arc::new(disk::read_network(Path::new(&network_graph_path), genesis, logger.clone()));
let gossip_sync = Arc::new(P2PGossipSync::new(
  Arc::clone(&network_graph),
  None::<Arc<dyn chain::Access + Send + Sync>>,
  logger.clone(),
));
```

</template>

<template v-slot:kotlin>

```java
val genesisBlock : BestBlock = BestBlock.from_genesis(Network.LDKNetwork_Testnet)
val genesisBlockHash : String = byteArrayToHex(genesisBlock.block_hash())

val serializedNetworkGraph = // Read network graph bytes from file
val networkGraph : NetworkGraph = NetworkGraph.read(serializedNetworkGraph, logger)
val p2pGossip : P2PGossipSync = P2PGossipSync.of(networkGraph, Option_AccessZ.none(), logger)
```

</template>

<template v-slot:swift>

```Swift
// If Network Graph exists, then read from disk
let serializedNetworkGraph = // Read Network Graph bytes from file
let readResult = NetworkGraph.read(ser: serializedNetworkGraph, arg: logger)
if readResult.isOk() {
  netGraph = readResult.getValue()!
}

// If Network Graph does not exist, create a new one
let netGraph = NetworkGraph(network: network, logger: logger)

// Initialise RGS
let rgs = RapidGossipSync(networkGraph: netGraph, logger: logger)
if let lastSync = netGraph.getLastRapidGossipSyncTimestamp(), let snapshot = getSnapshot(lastSyncTimeStamp: lastSync) {
  let timestampSeconds = UInt64(NSDate().timeIntervalSince1970)
  let res = rgs.updateNetworkGraphNoStd(updateData: snapshot, currentTimeUnix: timestampSeconds)
  if res.isOk() {
    print("RGS updated")
  }
} else if let snapshot = getSnapshot(lastSyncTimeStamp: 0) { // Use lastSyncTimeStamp as 0 for first Sync
  let timestampSeconds = UInt64(NSDate().timeIntervalSince1970)
  let res = rgs.updateNetworkGraphNoStd(updateData: snapshot, currentTimeUnix: timestampSeconds)
  if res.isOk() {
    print("RGS initialized for the first time")
  }
}

// Get current snapshot from the RGS Server
func getSnapshot(lastSyncTimeStamp: UInt32) -> [UInt8]? {
  // Use LDK's RGS Server or use your own Server
  let url: URL = URL(string: "https://rapidsync.lightningdevkit.org/snapshot/\(lastSyncTimeStamp)")!
  let data = // Use the url to get the data
  if let data = data {
    return [UInt8](data)
  }
  return nil
}
```

</template>

</CodeSwitcher>

**Implementation notes:** this struct is not required if you are providing your own routes. It will be used internally in `ChannelManager` to build a `NetworkGraph`. Other networking options are: `LDKNetwork_Bitcoin`, `LDKNetwork_Regtest` and `LDKNetwork_Testnet`

**Dependencies:** `Logger`

**Optional dependency:** `Access`, a source of chain information. Recommended to be able to verify channels before adding them to the internal network graph.

**References:** [Rust `P2PGossipSync` docs](https://docs.rs/lightning/*/lightning/routing/gossip/struct.P2PGossipSync.html), [`Access` docs](https://docs.rs/lightning/*/lightning/chain/trait.Access.html), [Java `P2PGossipSync` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/P2PGossipSync.java), [Rust `RapidGossipSync` docs](https://docs.rs/lightning-rapid-gossip-sync/*/lightning_rapid_gossip_sync/), [Java `RapidGossipSync` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/RapidGossipSync.java)

### Optional: Initialize `Probabilistic Scorer`

**You must follow this step if:** TODO

**What it's used for:** TODO

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">

<template v-slot:rust>

```rust
// TODO: Add Rust Code Here
```

</template>

<template v-slot:kotlin>

```java
// TODO: Add Java Code Here
```

</template>

<template v-slot:swift>

```Swift
// If Scorer exists, then read from disk
let serializedScorer = // Read Scorer bytes from file
let decayParams = ProbabilisticScoringDecayParameters.initWithDefault()
let serializedProbabilisticScorer = ProbabilisticScorer.read(
  ser: serializedScorer,
  argA: decayParams,
  argB: netGraph,
  argC: logger
)
if let res = serializedProbabilisticScorer.getValue() {
  let probabilisticScorer = res
  let score = probabilisticScorer.asScore()

  // Scorer loaded
  let scorer = MultiThreadedLockableScore(score: score)
}

// If Scorer does not exist, create a new one
let decayParams = ProbabilisticScoringDecayParameters.initWithDefault()
let probabilisticScorer = ProbabilisticScorer(
  decayParams: decayParams,
  networkGraph: netGraph,
  logger: logger
)
let score = probabilisticScorer.asScore()

// Scorer loaded
let scorer = MultiThreadedLockableScore(score: score)
```

</template>

</CodeSwitcher>

**Implementation notes:** TODO

**Dependencies:** TODO

**Optional dependency:** TODO

**References:** TODO
