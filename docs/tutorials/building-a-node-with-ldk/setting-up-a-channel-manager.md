# Setting up a ChannelManager

The ChannelManager is responsible for several tasks related to managing channel state. This includes keeping track of many channels, sending messages to appropriate channels, creating channels and more. 

## Adding a ChannelManager

To add a `ChannelManager` to your application, run:

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust>

  ```rust
  use lightning::ln::channelmanager;

  let channel_manager = ChannelManager::new(
    &fee_estimator,
    &chain_monitor,
    &broadcaster,
    &logger,
    &keys_manager,
    user_config,
    chain_params,
);
  ```
  </template>
  <template v-slot:java>
 
  ```java
  import org.ldk.batteries.ChannelManagerConstructor

  ChannelManagerConstructor channel_manager_constructor = new ChannelManagerConstructor(
    Network.LDKNetwork_Bitcoin, 
    UserConfig.default(), 
    best_block_hash,
    block_height, 
    keys_manager.as_KeysInterface(), 
    fee_estimator, 
    chain_monitor,
    router, 
    tx_broadcaster, 
    logger
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
      Global.keysManager?.as_KeysInterface(),
      feeEstimator,
      Global.chainMonitor,
      Global.router,
      txBroadcaster,
      logger
  );
  ```

  </template>
</CodeSwitcher>

There are a few dependencies needed to get this working. Let's walk through setting up each one so we can plug them into our `ChannelManager`.

### Step 1. Initialize the `FeeEstimator`

