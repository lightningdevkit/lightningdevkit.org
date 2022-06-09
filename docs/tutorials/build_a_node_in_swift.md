# Building a Node with LDK in Swift

## Introduction

This document covers some things you need to make a node using LDK in Swift.

- [**Setup**](#setup) covers everything you need to do to set up LDK on startup.
- **Running LDK** covers everything you need to do while LDK is running to keep
  it operational. _Not completed (yet)_

**Note:** LDK does not assume that safe shutdown is available, so there is no
shutdown checklist.

[LDK Swift](https://github.com/lightningdevkit/ldk-swift) is a set of
auto-generated decorators that call the C methods defined in `lightning.h`. The
wrappers (mostly) take care of conveniences such as converting Swift types into
C types and parsing C types back into Swift.

In `Bindings.swift`, various additional generic utility methods aid the
developer in passing data back and forth.

The most significant effort on the part of users of this project comes in when
dealing with traits. All files within bindings/LDK/traits are meant to be
interpreted as abstract classes. However, as Swift does not allow abstract
classes, and using protocols would shift both implementation and boilerplate
burden on developers, we instead recommend an overriding pattern, which we will
describe in Phase 1.

## Setup

This guide is essentially a conversion of the
[Java guide](/tutorials/build_a_node_in_java) for Swift.

### Phase 1: Trait Overrides

The first set of steps we need to set up is to create classes to override the
trait classes. In this example, we will simply be taking trait names such as
`FeeEstimator` and create classes inheriting from them prefixed with `My-`.

#### FeeEstimator

First, define an inheriting class called `MyFeeEstimator`:

```swift
//  MyFeeEstimator.swift

import Foundation

class MyFeeEstimator: FeeEstimator {

    override func get_est_sat_per_1000_weight(confirmation_target: LDKConfirmationTarget) -> UInt32 {
        return 253
    }

}
```

Second, somewhere within the app initialization context, e.g. the app delegate's
`didFinishLaunchingWithOptions` method, instantiate the fee estimator:

```swift
// main context

let feeEstimator = MyFeeEstimator()
```

#### Logger

Define the inheriting class:

```swift
//  MyLogger.swift

import Foundation

class MyLogger: Logger {

    override func log(record: Record) {
        print("log event: \(record.get_args())")
    }

}
```

Instantiate the value:

```swift
// main context (continued)

let logger = MyLogger()
```

#### BroadcasterInterface

Define the subclass:

```swift
//  MyBroadcasterInterface.swift

import Foundation

class MyBroadcasterInterface: BroadcasterInterface {

    override func broadcast_transaction(tx: [UInt8]) {
        // insert code to broadcast transaction
    }

}
```

Instantiate it:

```swift
// main context (continued)

let broadcaster = MyBroadcasterInterface()
```

#### Persist

Define the subclass:

```swift
//  MyPersister.swift

import Foundation

class MyPersister: Persist {

    override func persist_new_channel(channel_id: OutPoint, data: ChannelMonitor, update_id: MonitorUpdateId) -> Result_NoneChannelMonitorUpdateErrZ {
        let idBytes: [UInt8] = channel_id.write()
        let monitorBytes: [UInt8] = data.write()

        // persist monitorBytes to disk, keyed by idBytes

        return Result_NoneChannelMonitorUpdateErrZ.ok()
    }

    override func update_persisted_channel(channel_id: OutPoint, update: ChannelMonitorUpdate, data: ChannelMonitor, update_id: MonitorUpdateId) -> Result_NoneChannelMonitorUpdateErrZ {
        let idBytes: [UInt8] = channel_id.write()
        let monitorBytes: [UInt8] = data.write()

        // modify persisted monitorBytes keyed by idBytes on disk

        return Result_NoneChannelMonitorUpdateErrZ.ok()
    }

}
```

Instantiate it:

```swift
// main context (continued)

let persister = MyPersister()
```

#### Filter

Define the subclass:

```swift
//  MyFilter.swift

import Foundation

class MyFilter: Filter {

    override func register_tx(txid: [UInt8]?, script_pubkey: [UInt8]) {
        // watch this transaction on-chain
    }

    override func register_output(output: WatchedOutput) -> Option_C2Tuple_usizeTransactionZZ {
        let scriptPubkeyBytes = output.get_script_pubkey()
        let outpoint = output.get_outpoint()!
        let txid = outpoint.get_txid()
        let outputIndex = outpoint.get_index()

        // watch for any transactions that spend this output on-chain

        let blockHashBytes = output.get_block_hash()
        // if block hash bytes are not null, return any transaction spending the output that is found in the corresponding block along with its index

        return Option_C2Tuple_usizeTransactionZZ.none()
    }
}
```

Instantiate it:

```swift
// main context (continued)

let filter = MyFilter()
```

### Phase 2: Initializations

#### ChainMonitor

```swift
// main context (continued)

let filterOption = Option_FilterZ(value: filter)
let chainMonitor = ChainMonitor(chain_source: filterOption.dangle(), broadcaster: broadcaster, logger: logger, feeest: feeEstimator, persister: persister)
```

#### KeysManager

```swift
// main context (continued)

var keyData = Data(count: 32)
keyData.withUnsafeMutableBytes {
  // returns 0 on success
  let didCopySucceed = SecRandomCopyBytes(kSecRandomDefault, 32, $0.baseAddress!)
  assert(didCopySucceed == 0)
}
let seed = [UInt8](keyData)
let timestamp_seconds = UInt64(NSDate().timeIntervalSince1970)
let timestamp_nanos = UInt32.init(truncating: NSNumber(value: timestamp_seconds * 1000 * 1000))
let keysManager = KeysManager(seed: seed, starting_time_secs: timestamp_seconds, starting_time_nanos: timestamp_nanos)
let keysInterface = keysManager.as_KeysInterface()
```

We will keep needing to pass around a keysInterface instance, and we will also
need to pass its node secret to the peer manager initialization, so let's
prepare it right here:

```swift
let keysInterface = keysManager.as_KeysInterface()
let nodeSecret = self.keysInterface.get_node_secret()
```

This is a bit inelegant, but we will be providing simpler casting methods for
user-provided types shortly.

#### ChannelManager

To instantiate the channel manager, we need a couple of minor prerequisites.

First, we need the current block height and hash. For the sake of this example,
we'll use a random block at a height that does not exist at the time of this
writing.

```swift
let latestBlockHash = [UInt8](Data(base64Encoded: "AAAAAAAAAAAABe5Xh25D12zkQuLAJQbBeLoF1tEQqR8=")!)
let latestBlockHeight = 700123
```

Second, we also need to initialize a default user config, which we do like this:

```swift
let userConfig = UserConfig()
```

Finally, we can proceed by instantiating the `ChannelManager` using
`ChannelManagerConstructor`.

```swift
// main context (continued)

let channelManagerConstructor = ChannelManagerConstructor(
  network: LDKNetwork_Bitcoin,
  config: userConfig,
  current_blockchain_tip_hash: latestBlockHash,
  current_blockchain_tip_height: latestBlockHeight,
  keys_interface: keysInterface,
  fee_estimator: feeEstimator,
  chain_monitor: chainMonitor,
  net_graph: nil, // see `NetworkGraph`
  tx_broadcaster: broadcaster,
  logger: logger
)
let channelManager = channelManagerConstructor.channelManager
```

#### NetworkGraph

If you intend to use the LDK's built-in routing algorithm, you will need to
instantiate a `NetworkGraph` that can later be passed to the
`ChannelManagerConstructor`:

```swift
// main context (continued)

let networkGraph = NetworkGraph(genesis_hash: [UInt8](Data(base64Encoded: "AAAAAAAZ1micCFrhZYMek0/3Y65GoqbBcrPxtgqM4m8=")!))
```

Note that a network graph instance needs to be provided upon initialization,
which in turn requires the genesis block hash.

##### Serializing and restoring a ChannelManager

If you need to serialize a channel manager, you can call its write method on
itself:

```swift
let serializedChannelManager: [UInt8] = channelManager.write(obj: channelManager)
```

If you have a channel manager you previously serialized, you can restore it like
this:

```swift
let serializedChannelManager: [UInt8] = [2, 1, 111, 226, 140, 10, 182, 241, 179, 114, 193, 166, 162, 70, 174, 99, 247, 79, 147, 30, 131, 101, 225, 90, 8, 156, 104, 214, 25, 0, 0, 0, 0, 0, 0, 10, 174, 219, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 238, 87, 135, 110, 67, 215, 108, 228, 66, 226, 192, 37, 6, 193, 120, 186, 5, 214, 209, 16, 169, 31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // <insert bytes you would have written in following the later step "Persist channel manager">
let serializedChannelMonitors: [[UInt8]] = []
let channelManagerConstructor = try ChannelManagerConstructor(
  channel_manager_serialized: serializedChannelManager,
  channel_monitors_serialized: serializedChannelMonitors,
  keys_interface: keysInterface,
  fee_estimator: feeEstimator,
  chain_monitor: chainMonitor,
  filter: filter,
  net_graph: nil, // or networkGraph
  tx_broadcaster: broadcaster,
  logger: logger
)

let channelManager = channelManagerConstructor.channelManager
```

#### PeerHandler

Finally, let's get the peer handler. It has conveniently already been
instantiated by the `ChannelManagerConstructor`.

```swift
// main context (continued)

let peerManager = channelManagerConstructor.peerManager
```

Now, all that remains is setting up the actual syscalls that are necessary
within the host environment, and route them to the appropriate LDK objects.
