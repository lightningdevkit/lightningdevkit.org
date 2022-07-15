# Managing Channels

Channels are the basic building blocks of the Lightning Network. With channels,
you can transact not only with your immediate peers but with others on the
network. Let's explore how to open and close channels with LDK.

## Opening a Channel

Now that you have a peer, you can open a channel with them using
`ChannelManager`. You'll need the peer's pubkey as before along with:

* the amount in sats to use when funding the channel,
* any msats to push to your peer,
* an id which is given back in the `FundingGenerationReady` event, and
* an optional `UserConfig` for overriding `ChannelManager` defaults

Channels can be announced to the network or can remain private, which is
controlled via `UserConfig::announced_channel`.

<CodeSwitcher :languages="{rust:'Rust', java:'Java'}">
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
  <template v-slot:java>

```java
long amount = 10_000L;
long push_msat = 1_000L;
long user_id = 42L;
UserConfig config = UserConfig.with_defaults();
config.get_channel_options().set_announced_channel(true);

Result_NoneAPIErrorZ create_channel_result = channel_manager.create_channel(
    pubkey, amount, push_msat, user_id, config);
assert create_channel_result instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;
```

  </template>
</CodeSwitcher>

At this point, an outbound channel has been initiated with your peer and it will
appear in `ChannelManager::list_channels`. However, the channel  is not yet
funded. Once your peer accepts the channel, you will be notified with a
`FundingGenerationReady` event. It's then your responsibility to construct the
funding transaction and pass it to `ChannelManager`, which will broadcast it
once it receives your channel counterparty's signature.

<CodeSwitcher :languages="{rust:'Rust', java:'Java'}">
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
  <template v-slot:java>

```java
// After the peer responds with an `accept_channel` message, an
// Event.FundingGenerationReady event will be generated.

// In the `handle_event` method of ChannelManagerPersister implementation
if (e instanceof Event.FundingGenerationReady) {
	Event.FundingGenerationReady event = (Event.FundingGenerationReady) e;
	byte[] funding_scriptpubkey = event.output_script;
	long output_value = event.channel_value_satoshis;

	// This is the same channel created earler
	assert event.user_channel_id == 42;

	// The output is always a P2WSH:
	assert funding_scriptpubkey.length == 34 && funding_scriptpubkey[0] == 0 &&
		funding_scriptpubkey[1] == 32;

	// Generate the funding transaction for the channel based on the channel amount
	// The following uses the bitcoinj library to do so, but you can use any
	// standard Bitcoin library for on-chain logic.
	NetworkParameters bitcoinj_net =
		NetworkParameters.fromID(NetworkParameters.ID_MAINNET);
	Transaction funding_tx = new Transaction(bitcoinj_net);
	funding_tx.addInput(new TransactionInput(bitcoinj_net, funding, new byte[0]));
	// Note that all inputs in the funding transaction MUST spend SegWit outputs
	// (and have witnesses)
	funding_tx.getInputs().get(0).setWitness(new TransactionWitness(2));
	funding_tx.getInput(0).getWitness().setPush(0, new byte[]{0x1});
	funding_tx.addOutput(Coin.SATOSHI.multiply(output_value),
		new Script(funding_scriptpubkey));

	// Give the funding transaction back to the ChannelManager.
	Result_NoneAPIErrorZ funding_res = channel_manager.funding_transaction_generated(
		event.temporary_channel_id, funding_tx.bitcoinSerialize());
	// funding_transaction_generated should only generate an error if the
	// transaction didn't meet the required format (or the counterparty already
	// closed the channel on us):
	assert funding_res instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;
}
```

  </template>
</CodeSwitcher>

After `ChannelManager` has broadcast the funding transaction, the channel will
become usable once the transaction has enough confirmations and will appear in
`ChannelManager::list_usable_channels`. See the guide on
[Blockchain Data](../blockchain_data/introduction.md) for details on confirmations.

With a fully funded channel, you can now make Lightning payments! No more hefty
on-chain fees and long confirmation times when you're transacting on layer 2.

## Closing a Channel

While a channel can remain open indefinitely, there may come a time when you
need to close it. There are two ways to close a channel: either cooperatively or
unilaterally. The cooperative case makes for lower fees and immediate access to
funds while the unilateral case does not. The latter may be necessary if your
peer isn't behaving properly or has gone offline.

<CodeSwitcher :languages="{rust:'Rust', java:'Java'}">
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
  <template v-slot:java>

```java
// Example: Cooperative close (assuming 1 open channel)
byte[] channel_id = channel_manager.list_channels()[0].get_channel_id();
Result_NoneAPIErrorZ close_result = channel_manager.close_channel(
    channel_id);
assert close_result instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;

// Example: Unilateral close (assuming 1 open channel)
byte[] channel_id = channel_manager.list_channels()[0].get_channel_id();
Result_NoneAPIErrorZ channel_manager.force_close_channel(channel_id);
```

  </template>
</CodeSwitcher>

Now that we know how to manage channels, let's put our new channel to use!
