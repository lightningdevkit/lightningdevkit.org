# Using LDK

## Introduction

In this guide, we'll cover common operations when using LDK after you've set up
your lightning node.

* [Connecting Peers](#connecting-peers) shows how get on the Lightning Network.
* [Managing Channels](#managing-channels) covers the ins and outs of channels
  management.
* [Sending Payments](#sending-payments) demonstrates making payments using your
  channels.
* [Receiving Payments](#receiving-payments) walks through how to get paid via
  lightning.

Time to roll up your sleeves!

## Connecting Peers

First things first, let's join the Lightning Network! Connections to other peers
are established with `PeerManager`. You'll need to know the pubkey and address
of another node that you want as a peer. Once the connection is established and
the handshake is complete, `PeerManager` will show the peer's pubkey in its list
of peers.

:::: tabs
::: tab "Rust"

```rust
match lightning_net_tokio::connect_outbound(Arc::clone(&peer_manager), pubkey, address).await {
	Some(connection_closed_future) => {
		let mut connection_closed_future = Box::pin(connection_closed_future);
		loop {
			// Make sure the connection is still established.
			match futures::poll!(&mut connection_closed_future) {
				std::task::Poll::Ready(_) => {
					panic!("ERROR: Peer disconnected before handshake completed");
				}
				std::task::Poll::Pending => {}
			}

			// Wait for the handshake to complete.
			match peer_manager.get_peer_node_ids().iter().find(|id| **id == pubkey) {
				Some(_) => break,
				None => tokio::time::sleep(std::time::Duration::from_millis(10)).await,
			}
		}
	}
	None => panic!("ERROR: Failed to connect to peer"),
}
```

:::
::: tab "Java"

```java
try {
	// Connect and wait for the handshake to complete.
	SocketAddress address = new InetSocketAddress(host, port);
	nio_peer_handler.connect(pubkey, address);

	// The peer's pubkey will be present in the list of peer ids.
	final PeerManager peer_manager = channel_manager_constructor.peer_manager;
	byte[][] peer_node_ids = peer_manager.get_peer_node_ids();
}
catch (java.io.IOException e) {
	// Handle failure to successfully connect to a peer.
}
```

:::
::::

## Managing Channels

Channels are the basic building blocks of the Lightning Network. With channels,
you can transact not only with your immediate peers but with others on the
network. Let's explore how to open and close channels with LDK.

### Opening a Channel

Now that you have a peer, you can open a channel with them using
`ChannelManager`. You'll need the peer's pubkey as before along with:

* the amount in sats to use when funding the channel,
* any msats to push to your peer,
* an id which is given back in the `FundingGenerationReady` event, and
* an optional `UserConfig` for overriding `ChannelManager` defaults

Channels can be announced to the network or can remain private, which is
controlled via `UserConfig::announced_channel`.

:::: tabs
::: tab "Rust"

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

:::
::: tab "Java"

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

:::
::::

At this point, an outbound channel has been initiated with your peer and it will
appear in `ChannelManager::list_channels`. However, the channel  is not yet
funded. Once your peer accepts the channel, you will be notified with a
`FundingGenerationReady` event. It's then your responsibility to construct the
funding transaction and pass it to `ChannelManager`, which will broadcast it
once it receives your channel counterparty's signature.

:::: tabs
::: tab "Rust"

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

:::
::: tab "Java"

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

:::
::::

After `ChannelManager` has broadcast the funding transaction, the channel will
become usable once the transaction has enough confirmations and will appear in
`ChannelManager::list_usable_channels`. See the guide on
[Blockchain Data](blockdata.md) for details on confirmations.

With a fully funded channel, you can now make Lightning payments! No more hefty
on-chain fees and long confirmation times when you're transacting on layer 2.

### Closing a Channel

While a channel can remain open indefinitely, there may come a time when you
need to close it. There are two ways to close a channel: either cooperatively or
unilaterally. The cooperative case makes for lower fees and immediate access to
funds while the unilateral case does not. The latter may be necessary if your
peer isn't behaving properly or has gone offline.

:::: tabs
::: tab "Rust"

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

:::
::: tab "Java"

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

:::
::::

Now that we know how to manage channels, let's put our new channel to use!

## Sending Payments

Lightning payments are used to pay invoices, which are typically encoded as a
string in accordance with BOLT 11. After parsing the invoice, you'll need to
find a route from your node to the recipient and then make the payment using
`ChannelManager`.

:::: tabs
::: tab "Rust"

```rust
// Parse the invoice.
let invoice = Invoice::from_str(encoded_invoice)
	.expect("ERROR: failed to parse invoice");

let amt_pico_btc = invoice.amount_pico_btc()
	.expect("ERROR: invalid invoice: must contain amount to pay");
let amt_msat = amt_pico_btc / 10;
let payer_pubkey = channel_manager.get_our_node_id();
let network_graph = router.network_graph.read().unwrap();
let payee_pubkey = invoice.recover_payee_pub_key();
let payee_features = invoice.features().cloned();
let first_hops = channel_manager.list_usable_channels();
let last_hops = invoice.route_hints();
let final_cltv = invoice.min_final_cltv_expiry() as u32;

// Find a route and send the payment.
let route = router::get_route(
	&payer_pubkey, &network_graph, &payee_pubkey, payee_features,
	Some(&first_hops.iter().collect::<Vec<_>>()), &last_hops,
	amt_msat, final_cltv, logger.clone(),
).expect("ERROR: failed to find route");

let payment_hash = PaymentHash(invoice.payment_hash().clone().into_inner());
let payment_secret = invoice.payment_secret().cloned();

channel_manager.send_payment(&route, payment_hash, &payment_secret)
	.expect("ERROR: failed to send payment");
```

:::
::: tab "Java"

```java
String invoice_str = // get an invoice from the payee
Result_InvoiceNoneZ parsed_invoice = Invoice.from_str(invoice_str);

if (parsed_invoice instanceof Result_InvoiceNoneZ.Result_InvoiceNoneZ_OK) {
	Invoice invoice = ((Result_InvoiceNoneZ.Result_InvoiceNoneZ_OK) parsed_invoice).res;
    long amt = 0;
    if (invoice.amount_pico_btc() instanceof Option_u64Z.Some) {
        amt = ((Option_u64Z.Some)invoice.amount_pico_btc()).some;
    }
    if (amt == 0) {
        // <Handle a zero-value invoice>
    }

    Route route;
    try (LockedNetworkGraph netgraph = router.read_locked_graph()) {
        NetworkGraph graph = netgraph.graph();
        Result_RouteLightningErrorZ route_res = UtilMethods.get_route(
			channel_manager.get_our_node_id(),
            graph, invoice.recover_payee_pub_key(), invoice.features(),
            channel_manager.list_usable_channels(), invoice.route_hints(), amt,
            invoice.min_final_cltv_expiry(), logger);
        assert route_res instanceof Result_RouteLightningErrorZ.Result_RouteLightningErrorZ_OK;
        route = ((Result_RouteLightningErrorZ.Result_RouteLightningErrorZ_OK) route_res).res;
    }

    Result_NonePaymentSendFailureZ payment_res = channel_manager.send_payment(
		route, invoice.payment_hash(), invoice.payment_secret());
    assert payment_res instanceof Result_NonePaymentSendFailureZ.Result_NonePaymentSendFailureZ_OK;
}
```

:::
::::

An event is generated once a payment has completed. Successful payments result
in a `PaymentSent` event with the preimage of the payment hash. Be sure to look
out for a `PaymentFailed` event, if the payment fails for some reason, and act
accordingly.

:::: tabs
::: tab "Rust"

```rust
// In the event handler passed to BackgroundProcessor::start
match event {
	Event::PaymentSent { payment_preimage } => {
		// Handle successful payment
	}
	Event::PaymentFailed { payment_hash, rejected_by_dest } => {
		// Handle failed payment
	}
	// ...
}
```

:::
::: tab "Java"

```java
// In the `handle_event` method of ChannelManagerPersister implementation
else if (e instanceof Event.PaymentSent) {
	// Handle successful payment
	Event.PaymentSent event = ((Event.PaymentSent) e);
}
else if (e instanceof Event.PaymentFailed) {
	// Handle failed payment
	Event.PaymentFailed event = ((Event.PaymentFailed) e);
}
```

:::
::::

## Receiving Payments

To receive a payment, you'll need to create an invoice of your own with an
amount and description. `ChannelManager` contains the remaining information
needed for the invoice. Use the provided utility to generate an invoice and
register a pending payment in `ChannelManager`.

:::: tabs
::: tab "Rust"

```rust
let amt_msat = 10_000;
let description = "coffee".to_string();
let invoice = match utils::create_invoice_from_channelmanager(
	&channel_manager,
	keys_manager,
	currency,
	Some(amt_msat),
	description,
).expect("ERROR: failed to create invoice");
let encoded_invoice = invoice.to_string();
```

:::
::: tab "Java"

```java
String description = "coffee";
long amt_msat = 10_000L;
Result_InvoiceSignOrCreationErrorZ invoice = UtilMethods.invoice_from_channelmanager(
    channel_manager, keys_manager.as_KeysInterface(), LDKCurrency.LDKCurrency_Bitcoin,
	Option_u64Z.some(amt_msat), description);
assert invoice instanceof
    Result_InvoiceSignOrCreationErrorZ.Result_InvoiceSignOrCreationErrorZ_OK;
Invoice invoice = ((Result_InvoiceSignOrCreationErrorZ.Result_InvoiceSignOrCreationErrorZ_OK) invoice).res;
String encoded_invoice = invoice.to_str();
```

:::
::::

While it is possible to create an invoice without using the utility,
`ChannelManager` will reject any incoming HTLCs for unregistered payments to
protect your privacy. In this case, use either `create_inbound_payment` or
`create_inbound_payment_for_hash` to register a payment with `ChannelManager`
before creating the invoice with the returned payment hash and/or secret.

As with sending a payment, LDK will generate an event once a payment is
received. It is your responsibility to handle the `PaymentReceived` event by
using `ChannelManager` to release the preimage and claim the funds.

:::: tabs
::: tab "Rust"

```rust
// In the event handler passed to BackgroundProcessor::start
match event {
	Event::PaymentReceived { payment_hash, payment_preimage, payment_secret, amt, .. } => {
		let payment_hash = hex_utils::hex_str(&payment_hash.0);
		match channel_manager.claim_funds(payment_preimage.unwrap()) {
			true => println!("EVENT: received payment for {}", payment_hash),
			false => panic!("ERROR: failed to claim payment for {}", payment_hash),
		}
	}
	// ...
}
```

:::
::: tab "Java"

```java
// In the `handle_event` method of ChannelManagerPersister implementation
else if (e instanceof Event.PaymentReceived) {
	// Handle successful payment
	Event.PaymentReceived event = ((Event.PaymentReceived) e);
	assert event.payment_preimage insanceof Option_PaymentPreimageZ;
	byte[] payment_preimage = ((Option_PaymentPreimageZ.Some) event.payment_preimage).some;
	assert channel_manager.claim_funds(payment_preimage);
}
```

:::
::::

## Conclusion

So there you have it! Those are the basics of using LDK. As you can see, LDK
offers a ton of flexibility for building Lightning-enabled wallets and apps.
