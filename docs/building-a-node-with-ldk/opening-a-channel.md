# Opening a Channel

Channels are the basic building blocks of the Lightning Network. With channels, you can transact not only with your immediate peers but with others on the network. Let's explore how to open a channel with LDK.

Now that you have a peer, you can open a channel with them using `ChannelManager`. You'll need the peer's pubkey as before along with:

- the amount in sats to use when funding the channel,
- any msats to push to your peer,
- an id which is given back in the `FundingGenerationReady` event,
- an optional `UserConfig` for overriding `ChannelManager` defaults

Channels can be announced to the network or can remain private, which is controlled via `UserConfig::announced_channel`.

::: code-group

```rust [Rust]
let amount = 100_000;
let push_msat = 1_000;
let user_channel_id: u128 = 42;

let mut config = UserConfig::default();
// public aka announced channel (renamed from `announced_channel` in 0.2)
config.channel_handshake_config.announce_for_forwarding = true;

// Note the new `user_channel_id: u128` and the `temporary_channel_id`
// argument (pass `None` to let LDK generate one).
match channel_manager.create_channel(pubkey, amount, push_msat, user_channel_id, None, Some(config)) {
  Ok(_) => println!("EVENT: initiated channel with peer {}", pubkey),
  Err(e) => panic!("ERROR: failed to open channel: {:?}", e),
}
```

```kotlin [Kotlin]
val amount = 100_000L
val pushMsat = 1_000L
val userChannelId = UInt128(42L)

// public aka announced channel
val userConfig = UserConfig.with_default()

val channelHandshakeConfig = ChannelHandshakeConfig.with_default()
channelHandshakeConfig.set_announce_for_forwarding(true) // renamed from set_announced_channel

userConfig.set_channel_handshake_config(channelHandshakeConfig)

val createChannelResult = channelManager.create_channel(
    pubKey.toByteArray(), amount, pushMsat, userChannelId, null, userConfig
)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// public aka announced channel
const userConfig = ldk.UserConfig.constructor_default();
const handshake = userConfig.get_channel_handshake_config();
handshake.set_announce_for_forwarding(true); // renamed from announced_channel
userConfig.set_channel_handshake_config(handshake);

const result = channelManager.create_channel(
  pubkey,             // Uint8Array (33-byte node id)
  BigInt(100_000),    // channel_value_satoshis
  BigInt(1_000),      // push_msat
  BigInt(42),         // user_channel_id (u128)
  null,               // temporary_channel_id
  userConfig
);
if (!result.is_ok()) {
  // handle Result_ChannelIdAPIErrorZ_Err
}
```

:::

# FundingGenerationReady Event Handling

At this point, an outbound channel has been initiated with your peer and it will appear in `ChannelManager::list_channels`. However, the channel is not yet funded. Once your peer accepts the channel, you will be notified with a `FundingGenerationReady` event. It's then your responsibility to construct the funding transaction and pass it to ChannelManager, which will broadcast it once it receives your channel counterparty's signature.

::: tip Note

