---
title: "Anchor Outputs Channels Are Here"
description: "LDK v0.0.116 added support for opening channels with anchor outputs."
date: "2023-08-02"
authors:
  - Wilmer Paulino
tags:
  - Channels
  - Anchor Outputs
  - Fees
---

`v0.0.116` of LDK with added support for opening channels with [anchor
outputs](https://bitcoinops.org/en/topics/anchor-outputs) is live. This much-requested feature
brings multiple security and usability improvements to Lightning channels.

Lightning channels rely on pre-signed transactions that participants broadcast to the network if
they wish to close a channel unilaterally, e.g., when their counterparty is offline. Before
introducing anchor outputs to the Lightning protocol, participants continually negotiated their
commitment transaction’s fees based on the current block-space demand. This fee negotiation
unfortunately came with its own set of problems. If participants disagreed on the proposed fee
range, a unilateral close made the channel unusable. Underestimating the required fee could result
in loss of funds if an HTLC needed to be resolved on-chain, and overestimating would misallocate the
channel balance towards fees, potentially rendering the channel useless.

With anchor outputs, participants can now contribute the majority of fees required at the time of
broadcast by bumping the commitment transaction's fee via a child transaction using the
[Child-Pays-For-Parent (CPFP)](https://bitcoinops.org/en/topics/cpfp) fee-bumping mechanism. A small
portion of fees must still be allocated to commitment transactions to ensure they can enter nodes'
mempools independently. This will be required until [package
relay](https://bitcoinops.org/en/topics/package-relay) is deployed network-wide. At that point, we
can have a fixed 1 sat/vB commitment transaction that is likely to do away with the fee negotiation
once and for all, eliminating the most common cause of unilateral closes that we see today.

Given LDK's modularized design, support for anchor outputs posed a few challenges. As a
Lightning-only library, we do not include an on-chain wallet as a traditional node implementation
would, requiring manual integration work by the application developer. However, we were able to
leverage our existing [event-based
API](https://docs.rs/lightning/latest/lightning/events/index.html) to communicate that a commitment
or HTLC transaction's fee needs to be bumped. The handling of these events is often non-trivial, so
we added a utility
([`BumpTransactionEventHandler`](https://docs.rs/lightning/latest/lightning/events/bump_transaction/struct.BumpTransactionEventHandler.html))
to simplify required integration work. With this utility, an application developer only needs to
provide a view into their on-chain wallet for LDK to access confirmed UTXOs and sign them.

Note that node operators need to maintain a reserve of confirmed funds if they wish to exit a
channel unilaterally. LDK will not ensure this reserve is enforced, but we’re exploring [possible
ways to do so](https://github.com/lightningdevkit/rust-lightning/issues/2320). Without such
enforcement, a node may open or accept more channels than its provisioned reserve allows it to
handle, potentially resulting in a loss of funds if any HTLCs need to be resolved on-chain. In the
meantime, application developers must determine whether their use case warrants such enforcement,
then implement it themselves. For example, a mobile user connected to a LSP could always defer to
the LSP to broadcast the latest state so that the user wouldn’t need to maintain a reserve.

While the feature is now available, we still consider it experimental. We're always seeking feedback
on how to improve our API and provide a better developer experience.

