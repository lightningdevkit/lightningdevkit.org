# Persistent Storage 

You can store the channel state any way you want - whether Google Drive/iCloud, a local disk, any key-value store/database/a remote server, or any combination of them - LDK provides a clean API, where objects can be serialized into simple binary blobs, and stored in any way you wish.

[LDK's `Persist` docs](https://docs.rs/lightning/latest/lightning/chain/chainmonitor/trait.Persist.html)

[Sample module in Rust](https://github.com/rust-bitcoin/rust-lightning/tree/main/lightning-persister)