Remember that the funding transaction must only spend [SegWit](https://bitcoinops.org/en/topics/segregated-witness/) inputs.

:::

::: code-group

```rust [Rust]
// After the peer responds with an `accept_channel` message, a
// FundingGenerationReady event will be generated.
match event {
	Event::FundingGenerationReady {
		temporary_channel_id,
		counterparty_node_id,
		channel_value_satoshis,
		output_script,
		user_channel_id,
	} => {
		// Generate the funding transaction for the channel based on the channel amount.
		// The following uses BDK (Bitcoin Dev Kit) for on-chain logic.
		let mut builder = wallet.build_tx();
		builder
			.add_recipient(output_script, Amount::from_sat(channel_value_satoshis))
			.fee_rate(fee_rate)
			.enable_rbf();
		let mut psbt = builder.finish()?;
		wallet.sign(&mut psbt, SignOptions::default())?;
		let funding_tx = psbt.extract_tx()?;

		// `funding_transaction_generated` now requires the counterparty node id.
		channel_manager
			.funding_transaction_generated(temporary_channel_id, counterparty_node_id, funding_tx)
			.expect("ERROR: funding_transaction_generated failed");
	}
	// ...
	_ => {}
}
```

```java [Kotlin]
// After the peer responds with an `accept_channel` message, an
// Event.FundingGenerationReady event will be generated.
if (event is Event.FundingGenerationReady) {
    val fundingSpk = event.output_script

    if (fundingSpk.size == 34 && fundingSpk[0].toInt() == 0 && fundingSpk[1].toInt() == 32) {
        val rawTx = buildFundingTx(event.channel_value_satoshis, event.output_script)

        channelManager.funding_transaction_generated(
            event.temporary_channel_id,
            event.counterparty_node_id,
            rawTx
        )
    }
  }

// Generate the funding transaction for the channel based on the channel amount
// The following uses BDK (Bitcoin Dev Kit) for on-chain logic
fun buildFundingTx(value: Long, script: ByteArray): Transaction {
	val scriptListUByte: List<UByte> = script.toUByteArray().asList()
	val outputScript = Script(scriptListUByte)
	val (psbt, _) = TxBuilder()
		.addRecipient(outputScript, value.toULong())
		.feeRate(4.0F)
		.finish(onchainWallet)
	sign(psbt)
	val rawTx = psbt.extractTx().serialize().toUByteArray().toByteArray()
	return psbt.extractTx()
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// In your EventHandler, react to the FundingGenerationReady event.
if (event instanceof ldk.Event_FundingGenerationReady) {
  // Build a transaction paying `channel_value_satoshis` to `output_script`
  // with your on-chain wallet, then hand the signed tx back to LDK.
  const fundingTx: Uint8Array = buildFundingTx(
    event.output_script,
    event.channel_value_satoshis
  );

  // `funding_transaction_generated` now requires the counterparty node id.
  channelManager.funding_transaction_generated(
    event.temporary_channel_id, // ChannelId
    event.counterparty_node_id, // Uint8Array
    fundingTx
  );
}
```

:::

**References:** [Rust `FundingGenerationReady` docs](https://docs.rs/lightning/0.2.2/lightning/events/enum.Event.html#variant.FundingGenerationReady), [Java/Kotlin `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Event.java), [TypeScript `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/ts/structs/Event.mts)

# Broadcasting the Funding Transaction

After crafting the funding transaction you'll need to send it to the Bitcoin network where it will hopefully be mined and added to the blockchain. You'll need to watch this transaction and wait for a minimum of 6 confirmations before the channel is ready to use.

::: code-group

```rust [Rust]
// Broadcasting transactions via an esplora client. Note the batch signature:
// `broadcast_transactions` now takes a slice of transactions.
impl BroadcasterInterface for YourTxBroadcaster {
	fn broadcast_transactions(&self, txs: &[&Transaction]) {
		let esplora_client = self.esplora_client.clone();
		for tx in txs {
			if let Err(err) = esplora_client.broadcast(tx) {
				log_error!(self.logger, "Failed to broadcast transaction: {}", err);
			}
		}
	}
}

```

```java [Kotlin]
// Using BDK (Bitcoin Dev Kit) to broadcast a transaction via the esplora client
object YourTxBroadcaster : BroadcasterInterface.BroadcasterInterfaceInterface {
    override fun broadcast_transactions(txs: Array<out ByteArray>??) {
		val esploraURL = "esplora url"
        val blockchainConfig = BlockchainConfig.Esplora(EsploraConfig(esploraURL, null, 5u, 20u, null))
		val blockchain = Blockchain(blockchainConfig)

        txs?.let { transactions ->
            CoroutineScope(Dispatchers.IO).launch {
                transactions.forEach { txByteArray ->
                    val uByteArray = txByteArray.toUByteArray()
                    val transaction = Transaction(uByteArray.toList())

                    blockchain.broadcast(transaction)
                    Log.i(LDKTAG, "The raw transaction broadcast is: ${txByteArray.toHex()}")
                }
            }
        } ?: throw(IllegalStateException("Broadcaster attempted to broadcast a null transaction"))
    }
}

```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// `broadcast_transactions` receives an array of raw, serialized transactions.
const txBroadcaster = ldk.BroadcasterInterface.new_impl({
  broadcast_transactions(txs: Uint8Array[]): void {
    for (const tx of txs) {
      // POST each raw transaction to your esplora/electrum backend, e.g.:
      //   fetch(`${esploraUrl}/tx`, { method: "POST", body: toHexString(tx) });
    }
  },
} as ldk.BroadcasterInterfaceInterface);
```

:::

**References:** [Rust `BroadcasterInterface` docs](https://docs.rs/lightning/0.2.2/lightning/chain/chaininterface/trait.BroadcasterInterface.html), [Java/Kotlin `BroadcasterInterface` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/BroadcasterInterface.java), [TypeScript `BroadcasterInterface` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/ts/structs/BroadcasterInterface.mts)

::: tip Keep LDK in sync

Remember if you are restarting and have open channels then you should [let LDK know about the latest channel state.](./setting-up-a-channel-manager/#sync-channelmonitors-and-channelmanager-to-chain-tip)

:::
