# Setting up a `PeerManager`

The `PeerManager` is responsible for managing a set of peer connections and data associated with those peers.

## Adding a `PeerManager`

To add a `PeerManager` to your application, run:

::: code-group

```rust [Rust]
use lightning::ln::peer_handler::{MessageHandler, PeerManager, IgnoringMessageHandler};

let mut ephemeral_bytes = [0; 32];
rand::thread_rng().fill_bytes(&mut ephemeral_bytes);

let lightning_msg_handler = MessageHandler {
  chan_handler: channel_manager.clone(),
  route_handler: gossip_sync.clone(),
  onion_message_handler: onion_messenger.clone(),
  custom_message_handler: IgnoringMessageHandler {},
  // New in 0.2: a send-only handler for peer-storage messages (the ChainMonitor).
  send_only_message_handler: chain_monitor.clone(),
};

let peer_manager = PeerManager::new(
    lightning_msg_handler,
    current_time as u32,
    &ephemeral_bytes,
    logger.clone(),
    keys_manager.clone(), // node_signer
);
```

```java [Kotlin]
import org.ldk.structs.PeerManager

// The ChannelManagerConstructor wires up the PeerManager for you. Note it is
// `null` until you call `channelManagerConstructor.chain_sync_completed(..)`.
val peerManager: PeerManager = channelManagerConstructor.peer_manager
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// In TypeScript there is no MessageHandler wrapper — pass each handler to
// PeerManager.constructor_new directly. Use IgnoringMessageHandler for any
// role you don't need (here: routing, onion and custom messages).
const ignorer = ldk.IgnoringMessageHandler.constructor_new();

const peerManager = ldk.PeerManager.constructor_new(
  channelManager.as_ChannelMessageHandler(),
  ignorer.as_RoutingMessageHandler(),   // or gossipSync.as_RoutingMessageHandler()
  ignorer.as_OnionMessageHandler(),     // or onionMessenger.as_OnionMessageHandler()
  ignorer.as_CustomMessageHandler(),
  chainMonitor.as_SendOnlyMessageHandler(),
  Math.floor(Date.now() / 1000),        // current time / nonce
  keysManager.as_EntropySource().get_secure_random_bytes(), // 32 ephemeral bytes
  logger,
  keysManager.as_NodeSigner()
);
```

:::

**Implementation notes:** if you did not initialize `P2PGossipSync` in the previous step, you can pass an `IgnoringMessageHandler` (as shown in the TypeScript example) or your own struct implementing `RoutingMessageHandler` in its place.

**Dependencies:** `ChannelManager`, `RoutingMessageHandler`, `ChainMonitor`, `KeysManager`, random bytes, `Logger`

**References:** [Rust `PeerManager` docs](https://docs.rs/lightning/0.2.2/lightning/ln/peer_handler/struct.PeerManager.html), [Rust `MessageHandler` docs](https://docs.rs/lightning/0.2.2/lightning/ln/peer_handler/struct.MessageHandler.html), [Java/Kotlin `PeerManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/PeerManager.java), [TypeScript `PeerManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/ts/structs/PeerManager.mts)
