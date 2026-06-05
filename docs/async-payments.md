# Async Payments

## The Challenge of Receiving Payments While Offline

The Lightning Development Kit (LDK) provides the tools to build a node on the Lightning Network. One practical reality of the network is that a payment requires a degree of coordination: for a payment to settle, the sender and recipient need to be online at roughly the same time. A BOLT 11 invoice partially addresses this by requiring the recipient to hand the sender fresh, interactive data, which assumes the recipient is online and their device is unlocked at the moment of payment.

That assumption breaks down for one of the most common things people want to do with Lightning: accept tips or payments on a phone without keeping an app open and in the foreground. Modern mobile operating systems compound the problem. On both Android and iOS, an application is generally not guaranteed any CPU time in response to a push notification unless it falls into a privileged category such as VoIP. In practice, this means a mobile node often cannot wake up to claim an incoming HTLC on its own.

This guide describes the async payments protocol, which LDK implements to allow an often-offline node to receive payments without trusting a third party to custody funds, and without anyone encumbering network capacity with long-lived HTLCs. The [Integration](#integrating-async-payments) section at the end shows how to enable it in your application.

## Existing Approaches and Their Limitations

Before async payments, several techniques made partial progress toward offline receiving. Each is useful in its own context, but none fully solves the problem:

- **Custodial services.** The recipient delegates custody to a third party that is always online. This works, but it reintroduces the trust and counterparty risk that Lightning aims to remove.
- **Remote signing (e.g. Blockstream Greenlight).** Keys can live on the recipient's device while the heavier node infrastructure runs elsewhere. This reduces the resources required on the device, but it does not change the online requirement: the device must still be available with the same timing constraints as a full node.
- **Spontaneous payments (keysend / AMP).** These work well for tips, but only cover the sending half. If the recipient is offline when the payment arrives one hop away, the HTLC will time out and fail backwards before they return. Using a very long CLTV to keep the HTLC alive ties up liquidity across the route, which is antisocial toward the rest of the network and may break when relay policies tighten.
- **LNURL.** This is a convenient way to fetch an invoice from a trusted provider on the recipient's behalf, but it still requires the recipient to be online to receive the payment, unless a fully trusted provider accepts funds and forwards them later. As of 2026, the regulatory overhead of operating that kind of forwarding service has grown considerably, making it impractical in more and more jurisdictions.
- **Notification to open the app.** An untrusted provider can send a push notification prompting the recipient to open their app and claim the payment. This is the most common stopgap today and it does help. Its weakness is the OS behavior described above: the app frequently cannot run code in response to the notification, so the model degrades to "ask the user to open the app promptly," which is a poor experience to rely on.

Async payments aim to do better by removing both the trust requirement and the need to keep capacity locked up across the network.

## How Async Payments Work

The protocol introduces the concept of an LSP (Lightning Service Provider) that also acts as a static invoice server on behalf of an often-offline recipient. This server hands out reusable invoices that deliberately omit the payment hash. Omitting the payment hash is a safety measure: it prevents the server from handing out the same invoice twice and then claiming the second payment for itself once it has learned the preimage.

A payment then proceeds roughly as follows:

1. **The sender fetches a static invoice.** The sender requests a static invoice from the recipient's invoice server. The absence of a payment hash signals that the recipient sits behind an LSP and is rarely online, so the sender knows to use the async flow.

2. **The sender locks in the HTLC with its own LSP.** The sender forwards an HTLC with a long CLTV timeout to its own LSP, with instructions to hold it: "when you receive an onion message containing secret B, release this HTLC; until then, hold it." The sender's LSP accepts the HTLC but does not forward it. The long CLTV is acceptable here because these are the sender's own funds; if the sender chooses to encumber their own balance, no one else is affected. A sender that is reliably online can skip this step.

3. **The sender notifies the recipient.** The sender transmits an onion message to the recipient: "when you next come online, use the included reply path to send secret B to my LSP." The recipient's LSP holds this message until the recipient connects. At this point the sender can safely go offline.

4. **The recipient comes online and replies.** When the recipient reconnects, their LSP delivers the held onion message. The recipient follows the reply path and sends secret B to the sender's LSP.

5. **The HTLC is released.** Receiving secret B prompts the sender's LSP to forward the original HTLC, which travels the route and is received by the recipient.

This design has several useful properties. No funds are encumbered across the network for an extended period, except by the original sender, who intended to part with those funds anyway. No party in the flow can run away with the money or be reasonably construed as a custodian of it. And the sender does not need to reveal their identity to the recipient, nor even tell the recipient which LSP they used.

When the route the sender originally selected has gone stale by the time the recipient returns, the sender's LSP can find a fresh route on the sender's behalf using trampoline routing, so the sender can still lock in its HTLC immediately at step 2.

### Design Notes

- **Proof of payment.** Omitting the payment hash means the static invoice does not provide the usual proof-of-payment guarantee. The intended path forward is PTLCs: the sender adds a random nonce \* G to the PTLC being paid and sends the recipient the corresponding random nonce in the onion. With that in place, the sender and the static invoice server would have to collude to steal the funds, and a sender who wished to give funds to the server could simply do so directly.
- **Stale routes.** If the route the sender used when locking in the HTLC is no longer viable by the time the recipient returns, the sender's LSP finds a new route. This is what makes step 2 safe to perform immediately rather than waiting for the recipient.
- **The recipient never returns.** This behaves exactly as a normal Lightning payment does today. If any node on the route is offline long enough that the payment approaches its expiry, the HTLC is failed backwards to the sender.

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
