# Chain Activity

Initially, our node doesn't have any channels and hence has no data to monitor
for on-chain. When a channel is opened with a peer, the `ChannelManager` creates
a `ChannelMonitor` and passes it to the `ChainMonitor` to watch.

At this point, you need to feed LDK any chain data of interest so that it can
respond accordingly. It supports receiving either full blocks or pre-filtered
blocks using the `chain::Listen` interface. While block data can be sourced from
anywhere, it is your responsibility to call the `block_connected` and
`block_disconnected` methods on `ChannelManager` and `ChainMonitor`. This allows
them to update channel state and respond to on-chain events, respectively.

LDK comes with a `lightning-block-sync` utility that handles polling a block
source for the best chain tip, detecting chain forks, and notifying listeners
when blocks are connected and disconnected. It can be configured to:

* Poll a custom `BlockSource`
* Notify `ChannelManager` and `ChainMonitor` of block events

It is your choice as to whether you use this utility or your own to feed the
required chain data to LDK. If you choose to use it, you will need to implement
the `BlockSource` interface or use one of the samples that it provides.

::: tip Note
Currently, `lightning-block-sync` is only available in Rust.
:::
