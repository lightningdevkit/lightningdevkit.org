---
id: onchain_funds
title: "Spending On-chain Funds"
---
Relevant reference: search for any structs or methods mentioned in this article [here](https://docs.rs/lightning/0.0.12/lightning/index.html).

When a channel has been closed and some outputs on chain are spendable only by us, LDK provides a `util::events::Event::SpendableOutputs` event in return from `ChannelMonitor::get_and_clear_pending_events()`. It contains a list of `chain::keysinterface::SpendableOutputDescriptor` objects which describe the output and provide all necessary information to spend it. `ChannelKeys` objects provide a unique id via the `key_derivation_params` function, who's value is provided back to you in the `SpendableOutputs` objects. For users of a `KeysManager` object, you can re-construct the `InMemoryChannelKeys` object using this information and fetch the relevant private keys from that. A `SpendableOutputDescriptor::StaticOutput` element does not have this information as the output is sent to an output which used only `KeysInterface` data, not per-channel data.
