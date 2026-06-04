# Connect to Peers

In this section you'll learn how to join the lightning network.

Firstly we need to have the ability to do high performance I/O operations. LDK provides default implementations for initializing all of your networking needs. If you are using Rust, you can use our simple socket handling library `lightning_net_tokio`. In Kotlin/Java you can use the `NioPeerHandler` which uses Java's NIO I/O interface.

In TypeScript there is no networking module for non-Node.js (browser) environments: WASM cannot open raw TCP sockets. Instead you implement a `SocketDescriptor` that bridges LDK to a transport you do have — typically a `WebSocket` talking to a WebSocket-to-TCP proxy you run server-side — and feed bytes to the `PeerManager` yourself. (Node.js users can use the separate [`lightningdevkit-node-net`](https://www.npmjs.com/package/lightningdevkit-node-net) package instead.)

**What it's used for**: making peer connections, facilitating peer data to and from LDK

::: code-group

```rust [Rust]
use lightning_net_tokio; // use LDK's sample networking module

let listen_port = 9735;
let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", listen_port))
    .await.unwrap();
loop {
    let tcp_stream = listener.accept().await.unwrap().0;
    let peer_manager = peer_manager.clone();
    tokio::spawn(async move {
        // Use LDK's supplied networking battery to facilitate inbound
        // connections.
        lightning_net_tokio::setup_inbound(
            peer_manager,
            tcp_stream.into_std().unwrap(),
        )
        .await;
    });
}
```

```java [Kotlin]
val nioPeerHandler = channelManagerConstructor.nio_peer_handler
val port = 9777
nioPeerHandler.bind_listener(InetSocketAddress("127.0.0.1", port))
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// Bridge a transport (here a WebSocket to a WS->TCP proxy) to LDK by
// implementing SocketDescriptor. There is no raw TCP in the browser.
function makeSocketDescriptor(ws: WebSocket, id: bigint): ldk.SocketDescriptor {
  return ldk.SocketDescriptor.new_impl({
    // Return how many bytes you accepted; buffer the rest if back-pressured.
    send_data(data: Uint8Array, _resume_read: boolean): number {
      ws.send(data);
      return data.length;
    },
    disconnect_socket(): void { ws.close(); },
    eq(other: ldk.SocketDescriptor): boolean { return other.hash() === id; },
    hash(): bigint { return id; },
  } as ldk.SocketDescriptorInterface);
}

// On an inbound connection from the proxy:
const descriptor = makeSocketDescriptor(ws, 1n);
peerManager.new_inbound_connection(
  descriptor,
  ldk.Option_SocketAddressZ.constructor_none()
);

// Forward every chunk you receive from the socket into LDK, then flush:
ws.onmessage = (ev) => {
  peerManager.read_event(descriptor, new Uint8Array(ev.data));
  peerManager.process_events();
};
```

:::

Connections to other peers are established with `PeerManager`. You'll need to know the pubkey and address of another node that you want as a peer. Once the connection is established and the handshake is complete, `PeerManager` will show the peer's pubkey in its list of peers.

::: code-group

```rust [Rust]
match lightning_net_tokio::connect_outbound(peer_manager.clone(), pubkey, address).await {
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

			// Wait for the handshake to complete. `get_peer_node_ids` was
			// replaced by `list_peers`, which returns rich `PeerDetails`.
			match peer_manager.list_peers().iter().find(|p| p.counterparty_node_id == pubkey) {
				Some(_) => break,
				None => tokio::time::sleep(std::time::Duration::from_millis(10)).await,
			}
		}
	}
	None => panic!("ERROR: Failed to connect to peer"),
}
```

```java [Kotlin]
try {
    // Connect and wait for the handshake to complete.
    val address: SocketAddress = InetSocketAddress(hostname, port)
    nioPeerHandler.connect(pubkeyHex.toByteArray(), address, 5555)

    // The peer's pubkey will be present in the list of peers. (`get_peer_node_ids`
    // was removed in favour of `list_peers`, which returns `PeerDetails`.)
    val peerManager: PeerManager = channelManagerConstructor.peer_manager
    val peerNodeIds = peerManager.list_peers().map { it.get_counterparty_node_id() }

    } catch (e: IOException) {
    // Handle failure when connecting to a peer.

}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// `pubkey` is the peer's 33-byte node id. Kick off the outbound handshake;
// `new_outbound_connection` returns the first bytes to send to the peer.
const descriptor = makeSocketDescriptor(ws, 2n);
const initialSend = peerManager.new_outbound_connection(
  pubkey,
  descriptor,
  ldk.Option_SocketAddressZ.constructor_none()
);
if (initialSend instanceof ldk.Result_CVec_u8ZPeerHandleErrorZ_OK) {
  ws.send(initialSend.res);
}

// Feed received bytes in (as in the inbound example), then check the handshake
// completed by looking for the peer in the list. (`get_peer_node_ids` was
// removed in favour of `list_peers`, which returns `PeerDetails`.)
const connected = peerManager
  .list_peers()
  .some((p) => p.get_counterparty_node_id().toString() === pubkey.toString());
```

:::

**Dependencies:** `PeerManager`

**References:** [Rust `lightning-net-tokio` docs](https://docs.rs/lightning-net-tokio/0.2.0/lightning_net_tokio/), [Rust `PeerManager` docs](https://docs.rs/lightning/0.2.2/lightning/ln/peer_handler/struct.PeerManager.html), [Java/Kotlin `NioPeerHandler` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/batteries/NioPeerHandler.java), [Java/Kotlin `PeerManager` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/PeerManager.java), [TypeScript `SocketDescriptor` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/ts/structs/SocketDescriptor.mts)
