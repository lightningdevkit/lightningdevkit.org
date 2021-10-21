## LDK Batteries

While LDK provides all the core lightning state machine logic, other
batteries/modules are needed to run a node. LDK interacts with these modules
through generic interfaces, meaning the user can choose the implementation that
best suits their needs. LDK provides sample implementations for many of these
batteries, which are enumerated below.

* On-disk storage
  * You can store the channel state any way you want - whether Google
  Drive/iCloud, a local disk, any key-value store/database/a remote server, or
  any combination of them - we provide a clean API that provides objects which
  can be serialized into simple binary blobs, and stored in any way you wish.
  * [**Sample module in Rust**](https://github.com/rust-bitcoin/rust-lightning/tree/main/lightning-persister)
* Blockchain data
  * We provide a simple `block_connected`/`block_disconnected`
  API which you provide block headers and transaction information to. We also
  provide an API for getting information about transactions we wish to be
  informed of, which is compatible with Electrum server requests/neutrino
  filtering/etc.
  * [**Sample module in Rust**](https://github.com/rust-bitcoin/rust-lightning/tree/main/lightning-block-sync)
* On-chain funds wallet/UTXO management
  * LDK owns on-chain funds as long as they are claimable as
  a part of a Lightning output which can be contested - once a channel is closed
  and all on-chain outputs are spendable only by the user, we provide users
  notifications that a UTXO is "theirs" again and it is up to them to spend it
  as they wish. Additionally, channel funding is accomplished with a generic API
  which notifies users of the output which needs to appear on-chain, which they
  can then create a transaction for. Once a transaction is created, we handle
  the rest. This is a large part of our API's goals - making it easier to
  integrate Lightning into existing on-chain wallets which have their own
  on-chain logic - without needing to move funds in and out of a separate
  Lightning wallet with on-chain transactions and a separate private key system.
  * LDK does not currently provide a sample wallet module, but its sample node
    implementation uses Bitcoin Core's wallet for UTXO management e.g. [here](https://github.com/lightningdevkit/ldk-sample/blob/2cd778e7acc959689e3b8462c529ffb3509aa1ec/src/main.rs#L245-L260)
* Networking
  * To enable a user to run a full Lightning node on an embedded
  machine, we don't specify exactly how to connect to another node at all! We
  provide a default implementation which uses TCP sockets, but, e.g., if you
  wanted to run your full Lightning node on a hardware wallet, you could, by
  piping the Lightning network messages over USB/serial and then sending them in
  a TCP socket from another machine.
  * [**Sample module in Rust**](https://github.com/rust-bitcoin/rust-lightning/tree/main/lightning-net-tokio)
  * [**Sample module in Java**](https://github.com/lightningdevkit/ldk-garbagecollected/tree/main/src/main/java/org/ldk/batteries)
* Private keys
  * LDK has "default implementations", but users can choose to provide private
  keys to RL/LDK in any way they wish following a simple API. We even support a
  generic API for signing transactions, allowing users to run RL/LDK without any
  private keys in memory and/or putting private keys only on hardware wallets.
  * [LDK's `KeysManager` docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html).
  While LDK's default implementation is currently within Rust-Lightning, it is
  still considered a sample module.
* Transaction filtering
  * Clients running a light client may wish to filter for transactions on a separate server, in which case LDK will tell them about transactions to filter for. More information is available in the [Blockchain Data guide](/basic-features/blockchain_data.md).
* Fee estimation
  * LDK's sample node implementation uses Bitcoin Core's fee estimation API [here](https://github.com/lightningdevkit/ldk-sample/blob/2cd778e7acc959689e3b8462c529ffb3509aa1ec/src/bitcoind_client.rs#L98-L154).
* Transaction broadcasting
  * LDK's sample node implementation uses Bitcoin Core's transaction broadcasting API [here](https://github.com/lightningdevkit/ldk-sample/blob/2cd778e7acc959689e3b8462c529ffb3509aa1ec/src/bitcoind_client.rs#L235-L257).
* Random number generation
  * Because LDK aims to make no system calls, it is restricted from generating its own randomness.
  * LDK's sample node implementation uses Rust's `rand` crate [here](https://github.com/lightningdevkit/ldk-sample/blob/2cd778e7acc959689e3b8462c529ffb3509aa1ec/src/main.rs#L464-L465) and elsewhere.