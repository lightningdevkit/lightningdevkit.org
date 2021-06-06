---
id: key_mgmt
title: Key Management
---
Relevant reference: [Rust docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html)

LDK Private Key Information is primarily provided through the `chain::keysinterface::KeysInterface` trait. It includes a few basic methods to get public and private key information, as well as a method to get an instance of a second trait which provides per-channel information - `chain::keysinterface::ChannelKeys`. While a custom `KeysInterface` implementation allows simple flexibility to control derivation of private keys, `ChannelKeys` focuses on signing lightning transactions and is primarily useful if you want to store private key material on a separate device which enforces lightning protocol details.

A simple implementation of `KeysInterface` is provided in the form of `chain::keysinterface::KeysManager`, see its documentation for more details on its key derivation. It uses `chain::keysinterface::InMemoryChannelKeys` for channel signing, which is likely an appropriate signer for custom `KeysInterface` implementations as well.


A `KeysManager` can be constructed simply with only a 32-byte seed and some integers which ensure uniqueness across restarts (defined as `starting_time_secs` and `starting_time_nanos`).

```rust
let mut random_32_bytes = [0; 32];
// Fill in random_32_bytes with secure random data, or, on restart, reload the seed from disk.
let start_time = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
let keys_interface_impl = lightning::chain::keysinterface::KeysManager::new(random_32-bytes, start_time.as_secs(), start_time.subsec_nanos());
```

Spending On-Chain Funds
=======================
When a channel has been closed and some outputs on chain are spendable only by us, LDK provides a `util::events::Event::SpendableOutputs` event in return from `ChannelMonitor::get_and_clear_pending_events()`. It contains a list of `chain::keysinterface::SpendableOutputDescriptor` objects which describe the output and provide all necessary information to spend it. `ChannelKeys` objects provide a unique id via the `key_derivation_params` function, who's value is provided back to you in the `SpendableOutputs` objects. For users of a `KeysManager` object, you can re-construct the `InMemoryChannelKeys` object using this information and fetch the relevant private keys from that. A `SpendableOutputDescriptor::StaticOutput` element does not have this information as the output is sent to an output which used only `KeysInterface` data, not per-channel data.
