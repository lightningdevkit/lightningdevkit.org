# Opening a Channel

Channels are the basic building blocks of the Lightning Network. With channels, you can transact not only with your immediate peers but with others on the network. Let's explore how to open a channel with LDK.

Now that you have a peer, you can open a channel with them using `ChannelManager`. You'll need the peer's pubkey as before along with:

- the amount in sats to use when funding the channel,
- any msats to push to your peer,
- an id which is given back in the `FundingGenerationReady` event,
- an optional `UserConfig` for overriding `ChannelManager` defaults

Channels can be announced to the network or can remain private, which is controlled via `UserConfig::announced_channel`.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
let amount = 10_000;
let push_msat = 1_000;
let user_id = 42;
let config = UserConfig {
  channel_options: ChannelConfig { announced_channel: true, ..Default::default() },
  ..Default::default()
};
match channel_manager.create_channel(pubkey, amount, push_msat, user_id, Some(config)) {
  Ok(_) => println!("EVENT: initiated channel with peer {}", pubkey),
  Err(e) => panic!("ERROR: failed to open channel: {:?}", e),
}
```

  </template>

  <template v-slot:kotlin>

```kotlin
val amount = 100_000L
val pushMsat = 1_000L
val userId = 42L

// public aka announced channel
val userConfig = UserConfig.with_default()

val channelHandshakeConfig = ChannelHandshakeConfig.with_default()
channelHandshakeConfig._announced_channel = true

userConfig._channel_handshake_config = channelHandshakeConfig

val createChannelResult = channelManager.create_channel(
    pubKey.toByteArray(), amount, pushMsat, userId, userConfig
)
```

  </template>

  <template v-slot:swift>

```Swift
let amount: UInt64 = 100000
let pushMsat: UInt64 = 1000
let userId: [UInt8] = toBytesArray(UUID().uuid)

// public aka announced channel
let userConfig = UserConfig.initWithDefault()
let channelHandshakeConfig = ChannelHandshakeConfig.initWithDefault()
channelConfig.setAnnouncedChannel(val: true)

userConfig.setChannelHandshakeConfig(val: channelConfig)

let createChannelResults = channelManager.createChannel(
	theirNetworkKey: pubKey,
	channelValueSatoshis: amount, 
	pushMsat: pushMsat, 
	userChannelId: userId, 
	overrideConfig: userConfig
)
```

  </template>

</CodeSwitcher>

# FundingGenerationReady Event Handling

At this point, an outbound channel has been initiated with your peer and it will appear in `ChannelManager::list_channels`. However, the channel is not yet funded. Once your peer accepts the channel, you will be notified with a `FundingGenerationReady` event. It's then your responsibility to construct the funding transaction and pass it to ChannelManager, which will broadcast it once it receives your channel counterparty's signature. 

::: tip Note

Remember that the funding transaction must only spend SegWit inputs.

:::

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
<template v-slot:rust>

```rust
// In the event handler passed to BackgroundProcessor::start
match event {
	Event::FundingGenerationReady {
		temporary_channel_id,
		channel_value_satoshis,
		output_script,
		user_channel_id,
	} => {
		// This is the same channel created earler.
		assert_eq!(event.user_channel_id, 42);

		// Construct the raw transaction with one output, that is paid the amount of the
		// channel.
		let network = bitcoin_bech32::constants::Network::Testnet;
		let address = WitnessProgram::from_scriptpubkey(&output_script[..], network)
			.unwrap().to_address;
		let mut outputs = vec![HashMap::with_capacity(1)];
		outputs[0].insert(address, channel_value_satoshis as f64 / 100_000_000.0);
		let raw_tx = bitcoind_client.create_raw_transaction(outputs).await;

		// Have your wallet put the inputs into the transaction such that the output is
		// satisfied.
		let funded_tx = bitcoind_client.fund_raw_transaction(raw_tx).await;
		assert!(funded_tx.changepos == 0 || funded_tx.changepos == 1);

		// Sign the funding transaction and give it to ChannelManager to broadcast.
		let signed_tx = bitcoind_client.sign_raw_transaction_with_wallet(funded_tx.hex).await;
		assert_eq!(signed_tx.complete, true);
		let final_tx: Transaction =
			encode::deserialize(&hex_utils::to_vec(&signed_tx.hex).unwrap()).unwrap();
		channel_manager.funding_transaction_generated(&temporary_channel_id, final_tx).unwrap();
	}
	// ...
}
```

</template>

<template v-slot:kotlin>

```java
// After the peer responds with an `accept_channel` message, an
// Event.FundingGenerationReady event will be generated.

