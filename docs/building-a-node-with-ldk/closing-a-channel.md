# Closing a Channel

Begins the process of closing a channel. After this call (plus some timeout), no new HTLCs will be accepted on the given channel, and after additional timeout/the closing of all pending HTLCs, the channel will be closed on chain.

::: code-group

```rust [Rust]
// Both close methods now require the counterparty's node id, so grab the full
// ChannelDetails. Note the field is `user_channel_id` (a u128) in 0.2.
let channel = channel_manager
	.list_channels()
	.into_iter()
	.find(|channel| channel.user_channel_id == user_channel_id)
	.expect("ERROR: Channel not found");
let channel_id = channel.channel_id;
let counterparty_node_id = channel.counterparty.node_id;

// Example: Cooperative close
channel_manager
	.close_channel(&channel_id, &counterparty_node_id)
	.expect("ERROR: Failed to close channel");

// Example: Unilateral close (renamed; now requires an error-message string)
channel_manager
	.force_close_broadcasting_latest_txn(&channel_id, &counterparty_node_id, "manually force-closed".to_string())
	.expect("ERROR: Failed to force-close channel");
```

```kotlin [Kotlin]
val res = channelManager.close_channel(channelId, counterpartyNodeId)

if (res is Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_Err) {
    // Handle error
}

if (res.is_ok) {
   // Handle successful close
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// channelId: ChannelId, counterpartyNodeId: Uint8Array (from the ChannelDetails)
const res = channelManager.close_channel(channelId, counterpartyNodeId);
if (res instanceof ldk.Result_NoneAPIErrorZ_Err) {
  // Handle error
} else {
  // Handle successful close
}
```

:::


To claim Funds directly into a custom wallet like BDK wallet using a custom `KeysManager` see the [Key Management](/key_management.md) guide for more info.

# SpendableOutputs Event Handling

::: code-group

```rust [Rust]
Event::SpendableOutputs { outputs, channel_id: _ } => {
    // SpendableOutputDescriptors, of which outputs is a vec of, are critical to keep track
    // of! While a `StaticOutput` descriptor is just an output to a static, well-known key,
    // other descriptors are not currently ever regenerated for you by LDK. Once we return
    // from this method, the descriptor will be gone, and you may lose track of some funds.
    //
    // Here we simply persist them to disk, with a background task running which will try
    // to spend them regularly (possibly duplicatively/RBF'ing them). These can just be
    // treated as normal funds where possible - they are only spendable by us and there is
    // no rush to claim them.
    for output in outputs {
        let key = hex_utils::hex_str(&keys_manager.get_secure_random_bytes());
        // Note that if the type here changes our read code needs to change as well.
        let output: SpendableOutputDescriptor = output;
        fs_store.write(PENDING_SPENDABLE_OUTPUT_DIR, "", &key, &output.encode()).unwrap();
    }
}

```

```kotlin [Kotlin]
// Example where we spend straight to our BDK based wallet
if (event is Event.SpendableOutputs) {
    val outputs = event.outputs
    try {
        val address = OnchainWallet.getNewAddress()
        val script = Address(address).scriptPubkey().toBytes().toUByteArray().toByteArray()
        val txOut: Array<TxOut> = arrayOf()
        // `spend_spendable_outputs` moved from KeysManager onto the OutputSpender
        // trait, and gained a trailing `locktime` argument.
        val res = keysManager?.as_OutputSpender()?.spend_spendable_outputs(
            outputs,
            txOut,
            script,
            1000,
            Option_u32Z.none() // locktime
        )

        if (res != null && res.is_ok) {
            val tx = (res as Result_TransactionNoneZ.Result_TransactionNoneZ_OK).res
            LDKBroadcaster.broadcast_transactions(arrayOf(tx))
        }
    } catch (e: Exception) {
        Log.i(LDKTAG, "Error: ${e.message}")
    }
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

if (event instanceof ldk.Event_SpendableOutputs) {
  // `spend_spendable_outputs` is on the OutputSpender trait.
  const res = keysManager.as_OutputSpender().spend_spendable_outputs(
    event.outputs,                      // SpendableOutputDescriptor[]
    [],                                 // additional TxOut[]
    changeDestinationScript,            // Uint8Array (your change scriptPubKey)
    1000,                               // feerate_sat_per_1000_weight
    ldk.Option_u32Z.constructor_none()  // locktime
  );
  if (res instanceof ldk.Result_TransactionNoneZ_OK) {
    txBroadcaster.broadcast_transactions([res.res]);
  }
}
```

:::

**References:** [Rust `SpendableOutputs` docs](https://docs.rs/lightning/0.2.2/lightning/events/enum.Event.html#variant.SpendableOutputs), [Rust `OutputSpender` docs](https://docs.rs/lightning/0.2.2/lightning/sign/trait.OutputSpender.html), [Java/Kotlin `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Event.java), [TypeScript `OutputSpender` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/ts/structs/OutputSpender.mts)