# Full Blocks 

If your Lightning node is backed by a Bitcoin full node, the operation is
straight forward: call the appropriate methods on `ChannelManager` and
`ChainMonitor` as blocks are connected and disconnected. LDK will handle the
rest!

So what happens? The `ChannelManager` examines the blocks transactions and
updates the internal channel state as needed. The `ChainMonitor` will detect
any spends of the channel funding transaction or any pertinent transaction
outputs, tracking them as necessary.

If necessary, LDK will broadcast a transaction on your behalf. More on that
later. For now, let's look at the more interesting case of pre-filtered blocks.