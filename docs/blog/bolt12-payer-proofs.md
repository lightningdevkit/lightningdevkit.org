---
title: "BOLT 12 Payer Proofs: Exportable, Verifiable Receipts for Lightning Payments"
description: "After settlement the payer’s wallet can export a compact, verifiable receipt (lnp…) that anyone can check against the original BOLT 12 offer — no recipient web server required."
date: "2026-07-01"
authors:
  - Vincenzo Palazzo
tags:
  - offers
  - onion messages
  - privacy
  - receipts
---

BOLT 12 fixed receive. Reusable offers, private invoice negotiation over onion messages — no more one-shot BOLT 11 invoices that die the moment you share them. That half of the product problem is solved.

The other half is still broken.

How does the payer actually prove that a particular offer was paid — to a messaging app, a Nostr client, a point-of-sale terminal, or anyone else — without standing up a web server, without trusting the recipient to publish a receipt, and without falling back to LNURL callbacks or custodial zap servers?

Most of the time the answer is still “you don’t.” Or worse: you just trust someone else’s server. That’s a self-custody failure dressed up as a feature.

Payer proofs close that loop. After settlement the payer’s wallet can export a compact, verifiable receipt (`lnp…`) that anyone can check against the original offer. No recipient cooperation required. No always-online HTTP endpoint. Just the cryptography that already lives inside BOLT 12.

