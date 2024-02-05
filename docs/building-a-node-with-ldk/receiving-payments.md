# Receiving Payments

To receive a payment, you'll need to create an invoice of your own with an
amount and description. `ChannelManager` contains the remaining information
needed for the invoice. Use the provided utility to generate an invoice and
register a pending payment in `ChannelManager`.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift: 'Swift'}">
  <template v-slot:rust>

```rust
let invoice = match utils::create_invoice_from_channelmanager(
    channel_manager,
    keys_manager,
    logger,
    currency,
    Some(amt_msat),
    "description".to_string(),
    expiry_secs,
    None,
) {
    Ok(inv) => {
        println!("SUCCESS: generated invoice: {}", inv);
        inv
    }
    Err(e) => {
        println!("ERROR: failed to create invoice: {:?}", e);
        return;
    }
};

let payment_hash = PaymentHash(invoice.payment_hash().to_byte_array());
inbound_payments.payments.insert(
    payment_hash,
    PaymentInfo {
        preimage: None,
        secret: Some(invoice.payment_secret().clone()),
        status: HTLCStatus::Pending,
        amt_msat: MillisatAmount(Some(amt_msat)),
    },
);

```

  </template>
  <template v-slot:kotlin>

```kotlin
val description = "description"
val amtMsat: Long = 3000000
val invoice = UtilMethods.create_invoice_from_channelmanager(
    channelManager,
    keysManager.inner.as_NodeSigner(),
    logger,
    Currency.LDKCurrency_Regtest,
    Option_u64Z.some(amtMsat),
    description,
    300,
    Option_u16Z.some(144)
)

val invoiceResult = (invoice as Result_Bolt11InvoiceSignOrCreationErrorZ.Result_Bolt11InvoiceSignOrCreationErrorZ_OK).res
val encodedInvoice = invoiceResult.to_str()
```

  </template>

  <template v-slot:swift>

```swift
let invoice = Bindings.createInvoiceFromChannelmanager(
    channelmanager: self.channelManager!,
    nodeSigner: myKeysManager.inner.asNodeSigner(),
    logger: self.logger,
    network: currency,
    amtMsat: amount,
    description: "Test Invoice",
    invoiceExpiryDeltaSecs: expiry,
    minFinalCltvExpiryDelta: nil
)

invoice.getValue()!.toStr()
```

  </template>
</CodeSwitcher>

While it is possible to create an invoice without using the utility,
`ChannelManager` will reject any incoming HTLCs for unregistered payments to
protect your privacy. In this case, use either `create_inbound_payment` or
`create_inbound_payment_for_hash` to register a payment with `ChannelManager`
before creating the invoice with the returned payment hash and/or secret. 
You might also opt to for `inbound_payment`, useful for generating invoices for [phantom node payments](https://docs.rs/lightning/*/lightning/sign/struct.PhantomKeysManager.html) without a ChannelManager.

# PaymentClaimable Event Handling

As with sending a payment, LDK will generate an event once a payment is
received. It is your responsibility to handle the `PaymentClaimable` event by
using `ChannelManager` to release the preimage and claim the funds.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
Event::PaymentClaimable {
    payment_hash,
    purpose,
    amount_msat,
    receiver_node_id: _,
    via_channel_id: _,
    via_user_channel_id: _,
    claim_deadline: _,
    onion_fields: _,
    counterparty_skimmed_fee_msat: _,
} => {
    println!(
        "\nEVENT: received payment from payment hash {} of {} millisatoshis",
        payment_hash, amount_msat,
    );
    print!("> ");
    io::stdout().flush().unwrap();
    let payment_preimage = match purpose {
        PaymentPurpose::InvoicePayment { payment_preimage, .. } => payment_preimage,
        PaymentPurpose::SpontaneousPayment(preimage) => Some(preimage),
    };
    channel_manager.claim_funds(payment_preimage.unwrap());
}
```

  </template>
  <template v-slot:kotlin>

```kotlin
if (event is Event.PaymentClaimable) {
    if (event.payment_hash != null) {
        val purpose = event.purpose as InvoicePayment
        val paymentPreimage = (purpose.payment_preimage as Option_ThirtyTwoBytesZ.Some).some

        channelManager.claim_funds(paymentPreimage)
    }
}
```

  </template>

  <template v-slot:swift>

```swift
if let paymentClaimedEvent = event.getValueAsPaymentClaimable() {
    let paymentPreimage = paymentClaimedEvent.getPurpose().getValueAsInvoicePayment()?.getPaymentPreimage()
    let _ = channelManager.claimFunds(paymentPreimage: paymentPreimage!)
}
```

  </template>
</CodeSwitcher>

**References:** [Rust `PaymentClaimable` docs](https://docs.rs/lightning/*/lightning/events/enum.Event.html#variant.PaymentClaimable), [Java/Kotlin `PaymentClaimable` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java#L261)