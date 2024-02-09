# Connect to Peers

In this section you'll learn how to join the lightning network.

Firstly we need to have the ability to do high performance I/O operations. LDK provides default implementations for initializing all of your networking needs. If you are using Rust, you can use our simple socket handling library `lightning_net_tokio`. In Kotlin/Java you can use the `NioPeerHandler` which uses Java's NIO I/O interface.

**What it's used for**: making peer connections, facilitating peer data to and from LDK

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

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

  </template>

  <template v-slot:kotlin>

```java
val nioPeerHandler = channelManagerConstructor.nio_peer_handler
val port = 9777
nioPeerHandler.bind_listener(InetSocketAddress("127.0.0.1", port))
```

  </template>

  <template v-slot:swift>

```Swift
let peerHandler = channelManagerConstructor.getTCPPeerHandler()
let port = 9777
peerHandler.bind(address: "127.0.0.1", port: port)
```

  </template>

</CodeSwitcher>

Connections to other peers are established with `PeerManager`. You'll need to know the pubkey and address of another node that you want as a peer. Once the connection is established and the handshake is complete, `PeerManager` will show the peer's pubkey in its list of peers.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
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

  <template v-slot:kotlin>
 
```java
try {
    // Connect and wait for the handshake to complete.
    val address: SocketAddress = InetSocketAddress(hostname, port)
    nioPeerHandler.connect(pubkeyHex.toByteArray(), address, 5555)

    // The peer's pubkey will be present in the list of peer ids.
    val peerManager: PeerManager = channelManagerConstructor.peer_manager
    val peerNodeIds = peerManager._peer_node_ids

    } catch (e: IOException) {
    // Handle failure when connecting to a peer.

}

````

  </template>

  <template v-slot:swift>

```Swift
// Connect and wait for the handshake to complete.
let pubKey = // Insert code to retrieve peer's pubKey as byte array
let address = // Insert code to retrieve peer's address
let port = // Insert code to retrieve peer's port
let _ = peerHandler.connect(address: address, port: port, theirNodeId: pubKey)

// The peer's pubkey will be present in the list of peer ids.
let peerManager: PeerManager = channelManagerConstructor.peerManager
let peerNodeIds = peerManager.getPeerNodeIds()
````

  </template>
  
</CodeSwitcher>

**Dependencies:** `PeerManager`

**References:** [Rust `lightning-net-tokio` docs](https://docs.rs/lightning-net-tokio/*/lightning_net_tokio/), [Rust `PeerManager` docs](https://docs.rs/lightning/*/lightning/ln/peer_handler/struct.PeerManager.html), [Java/Kotlin `NioPeerHandler` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/batteries/NioPeerHandler.java),
[Java/Kotlin `PeerManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/PeerManager.java),
