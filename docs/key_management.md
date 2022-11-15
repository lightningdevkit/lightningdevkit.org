# Key Management

Relevant reference: [Rust docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html)

LDK Private Key Information is primarily provided through the `chain::keysinterface::KeysInterface` trait. It includes a few basic methods to get public and private key information, as well as a method to get an instance of a second trait which provides per-channel information - `chain::keysinterface::ChannelKeys`.
 
While a custom `KeysInterface` implementation allows simple flexibility to control derivation of private keys, `ChannelKeys` focuses on signing Lightning transactions and is primarily useful if you want to store private key material on a separate device which enforces Lightning protocol details.

A simple implementation of `KeysInterface` is provided in the form of `chain::keysinterface::KeysManager`, see its documentation for more details on its key derivation. It uses `chain::keysinterface::InMemoryChannelKeys` for channel signing, which is likely an appropriate signer for custom `KeysInterface` implementations as well.

A `KeysManager` can be constructed simply with only a 32-byte seed and some integers which ensure uniqueness across restarts (defined as `starting_time_secs` and `starting_time_nanos`).

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust>

```rust
let mut random_32_bytes = [0; 32];
// Fill in random_32_bytes with secure random data, or, on restart, reload the seed from disk.
let start_time = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
let keys_interface_impl = lightning::chain::keysinterface::KeysManager::new(&random_32_bytes, start_time.as_secs(), start_time.subsec_nanos());
```

  </template>

  <template v-slot:java>

```java
byte[] key_seed = new byte[32];
// Fill in random_32_bytes with secure random data, or, on restart, reload the seed from disk.
KeysManager keys_manager = KeysManager.of(key_seed,
    System.currentTimeMillis() / 1000,
    (int) (System.currentTimeMillis() * 1000)
);
```

  </template>

  <template v-slot:kotlin>

```kotlin
val key_seed = ByteArray(32)
// Fill in random_32_bytes with secure random data, or, on restart, reload the seed from disk.
val keys_manager = KeysManager.of(
    key_seed,
    System.currentTimeMillis() / 1000, (System.currentTimeMillis() * 1000).toInt()
)
```

  </template>
</CodeSwitcher>

# Creating a Unified Wallet
LDK makes it simple to combine an on-chain and off-chain wallet in the same app. This means users don’t need to worry about storing 2 different recovery phrases. For apps containing a hierarchical deterministic wallet (or “HD Wallet”) we recommend using the entropy from a [hardened child key derivation](https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch05.asciidoc#hardened-child-key-derivation) path for your LDK seed.

Using a [BDK](https://bitcoindevkit.org/)-based wallet the steps would be as follows:
 1) Generate a mnemonic/entropy 
 2) Build an HD wallet from that. That's now your on-chain wallet, and you can derive any BIP-compliant on-chain wallet/path for it from there.
 3) Derive the private key at `m/535'/535'/535'` (or some other custom path). That's 32 bytes and is your starting entropy for your LDK wallet.

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin'}">
  <template v-slot:rust>

```rust
// Use BDK to create and build the HD wallet
let mnemonic = Mnemonic::parse_in_normalized(
        Language::English,
        "sock lyrics village put galaxy famous pass act ship second diagram pull"
    ).unwrap();
let seed: [u8; 64] = mnemonic.to_seed_normalized("");
let master_xprv = ExtendedPrivKey::new_master(Network::Testnet, &seed).unwrap();
let secp = Secp256k1::new();
let xprv: ExtendedPrivKey = master_xprv.ckd_priv(&secp, ChildNumber::Hardened { index: 535 }).unwrap();
let ldk_seed: [u8; 32] = xprv.private_key.secret_bytes();

// Seed the LDK KeysManager with the private key at m/535h
let cur = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
let keys_manager = KeysManager::new(&ldk_seed, cur.as_secs(), cur.subsec_nanos());
```

 </template>
 <template v-slot:kotlin>

```kotlin
// Use BDK to create and build the HD wallet
val mnemonic = Mnemonic.fromString("sock lyrics village put galaxy famous pass act ship second diagram pull")
val bip32RootKey = DescriptorSecretKey(network = Network.TESTNET, mnemonic = mnemonic, password = null)
val ldkDerivationPath = DerivationPath("m/535h")
val ldkChild: DescriptorSecretKey = bip32RootKey.derive(ldkDerivationPath)

@OptIn(kotlin.ExperimentalUnsignedTypes::class)
val entropy: ByteArray = ldkChild.secretBytes().toUByteArray().toByteArray()

// Seed the LDK KeysManager with the private key at m/535h
val keysManager = KeysManager.of(
    entropy,
    System.currentTimeMillis() / 1000,
    (System.currentTimeMillis() * 1000).toInt()
);
```

 </template>
</CodeSwitcher>

::: tip Protection for on-chain wallet

An advantage to this approach is that the LDK entropy is contained within your initial mnemonic and a user only has one master private key to backup and secure. Another added benefit is that if your lightning keys were to be leaked we reduce the exposure to those funds and not the rest of the on-chain wallet. 

:::

Spending On-Chain Funds
=======================
When a channel has been closed and some outputs on chain are spendable only by us, LDK provides a `util::events::Event::SpendableOutputs` event in return from `ChannelMonitor::get_and_clear_pending_events()`. It contains a list of `chain::keysinterface::SpendableOutputDescriptor` objects which describe the output and provide all necessary information to spend it.

If you're using `KeysManager` directly, a utility method is provided which can generate a signed transaction given a list of `
SpendableOutputDescriptor` objects. `KeysManager::spend_spendable_outputs` can be called any time after receiving the `SpendableOutputDescriptor` objects to build a spending transaction, including delaying until sending funds to an external destination or opening a new channel. Note that if you open new channels directly with `SpendableOutputDescriptor` objects, you must ensure all closing/destination scripts provided to LDK are SegWit (either native or P2SH-wrapped).

If you are not using `KeysManager` for keys generation, you must re-derive the private keys yourself. Any `BaseSign` object must provide a unique id via the `channel_keys_id` function, whose value is provided back to you in the `SpendableOutputs` objects. A `SpendableOutputDescriptor::StaticOutput` element does not have this information as the output is sent to an output which used only `KeysInterface` data, not per-channel data.
