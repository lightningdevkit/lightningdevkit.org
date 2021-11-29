# Blockchain Data 

LDK provides a simple block_connected/block_disconnected API which you pass block headers and transaction information to. LDK also provides an API for getting information about transactions it wishes to be informed of, which is compatible with Electrum server requests/neutrino filtering/etc.

[Sample module in Rust](https://github.com/rust-bitcoin/rust-lightning/tree/main/lightning-block-sync)