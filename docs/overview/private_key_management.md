# Private Key Management

LDK has "default implementations", but you can choose to provide private keys to LDK in any way you wish following a simple API. LDK even supports a generic API for signing transactions, allowing you to run LDK without any private keys in memory and/or putting private keys only on hardware wallets.

While LDK's default implementation is currently within Rust-Lightning, it is still considered a sample module.

[LDK's `KeysManager` docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html).