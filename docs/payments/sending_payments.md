# Sending Payments

Lightning payments are used to pay invoices, which are typically encoded as a
string in accordance with BOLT 11. After parsing the invoice, you'll need to
find a route from your node to the recipient and then make the payment using
`ChannelManager`.

<CodeSwitcher :languages="{rust:'Rust', java:'Java'}">
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
  <template v-slot:java>

```java
String invoice_str = // get an invoice from the payee
Result_InvoiceNoneZ parsed_invoice = Invoice.from_str(invoice_str);

if (parsed_invoice instanceof Result_InvoiceNoneZ.Result_InvoiceNoneZ_OK) {
	Invoice invoice = ((Result_InvoiceNoneZ.Result_InvoiceNoneZ_OK) parsed_invoice).res;
    long amt_msat = 0;
    if (invoice.amount_pico_btc() instanceof Option_u64Z.Some) {
        amt_msat = ((Option_u64Z.Some)invoice.amount_pico_btc()).some / 10;
    }
    if (amt_msat == 0) {
        // <Handle a zero-value invoice>
    }

    Route route;
    try (LockedNetworkGraph netgraph = router.read_locked_graph()) {
        NetworkGraph graph = netgraph.graph();
        Result_RouteLightningErrorZ route_res = UtilMethods.get_route(
			channel_manager.get_our_node_id(),
            graph, invoice.recover_payee_pub_key(), invoice.features(),
            channel_manager.list_usable_channels(), invoice.route_hints(),
            amt_msat, invoice.min_final_cltv_expiry(), logger);
        assert route_res instanceof Result_RouteLightningErrorZ.Result_RouteLightningErrorZ_OK;
        route = ((Result_RouteLightningErrorZ.Result_RouteLightningErrorZ_OK) route_res).res;
    }

    Result_NonePaymentSendFailureZ payment_res = channel_manager.send_payment(
		route, invoice.payment_hash(), invoice.payment_secret());
    assert payment_res instanceof Result_NonePaymentSendFailureZ.Result_NonePaymentSendFailureZ_OK;
}
```

  </template>
</CodeSwitcher>

An event is generated once a payment has completed. Successful payments result
in a `PaymentSent` event with the preimage of the payment hash. Be sure to look
out for a `PaymentFailed` event, if the payment fails for some reason, and act
accordingly.

<CodeSwitcher :languages="{rust:'Rust', java:'Java'}">
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
  <template v-slot:java>

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

  </template>
</CodeSwitcher>
