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
	assert event.payment_preimage instanceof Option_PaymentPreimageZ;
	byte[] payment_preimage = ((Option_PaymentPreimageZ.Some) event.payment_preimage).some;
	assert channel_manager.claim_funds(payment_preimage);
}
```

:::
::::
