# Key Management

LDK provides a simple default `KeysManager` implementation that takes a 32-byte seed for use as a BIP 32 extended key and derives keys from that. Check out the [Rust docs](https://docs.rs/lightning/*/lightning/chain/keysinterface/struct.KeysManager.html).

However, LDK also allows to customize the way key material and entropy are sourced through custom implementations of the `NodeSigner`, `SignerProvider`, and `EntropySource` traits located in `chain::keysinterface`. These traits include basic methods to provide public and private key material, as well as pseudorandom numbers.

A `KeysManager` can be constructed simply with only a 32-byte seed and some random integers which ensure uniqueness across restarts (defined as `starting_time_secs` and `starting_time_nanos`):

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

LDK makes it simple to combine an on-chain and off-chain wallet in the same app. This means users don’t need to worry about storing two different recovery phrases. For apps containing a hierarchical deterministic wallet (or "HD Wallet") we recommend using the entropy from a [hardened child key derivation](https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch05.asciidoc#hardened-child-key-derivation) path for your LDK seed.

Using a [BDK](https://bitcoindevkit.org/)-based wallet the steps would be as follows:

1.  Generate a mnemonic/entropy source.
2.  Build an HD wallet from that. That's now your on-chain wallet, and you can derive any BIP-compliant on-chain wallet/path for it from there.
3.  Derive the private key at `m/535h` (or some other custom path). That's 32 bytes and is your starting entropy for your LDK wallet.
4.  Optional: use a custom `SignerProvider` implementation to have the BDK wallet provide the destination and shutdown scripts (see [Spending On-Chain Funds](#spending-on-chain-funds)).

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust>

```rust
// Use BDK to create and build the HD wallet
let mnemonic = Mnemonic::parse_in_normalized(
        Language::English,
        "sock lyrics village put galaxy famous pass act ship second diagram pull"
    ).unwrap();
let seed: [u8; 64] = mnemonic.to_seed_normalized("");
// Other supported networks include mainnet (Bitcoin), Regtest, Signet
let master_xprv = ExtendedPrivKey::new_master(Network::Testnet, &seed).unwrap();
let secp = Secp256k1::new();
let xprv: ExtendedPrivKey = master_xprv.ckd_priv(&secp, ChildNumber::Hardened { index: 535 }).unwrap();
let ldk_seed: [u8; 32] = xprv.private_key.secret_bytes();

// Seed the LDK KeysManager with the private key at m/535h
let cur = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
let keys_manager = KeysManager::new(&ldk_seed, cur.as_secs(), cur.subsec_nanos());
```

 </template>

 <template v-slot:java>

```java
// Use BDK to create and build the HD wallet
Mnemonic mnemonic = Mnemonic.Companion.fromString("sock lyrics " +
                "village put galaxy " +
                "famous pass act ship second diagram pull");

// Other supported networks include mainnet (Bitcoin), Regtest, Signet
DescriptorSecretKey bip32RootKey = new DescriptorSecretKey(Network.TESTNET, mnemonic, null);

DerivationPath ldkDerivationPath = new DerivationPath("m/535h");
DescriptorSecretKey ldkChild = bip32RootKey.derive(ldkDerivationPath);

ByteArrayOutputStream bos = new ByteArrayOutputStream();
ObjectOutputStream oos = new ObjectOutputStream(bos);
oos.writeObject(ldkChild.secretBytes());
byte[] entropy = bos.toByteArray();

// Seed the LDK KeysManager with the private key at m/535h
var startupTime = System.currentTimeMillis();
KeysManager keysManager = KeysManager.of(
        entropy,
        startupTime / 1000,
        (int) (startupTime * 1000)
);
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

# Spending On-Chain Funds

When a channel has been closed and some outputs on chain are spendable only by us, LDK provides a `util::events::Event::SpendableOutputs` event in return from `ChannelMonitor::get_and_clear_pending_events()`. It contains a list of `chain::keysinterface::SpendableOutputDescriptor` objects which describe the output and provide all necessary information to spend it.

If you're using `KeysManager` directly, a utility method is provided which can generate a signed transaction given a list of `
SpendableOutputDescriptor` objects. `KeysManager::spend_spendable_outputs` can be called any time after receiving the `SpendableOutputDescriptor` objects to build a spending transaction, including delaying until sending funds to an external destination or opening a new channel. Note that if you open new channels directly with `SpendableOutputDescriptor` objects, you must ensure all closing/destination scripts provided to LDK are SegWit (either native or P2SH-wrapped).

If you are not using `KeysManager` for keys generation, you must re-derive the private keys yourself. Any `ChannelSigner` object must provide a unique id via the `channel_keys_id` function, whose value is provided back to you in the `SpendableOutputs` objects. A `SpendableOutputDescriptor::StaticOutput` element does not have this information as the output is sent to an output which used only `KeysInterface` data, not per-channel data.

In order to make the outputs from channel closing spendable by a third-party wallet, a middleground between using the default `KeysManager` and an entirely custom implementation of `SignerProvider`/`NodeSigner`/`EntropySource` could be to implement a wrapper around `KeysManager`. Such a wrapper would need to override the respective methods returning the destination and shutdown scripts while simply dropping any instances of `SpendableOutputDescriptor::StaticOutput`, as these then could be spent by the third-party wallet from which the scripts had been derived.

For example, a wrapper based on BDK's [`Wallet`](https://docs.rs/bdk/*/bdk/wallet/struct.Wallet.html) could look like this:

<CodeSwitcher :languages="{rust:'Rust'}">
<template v-slot:rust>

```rust
pub struct BDKKeysManager<D>
where
	D: bdk::database::BatchDatabase,
{
	inner: KeysManager,
	wallet: Arc<Mutex<bdk::Wallet<D>>>,
}

impl<D> BDKKeysManager<D>
where
	D: bdk::database::BatchDatabase,
{
	pub fn new(
		seed: &[u8; 32], starting_time_secs: u64, starting_time_nanos: u32, wallet: Arc<Mutex<bdk::Wallet<D>>>,
	) -> Self {
		let inner = KeysManager::new(seed, starting_time_secs, starting_time_nanos);
		Self { inner, wallet }
	}

	// We drop all occurences of `SpendableOutputDescriptor::StaticOutput` (since they will be
	// spendable by the BDK wallet) and forward any other descriptors to
	// `KeysManager::spend_spendable_outputs`.
	//
	// Note you should set `locktime` to the current block height to mitigate fee sniping.
	// See https://bitcoinops.org/en/topics/fee-sniping/ for more information.
	pub fn spend_spendable_outputs<C: Signing>(
		&self, descriptors: &[&SpendableOutputDescriptor], outputs: Vec<TxOut>,
		change_destination_script: Script, feerate_sat_per_1000_weight: u32,
		locktime: Option<PackedLockTime>, secp_ctx: &Secp256k1<C>,
	) -> Result<Transaction, ()> {
		let only_non_static = &descriptors
			.iter()
			.filter(|desc| {
				if let SpendableOutputDescriptor::StaticOutput { .. } = desc {
					false
				} else {
					true
				}
			})
			.copied()
			.collect::<Vec<_>>();
		self.inner.spend_spendable_outputs(
			only_non_static,
			outputs,
			change_destination_script,
			feerate_sat_per_1000_weight,
			locktime,
			secp_ctx,
		)
	}
}

impl<D> SignerProvider for BDKKeysManager<D>
where
	D: bdk::database::BatchDatabase,
{
	type Signer = InMemorySigner;

	// We return the destination and shutdown scripts derived by the BDK wallet.
	fn get_destination_script(&self) -> Result<Script, ()> {
		let address = self.wallet.lock().unwrap()
			.get_address(bdk::wallet::AddressIndex::New)
			.map_err(|e| {
				eprintln!("Failed to retrieve new address from wallet: {:?}", e);
			})?;
		Ok(address.script_pubkey())
	}

	fn get_shutdown_scriptpubkey(&self) -> Result<ShutdownScript, ()> {
		let address = self.wallet.lock().unwrap()
			.get_address(bdk::wallet::AddressIndex::New)
			.map_err(|e| {
				eprintln!("Failed to retrieve new address from wallet: {:?}", e);
			})?;
		match address.payload {
			bitcoin::util::address::Payload::WitnessProgram { version, program } => {
				ShutdownScript::new_witness_program(version, &program).map_err(|e| {
					eprintln!("Invalid shutdown script: {:?}", e);
				})
			}
			_ => panic!("Tried to use a non-witness address. This must not ever happen."),
		}
	}

	// ... and redirect all other trait method implementations to the `inner` `KeysManager`.
	fn generate_channel_keys_id(
		&self, inbound: bool, channel_value_satoshis: u64, user_channel_id: u128,
	) -> [u8; 32] {
		self.inner.generate_channel_keys_id(inbound, channel_value_satoshis, user_channel_id)
	}

	fn derive_channel_signer(
		&self, channel_value_satoshis: u64, channel_keys_id: [u8; 32],
	) -> Self::Signer {
		self.inner.derive_channel_signer(channel_value_satoshis, channel_keys_id)
	}

	fn read_chan_signer(&self, reader: &[u8]) -> Result<Self::Signer, DecodeError> {
		self.inner.read_chan_signer(reader)
	}
}

impl<D> NodeSigner for BDKKeysManager<D>
where
	D: bdk::database::BatchDatabase,
{
// ... snip
}

impl<D> EntropySource for BDKKeysManager<D>
where
	D: bdk::database::BatchDatabase,
{
// ... snip
}

```

  </template>
</CodeSwitcher>
