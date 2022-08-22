# Building a Node with LDK

## Learn how to build a basic LDK node from scratch 

::: tip Note
For an integrated example of an LDK node in Rust, see the [Sample Node](https://github.com/lightningdevkit/ldk-sample)
:::

The following tutorials will show you how to build the simplest lightning node using LDK, that fufills the following tasks:

1. **Connect to peers** 
2. **Open channels** 
3. **Send Payments** 
4. **Receive Payments**
5. **Close channels**

### Foundational Components

Let's start by looking at the core components we'll need to make this node work for the tasks we outlined above.

1. A `PeerManager`, for establishing TCP/IP connections to other nodes on the lightning network.
2. A `ChannelManager`, to open and close channels.
3. Payments & Routing, ability to create and pay invoices.

To make the above work we also need to setup a series of supporting modules, including:
1. A `FeeEstimator`
2. A `Logger`
3. A `TransactionBroadcaster`
4. A `NetworkGraph`
5. A `Persister`
6. An `EventHandler`
7. A `TransactionFilter`
8. A `ChainMonitor`
9. A `KeysManager`
10. A `Scorer`
