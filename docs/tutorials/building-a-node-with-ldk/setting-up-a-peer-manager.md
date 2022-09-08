# Setting up a PeerManager

The Peer Manager is responsible for managing a set of peer connections and all data associated with those peers.


## Adding a PeerManager

To add a PeerManager to your application, run:

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust>

  ```rust
  use lightning::ln::peer_handler::{PeerManager};

  let mut ephemeral_bytes = [0; 32];
  rand::thread_rng().fill_bytes(&mut ephemeral_bytes);

  let lightning_msg_handler = MessageHandler {
    chan_handler: &channel_manager,
    route_handler: &gossip_sync,
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
  </template>

  <template v-slot:java>
 
  ```java
  import org.ldk.structs.PeerManager

  PeerManager peerManager = channelManagerConstructor.peer_manager;
  ```

  </template>

   <template v-slot:kotlin>
 
  ```kotlin
  import org.ldk.structs.PeerManager
  
  val peerManager: PeerManager = channelManagerConstructor.peer_manager;
  ```

  </template>
</CodeSwitcher>

**Implementation notes:** if you did not initialize `P2PGossipSync` in the previous step, you can initialize your own struct (which can be a dummy struct) that implements `RoutingMessageHandler`

**Dependencies:** `ChannelManager`, `RoutingMessageHandler`, `KeysManager`, random bytes, `Logger`

**References:** [Rust `PeerManager` docs](https://docs.rs/lightning/*/lightning/ln/peer_handler/struct.PeerManager.html), [Rust `RoutingMessageHandler` docs](https://docs.rs/lightning/*/lightning/ln/msgs/trait.RoutingMessageHandler.html), [Java `PeerManager` docs](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/PeerManager.java), [Java `RoutingMessageHandler` docs](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/RoutingMessageHandler.java)

