---
id: open_channel
title: "Opening a Channel with LDK"
---

## Prerequisites
See [Building a Node with LDK](build_node.md) for preparing LDK to open a channel. This guide 
is a follow-up.

## Overview
This guide is more of a walkthrough of a code snippet that shows the steps to
open a channel with LDK.

```java
// <insert code to connect to peer via NioPeerHandler.connect(byte[] their_node_id, SocketAddress remote)>

// Create the initial channel and make sure the result is successful.
[]byte peer_node_pubkey = <peer node pubkey bytes>;
Result_NoneAPIErrorZ create_channel_result = channel_manager.create_channel(
    peer_node_pubkey, 10000, 1000, 42, null);
assert create_channel_result instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;

// Ensure this generates a FundingGenerationReady event and that its fields are 
// sane.
nio_peer_handler.check_events();
Event[] events = channel_manager_events.get_and_clear_pending_events();
assert events.length == 1;
assert events[0] instanceof Event.FundingGenerationReady;
assert ((Event.FundingGenerationReady) events[0]).channel_value_satoshis == 10000;
assert ((Event.FundingGenerationReady) events[0]).user_channel_id == 42;
byte[] funding_spk = ((Event.FundingGenerationReady) events[0]).output_script;
assert funding_spk.length == 34 && funding_spk[0] == 0 && funding_spk[1] == 32; // P2WSH

// Generate the funding transaction for the channel based on the channel amount
NetworkParameters bitcoinj_net = NetworkParameters.fromID(NetworkParameters.ID_MAINNET);
Transaction funding_tx = new Transaction(bitcoinj_net);
funding_tx.addInput(new TransactionInput(bitcoinj_net, funding, new byte[0]));
funding_tx.getInputs().get(0).setWitness(new TransactionWitness(2)); // Make sure we don't complain about lack of witness
funding_tx.getInput(0).getWitness().setPush(0, new byte[]{0x1});
funding_tx.addOutput(Coin.SATOSHI.multiply(10000), new Script(funding_spk));

// Give the funding transaction back to the channel manager.
byte[] chan_id = ((Event.FundingGenerationReady) events[0]).temporary_channel_id;
channel_manager.funding_transaction_generated(chan_id, OutPoint.constructor_new(
    funding_tx.getTxId().getReversedBytes(), (short) 0));

// Ensure that the funding transaction is then broadcasted.
nio_peer_handler.check_events();
events = channel_manager_events.get_and_clear_pending_events();
assert events.length == 1;
assert events[0] instanceof Event.FundingBroadcastSafe;
assert ((Event.FundingBroadcastSafe) events[0]).user_channel_id == 42;

// Wait until a few blocks are mined, and then the channel is now open
```
