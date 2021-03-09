---
id: mobile
title: "LDK for Lightning mobile devices"
---

## Introduction

This documents covers the challenges of building a mobile-first Lightning node and what
solution LDK offers. Note, this documentation already supposes a reader's familiarity with
the Lightning protocol and Bitcoin fundamental notions.

* [Fee Estimation](#fee-estimation) covers issues related to fee-estimation
* [Liveliness & Watchtowers](#watchtowers) covers issues related to Lightning liveliness requirement
* [Chain-validation](#chain-validation) covers issues related to chain validation

## Fee Estimation

A Lightning node can broadcast four types of transactions. A _funding transaction_, to open one or
multiple channel transactions. A _penalty transaction_ in reaction of a cheating by a counterparties
to double-spend a channel. A _commitment transaction_, either motivated by reallocating funds
locked in this channel to another purpose or in reaction to a in-flight HTLC to claim onchain. Such
unilateral broadcast should only happen when the counterparty is faulting to cooperate. A _closing 
transaction_, cooperatively built by parties to complete the channel.

Block space being a scarce resources, a Lightning node, similar to any other kind of Bitcoin applications
is in competition to confirm its transactions. While bidding to get its transaction included, a
Bitcoin application's fee-estimation should be as accurate as possible to save in fees. Further, a 
Lightning node has a time-sensitive requirement with regards to confirmation. Commitment and penalty 
transactions, must be confirmed before a block height timelock expire. After the timelock expiration
the counterparty can confirm transactions at its advantage, resulting in a loss of funds of the
Lightning user.

Contrary to simple Bitcoin transactions, of which the delaying of confirmation isn't directly
provoking losses, in Lightning fee-estimation accuracy is a safety-critical requirement.

Bitcoin Core implements fee-estimation in a way which attemps to be robust against various censorship
attacks by analyzing transactions that were both in its mempool and were later confirmed. By avoiding
waiting for confirmation, other fee estimators may respond faster to fee spikes. Due to its
immediate confirmation pressure, Lightning may benefit from a fee estimator more in the second
category, but care must be taken to avoid P2P censorship attacks or unbounded fee inflation. LDK
attempts to deal with insufficient fee-estimation by using RBF and slowly increasing transaction
fees until confirmation.

LDK offers a `lightning-fee-estimation` crate and its bindings, implementing the
`chaininterface::FeeEstimator` trait and thus servicing smoothly the rest of the LDK engine. This
utility will be a RPC HTTP client, configurable to be pointed toward any Bitcoin Core full-node.

## Liveliness & Watchtowers

A Lightning node must always monitor blockchain updates to react in consequence, either in case of
a revoked commitment transaction confirmed or reaching block height at which an HTLC expires. This
is a strong requirement as even missing few hours of blocks might trigger a loss of funds. Mobile
devices with an unreliable access to Internet or often shutdown by their users are particularly
sensible to this issue.

This liveliness requirement is function of which Lightning situation is considered. 

As soon, as a payment has been initiated on the channel, your counterparty can broadcast _any old  
commitment_ at _any time_ thus forcing your Lightning node to be always online in anticipation of such
an event. Watchtowers have been designed by the Lightning community to delegate such justice
enforcement function to an external entity. As this entity is trusted to broadcast client penalty
transactions, it is recommended to rely on multiple of them.

Currently, the LDK community is engaged on adoption of BOLT13, a cross-implementation standard
for watchtowers. LDK hope to offer soon a client-side implementation of BOLT13, pluggable on
the LDK engine. Beyond, if channels are opened with low-trust counterparties, it's recommended
to use longuer timelocks delays in your configuration (`ChannelHandshakeConfig::our_to_self_delay`).

With regards to handling in-flight HTLCs, a Lightning node not online when an HTLC has expired is
taking the risk of seeing its counterparty canceling onchain the HTLC and thus loosing funds. 

In case of sending a payment, if it doesn't succeed immediately (e.g waiting on the receiver to
be online), the mobile should be back online later to remove the sent HTLC in cooperation with
channel counterparty or worst-case scenario to broadcast onchain the commitment transaction and
a corresponding HTLC-timeout. Setting a long CLTV delay at first hop relay offers a _time window_
for how long the mobile device can be offline. Ideally, the Lightning application will send a
notification to the user at half of the CLTV delay warning about the requirement to connect back
to the network.

In case of receiving a payment, if it doesn't succeed immediately (e.g waiting on payer interactions
to receive the preimage), the mobile should be back online to hopefully learn payment preimage
and thus either claim the received HTLC in cooperation with channel counterparty or worst-case scenario
to broadcast onchain the commitment transaction and a corresponding HTLC-Success. Requiring a long
CLTV delay at last hop offers a _time window_ for how long the mobile device can be offline. With
LDK, this can be easily done by checking `event::PaymentReceived` at reception. Ideally, the 
Lightning application will send a notification to the user at half of the CLTV delay warning about
the requirement to connect back to the network.

Note, if you don't have HTLC in-flight, checking the chain once per day (depending on your justice
CSV delay) is a safe behavior.

## Chain Validation

A Lightning node needs access to the chain to verify channel utxo state. Failure to do so
might lead to accept payments on a non-existent or already-closed channel, thus provoking a loss of
funds. As chain validation is a costly processing, a mobile device might not have the bandwidth/CPU/
storage resources to allocate for.

In the Bitcoin ecosystem, mobile devices have been in practice relying on lightclient protocols
such as Electrum, BIP37 or BIP157 to access chain data. If the server isn't operated by the mobile
device user, it should be noted that funds security might be jeopardized by this entity.

LDK offers a ready-to-integrate client that fetches full block from RPC or REST, serviced by a
Bitcoin Core node. Its API allows you yo build a filtering client to parse chain data for the
rest of the LDK engine (`chain::Filter`).

Note, a Lightning client doesn't have to wait syncing with chain tip to start some LN operations.
Assuming client wallet keys have not leaked, a channel funding sequence should be always valid.
Further, sending payment is only decreasing user balance. In case of the channel being already
closed, the user balance committed onchain will be higher, thus at its advantage (and a loss for
the counterparty...)