LDK has the primitives. Core Lightning has shipped support. Eclair has verified the vectors. The specification is in [bolts#1346](https://github.com/lightning/bolts/pull/1346). The missing piece was simply making the receipt a first-class object that the payer controls.

## Why the existing options fail

Lightning has always had a cryptographic core of proof-of-payment: the preimage that claims an HTLC. For simple BOLT 11 flows that was often enough. Modern apps and BOLT 12 change what we actually need.

A messaging app wants a gold “paid” bubble that a third party can re-verify later. A Nostr client wants public tip totals without standing up an LNURL zap server. A point-of-sale terminal needs to know this order was paid, not just that some payment hit the merchant node. An agent talking to a wallet over a connector needs a receipt it can store and check offline.

All of them need the same thing: a portable object that answers four questions without asking the recipient’s server for permission.

- **Share the preimage?** Binding is weak. A bare preimage doesn’t carry a signed statement of the offer, the invoice fields, or the payer’s intended metadata. It’s also a sensitive settlement secret — application protocols shouldn’t be forced to treat it as a public receipt format.
- **Trust the recipient to publish a receipt?** That’s the NIP-57 model. It works until the recipient’s server lies, lags, or simply disappears. Lightning succeeded; the social layer still broke.
- **LNURL / HTTP callbacks?** Convenient for fetching invoices, but they re-introduce a trusted web endpoint into the critical path for both payment and proof. As the regulatory and operational cost of always-online payment servers keeps rising, that model gets harder and harder to justify for tips and chat payments.
- **Wallet screenshots or “I saw PaymentSent”?** Fine for the person who paid. Useless to anyone else, and useless on a different device that was offline when settlement happened.

Settlement itself can finish while the UI that would have announced it is offline. The proof needs to be something the payer’s wallet can export when it’s ready — not something only the recipient can mint.


![Trusted server vs cryptography already in BOLT 12](../assets/bolt12-payer-proofs-comparison.png)

*Figure: comparison — a trusted server reintroduced vs the cryptography already in BOLT 12.*

## What a payer proof actually is

Payer proofs treat the receipt as a first-class BOLT 12 object that the payer exports and anyone can verify against the offer.

A payer proof is a BOLT 12–defined object, usually encoded as bech32 with the human-readable prefix `lnp`. It lets a verifier check a settled payment against a known offer.

At a high level it combines:

- selected fields from the invoice request (what the payer asked to pay — amount, payer note, payer id material…),
- selected fields from the invoice (what the recipient returned — payment hash, node id, features…),
- the proof material itself: the payment preimage (settlement), the invoice signature (authenticity of the invoice), and the payer’s signature (who authorized it),
- optional omission metadata so wallets can disclose only what a given application needs.

The verifier’s job isn’t to trust the payer’s story. It’s to run the validation algorithm: given this `lnp` and this canonical offer (`lno…`), did a conforming payment complete for the disclosed amount and notes?

That’s the difference between a screenshot of a wallet UI and a real receipt.


![Anatomy of a payer proof (lnp)](../assets/bolt12-payer-proofs-anatomy.png)

*Figure: anatomy — selected invoice-request fields, invoice fields, preimage and signatures that make up an `lnp`.*

## How it works in practice

The flow is deliberately simple.

1. The recipient publishes a reusable BOLT 12 offer. It can live in a BIP 353 DNS record, a Nostr profile, an app capability descriptor, a QR code, or a contact list.
2. The payer requests an invoice over onion messages, including the amount (for variable offers) and any payer note or metadata the application wants bound to the payment.
3. The recipient returns a unique invoice; the payer settles it over Lightning.
4. After settlement the payer’s wallet builds the `lnp` from the paid invoice, the preimage, and the fields it chooses to disclose. This happens entirely on the payer side — no recipient web callback required.
5. The application then attaches the proof wherever it needs it: a public tip event, an encrypted chat receipt, a wallet-connector pay response, a point-of-sale notification.

Anyone who needs to can verify. Clients parse the `lnp`, check the signatures and preimage binding, and compare the disclosed fields against the offer they believe was paid. Invalid or replayed proofs are dropped; duplicates are deduplicated by payment hash.

No LNURL. No “please host a zap callback.” The Lightning proof is the receipt. The application only decides whether that receipt is public, private, or kept in a backend ledger.


![Payer proof end-to-end flow](../assets/bolt12-payer-proofs-flow.png)

*Figure: flow — publish offer → request invoice over onion messages → settle → export `lnp` → verify.*

## Design notes that matter

**Selective disclosure.** Not every verifier needs every TLV. LDK exposes `include_*` helpers so wallets can disclose only what validation requires and omit the rest. Follow the specification’s rules about which fields may be omitted — especially when the proof will be published widely.

**Privacy.** A publicly posted payer proof is a public statement about amount, time, offer, and (depending on disclosure) the payer. Wallets should make publication an explicit user action. Private chat receipts can use the same cryptographic object without broadcasting it. Blinded paths on the offer still hide the recipient’s node ID from casual observers; they don’t anonymise a proof the user chooses to post on a public network.


![Trust boundary for payer proofs](../assets/bolt12-payer-proofs-trust-boundary.png)

*Figure: trust boundary — what the verifier checks locally without asking the recipient’s server.*

## Ecosystem status

| Component | Status |
|---|---|
| Specification (bolts#1346) | Open and approved |
| LDK (rust-lightning) | Primitives merged (#4297) |
| LDK Node | Target for the next release |
| Core Lightning | Shipped |
| Eclair | Test vectors verified; maintainer ACK on the PR |
| LND | No known implementation yet |

Cross-implementation vectors matter more than any single stack. If you’re building a verifier, test against more than one producer.

## What this actually unlocks

With offers for receive and payer proofs for receipts, self-custodial apps can finally close loops that used to require custodial middleware.

- Tips and zaps without LNURL pay servers publishing receipts on the recipient’s behalf.
- In-chat payments with receipts that either party — or an auditor — can re-check.
- Point-of-sale notifications that reference a specific order, not merely a node balance change.
- Scoped app wallets that return a proof on pay the same way card APIs return a transaction ID — except the proof is verifiable without the wallet vendor.

The theme matches the rest of the BOLT 12 stack: push the policy and the cryptography into the protocol so applications stop reinventing trusted servers.

## Closing

BOLT 12 made reusable, private receive practical. Payer proofs make honest receipts practical.

If you maintain a wallet: export `lnp` after BOLT 12 settlement.

If you maintain an app: stop inventing parallel receipt formats. Bind your context, pay the offer, attach the proof, verify on read.

The only remaining question is the same one that hangs over every self-custody feature that actually works: will the builders ship it, or will we keep papering over the gap with another trusted server?
