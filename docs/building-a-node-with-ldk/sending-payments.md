# Sending Payments

Lightning payments are used to pay invoices, which are typically encoded as a
string in accordance with BOLT 11. After parsing the invoice, you'll need to
find a route from your node to the recipient and then make the payment using
`ChannelManager`.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

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

  </template>
  <template v-slot:kotlin>

```java
// Get an invoice from the recipient/payee
val parsedInvoice = Bolt11Invoice.from_str(recipientInvoice)
val invoiceVal = (parsedInvoice as Result_Bolt11InvoiceSignOrCreationErrorZ.Result_Bolt11InvoiceSignOrCreationErrorZ_OK).res

val res = UtilMethods.pay_invoice(invoice, Retry.attempts(6), channelManager)

if (res.is_ok) {
  // Payment success
}
```

  </template>

  <template v-slot:swift>

```Swift
let invoiceStr = // get an invoice from the payee
let parsedInvoice = Bolt11Invoice.fromStr(s: invoiceStr)

if let invoiceVal = parsedInvoice.getValue() {
  let invoicePaymentResult = Bindings.paymentParametersFromInvoice(invoice: invoiceVal)
  guard invoicePaymentResult.isOk() else {
    return false
  }
  let (paymentHash, recipientOnion, routeParams) = Bindings.paymentParametersFromInvoice(invoice: invoiceVal).getValue()!
  let paymentId = invoice.paymentHash()!
  let res = channelManager.sendPayment(
    paymentHash: paymentHash, 
    recipientOnion: recipientOnion, 
    paymentId: paymentId, 
    routeParams: routeParams, 
    retryStrategy: .initWithTimeout(a: 15)
  )

  if res.isOk() {
    // Payment Sent
  }
}
```

  </template>

</CodeSwitcher>

# PaymentSent & PaymentFailed Event Handling

An event is generated once a payment has completed. Successful payments result
in a `PaymentSent` event with the preimage of the payment hash. Be sure to look
out for a `PaymentFailed` event, if the payment fails for some reason, and act
accordingly.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

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

  </template>
  <template v-slot:kotlin>

```java
// In the `handleEvent` method of ChannelManagerPersister implementation
if(event is Event.PaymentSent) {
    // Handle successful payment
}

if(event is Event.PaymentFailed) {
    // Handle failed payment
}
```

  </template>

  <template v-slot:swift>

```Swift
// In the `handleEvent` method of ChannelManagerPersister implementation
if let paymentSentEvent = event.getValueAsPaymentSent() {
  // Handle successful payment
} else if let paymentFailedEvent = event.getValueAsPaymentFailed() {
  // Handle failed payment
}
```

  </template>

</CodeSwitcher>

**References:** [Rust `PaymentSent` docs](https://docs.rs/lightning/*/lightning/events/enum.Event.html#variant.PaymentSent),[Rust `PaymentFailed` docs](https://docs.rs/lightning/*/lightning/events/enum.Event.html#variant.PaymentFailed), [Java/Kotlin `PaymentSent` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java#L464), [Java/Kotlin `PaymentFailed` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java#L512)