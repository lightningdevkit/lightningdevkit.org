---
id: key_mgmt
title: Key Management
---
Relevant reference: https://docs.rs/lightning/0.0.12/lightning/chain/keysinterface/struct.KeysManager.html

LDK Private Key Information is primarily provided through the `chain::keysinterface::KeysInterface` trait. It includes a few basic methods to get public and private key information, as well as a method to get an instance of a second trait which provides per-channel information - `chain::keysinterface::ChannelKeys`. While a custom `KeysInterface` implementation allows simple flexibility to control derivation of private keys, `ChannelKeys` focuses on signing lightning transactions and is primarily useful if you want to store private key material on a separate device which enforces lightning protocol details.
A simple implementation of `KeysInterface` is provided in the form of `chain::keysinterface::KeysManager`, see its documentation for more details on its key derivation. It uses `chain::keysinterface::InMemoryChannelKeys` for channel signing, which is likely an appropriate signer for custom `KeysInterface` implementations as well.
A `KeysManager` can be constructed simply with only a 32-byte seed and some integers which ensure uniqueness across restarts (defined as `starting_time_secs` and `starting_time_nanos`).
```rust
let mut random_32_bytes = [0; 32];
// Fill in random_32_bytes with secure random data, or, on restart, reload the seed from disk.
let start_time = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
let keys_interface_impl = lightning::chain::keysinterface::KeysManager::new(random_32-bytes, bitcoin::network::constants::Network::Bitcoin, start_time.as_secs(), start_time.subsec_nanos());
```
