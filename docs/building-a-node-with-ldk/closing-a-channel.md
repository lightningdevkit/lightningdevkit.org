# Closing a Channel

Begins the process of closing a channel. After this call (plus some timeout), no new HTLCs will be accepted on the given channel, and after additional timeout/the closing of all pending HTLCs, the channel will be closed on chain.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
let channel_id = channel_manager
	.list_channels()
	.iter()
	.find(|channel| channel.user_id == user_id)
	.expect("ERROR: Channel not found")
	.channel_id;

// Example: Cooperative close
channel_manager.close_channel(&channel_id).expect("ERROR: Failed to close channel");

// Example: Unilateral close
channel_manager.force_close_channel(&channel_id).expect("ERROR: Failed to close channel");
```
  </template>
  <template v-slot:kotlin>

```kotlin
val res = channelManager.close_channel(channelId, pubKey)

if (res is Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_Err) {
    // Handle error
}

if (res.is_ok) {
   // Handle successful close
}
```

  </template>
  <template v-slot:swift>

```Swift
let channelId: [UInt8] = // Add Channel Id in bytes
let counterpartyNodeId: [UInt8] = // Add Counterparty Node Id in bytes
let res = channelManager.closeChannel(channelId: channelId, counterpartyNodeId: counterpartyNodeId)
if res!.isOk() {
    // Channel Closed
}
```

  </template>
</CodeSwitcher>


To claim Funds directly into a custom wallet like BDK wallet using a custom `KeysManager` see the [Key Management](/key_management.md) guide for more info.

# SpendableOutputs Event Handling

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
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

  </template>
  <template v-slot:kotlin>

```kotlin
// Example where we spend straight to our BDK based wallet
if (event is Event.SpendableOutputs) {
    val outputs = event.outputs
    try {
        val address = OnchainWallet.getNewAddress()
        val script = Address(address).scriptPubkey().toBytes().toUByteArray().toByteArray()
        val txOut: Array<TxOut> = arrayOf()
        val res = keysManager?.spend_spendable_outputs(
            outputs,
            txOut,
            script,
            1000,
            Option_u32Z.None.none()
        )

        if (res != null) {
            if (res.is_ok) {
                val tx = (res as Result_TransactionNoneZ.Result_TransactionNoneZ_OK).res
                val txs: Array<ByteArray> = arrayOf()
                txs.plus(tx)

                LDKBroadcaster.broadcast_transactions(txs)
            }
        }

    } catch (e: Exception) {
        Log.i(LDKTAG, "Error: ${e.message}")
    }
}

```

  </template>
  <template v-slot:swift>

```Swift
// Example where we spend straight to our BDK based wallet
func handleEvent(event: Event) {
    if let event = event.getValueAsSpendableOutputs() {
        let outputs = event.getOutputs()
        do {
            let address = ldkManager!.bdkManager.getAddress(addressIndex: .new)!
            let script = try Address(address: address).scriptPubkey().toBytes()
            let res = ldkManager!.myKeysManager.spendSpendableOutputs(
                descriptors: outputs,
                outputs: [],
                changeDestinationScript: script,
                feerateSatPer1000Weight: 1000,
                locktime: nil)
            if res.isOk() {
                var txs: [[UInt8]] = []
                txs.append(res.getValue()!)
                ldkManager!.broadcaster.broadcastTransactions(txs: txs)
            }
        } catch {
            print(error.localizedDescription)
        }
    }
}
```

  </template>

</CodeSwitcher>

**References:** [Rust `SpendableOutputs` docs](https://docs.rs/lightning/0.0.121/lightning/events/enum.Event.html#variant.SpendableOutputs), [Java/Kotlin `SpendableOutputs` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java#L802)