**What it's used for:** estimating fees for on-chain transactions that LDK wants broadcasted.

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
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
  ```

  </template>

  <template v-slot:java>
 
  ```java
  class YourFeeEstimator implements FeeEstimator.FeeEstimatorInterface {
      @Override
      public int get_est_sat_per_1000_weight(ConfirmationTarget conf_target) {
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

  </template>

   <template v-slot:kotlin>
 
  ```kotlin
  object LDKFeeEstimator: FeeEstimatorInterface {
    override fun get_est_sat_per_1000_weight(conf_target: ConfirmationTarget?): Int {
        // insert code to retieve a fee rate
    }
  }
  ```

  </template>
</CodeSwitcher>

**Implementation notes:**
1. Fees must be returned in: satoshis per 1000 weight units
2. Fees must be no smaller than 253 (equivalent to 1 satoshi/vbyte, rounded up)
3. To reduce network traffic, you may want to cache fee results rather than
retrieving fresh ones every time

**Dependencies:** *none*

**References:** [Rust `FeeEstimator` docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.FeeEstimator.html), [Java `FeeEstimator` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/FeeEstimator.java)

### Step 2. Initialize the `Logger`
**What it's used for:** LDK logging

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
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
  ```

  </template>

  <template v-slot:java>
 
  ```java
  class YourLogger implements Logger.LoggerInterface {
      @Override
      public void log(String record) {
          // <insert code to print this log and/or write this log to a file>
      }
  }

  Logger logger = Logger.new_impl(new YourLogger());
  ```

  </template>

   <template v-slot:kotlin>
 
  ```kotlin
  object LDKLogger : LoggerInterface {
      override fun log(record: Record?) {
          // <insert code to print this log and/or write this log to a file>
      }
  }
  ```

  </template>
</CodeSwitcher>

**Implementation notes:** you'll likely want to write the logs to a file for debugging purposes.

**Dependencies:** *none*

**References:** [Rust `Logger` docs](https://docs.rs/lightning/*/lightning/util/logger/trait.Logger.html), [Java `Logger` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Logger.java)

### Step 3. Initialize the `BroadcasterInterface`
**What it's used for:** broadcasting various transactions to the bitcoin network

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust>
 
  ```rust
  struct YourTxBroadcaster();

  impl BroadcasterInterface for YourTxBroadcaster {
      fn broadcast_transaction(&self, tx: &Transaction) {
          // <insert code to broadcast this transaction>
      }
  }

  let broadcaster = YourTxBroadcaster();
  ```

  </template>

  <template v-slot:java>
 
  ```java
  class YourBroadcaster implements
  BroadcasterInterface.BroadcasterInterfaceInterface {
      @Override
      public void broadcast_transaction(byte[] tx) {
          // <insert code to broadcast the given transaction here>
      }
  }

  BroadcasterInterface tx_broadcaster = BroadcasterInterface.new_impl(new YourBroadcaster());
  ```

  </template>

   <template v-slot:kotlin>
 
  ```kotlin
  object LDKBroadcaster: BroadcasterInterface.BroadcasterInterfaceInterface {
      override fun broadcast_transaction(tx: ByteArray?) {
          // <insert code to broadcast the given transaction here>
      }
  }
  ```

  </template>
</CodeSwitcher>

**Dependencies:** *none*

**References:** [Rust `BroadcasterInterface` docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.BroadcasterInterface.html), [Java `BroadcasterInterface` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/BroadcasterInterface.java)

### Step 4. Initialize `Persist`
**What it's used for:** persisting `ChannelMonitor`s, which contain crucial channel data, in a timely manner

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
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

  <template v-slot:java>
  
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
  </template>

  <template v-slot:kotlin>

  ```kotlin
  object LDKPersister: Persist.PersistInterface {
    override fun persist_new_channel(
        id: OutPoint?,
        data: ChannelMonitor?,
        updateId: MonitorUpdateId?
    ): Result_NoneChannelMonitorUpdateErrZ? {
        val channelMonitorBytes = data.write()
        // <insert code to write these bytes to disk, keyed by `id`>
    }

    override fun update_persisted_channel(
        id: OutPoint?,
        update: ChannelMonitorUpdate?,
        data: ChannelMonitor?,
        updateId: MonitorUpdateId
    ): Result_NoneChannelMonitorUpdateErrZ? {
        val channelMonitorBytes = data.write()
        // <insert code to update the `ChannelMonitor`'s file on disk with these
        //  new bytes, keyed by `id`>
    }
  }
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
* `ChannelMonitor`s are objects which are capable of
responding to on-chain events for a given channel. Thus, you will have one
`ChannelMonitor` per channel. They are persisted in real-time and the `Persist`
methods will block progress on sending or receiving payments until they return.
You must ensure that `ChannelMonitor`s are durably persisted to disk before
returning or you may lose funds.
* If you implement a custom persister, it's important to read the trait docs (linked in References) to make sure you satisfy the API requirements, particularly for `update_persisted_channel`

**Dependencies:** *none*

**References:** [Rust `Persister` docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/trait.Persist.html), [Java `Persister` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Persist.java)

### Optional: Initialize the Transaction `Filter`
**You must follow this step if:** you are *not* providing full blocks to LDK,
i.e. if you're using BIP 157/158 or Electrum as your chain backend

**What it's used for:** if you are not providing full blocks, LDK uses this
object to tell you what transactions and outputs to watch for on-chain. You'll
inform LDK about these transactions/outputs in Step 14.


<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
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

  <template v-slot:java>
  
  ```java
  Filter tx_filter = Filter.new_impl(new Filter.FilterInterface() {
    @Override
    public void register_tx(byte[] txid, byte[] script_pubkey) {
        // <insert code for you to watch for this transaction on-chain>
    }

    @Override
    public Option_C2Tuple_usizeTransactionZZ register_output(WatchedOutput output) {
        // <insert code for you to watch for any transactions that spend this
        //  output on-chain>
    }
});
  ```
  </template>

  <template v-slot:kotlin>

  ```kotlin
  object LDKTxFilter : Filter.FilterInterface {
    override fun register_tx(txid: ByteArray, script_pubkey: ByteArray) {
        // <insert code for you to watch for this transaction on-chain>
    }

    override fun register_output(output: WatchedOutput): Option_C2Tuple_usizeTransactionZZ {
        // <insert code for you to watch for any transactions that spend this
        //  output on-chain>
    }
}
  
  ```
  </template>
</CodeSwitcher>

**Implementation notes:** see the [Blockchain Data](/blockchain_data/introduction.md) guide for more info

**Dependencies:** *none*

**References:** [Rust `Filter` docs](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html), [Java `Filter` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Filter.java)

### Step 5. Initialize the `ChainMonitor`
**What it's used for:** tracking one or more `ChannelMonitor`s and using them to monitor the chain for lighting transactions that are relevant to our node, and broadcasting transactions if need be.

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust>

  ```rust
  let filter: Option<Box<dyn Filter>> = // leave this as None or insert the Filter trait object

  let chain_monitor = ChainMonitor::new(
      filter, &broadcaster, &logger, &fee_estimator, &persister
  );
  ```
  </template>

  <template v-slot:java>
  
  ```java
  final filter = // leave this as `null` or insert the Filter object.
              
  final chain_monitor = ChainMonitor.of(filter, tx_broadcaster, logger,
      fee_estimator, persister);
  
  ```
  </template>

  <template v-slot:kotlin>

  ```kotlin
  val filter : Filter = // leave this as `null` or insert the Filter object.

  val chainMonitor = ChainMonitor.of(filter, txBroadcaster, logger, feeEstimator, persister)
  ```
  </template>
</CodeSwitcher>

**Implementation notes:** `Filter` must be non-`None` if you're using Electrum or BIP 157/158 as your chain backend

**Dependencies:** `FeeEstimator`, `Logger`, `BroadcasterInterface`, `Persist`

**Optional dependency:** `Filter`

**References:** [Rust `ChainMonitor` docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/struct.ChainMonitor.html), [Java `ChainMonitor` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChainMonitor.java)

### Step 6. Initialize the `KeysManager`
**What it's used for:** providing keys for signing Lightning transactions

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
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

  <template v-slot:java>
  
  ```java
  byte[] key_seed = new byte[32];
  // <insert code to fill key_seed with random bytes OR if restarting, reload the
  // seed from disk>
  KeysManager keys_manager = KeysManager.of(key_seed,
      System.currentTimeMillis() / 1000,
      (int) (System.currentTimeMillis() * 1000));
  ```
  </template>

  <template v-slot:kotlin>

  ```kotlin
  val keySeed = ByteArray(32)

  val keysManager = KeysManager.of(
        keySeed,
        System.currentTimeMillis() / 1000,
        (System.currentTimeMillis() * 1000).toInt()
    )
  ```
  </template>
</CodeSwitcher>

**Implementation notes:**
* See the [Key Management](/key_management.md) guide for more info
* Note that you must write the `key_seed` you give to the `KeysManager` on
  startup to disk, and keep using it to initialize the `KeysManager` every time
  you restart. This `key_seed` is used to derive your node's secret key (which
  corresponds to its node pubkey) and all other secret key material.
* The current time is part of the `KeysManager`'s parameters because it is used to derive
random numbers from the seed where required, to ensure all random
generation is unique across restarts.

**Dependencies:** random bytes

**References:** [Rust `KeysManager` docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html), [Java `KeysManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/KeysManager.java)

### Step 7. Read `ChannelMonitor` state from disk

**What it's used for:** if LDK is restarting and has at least 1 channel, its `ChannelMonitor`s will need to be (1) fed to the `ChannelManager` and (2) synced to chain.

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
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

  <template v-slot:java>
  
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
  // `ChannelManagerConstructor`.
  final byte[][] channel_monitors = (byte[][])channel_monitor_list.toArray(new byte[1][]);
  
  ```
  </template>

  <template v-slot:kotlin>

  ```kotlin
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
</CodeSwitcher>

**Dependencies:** `KeysManager`

**References:** [Rust `load_outputs_to_watch` docs](https://docs.rs/lightning/*/lightning/chain/channelmonitor/struct.ChannelMonitor.html#method.load_outputs_to_watch)

### Step 8. Initialize the `ChannelManager`
**What it's used for:** managing channel state

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
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

  <template v-slot:java>
  
  ```java
  /* FRESH CHANNELMANAGER */

  int block_height = // <insert current chain tip height>;
  byte[] best_block_hash = // <insert current chain tip block hash>;
  ChannelManagerConstructor channel_manager_constructor = new ChannelManagerConstructor(
    Network.LDKNetwork_Bitcoin, UserConfig.default(), best_block_hash,
    block_height, keys_manager.as_KeysInterface(), fee_estimator, chain_monitor,
    router, tx_broadcaster, logger);

  /* RESTARTING CHANNELMANAGER */

  byte[] serialized_channel_manager = // <insert bytes as written to disk in Step 4>
  ChannelManagerConstructor channel_manager_constructor = new ChannelManagerConstructor(
    serialized_channel_manager, channel_monitors, keys_manager.as_KeysInterface(),
    fee_estimator, chain_monitor, filter, router, tx_broadcaster, logger);

  final ChannelManager channel_manager = channel_manager_constructor.channel_manager;  
  ```
  </template>

  <template v-slot:kotlin>

  ```kotlin
  try {
      if (serializedChannelManager != "") {
          // loading from disk (restarting)
          channelManagerConstructor = ChannelManagerConstructor(
              serializedChannelManager,
              channelMonitors,
              userConfig,
              keysManager?.as_KeysInterface(),
              feeEstimator,
              chainMonitor,
              txFilter,
              router!!.write(),
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
              keysManager?.as_KeysInterface(),
              feeEstimator,
              chainMonitor,
              router,
              txBroadcaster,
              logger
          );
      }
  ```
  </template>
</CodeSwitcher>

**Implementation notes:** No methods should be called on `ChannelManager` until
*after* Step 9.

**Dependencies:** `KeysManager`, `FeeEstimator`, `ChainMonitor`, `BroadcasterInterface`, `Logger`
* If restarting: `ChannelMonitor`s and `ChannelManager` bytes from Step 7 and Step 18 respectively

**References:** [Rust `ChannelManager` docs](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html), [Java `ChannelManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/ChannelManager.java)

### Step 9. Sync `ChannelMonitor`s and `ChannelManager` to chain tip
**What it's used for:** this step is only necessary if you're restarting and have open channels. This step ensures that LDK channel state is up-to-date with the bitcoin blockchain

**Example:**

<CodeSwitcher :languages="{full_blocks_rust:'Rust Full Blocks or BIP 157/158', electrum_rust:'Rust Electrum', electrum_java:'Java Electrum'}">
  <template v-slot:full_blocks_rust>

  ```rust
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

  // Save the chain tip to be used in Step 14.
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
  ```

  </template>
  <template v-slot:electrum_rust>

  ```rust
  // Retrieve transaction IDs to check the chain for un-confirmation.
  let relevant_txids_1 = channel_manager.as_Confirm().get_relevant_txids();
  let relevant_txids_2 = chain_monitor.as_Confirm().get_relevant_txids();

  let unconfirmed_txids = // <insert code to find out from your chain source
                          //  if any of relevant_txids have been reorged out
                          //  of the chain>

  for txid in unconfirmed_txids.iter() {
      channel_manager.transaction_unconfirmed(txid);
      chain_monitor.transaction_unconfirmed(txid);
  }

  // Retrieve transactions and outputs that were registered through the `Filter`

  // If any of these txs/outputs were confirmed on-chain, then:
  let header = // insert block header from the block with confirmed tx/output
  let height = // insert block height of `header`
  let tx_list = // insert `Filter`-registered transactions that were confirmed in
                // this block

  channel_manager.transactions_confirmed(header, tx_list, height);
  chain_monitor.transactions_confirmed(header, tx_list, height);

  byte[] best_header = // <insert code to get your best known header>
  int best_height = // <insert code to get your best known block height>
  channel_manager.update_best_block(best_header, best_height);
  chain_monitor.update_best_block(best_header, best_height);
  ```

  </template>

  <template v-slot:electrum_java>

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

  </template>
</CodeSwitcher>

**Implementation notes:**

There are 2 main options for synchronizing to chain on startup:

**Full Blocks or BIP 157/158**

If you are connecting full blocks or using BIP 157/158, then it is recommended to use
LDK's `lightning_block_sync` sample module as in the example above: the high-level steps that must be done for both `ChannelManager` and each `ChannelMonitor` are as follows:

1. Get the last blockhash that each object saw.
    * `ChannelManager`'s is in `channel_manager_constructor.channel_manager_latest_block_hash`
    * Each `ChannelMonitor`'s is in `channel_manager_constructor.channel_monitors`, as the 2nd element in each tuple
2. For each object, if its latest known blockhash has been reorged out of the chain, then disconnect blocks using `channel_manager.as_Listen().block_disconnected(..)` or `channel_monitor.block_disconnected(..)` until you reach the last common ancestor with the main chain.
3. For each object, reconnect blocks starting from the common ancestor until it gets to your best known chain tip using `channel_manager.as_Listen().block_connected(..)` and/or `channel_monitor.block_connected(..)`.
4. Call `channel_manager_constructor.chain_sync_completed(..)` to complete the initial sync process.



**Electrum**

Otherwise, you can use LDK's `Confirm` interface as in the examples above. The high-level steps are as    follows:
  1. Tell LDK about relevant confirmed and unconfirmed transactions.
  2. Tell LDK what your best known block header and height is.
  3. Call `channel_manager_constructor.chain_sync_completed(..)` to complete the initial sync process.

**More details about LDK's interfaces to provide chain info in Step 14**

**References:** [Rust `Confirm` docs](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html), [Rust `Listen` docs](https://docs.rs/lightning/*/lightning/chain/trait.Listen.html), [Rust `lightning_block_sync` module docs](https://docs.rs/lightning-block-sync/*/lightning_block_sync/)

**Dependencies:** `ChannelManager`, `ChainMonitor`, `ChannelMonitor`s
* If providing providing full blocks or BIP 157/158: set of `ChannelMonitor`s
* If using Electrum: `ChainMonitor`

### Step 10. Give `ChannelMonitor`s to `ChainMonitor`
**What it's used for:** `ChainMonitor` is responsible for updating the `ChannelMonitor`s during LDK node operation.

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust>

  ```rust
  for (funding_outpoint, channel_monitor) in channel_monitors.drain(..) {
    chain_monitor.watch_channel(funding_outpoint, channel_monitor).unwrap();
  }
  ```
  </template>

  <template v-slot:java>
  
  ```java
  long[] channel_monitors = chainMonitor.list_monitors()

  for (int k = 0; k < channel_monitors.length; k++) {
    Outpoint outpoint = channel_monitors[k];
    ChannelMonitor monitor  = // Retrieve channel monitor saved in step 4
    chainMonitor.as_Watch().watch_channel(outPoint, monitor)
  }
  ```
  </template>

  <template v-slot:kotlin>

  ```kotlin
  val channelMonitorlist = chainMonitor.list_monitors()
  
  list.iterator().forEach { outPoint ->
      val monitor  = // Retrieve channel monitor saved in step 4
      chainMonitor.as_Watch().watch_channel(outPoint, monitor)
  }
  ```
  </template>
</CodeSwitcher>

**Dependencies:**
* `ChainMonitor`, set of `ChannelMonitor`s and their funding outpoints
* Step 9 must be completed prior to this step

### Step 11: Optional: Initialize the `P2PGossipSync`

**You must follow this step if:** you need LDK to provide routes for sending payments (i.e. you are *not* providing your own routes)

**What it's used for:** generating routes to send payments over

**Example:** initializing `P2PGossipSync`

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">

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

<template v-slot:java>

```java
Network network = Network.LDKNetwork_Testnet;

BestBlock genesisBlock = BestBlock.from_genesis(network);
final byte[] genesisBlockHash = genesisBlock.block_hash();

final byte[] serializedNetworkGraph = // Read network graph bytes from file
final NetworkGraph networkGraph = NetworkGraph.read(serializedNetworkGraph, logger);
final P2PGossipSync p2pGossip = P2PGossipSync.of(networkGraph, Option_AccessZ.none(), logger)
```

</template>

<template v-slot:kotlin>

```kotlin
val genesisBlock : BestBlock = BestBlock.from_genesis(Network.LDKNetwork_Testnet)
val genesisBlockHash : String = byteArrayToHex(genesisBlock.block_hash())

val serializedNetworkGraph = // Read network graph bytes from file
val networkGraph : NetworkGraph = NetworkGraph.read(serializedNetworkGraph, logger)
val p2pGossip : P2PGossipSync = P2PGossipSync.of(networkGraph, Option_AccessZ.none(), logger)
```

</template>


</CodeSwitcher>


**Implementation notes:** this struct is not required if you are providing your own routes. It will be used internally in `ChannelManager` to build a `NetworkGraph`. Other networking options are: `LDKNetwork_Bitcoin`, `LDKNetwork_Regtest` and `LDKNetwork_Testnet`

**Dependencies:** `Logger`

**Optional dependency:** `Access`, a source of chain information. Recommended to be able to verify channels before adding them to the internal network graph.

**References:** [Rust `P2PGossipSync` docs](https://docs.rs/lightning/*/lightning/routing/gossip/struct.P2PGossipSync.html), [`Access` docs](https://docs.rs/lightning/*/lightning/chain/trait.Access.html), [Java `P2PGossipSync` docs](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/P2PGossipSync.java)