---
id: handle_events
title: "Handling LDK Events"
---

## Introduction

LDK produces events that must be handled by the user, such as when a payment is
received or a when funding transaction must be generated.

:::note
This guide assumes that you've followed the steps in [Building a Node with LDK](build_node.md)
:::

### References
#### [Integrated example in Rust](XXX)
#### [LDK `Event` documentation](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html)
#### [Events in Java](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java)

## Event Handling
### 0. Setup

**What it's used for:** regularly retrieving events from `ChannelManager` and `ChainMonitor` for handling

**Example:**
```rust
// On startup, start this loop.
loop {
	let mut events = channel_manager.get_and_clear_pending_events();
	events.append(&mut chain_monitor.get_and_clear_pending_events());
	for event in events {
        match event {
            // Event handling goes here in the upcoming steps
            ...
        }
    }
}
```
**Dependencies:** `ChannelManager`, `ChainMonitor`

### 1. `FundingGenerationReady`
**What it's used for:** indicates that you should generate a funding transaction
with the given parameters and give it to LDK

**Example:**
```rust
...
match event {
	Event::FundingGenerationReady {
		temporary_channel_id,
		channel_value_satoshis,
		output_script,
		..
	} => {
		// Construct the raw transaction with one output, that is paid
		// the amount of the channel.
		let addr = WitnessProgram::from_scriptpubkey(
			&output_script[..],
			// Put whatever network you're running on here
			bitcoin_bech32::constants::Network::Testnet
		)
		.expect("Funding tx should always be to a SegWit output")
		.to_address();
		let mut outputs = vec![HashMap::with_capacity(1)];
		outputs[0].insert(
			addr,
			channel_value_satoshis as f64 / 100_000_000.0
		);
		let raw_tx = bitcoind_client.create_raw_transaction(outputs)
                                    .await;

		// Have your wallet put the inputs into the transaction such
		// that the output is satisfied.
		let funded_tx = bitcoind_client.fund_raw_transaction(raw_tx)
                                       .await;

		// Sign the final funding transaction and broadcast it.
		let signed_tx =
			bitcoind_client.sign_raw_transaction_with_wallet(funded_tx.hex).await;
		assert_eq!(signed_tx.complete, true);
		let final_funding_tx: Transaction =
			encode::deserialize(&hex_utils::to_vec(&signed_tx.hex)
                               .unwrap()).unwrap();
		// Give the funding transaction back to LDK for opening the
		// channel.
		channel_manager
			.funding_transaction_generated(&temporary_channel_id, final_funding_tx);
	}
	...
}
```
**Implementation notes:** 
* All inputs in the funding transaction must spend SegWit outputs
* The final funding transaction must be passed to `channel_manager.funding_transaction_generated(..)`

**Dependencies:** `ChannelManager`

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html#variant.FundingGenerationReady)

### 2. `PaymentReceived`

**What it's used for:** this is the only way in LDK to know when you've received a payment.

**Example:**
```rust
...
match event {
    ...
    Event::PaymentReceived { payment_hash, payment_secret, amt: amt_msat } => {
        let preimage = // insert code to retrieve the payment preimage that you
                       // stored on invoice generation
        
        // If we know the preimage, claim the payment.
        if found_preimage {
            // `claim_funds` returns true if the payment was successfully
            // claimed, else it returns false.
            assert!(
                channel_manager.claim_funds(preimage, &payment_secret, amt_msat)
            );
        } else {
            // If we were unable to find the preimage, fail the payment
            // backwards.
			channel_manager.fail_htlc_backwards(&payment_hash, &payment_secret);
        }
        
    }
    ...
}
            
```
**Implementation notes:** 
* If you know the preimage corresponding to the given payment hash, then
`channel_manager.claim_funds(..)` must be called to claim the payment
* If you don't know the preimage, then `channel_manager.fail_htlc_backwards(..)` must be called to fail the payment
* You must store the payment preimage on invoice generation, LDK doesn't store it

**Dependencies:** `ChannelManager`

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html#variant.PaymentReceived)

### 3. `PaymentSent`
**What it's used for:** this is the only way in LDK to know when you've successfully sent a payment.

**Example:**
```rust
...
match event {
    ...
    Event::PaymentSent { payment_preimage } => {
        // insert code to store the payment preimage as proof of payment and/or
        // notify the user
    }
    ...
}
```
**Implementation notes:** this is your chance to store the preimage as proof of payment. You may also want to notify the user that their payment succeeded, and/or update any "list of payments" UIs.

**Dependencies:** a way to store preimages

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html#variant.PaymentSent)

### 4. `PaymentFailed`

**What it's used for:** this is the only way in LDK to know when a payment has failed to send.

**Example:**
```rust
match event {
    ...
    Event::PaymentFailed { payment_hash, .. } => {
        // insert code to store the result of the payment and/or notify the user
    }
    ...
}
```

**Implementation notes:** this is your chance to store the result of the payment. You may also want to notify the user that their payment failed, and/or update any "list of payments" UIs.

**Dependencies:** a way to store payment results

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html#variant.PaymentFailed)

### 5. `PendingHTLCsForwardable`

**What it's used for:** indicates that there are HTLCs that need to be forwarded through your node. 

**Example:**
```rust
match event {
    ...
    Event::PendingHTLCsForwardable { time_forwardable } => {
		// To mitigate payment correlation, forward the payment at a random time
		// between `time_forwardable` and `5 * time_forwardable`.
		let min = time_forwardable.as_millis() as u64;
		let millis_to_sleep = thread_rng().gen_range(min, min * 5) as u64;
		tokio::time::sleep(Duration::from_millis(millis_to_sleep)).await;
		channel_manager.process_pending_htlc_forwards();
    }
    ...
}
```
**Implementation notes:** The reason LDK tells you about pending forwardable HTLCs rather than just forwarding them directly is to give you a chance to mitiate "payment correlation" -- the ability for outside eavesdroppers to correlate payments back to your node.

**Dependencies:** `ChannelManager`

**References:** [Rust docs](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html#variant.PendingHTLCsForwardable)

### 6. `SpendableOutputs`

**What it's used for:** indicates that a channel closed and you need to pay its funds back to your on-chain wallet.

**Example:**
```rust
match event {
    ...
    Event::SpendableOutputs { outputs } => {
		// First, get the address that the former channel funds should be
		// spent to.
		let destination_address = bitcoind_client.get_new_address().await;
        
		// Next, use LDK's `spend_spendable_outputs` utility to get a
		// transaction that spends these outputs to the desired address from
		// above.
		let output_descriptors = &outputs.iter().map(|a| a).collect::<Vec<_>>();
		let tx_feerate =
			bitcoind_client.get_est_sat_per_1000_weight(ConfirmationTarget::Normal);
		let spending_tx = keys_manager
			.spend_spendable_outputs(
				output_descriptors,
				Vec::new(),
				destination_address.script_pubkey(),
				tx_feerate,
				&Secp256k1::new(),
			)
			.unwrap();
        
		// Finally, broadcast the transaction that spends the funds back to your
		// wallet.
		bitcoind_client.broadcast_transaction(&spending_tx);
    }
    ...
}
```

**Implementation notes:** while the example above simply pays to a destination address, see the docs for `keys_manager.spend_spendable_outputs(..)` for more options.

**Dependencies:** `KeysManager`, `BroadcasterInterface`, an on-chain bitcoin destination address

**References:** [`SpendableOutputs` event Rust docs](https://docs.rs/lightning/*/lightning/util/events/enum.Event.html#variant.SpendableOutputs), [`keys_manager.spend_spendable_outputs(..)` Rust docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html#method.spend_spendable_outputs)
