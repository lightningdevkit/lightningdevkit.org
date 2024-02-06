# Building a Node with LDK

## Learn how to build a basic LDK node from scratch

::: tip Note
For an integrated example of an LDK node in Rust, see the [Sample Node](https://github.com/lightningdevkit/ldk-sample)
:::

The following tutorials will show you how to build the simplest lightning node using LDK, that fufills the following tasks:

1. **Connecting to Peers**
2. **Opening Channels**
3. **Sending Payments**
4. **Receiving Payments**
5. **Closing Channels**

### Foundational Components

Let's start by looking at the core components we'll need to make this node work for the tasks we outlined above.

1. A [`ChannelManager`](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html), to open and close channels.
2. A [`PeerManager`](https://docs.rs/lightning/*/lightning/ln/peer_handler/struct.PeerManager.html), for establishing TCP/IP connections to other nodes on the lightning network.
3. Payments & Routing, ability to create and pay invoices.

To make the above work we also need to setup a series of supporting modules, including:

1. A [`FeeEstimator`](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.FeeEstimator.html)
2. A [`Logger`](https://docs.rs/lightning/*/lightning/util/logger/index.html)
3. A Transaction [`Broadcaster`](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.BroadcasterInterface.html)
4. A [`NetworkGraph`](https://docs.rs/lightning/*/lightning/routing/gossip/struct.NetworkGraph.html)
5. A [`Persister`](https://docs.rs/lightning/*/lightning/util/persist/trait.Persister.html)
6. An [`EventHandler`](https://docs.rs/lightning/*/lightning/events/trait.EventHandler.html)
7. A Transaction [`Filter`](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html)
8. A [`ChainMonitor`](https://docs.rs/lightning/*/lightning/chain/chainmonitor/index.html)
9. A [`KeysManager`](https://docs.rs/lightning/*/lightning/sign/struct.KeysManager.html)
10. A [`Scorer`](https://docs.rs/lightning/*/lightning/routing/scoring/index.html)
