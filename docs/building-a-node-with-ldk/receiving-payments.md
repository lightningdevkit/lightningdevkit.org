# Receiving Payments

To receive a payment, you'll need to create an invoice of your own with an
amount and description. `ChannelManager` contains the remaining information
needed for the invoice. Use the provided utility to generate an invoice and
register a pending payment in `ChannelManager`.

::: code-group

```rust [Rust]
// The standalone `utils::create_invoice_from_channelmanager` was removed in
// lightning-invoice 0.34. Invoice creation now lives on the ChannelManager and
// takes a single `Bolt11InvoiceParameters`; it registers the inbound payment
// for you. The invoice currency is inferred from the manager's network.
use lightning::ln::channelmanager::Bolt11InvoiceParameters;

let mut invoice_params = Bolt11InvoiceParameters::default();
invoice_params.amount_msats = Some(amt_msat);
invoice_params.invoice_expiry_delta_secs = Some(expiry_secs);
// Set `description` and other fields on `invoice_params` as needed.

let invoice = match channel_manager.create_bolt11_invoice(invoice_params) {
    Ok(inv) => {
        println!("SUCCESS: generated invoice: {}", inv);
        inv
    }
    Err(e) => {
        println!("ERROR: failed to create invoice: {:?}", e);
        return;
    }
};
```

```kotlin [Kotlin]
// `UtilMethods.create_invoice_from_channelmanager` was removed — use
// `channelManager.create_bolt11_invoice(..)` instead.
val descriptionRes = Description.of("description")
val description = (descriptionRes as Result_DescriptionCreationErrorZ.Result_DescriptionCreationErrorZ_OK).res

val amtMsat: Long = 3_000_000
val invoice = channelManager.create_bolt11_invoice(
    Option_u64Z.some(amtMsat),                    // amount_msats
    Bolt11InvoiceDescription.direct(description),  // description
    Option_u32Z.some(300),                         // invoice_expiry_delta_secs
    Option_u16Z.some(144),                         // min_final_cltv_expiry_delta
    Option_ThirtyTwoBytesZ.none()                  // payment_hash (none = auto)
)

val invoiceResult = (invoice as Result_Bolt11InvoiceSignOrCreationErrorZ.Result_Bolt11InvoiceSignOrCreationErrorZ_OK).res
val encodedInvoice = invoiceResult.to_str()
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// `create_bolt11_invoice` lives on the ChannelManager (the old
// `UtilMethods.create_invoice_from_channelmanager` was removed).
const descRes = ldk.Description.constructor_new("description");
const description = (descRes as ldk.Result_DescriptionCreationErrorZ_OK).res;

const invoiceRes = channelManager.create_bolt11_invoice(
  ldk.Option_u64Z.constructor_some(BigInt(3_000_000)),  // amount_msats
  ldk.Bolt11InvoiceDescription.constructor_direct(description),
  ldk.Option_u32Z.constructor_some(300),                // invoice_expiry_delta_secs
  ldk.Option_u16Z.constructor_some(144),                // min_final_cltv_expiry_delta
  ldk.Option_ThirtyTwoBytesZ.constructor_none()         // payment_hash (none = auto)
);
if (invoiceRes instanceof ldk.Result_Bolt11InvoiceSignOrCreationErrorZ_OK) {
  const encodedInvoice = invoiceRes.res.to_str();
}
```

:::

While it is possible to create an invoice without using the utility,
`ChannelManager` will reject any incoming HTLCs for unregistered payments to
protect your privacy. In this case, use either `create_inbound_payment` or
`create_inbound_payment_for_hash` to register a payment with `ChannelManager`
before creating the invoice with the returned payment hash and/or secret. 
You might also opt to for `inbound_payment`, useful for generating invoices for [phantom node payments](https://docs.rs/lightning/0.2.2/lightning/sign/struct.PhantomKeysManager.html) without a ChannelManager.

# PaymentClaimable Event Handling

As with sending a payment, LDK will generate an event once a payment is
received. It is your responsibility to handle the `PaymentClaimable` event by
using `ChannelManager` to release the preimage and claim the funds.

::: code-group

```rust [Rust]
// `PaymentClaimable` has several more fields in 0.2; use `..` to ignore them.
// `PaymentPurpose::InvoicePayment` was split into BOLT11/BOLT12 variants.
Event::PaymentClaimable { payment_hash, purpose, amount_msat, .. } => {
    println!(
        "\nEVENT: received payment from payment hash {} of {} millisatoshis",
        payment_hash, amount_msat,
    );
    let payment_preimage = match purpose {
        PaymentPurpose::Bolt11InvoicePayment { payment_preimage, .. } => payment_preimage,
        PaymentPurpose::Bolt12OfferPayment { payment_preimage, .. } => payment_preimage,
        PaymentPurpose::Bolt12RefundPayment { payment_preimage, .. } => payment_preimage,
        PaymentPurpose::SpontaneousPayment(preimage) => Some(preimage),
    };
    if let Some(preimage) = payment_preimage {
        channel_manager.claim_funds(preimage);
    }
}
```

```kotlin [Kotlin]
if (event is Event.PaymentClaimable) {
    val purpose = event.purpose
    if (purpose is PaymentPurpose.Bolt11InvoicePayment) {
        val preimage = purpose.payment_preimage
        if (preimage is Option_ThirtyTwoBytesZ.Some) {
            channelManager.claim_funds(preimage.some)
        }
    }
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

if (event instanceof ldk.Event_PaymentClaimable) {
  // `purpose.preimage()` returns the preimage for any purpose variant.
  const preimage = event.purpose.preimage();
  if (preimage instanceof ldk.Option_ThirtyTwoBytesZ_Some) {
    channelManager.claim_funds(preimage.some);
  }
}
```

:::

**References:** [Rust `PaymentClaimable` docs](https://docs.rs/lightning/0.2.2/lightning/events/enum.Event.html#variant.PaymentClaimable), [Rust `PaymentPurpose` docs](https://docs.rs/lightning/0.2.2/lightning/events/enum.PaymentPurpose.html), [Java/Kotlin `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Event.java), [TypeScript `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/ts/structs/Event.mts)
