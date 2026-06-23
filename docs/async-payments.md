# Async Payments

Async payments let an often-offline node — typically a mobile wallet — receive Lightning payments without keeping an app open in the foreground, without trusting a third party to custody funds, and without anyone encumbering network capacity with long-lived HTLCs.

This guide covers how to enable async payments in your application. For the protocol background, the existing approaches it improves on, and the design rationale, see the blog post [Async Payments: Getting Paid While Your Node Is Offline](/blog/async-payments-receiving-while-offline).

<AsyncPaymentsSequenceDiagram />

## Integrating Async Payments

LDK handles the async offer machinery transparently once your node is configured for the appropriate role. The configuration differs depending on whether your node is an always-online participant, an often-offline sender or receiver, or the always-online LSP and static-invoice server that supports offline recipients.

### Always-online sender or receiver

If your node is reliably online, no special configuration is required. Pay an offer with [`ChannelManager::pay_for_offer`](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html#method.pay_for_offer); async offers are handled transparently.

### Often-offline sender or receiver

For a node that is frequently offline, such as a mobile wallet:

1. Set [`UserConfig::enable_htlc_hold`](https://docs.rs/lightning/*/lightning/util/config/struct.UserConfig.html) to `true`.
2. Obtain blinded paths to your static-invoice server out-of-band from the LSP (see [Acting as an LSP](#acting-as-an-lsp-static-invoice-server) below).
3. Register those paths with `ChannelManager::set_paths_to_static_invoice_server`.
4. When sharing an offer with a sender, obtain it from `ChannelManager::get_async_receive_offer`.
5. Pay offers with [`ChannelManager::pay_for_offer`](https://docs.rs/lightning/*/lightning/ln/channelmanager/struct.ChannelManager.html#method.pay_for_offer); async offers are handled transparently.

### Acting as an LSP / static-invoice server

An always-online node that serves offline recipients acts as both an onion message mailbox and a store for static invoices:

1. Set [`UserConfig::enable_htlc_hold`](https://docs.rs/lightning/*/lightning/util/config/struct.UserConfig.html) to `true`.
2. Initialize the onion messenger with `OnionMessenger::new_with_offline_peer_interception` so that messages destined for offline peers can be held.
3. Generate blinded paths for each recipient with `ChannelManager::blinded_paths_for_async_recipient` and deliver them to the recipient out-of-band.
4. Act as an onion message mailbox by handling `Event::OnionMessageIntercepted` and `Event::OnionMessagePeerConnected`: buffer messages for offline peers, and flush them when the peer reconnects.
5. Persist static invoices by handling `Event::PersistStaticInvoice`. Store the provided invoice and blinded path keyed by `(recipient_id, invoice_slot)`, then call `ChannelManager::static_invoice_persisted` with the supplied path.
6. Serve invoice requests by handling `Event::StaticInvoiceRequested`. Look up the persisted invoice and reply with `ChannelManager::respond_to_static_invoice_request`.

For a complete reference on the events referenced above, see the [`Event` documentation](https://docs.rs/lightning/*/lightning/events/enum.Event.html). For details on configuring and constructing the `ChannelManager`, see [Setting up a ChannelManager](/building-a-node-with-ldk/setting-up-a-channel-manager).
