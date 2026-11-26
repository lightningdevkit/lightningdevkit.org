# Shutting Down a Node

An orderly shutdown stops node activity and saves the state needed for the next
start. Open channels can stay open while the node is offline.

## LDK Node

Stop accepting new application requests and call
[`Node::stop`](https://docs.rs/ldk-node/latest/ldk_node/struct.Node.html#method.stop).
Check the result and wait for the call to finish before exiting the process.

## Custom integrations

1. Stop accepting new requests that change Lightning state, such as sending
   payments or opening channels. Stop delivering new peer messages and chain
   notifications to LDK, and let callbacks already in progress finish.
2. Keep persistence available while the node winds down. If your channel
   monitor persister completes writes asynchronously, wait for outstanding
   writes and deliver their completion notifications to LDK before shutting
   down the event loop. Follow the requirements in the
   [`Persist` trait](https://docs.rs/lightning/latest/lightning/chain/chainmonitor/trait.Persist.html).
3. Stop background processing and wait for the result. With
   [`BackgroundProcessor::stop`](https://docs.rs/lightning-background-processor/latest/lightning_background_processor/struct.BackgroundProcessor.html#method.stop),
   check the returned persistence error, if any. With
   [`process_events_async`](https://docs.rs/lightning-background-processor/latest/lightning_background_processor/fn.process_events_async.html),
   signal the sleeper to return `true` and await the processing future. If your
   integration drives LDK itself, finish processing pending events and persist
   the latest channel manager state before releasing the store.
4. Close remaining peer connections and storage resources after processing and
   persistence have finished. Report persistence errors before treating the
   shutdown as successful.

On startup, reload the persisted channel manager and channel monitors and bring
them up to date with the chain before resuming Lightning activity. See
[Setting up a Channel Manager](/building-a-node-with-ldk/setting-up-a-channel-manager)
for the components involved in loading and persisting channel state.
