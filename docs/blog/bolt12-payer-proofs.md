---
title: "Lightning has no receipts. Let's fix it."
description: "Lightning gives you no receipt: the preimage proves an invoice was paid, not who paid it. BOLT 12 payer proofs are an exportable receipt that anyone can verify against the original offer."
date: "2026-09-10"
authors:
  - Vincenzo Palazzo
tags:
  - offers
  - onion messages
  - privacy
  - receipts
---

When I pay something over Lightning, the payment settles in a matter of seconds, and then nothing. No receipt, no proof, nothing I can show to somebody else except a screenshot or an invoice with a preimage, which is a huge privacy leak. This is why I started working on payer proofs for BOLT 12.

## Why is proving a Lightning payment hard?

I like to think that paying over Lightning today is like paying cash in a dark room: the money moves, both sides know it, but nobody hands you a receipt.

In fact, the only cryptographic evidence left after a payment settles is the *preimage*, a secret number that the recipient generates and releases when the payment is claimed. The BOLT 12 specification says this better than me:

> The classic Lightning proof of payment can demonstrate that an invoice **was paid**, but not **who paid it**.

The merchant can claim an invoice was paid, and once the preimage is revealed, anybody who sees it can claim they are the one who paid.

## What is a BOLT 12 payer proof?

A payer proof is a small, self-contained receipt that the payer wallet can export after the payment settles. Anyone can verify it against the original BOLT 12 offer in an offline manner, without any web server on the recipient side, and without trusting anybody's word.

