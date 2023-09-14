# Connect to Peers

In this section you'll learn how to join the lightning network. 

Firstly we need to have the ability to do high performance I/O operations. LDK provides default implementations for all of your networking needs. If you are using Rust, you can use our simple socket handling library `lightning_net_tokio`. In Java you can use the `NioPeerHandler` which uses Java's NIO I/O interface.

Connections to other peers are established with `PeerManager`. You'll need to know the pubkey and address of another node that you want as a peer. Once the connection is established and the handshake is complete, `PeerManager` will show the peer's pubkey in its list of peers.

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust> 

```rust
match lightning_net_tokio::connect_outbound(Arc::clone(&peer_manager), pubkey, address).await {
	Some(connection_closed_future) => {
		let mut connection_closed_future = Box::pin(connection_closed_future);
		loop {
			// Make sure the connection is still established.
			match futures::poll!(&mut connection_closed_future) {
				std::task::Poll::Ready(_) => {
					panic!("ERROR: Peer disconnected before handshake completed");
				}
				std::task::Poll::Pending => {}
			}

			// Wait for the handshake to complete.
			match peer_manager.get_peer_node_ids().iter().find(|id| **id == pubkey) {
				Some(_) => break,
				None => tokio::time::sleep(std::time::Duration::from_millis(10)).await,
			}
		}
	}
	None => panic!("ERROR: Failed to connect to peer"),
}
```

  </template>

  <template v-slot:java>
 
```java
try {
	// Connect and wait for the handshake to complete.
	SocketAddress address = new InetSocketAddress(host, port);
	nio_peer_handler.connect(pubkey, address);

	// The peer's pubkey will be present in the list of peer ids.
	final PeerManager peer_manager = channel_manager_constructor.peer_manager;
	byte[][] peer_node_ids = peer_manager.get_peer_node_ids();
} catch (java.io.IOException e) {
  // Handle failure to successfully connect to a peer.
}
```

  </template>

   <template v-slot:kotlin>
 
```kotlin
try {
    // Connect and wait for the handshake to complete.
    val address: SocketAddress = InetSocketAddress(hostname, port)
    nioPeerHandler.connect(pubkeyHex.toByteArray(), address, 5555)

    // The peer's pubkey will be present in the list of peer ids.
    val peerManager: PeerManager = channelManagerConstructor.peer_manager
    val peerNodeIds = peerManager._peer_node_ids

    } catch (e: IOException) {
    // Handle failure to successfully connect to a peer.
}
```

  </template>
</CodeSwitcher>

**Dependencies:** `PeerManager`

**References:** [Rust `lightning-net-tokio` docs](https://docs.rs/lightning-net-tokio/*/lightning_net_tokio/), [Rust `PeerManager` docs](https://docs.rs/lightning/*/lightning/ln/peer_handler/struct.PeerManager.html), [Java `NioPeerHandler` docs](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/batteries/NioPeerHandler.java),
[Java `PeerManager` docs](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/PeerManager.java),







