# Setting up a PeerManager

The `PeerManager` is responsible for managing a set of peer connections and data associated with those peers.

## Adding a `PeerManager`

To add a PeerManager to your application, run:

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
use lightning::ln::peer_handler::{PeerManager};

let mut ephemeral_bytes = [0; 32];
rand::thread_rng().fill_bytes(&mut ephemeral_bytes);

let lightning_msg_handler = MessageHandler {
  chan_handler: channel_manager,
  route_handler: gossip_sync,
  onion_message_handler: onion_messenger,
  custom_message_handler: IgnoringMessageHandler {}
};

let peer_manager = PeerManager::new(
    lightning_msg_handler,
    cur_time.as_secs().try_into().map_err(|e| {
			log_error!(logger, "Failed to get current time: {}", e);
			BuildError::InvalidSystemTime
	  })?,
    &ephemeral_bytes,
    &logger,
    &keys_manager
);
```

  </template>

  <template v-slot:kotlin>
 
  ```java
  import org.ldk.structs.PeerManager
  
  val peerManager: PeerManager = channelManagerConstructor.peer_manager;
  ```

  </template>

  <template v-slot:swift>
 
  ```Swift
  import LightningDevKit
  
  let peerManager: PeerManager = channelManagerConstructor.peerManager
  ```

  </template>

</CodeSwitcher>

**Implementation notes:** if you did not initialize `P2PGossipSync` in the previous step, you can initialize your own struct (which can be a dummy struct) that implements `RoutingMessageHandler`

**Dependencies:** `ChannelManager`, `RoutingMessageHandler`, `KeysManager`, random bytes, `Logger`

**References:** [Rust `PeerManager` docs](https://docs.rs/lightning/*/lightning/ln/peer_handler/struct.PeerManager.html), [Rust `RoutingMessageHandler` docs](https://docs.rs/lightning/*/lightning/ln/msgs/trait.RoutingMessageHandler.html), [Java/Kotlin `PeerManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/PeerManager.java), [Java/Kotlin `RoutingMessageHandler` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/RoutingMessageHandler.java)
