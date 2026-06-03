# Sending Payments

Lightning payments are used to pay invoices, which are typically encoded as a
string in accordance with BOLT 11. After parsing the invoice, you'll need to
find a route from your node to the recipient and then make the payment using
`ChannelManager`.

::: code-group

```rust [Rust]
use lightning_invoice::Bolt11Invoice;
use lightning::ln::channelmanager::{PaymentId, Retry, RouteParametersConfig};
use bitcoin::hashes::Hash;
use std::str::FromStr;
use std::time::Duration;

// Parse the invoice.
let invoice = Bolt11Invoice::from_str(encoded_invoice)
	.expect("ERROR: failed to parse invoice");

// `pay_for_bolt11_invoice` derives the route parameters and retries internally.
// The old `router::get_route` + `send_payment(&route, ..)` flow and the
// `InvoicePayer` abstraction were removed.
let payment_id = PaymentId((*invoice.payment_hash()).to_byte_array());
channel_manager
	.pay_for_bolt11_invoice(
		&invoice,
		payment_id,
		None, // amount_msats: None uses the invoice's amount
		RouteParametersConfig::default(),
		Retry::Timeout(Duration::from_secs(10)),
	)
	.expect("ERROR: failed to send payment");
```

```java [Kotlin]
// Get an invoice from the recipient/payee
val parseRes = Bolt11Invoice.from_str(recipientInvoice)
val invoice = (parseRes as Result_Bolt11InvoiceParseOrSemanticErrorZ.Result_Bolt11InvoiceParseOrSemanticErrorZ_OK).res

// `UtilMethods.payment_parameters_from_invoice` was removed —
// `pay_for_bolt11_invoice` builds the route parameters for you.
val res = channelManager.pay_for_bolt11_invoice(
    invoice,
    paymentId,                            // ByteArray (32) — your idempotency id
    Option_u64Z.none(),                   // amount_msats (none = use invoice amount)
    RouteParametersConfig.with_default(),
    Retry.attempts(5)
)

if (res.is_ok) {
  // Payment success
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// Parse the invoice.
const parsed = ldk.Bolt11Invoice.constructor_from_str(invoiceString);
if (!(parsed instanceof ldk.Result_Bolt11InvoiceParseOrSemanticErrorZ_OK)) {
  return; // invalid invoice
}
const invoice = parsed.res;

// The TS bindings have no `pay_for_bolt11_invoice` helper, and
// `payment_parameters_from_invoice` was removed — build route params from the
// invoice, then call `send_payment`.
const paymentParams = ldk.PaymentParameters.constructor_from_bolt11_invoice(invoice);
const amtMsat = (invoice.amount_milli_satoshis() as ldk.Option_u64Z_Some).some;
const routeParams = ldk.RouteParameters.constructor_from_payment_params_and_value(
  paymentParams,
  amtMsat
);

const res = channelManager.send_payment(
  invoice.payment_hash(), // Uint8Array
  ldk.RecipientOnionFields.constructor_secret_only(invoice.payment_secret()),
  paymentId,              // Uint8Array — your idempotency id
  routeParams,
  ldk.Retry.constructor_attempts(5)
);
if (res.is_ok()) {
  // Payment sent
}
```

:::

# PaymentSent & PaymentFailed Event Handling

An event is generated once a payment has completed. Successful payments result
in a `PaymentSent` event with the preimage of the payment hash. Be sure to look
out for a `PaymentFailed` event, if the payment fails for some reason, and act
accordingly.

::: code-group

```rust [Rust]
// In the async event handler passed to process_events_async.
// Note `PaymentFailed` now carries `payment_id` + optional `reason`
// (the old `rejected_by_dest` field is gone).
match event {
	Event::PaymentSent { payment_preimage, payment_hash, .. } => {
		// Handle successful payment
	}
	Event::PaymentFailed { payment_id, payment_hash, reason } => {
		// Handle failed payment
	}
	// ...
	_ => {}
}
```

```java [Kotlin]
// In your ChannelManagerConstructor.EventHandler
if (event is Event.PaymentSent) {
    // Handle successful payment
}

if (event is Event.PaymentFailed) {
    // Handle failed payment
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// In your EventHandler (see Handling Events)
if (event instanceof ldk.Event_PaymentSent) {
  // Handle successful payment
} else if (event instanceof ldk.Event_PaymentFailed) {
  // Handle failed payment
}
```

:::

**References:** [Rust `PaymentSent` docs](https://docs.rs/lightning/0.2.2/lightning/events/enum.Event.html#variant.PaymentSent), [Rust `PaymentFailed` docs](https://docs.rs/lightning/0.2.2/lightning/events/enum.Event.html#variant.PaymentFailed), [Java/Kotlin `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Event.java), [TypeScript `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/ts/structs/Event.mts)