if (event is Event.FundingGenerationReady) {
    val funding_spk = event.output_script

    if (funding_spk.size == 34 && funding_spk[0].toInt() == 0 && funding_spk[1].toInt() == 32) {
      // Generate the funding transaction for the channel based on the channel amount
      // The following uses BDK (Bitcoin Dev Kit) for on-chain logic
        val rawTx = buildFundingTx(event.channel_value_satoshis, event.output_script)

        channelManager.funding_transaction_generated(
            event.temporary_channel_id,
            event.counterparty_node_id,
            rawTx
        )
    }
  }

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

</template>

<template v-slot:swift>

```Swift
// After the peer responds with an `accept_channel` message, an
// Event.FundingGenerationReady event will be generated.

if let event = event.getValueAsFundingGenerationReady() {
    let script = Script(rawOutputScript: event.getOutputScript())
    let channelValue = event.getChannelValueSatoshis()
    let rawTx = buildFundingTx(script: script, amount: channelValue)
    if let rawTx = rawTx {
        channelManager.fundingTransactionGenerated(
			temporaryChannelId: event.getTemporaryChannelId(), 
			counterpartyNodeId: event.getCounterpartyNodeId(), 
			fundingTransaction: rawTx.serialize()
		)
    }
}

// Building transaction using BDK
func buildFundingTx(script: Script, amount: UInt64) -> Transaction? {
    do {
        let transaction = try TxBuilder().addRecipient(
            script: script,
            amount: amount)
			.feeRate(satPerVbyte: 4.0)
            .finish(wallet: onchainWallet)
        let _ = try onchainWallet.sign(psbt: transaction.psbt, signOptions: nil)
        return transaction.psbt.extractTx()
    } catch {
        return nil
    }
}
```

</template>

</CodeSwitcher>

**References:** [Rust `FundingGenerationReady` docs](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html#variant.FundingGenerationReady), [Java `FundingGenerationReady` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java#L95)
# Broadcasting the Funding Transaction

After crafting the funding transaction you'll need to send it to the Bitcoin network where it will hopefully be mined and added to the blockchain. You'll need to watch this transaction and wait for a minimum of 6 confirmations before the channel is ready to use.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
// Using BDK (Bitcoin Dev Kit) to broadcast a transaction via the esplora client
impl BroadcasterInterface for YourTxBroadcaster {
	fn broadcast_transaction(&self, tx: &Transaction) {
		let locked_runtime = self.tokio_runtime.read().unwrap();
		if locked_runtime.as_ref().is_none() {
			log_error!(self.logger, "Failed to broadcast transaction: No runtime.");
			return;
		}

		let res = tokio::task::block_in_place(move || {
			locked_runtime
				.as_ref()
				.unwrap()
				.block_on(async move { self.blockchain.broadcast(tx).await })
		});

		match res {
			Ok(_) => {}
			Err(err) => {
				log_error!(self.logger, "Failed to broadcast transaction: {}", err);
			}
		}
	}
}

```

  </template>

  <template v-slot:kotlin>

```java

// Using BDK (Bitcoin Dev Kit) to broadcast a transaction via the esplora client
object YourTxBroadcaster : BroadcasterInterface.BroadcasterInterfaceInterface {
    override fun broadcast_transaction(tx: ByteArray?) {
		val esploraURL = "esploraUrl"
        val blockchainConfig = BlockchainConfig.Esplora(EsploraConfig(esploraURL, null, 5u, 20u, null))
        val blockchain = Blockchain(blockchainConfig)

		val uByteArray = UByteArray(tx.size) { tx[it].toUByte() }
		val transaction = Transaction(uByteArray.toList())

		tx?.let {
            CoroutineScope(Dispatchers.IO).launch { 
				blockchain.broadcast(transaction) 
			}
        } ?: throw(IllegalStateException("Broadcaster attempted to broadcast a null transaction"))

    }
}

```

  </template>

  <template v-slot:swift>

```Swift
// Using BDK (Bitcoin Dev Kit) to broadcast a transaction via the esplora client
import BitcoinDevKit

class MyBroacaster: BroadcasterInterface {
    override func broadcastTransactions(txs: [[UInt8]]) {
        let esploraURL = "esploraUrl"
        let esploraConfig = EsploraConfig(baseUrl: esploraURL, proxy: nil, concurrency: 5, stopGap: 20, timeout: nil)
        let blockchainConfig = BlockchainConfig.esplora(config: esploraConfig)
        do {
            let blockchain = try Blockchain(config: blockchainConfig)
            for tx in txs {
                let transaction = try Transaction(transactionBytes: tx)
                try blockchain.broadcast(transaction: transaction)
            }
        } catch {
            print("Failed to broadcast transaction: \(error.localizedDescription)")
        }
    }
}
```

  </template>

</CodeSwitcher>

::: tip Keep LDK in sync

Remember if you are restarting and have open channels then you should [let LDK know about the latest channel state.](./setting-up-a-channel-manager/#sync-channelmonitors-and-channelmanager-to-chain-tip)

:::