An example of how to verify a proof of payment is contained in the code snippet below using the [lightning-payer-proof](https://github.com/lightningdevkit/rust-lightning/tree/main/lightning-payer-proof) crate.

```rust
use lightning_payer_proof::{verify, Offer};

let encoded_proof = "lnp1...";
let offer = "lno1...";

let proof = verify(encoded_proof).unwrap();
let offer: Offer = offer.parse().unwrap();
assert!(proof.pays_offers_recipient(&offer));
```

![Trusted server vs cryptography already in BOLT 12](../assets/bolt12-payer-proofs-comparison.png)

<p style="text-align: center;"><i>Trusted server vs cryptography already in BOLT 12</i></p>

## How does a payer proof work?

The flow is the normal BOLT 12 payment flow, plus one export step at the end:

1. **BOLT 12 invoice request**: the wallet sends an `invoice_request` for the offer, signed with a payer key that the wallet derives for this payment.
2. **Receive the BOLT 12 invoice**: the merchant answers with an invoice. This invoice is signed, and it carries a copy of the invoice request fields including the payer key, the amount, and the payment hash.
3. **Pay and export**: when the payment settles, the wallet learns the preimage. Now the wallet can bundle the signed invoice, the preimage, and a signature made with the payer key. This bundle is the receipt.

![Payer proof end-to-end flow](../assets/bolt12-payer-proofs-flow.png)

<p style="text-align: center;"><i>Publish offer → request invoice over onion messages → settle → export <code>lnp</code> → verify</i></p>

So, now the question is: "How does a verifier check the proof?" The answer is three checks:

- The invoice signature is valid, and the signing key is the one that the offer points to;
- The preimage hashes to the payment hash inside the invoice;
- The payer signature is valid under the payer key that the invoice commits to.

Check one says the merchant issued this invoice. Check two says the invoice was paid. Check three says **you** are the one who requested and paid it.

![Trust boundary for payer proofs](../assets/bolt12-payer-proofs-trust-boundary.png)

<p style="text-align: center;"><i>What the verifier checks locally without asking the recipient’s server</i></p>

To see what a payer proof looks like, you should look at the [lnproof.space explorer](https://lnproof.space/lnp1pgd9xatswphhyapqgf85c4p3xgsxgetkv4kx7urdv4h8gys0we5kucm9deax7urpd3sh57n02gzq97hsspvzqxlx3fdq9rexq8gwsr2x3s6yhge36cgmjmp43dsr9695mgz50lq35szx5vulgz5zqdm7zhhae8jf878pk64cx2kvxjhg759yk4hg6rshh3culzzgfqgy4gzq97hsszczphhaafxdkemh2zjzplhgql4v7g0tnzv2u7dew6rkde865p9z6j357pqwjxpg5h9pjdq3y6hcc0rpqegga93hd96chvjsdsrekhe9hy24rxydjznvhxfms77a4n59k7rl98nmgxjh5hs02d268xd9yngttkqzgtc5qe2626xr27slrm32aq8s34krrvqlmx00s63j95nzc4xpafz3ht8zhs2t8wv3lqmyst6k5wzjs66srag4ew4arrkltqgrt0pnpnwhte006qlfyzn60fa857n60fa857n60fa857n60fa857n60fa857n60fa857n60lgragq38lgradqrtg0f2fq2x3uqwvg2svh0jx4ay3ffltkzn469rztgxc699ll5jec0ql0c0sgdxtgsu02kwtlq2vq0m56p4nr0xyuzwrdzzjzz93jsfr7s8m8aqyqpm66a6rvrpscv3w49rpmaym25ctxzv6avsaupmtdzcdz660j5dqlkkrdezeed7ufypzrq4xv3x23ckc7yg8t8lt47n748tgkl306f6rmaetqlvaux52dnf07pzrkr9tzm50r5wyc2f4m2597lrd2meld0hxw5plt5vdxan5w02749n5y0s9fph327jrafhllnhapdazvfj7w8t3d5kun9d0tx6ql7hghvhrpzwlxmg3wnt2h60734wn9uensapc7n0v5qcfly90k2fczxqy4n3jn8yf80ajkmlp68qgmqw870qd9rd7sy3f3tvmlawgtjxwxnu84xqq6ncwj5gpc0rtju82a62mpylh5vtqmgu2rf9u342src8kj3vttun6l8n2na5j6u2ax7snpxmrycvr650lgra5n4g6rpde4hxgrxdaezq7t0w4ezqam0wf4jqmmwyppk7un9ypxxjemgw3hxjmn8yy).

![Anatomy of a BOLT 12 payer proof](../assets/bolt12-payer-proofs-anatomy.png)

<p style="text-align: center;"><i>The anatomy of a BOLT 12 payer proof</i></p>

## What you need to know to just create a payer proof with LDK

Creating a payer proof from LDK requires three pieces of information. Two of them must be stashed from `Event::PaymentSent` after a successful outbound BOLT 12 payment, and the third is the node's own key.

When the payment settles, your event handler gets:

```rust
Event::PaymentSent {
    payment_id,           // Some(PaymentId) for modern LDK
    payment_preimage,     // always present on PaymentSent
    payment_hash,
    bolt12_invoice,       // Some(PaidBolt12Invoice) for BOLT 12; None for BOLT 11
    ..
}
```

The piece that is **not** on the event is the `ExpandedKey`:

```rust
let expanded_key = keys_manager.get_expanded_key();
// or: node_signer.get_expanded_key()
```

The following code snippet is what building the proof looks like, once you have those three pieces:

```rust
fn build_payer_proof(
    paid_invoice: &PaidBolt12Invoice,
    payment_preimage: PaymentPreimage,
    payment_id: PaymentId,
    keys_manager: &KeysManager,
) -> Result<String, lightning::offers::payer_proof::PayerProofError> {
    let expanded_key = keys_manager.get_expanded_key();
    let secp_ctx = Secp256k1::new();

    let proof: PayerProof = paid_invoice
        .prove_payer_derived(payment_preimage, &expanded_key, payment_id, &secp_ctx)?
        .include_offer_description()
        .include_offer_issuer()
        .include_invoice_amount()
        .include_invoice_created_at()
        // .with_proof_note("optional human note".into())
        .build_and_sign()?;

    Ok(proof.to_string()) // bech32 `lnp1...`
}
```

## What you can build with it

If you run a business on Lightning, or you are building wallets, this unlocks some concrete things:

- **Accounting**: hand your accountant the proof of a single payment, without exposing the rest of the invoice information;
- **Disputes**: "I paid you" stops being a claim and becomes a statement that anyone can check;
- **Integrations**: a payment confirmation becomes plain data that you can forward to a third party, or publish. [BOLT 12 zaps](https://github.com/nostr-protocol/nips/pull/2421) are one of the first use cases people are building on top of it.

## Current status

| Component | Status |
|---|---|
| Specification ([bolts#1346](https://github.com/lightning/bolts/pull/1346)) | Merged |
| LDK (rust-lightning) | Implemented |
| LDK Node | Implemented |
| LDK Server | Implemented |
| Core Lightning | Implemented |
| Eclair | Test vectors verified; maintainer ACK |
| LND | No known implementation yet |

## Final Thought

Payer proofs are the missing piece of the BOLT 12 specification: a simple way to prove that an invoice was paid, and who paid it. Until now, this was complicated because you had to carry around the offer, the invoice, and the preimage, and by doing that, you were revealing everything stored inside the invoice.

This is why selective disclosure matters: not every verifier needs every TLV. The Merkle construction of BOLT 12 lets the wallet include only the fields required for validation and leave the rest out, and LDK ships the helpers for exactly this so adding payer proof support to a wallet is an afternoon of work, not a research project.

The pieces are all in place, so the open question now belongs to wallets: what should a proof reveal by default? If you are adding support and hit that question, or you find a use case we did not think about, I would like to hear it.
