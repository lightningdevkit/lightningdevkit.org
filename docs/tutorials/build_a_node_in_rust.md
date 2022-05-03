# Building a Node with LDK in Rust

## Introduction

This document covers everything you need to make a node using LDK in Rust.

::: tip Note
For an integrated example of an LDK node in Rust, see the [Sample Node](https://github.com/lightningdevkit/ldk-sample)
:::

* [Setup](#setup) covers everything you need to do to set up LDK on startup.
* [Running LDK](#running-ldk) covers everything you need to do while LDK is running to keep it operational.

Note that LDK does not assume that safe shutdown is available, so there is no
shutdown checklist.

## Setup
### 1. Initialize the `FeeEstimator`

**What it's used for:** estimating fees for on-chain transactions that LDK wants broadcasted.

**Example:**
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

**Implementation notes:**
1. Fees must be returned in: satoshis per 1000 weight units
2. Fees must be no smaller than 253 (equivalent to 1 satoshi/vbyte, rounded up)
3. To reduce network traffic, you may want to cache fee results rather than
retrieving fresh ones every time

**Dependencies:** *none*

**References:** [`FeeEstimator` docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.FeeEstimator.html)

### 2. Initialize the `Logger`
**What it's used for:** LDK logging

**Example:**
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

**Implementation notes:** you'll likely want to write the logs to a file for debugging purposes.

**Dependencies:** *none*

**References:** [`Logger` docs](https://docs.rs/lightning/*/lightning/util/logger/trait.Logger.html)

### 3. Initialize the `BroadcasterInterface`
**What it's used for:** broadcasting various Lightning transactions

**Example:**
```rust
struct YourTxBroadcaster();

impl BroadcasterInterface for YourTxBroadcaster {
	fn broadcast_transaction(&self, tx: &Transaction) {
        // <insert code to broadcast this transaction>
	}
}

let broadcaster = YourTxBroadcaster();
```

**Dependencies:** *none*

**References:** [`BroadcasterInterface` docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.BroadcasterInterface.html)

### 4. Initialize `Persist`
**What it's used for:** persisting `ChannelMonitor`s, which contain crucial channel data, in a timely manner

**Example:**

:::: tabs
::: tab "Custom"

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

:::
::: tab "Using LDK Sample Filesystem Persistence Module"

```rust
use lightning_persister::FilesystemPersister; // import LDK sample persist module

let persister = FilesystemPersister::new(ldk_data_dir_path);
```

:::
::::

**Implementation notes:**
* `ChannelMonitor`s are objects which are capable of
responding to on-chain events for a given channel. Thus, you will have one
`ChannelMonitor` per channel. They are persisted in real-time and the `Persist`
methods will block progress on sending or receiving payments until they return.
You must ensure that `ChannelMonitor`s are durably persisted to disk before
returning or you may lose funds.
* If you implement a custom persister, it's important to read the trait docs (linked in References) to make sure you satisfy the API requirements, particularly for `update_persisted_channel`

**Dependencies:** *none*

**References:** [`Persist` docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/trait.Persist.html), [Rust sample persister module](https://github.com/rust-bitcoin/rust-lightning/tree/main/lightning-persister)

### 5. Optional: Initialize the Transaction `Filter`
**You must follow this step if:** you are *not* providing full blocks to LDK,
i.e. if you're using BIP 157/158 or Electrum as your chain backend

**What it's used for:** if you are not providing full blocks, LDK uses this
object to tell you what transactions and outputs to watch for on-chain. You'll
inform LDK about these transactions/outputs in Step 15.

**Example:**
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

**Implementation notes:** see the [Blockchain Data](/blockchain_data.md) guide for more info

**Dependencies:** *none*

**References:** [`Filter` docs](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html), [Blockchain Data guide](/blockchain_data.md)

### 6. Initialize the `ChainMonitor`
**What it's used for:** tracking one or more `ChannelMonitor`s and using them to monitor the chain for lighting transactions that are relevant to our node, and broadcasting transactions if need be

**Example:**

```rust
let filter: Option<Box<dyn Filter>> = // leave this as None or insert the Filter trait
                                      // object, depending on what you did for Step 5

let chain_monitor = ChainMonitor::new(
    filter, &broadcaster, &logger, &fee_estimator, &persister
);
```

**Implementation notes:** `Filter` must be non-`None` if you're using Electrum or BIP 157/158 as your chain backend

**Dependencies:** `FeeEstimator`, `Logger`, `BroadcasterInterface`, `Persist`

**Optional dependency:** `Filter`

**References:** [`ChainMonitor` docs](https://docs.rs/lightning/*/lightning/chain/chainmonitor/struct.ChainMonitor.html)

### 7. Initialize the `KeysManager`
**What it's used for:** providing keys for signing Lightning transactions

**Example:**

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

**References:** [`KeysManager` docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html), [Key Management guide](/key_management.md)

### 8. Marshal `ChannelMonitor`s from disk

**What it's used for:** if LDK is restarting and has at least 1 channel, its `ChannelMonitor`s will need to be (1) fed to the `ChannelManager` in Step 9 and (2) synced to chain in Step 10.

**Example:** using LDK's sample persistence module

```rust
// Use LDK's sample persister module provided method
let mut channel_monitors =
	persister.read_channelmonitors(keys_manager.clone()).unwrap();

// If you are using Electrum or BIP 157/158, you must call load_outputs_to_watch
// on each ChannelMonitor to prepare for chain synchronization in Step 10.
for chan_mon in channel_monitors.iter() {
    chan_mon.load_outputs_to_watch(&filter);
}
```

**Dependencies:** `KeysManager`

**References:** [`load_outputs_to_watch` docs](https://docs.rs/lightning/*/lightning/chain/channelmonitor/struct.ChannelMonitor.html#method.load_outputs_to_watch)

### 9. Initialize the `ChannelManager`
**What it's used for:** managing channel state

**Example:**

```rust
let user_config = UserConfig::default();

/* RESTARTING */

let (channel_manager_blockhash, mut channel_manager) = {
    let channel_manager_file =
        fs::File::open(format!("{}/manager", ldk_data_dir.clone())).unwrap();

    // Use the `ChannelMonitors` marshalled in Step 8.
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

**Implementation notes:** No methods should be called on `ChannelManager` until
*after* Step 10.

**Dependencies:** `KeysManager`, `FeeEstimator`, `ChainMonitor`, `BroadcasterInterface`, `Logger`
* If restarting: `ChannelMonitor`s and `ChannelManager` bytes from Step 8 and Step 17 respectively

**References:** [`ChannelManager` docs](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html)

### 10. Sync `ChannelMonitor`s and `ChannelManager` to chain tip
**What it's used for:** this step is only necessary if you're restarting and have open channels. This step ensures that LDK channel state is up-to-date with the bitcoin blockchain

**Example:**

:::: tabs
::: tab "Full Blocks or BIP 157/158"

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

// Save the chain tip to be used in Step 15.
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

:::
::: tab "Electrum"

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
// interface in Step 5.

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

:::
::::

**Implementation notes:**

* There are 2 main options for synchronizing to chain on startup:
  * If you are connecting full blocks or using BIP 157/158, then it is recommended to use
LDK's `lightning_block_sync` sample module as in the example above
  * Otherwise, you can use LDK's `Confirm` interface as in the Electrum example above
* More details about LDK's interfaces to provide chain info in Step 15

**References:** [`Confirm` docs](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html), [Rust `lightning_block_sync` module docs](https://docs.rs/lightning-block-sync/*/lightning_block_sync/)

**Dependencies:** `ChannelManager`
* If providing providing full blocks or BIP 157/158: set of `ChannelMonitor`s
* If using Electrum: `ChainMonitor`

### 11. Give `ChannelMonitor`s to `ChainMonitor`
**What it's used for:** `ChainMonitor` is responsible for updating the `ChannelMonitor`s during LDK node operation.

**Example:**

```rust
for (funding_outpoint, channel_monitor) in channel_monitors.drain(..) {
	chain_monitor.watch_channel(funding_outpoint, channel_monitor).unwrap();
}
```

**Dependencies:**
* `ChainMonitor`, set of `ChannelMonitor`s and their funding outpoints
* Step 10 must be completed prior to this step

### 12. Optional: Initialize the `NetGraphMsgHandler`
**You must follow this step if:** you need LDK to provide routes for sending payments (i.e. you are *not* providing your own routes)

**What it's used for:** generating routes to send payments over

**Example:** initializing `NetGraphMsgHandler` without providing an `Access`

```rust
let genesis = genesis_block(Network::Testnet).header.block_hash();
let net_graph_msg_handler = Arc::new(NetGraphMsgHandler::new(
	genesis,
	None::<Arc<dyn chain::Access + Send + Sync>>,
	&logger,
));
```

**Implementation notes:** this struct is not required if you are providing your own routes.

**Dependencies:** `Logger`

**Optional dependency:** `Access`, a source of chain information. Recommended to be able to verify channels before adding them to the internal network graph.

**References:** [`NetGraphMsgHandler` docs](https://docs.rs/lightning/*/lightning/routing/network_graph/struct.NetGraphMsgHandler.html), [`Access` docs](https://docs.rs/lightning/*/lightning/chain/trait.Access.html)

### 13. Initialize the `PeerManager`

**What it's used for:** managing peer data and connections

**Example:**

```rust
let mut ephemeral_bytes = [0; 32];
rand::thread_rng().fill_bytes(&mut ephemeral_bytes);
let lightning_msg_handler = MessageHandler {
	chan_handler: &channel_manager,
	route_handler: &net_graph_msg_handler,
};
let ignoring_custom_msg_handler = IgnoringMessageHandler {};
let peer_manager = PeerManager::new(
	lightning_msg_handler,
	keys_manager.get_node_secret(),
	&ephemeral_bytes,
	&logger,
    &ignoring_custom_msg_handler,
);
```

**Implementation notes:** if you did not initialize `NetGraphMsgHandler` in the previous step, you can initialize your own struct (which can be a dummy struct) that implements `RoutingMessageHandlerInterface`

**Dependencies:** `ChannelManager`, `RoutingMessageHandlerInterface`, `KeysManager`, random bytes, `Logger`

**References:** [`PeerManager` docs](https://docs.rs/lightning/*/lightning/ln/peer_handler/struct.PeerManager.html), [`RoutingMessageHandler` docs](https://docs.rs/lightning/*/lightning/ln/msgs/trait.RoutingMessageHandler.html)

### 14. Initialize Networking
**What it's used for:** making peer connections, facilitating peer data to and from LDK

**Example:**

```rust
use lightning_net_tokio; // use LDK's sample networking module

let listen_port = 9735;
let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", listen_port))
    .await.unwrap()
loop {
    let tcp_stream = listener.accept().await.unwrap().0;
    tokio::spawn(async move {
        // Use LDK's supplied networking battery to facilitate inbound
        // connections.
        lightning_net_tokio::setup_inbound(
            &peer_manager,
            tcp_stream.into_std().unwrap(),
        )
        .await;
    });
}
```

**Dependencies:** `PeerManager`

**References:** [Rust `lightning-net-tokio` sample networking module](https://docs.rs/lightning-net-tokio/0.0.14/lightning_net_tokio/)

## Running LDK

This section assumes you've already run all the steps in [Setup](#setup).

### 15. Keep LDK Up-to-date with Chain Info
**What it's used for:** LDK needs to know when blocks are newly connected and disconnected and when relevant transactions are confirmed and/or reorged out.

**Example:**

:::: tabs
::: tab "Bitcoind"

```rust
// If you don't have the chain tip, retrieve it here.
if chain_tip.is_none() {
	chain_tip = Some(
		init::validate_best_block_header(&mut block_source).await.unwrap()
	);
}

// Use your BlockSource from Step 10.
let chain_poller = poll::ChainPoller::new(&mut block_source, Network::Testnet);
let chain_listener = (chain_monitor, channel_manager);
let mut spv_client = SpvClient::new(
	chain_tip.unwrap(),
	chain_poller,
	&mut cache,
	&chain_listener,
);
loop {
    // `poll_best_tip` will update ChannelManager and ChainMonitor with the
    // best chain tip as needed.
	spv_client.poll_best_tip().await.unwrap();
	tokio::time::sleep(Duration::from_secs(1)).await;
}
```

:::
::: tab "Electrum"

```rust
/* UNCONFIRMED TRANSACTIONS */

// Retrieve transaction IDs to check the chain for un-confirmation.
let relevant_txids_1 = channel_manager.get_relevant_txids();
let relevant_txids_2 = chain_monitor.get_relevant_txids();

// If any txids `relevant_txids_*` gets reorged out, you must call:
channel_manager.transaction_unconfirmed(unconfirmed_txid);
chain_monitor.transaction_unconfirmed(unconfirmed_txid);

/* CONFIRMED TRANSACTIONS */

// Retrieve transactions and outputs to check the chain for confirmation.
// These should've been given to you for monitoring via the `Filter` interface.

// If any transactions or output spends appear on-chain, you must call:
channel_manager.transactions_confirmed(header, height, confirmed_txs_list);
chain_monitor.transactions_confirmed(header, height, confirmed_txs_list);

/* CONNECTED OR DISCONNECTED BLOCKS */

// Whenever there's a new chain tip or a block has been newly disconnected, you
// must call:
channel_manager.update_best_block(new_best_header, new_best_height);
chain_monitor.update_best_block(new_best_header, new_best_height);
```

:::
::::

**Implementation notes:**
* If you're using the `Listen` interface: blocks must be connected and disconnected in chain order
* If you're using the `Confirm` interface: it's important to read the `Confirm` docs linked in References, to make sure you satisfy the interface's requirements

**Dependencies:** `ChannelManager`, `ChainMonitor`

**References:** [Rust `Listen` docs](https://docs.rs/lightning/*/lightning/chain/trait.Listen.html), [Rust `Confirm` docs](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html)

### 16. Initialize LDK `EventHandler`
**What it's used for:** LDK generates events that must be handled by you, such as telling you when a payment has been successfully received or when a funding transaction is ready for broadcast.

**Example:** from the LDK Rust sample node, of handling these events: https://github.com/lightningdevkit/ldk-sample/blob/bc07db6ca4a3323d8718a27f85182b8157a20750/src/main.rs#L101-L240

**Example:**

```rust
// In this example, we provide a closure to handle events. But you're also free
// to provide an implementation of the trait `EventHandler` instead.

// This handler will be used in Step 18.
let handle_event_callback = move |event| {
	handle_ldk_event(&channel_manager, &keys_manager, event)
};

fn handle_ldk_event(..) {
    match event {
        Event::FundingGenerationReady { .. } => { .. }, // insert handling code
        Event::PaymentReceived { .. } => { .. }, // insert handling code
        Event::PaymentSent { .. } => { .. }, // insert handling code
        Event::PaymentPathFailed { .. } => { .. }, // insert handling code
        Event::PendingHTLCsForwardable { .. } => { .. }, // insert handling code
        Event::SpendableOutputs { .. } => { .. } // insert handling code
        Event::PaymentForwarded { .. } => { .. } // insert handling code
        Event::ChannelClosed { .. } => { .. } // insert handling code
    }
}
```

**Implementation notes:**
* It's important to read the documentation for individual event handling (linked in References below) to make sure event handling requirements are satisfied
* It is recommended to read through event handling in the LDK sample node (linked in the first example) to get an idea of what integrated LDK event handling looks like

**Dependencies:** `ChannelManager`, `ChainMonitor`, `KeysManager`, `BroadcasterInterface`

**References:** [`Event` docs](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html), [LDK sample node event handling example](https://github.com/lightningdevkit/ldk-sample/blob/bc07db6ca4a3323d8718a27f85182b8157a20750/src/main.rs#L101-L240), [`EventHandler` docs](https://docs.rs/lightning/*/lightning/util/events/trait.EventHandler.html)

### 17. Initialize the `Persister`

**What it's used for:** keeping `ChannelManager`'s stored state up-to-date

**Example:**

```rust
// In this example, we provide an implementation of the trait `Persister`

struct YourDataPersister {
	data_dir: String
}

impl Persister for YourDataPersister {
	fn persist_manager(&self, channel_manager: &ChannelManager) -> Result<(), std::io::Error> {
		// <insert code to persist the ChannelManager to disk and/or backups>
	}

	fn persist_graph(&self, network_graph: &NetworkGraph) -> Result<(), std::io::Error> {
		// <insert code to persist the NetworkGraph to disk and/or backups>
	}
}

// This will be used in the Step 18 for regular persistence.
let persister = YourDataPersister { data_dir: ldk_data_dir.clone() };

```

**Implementation notes:** if the `ChannelManager` is not persisted properly to disk, there is risk of channels force closing the next time LDK starts up. However, in this situation, no funds other than those used to pay force-closed channel fees are at risk of being lost.

**Dependencies:** `ChannelManager`, `NetworkGraph`

**References:** [`Persister` docs](https://docs.rs/lightning-background-processor/*/lightning_background_processor/trait.Persister.html)

### 18. Start Background Processing

**What it's used for:** running tasks periodically in the background to keep LDK operational

**Example:**
```rust
let background_processor = BackgroundProcessor::start(
	persister,
	handle_event_callback,
	&chain_monitor,
	&channel_manager,
	&net_graph_msg_handler
	&peer_manager,
	&logger,
);
```

**Dependencies:** `ChannelManager`, `ChainMonitor`, `PeerManager`, `Logger`

**References:** [`BackgroundProcessor::start` docs](https://docs.rs/lightning-background-processor/*/lightning_background_processor/struct.BackgroundProcessor.html#method.start)

### 19. Regularly Broadcast Node Announcement
**What it's used for:** if you have 1 or more public channels, you may need to
announce your node and its channels occasionally. LDK will automatically
announce channels when they are created, but there are no guarantees you have
connected peers at that time or that your peers will propagate such announcements.
The broader node-announcement message is not automatically broadcast.

**Example:**
```rust
let mut interval = tokio::time::interval(Duration::from_secs(60));
loop {
	interval.tick().await;
	channel_manager.broadcast_node_announcement(
		[0; 3], // insert your node's RGB color
		node_alias,
		vec![ldk_announced_listen_addr],
	);
}
```

**Dependencies:** `ChannelManager`

**References:** [`ChannelManager::broadcast_node_announcement` docs](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html#method.broadcast_node_announcement)
