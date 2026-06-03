# Key Management

LDK provides a simple default `KeysManager` implementation that takes a 32-byte seed for use as a BIP 32 extended key and derives keys from that. Check out the [Rust docs](https://docs.rs/lightning/0.2.2/lightning/sign/struct.KeysManager.html).

However, LDK also allows to customize the way key material and entropy are sourced through custom implementations of the `NodeSigner`, `SignerProvider`, and `EntropySource` traits located in `sign`. These traits include basic methods to provide public and private key material, as well as pseudorandom numbers.

A `KeysManager` can be constructed simply with only a 32-byte seed and some random integers which ensure uniqueness across restarts (defined as `starting_time_secs` and `starting_time_nanos`):

::: code-group

```rust [Rust]
// Fill in random_32_bytes with secure random data, or, on restart, reload the seed from disk.
let mut random_32_bytes = [0; 32];
let start_time = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
// 0.2 adds a `v2_remote_key_derivation` flag (pass `true` for new nodes).
let keys_interface_impl = lightning::sign::KeysManager::new(&random_32_bytes, start_time.as_secs(), start_time.subsec_nanos(), true);
```

```kotlin [Kotlin]
// Fill in key_seed with secure random data, or, on restart, reload the seed from disk.
val key_seed = ByteArray(32)
val keys_manager = KeysManager.of(
    key_seed,
    System.currentTimeMillis() / 1000, (System.currentTimeMillis() * 1000).toInt(),
    true // v2_remote_key_derivation
)
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// Fill with secure random data, or, on restart, reload the seed from disk.
const seed = new Uint8Array(32);
const nowSecs = Math.floor(Date.now() / 1000);
const keysManager = ldk.KeysManager.constructor_new(
  seed,
  BigInt(nowSecs),                  // starting_time_secs (bigint)
  (Date.now() % 1000) * 1_000_000,  // starting_time_nanos
  true                              // v2_remote_key_derivation
);
```

:::

# Creating a Unified Wallet

LDK makes it simple to combine an on-chain and off-chain wallet in the same app. This means users don’t need to worry about storing two different recovery phrases. For apps containing a hierarchical deterministic wallet (or "HD Wallet") we recommend using the entropy from a [hardened child key derivation](https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch05.asciidoc#hardened-child-key-derivation) path for your LDK seed.

Using a [BDK](https://bitcoindevkit.org/)-based wallet the steps would be as follows:

1.  Generate a mnemonic/entropy source.
2.  Build an HD wallet from that. That's now your on-chain wallet, and you can derive any BIP-compliant on-chain wallet/path for it from there.
3.  Derive the private key at `m/535h` (or some other custom path). That's 32 bytes and is your starting entropy for your LDK wallet.
4.  Optional: use a custom `SignerProvider` implementation to have the BDK wallet provide the destination and shutdown scripts (see [Spending On-Chain Funds](#spending-on-chain-funds)).

::: code-group

```rust [Rust]
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
let keys_manager = KeysManager::new(&ldk_seed, cur.as_secs(), cur.subsec_nanos(), true);
```

```kotlin [Kotlin]
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
    (System.currentTimeMillis() * 1000).toInt(),
    true // v2_remote_key_derivation
);
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// Derive your 32-byte LDK seed from your HD wallet (e.g. the key at m/535h),
// then seed the KeysManager with it.
const ldkSeed: Uint8Array = /* 32 bytes derived at m/535h */;
const nowSecs = Math.floor(Date.now() / 1000);
const keysManager = ldk.KeysManager.constructor_new(
  ldkSeed,
  BigInt(nowSecs),
  (Date.now() % 1000) * 1_000_000,
  true // v2_remote_key_derivation
);
```

:::

::: tip Protection for on-chain wallet

An advantage to this approach is that the LDK entropy is contained within your initial mnemonic and a user only has one master private key to backup and secure. Another added benefit is that if your lightning keys were to be leaked we reduce the exposure to those funds and not the rest of the on-chain wallet.

:::

# Spending On-Chain Funds

When a channel has been closed and some outputs on chain are spendable only by us, LDK provides a `events::Event::SpendableOutputs` event in return from `ChannelMonitor::get_and_clear_pending_events()`. It contains a list of `sign::SpendableOutputDescriptor` objects which describe the output and provide all necessary information to spend it.

If you're using `KeysManager` directly, a utility method is provided which can generate a signed transaction given a list of `
SpendableOutputDescriptor` objects. `KeysManager::spend_spendable_outputs` can be called any time after receiving the `SpendableOutputDescriptor` objects to build a spending transaction, including delaying until sending funds to an external destination or opening a new channel. Note that if you open new channels directly with `SpendableOutputDescriptor` objects, you must ensure all closing/destination scripts provided to LDK are SegWit (either native or P2SH-wrapped).

If you are not using `KeysManager` for keys generation, you must re-derive the private keys yourself. Any `ChannelSigner` object must provide a unique id via the `channel_keys_id` function, whose value is provided back to you in the `SpendableOutputs` objects. A `SpendableOutputDescriptor::StaticOutput` element does not have this information as the output is sent to an output which used only `KeysInterface` data, not per-channel data.

In order to make the outputs from channel closing spendable by a third-party wallet, a middleground between using the default `KeysManager` and an entirely custom implementation of `SignerProvider`/`NodeSigner`/`EntropySource` could be to implement a wrapper around `KeysManager`. Such a wrapper would need to override the respective methods returning the destination and shutdown scripts while simply dropping any instances of `SpendableOutputDescriptor::StaticOutput`, as these then could be spent by the third-party wallet from which the scripts had been derived.

For example, a wrapper based on BDK's [`Wallet`](https://docs.rs/bdk/*/bdk/wallet/struct.Wallet.html) could look like this:

::: tip Note
The `SignerProvider` trait changed in 0.2: `generate_channel_keys_id` and
`derive_channel_signer` no longer take `channel_value_satoshis`,
`get_destination_script` now takes a `channel_keys_id` and returns `ScriptBuf`,
and `spend_spendable_outputs` lives on the separate `OutputSpender` trait
(implemented by `KeysManager`). For a production-grade wrapper, see
[LDK Node's `KeysManager`](https://github.com/lightningdevkit/ldk-node/blob/main/src/wallet/mod.rs).
:::

::: code-group

```rust [Rust]
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
		let inner = KeysManager::new(seed, starting_time_secs, starting_time_nanos, true);
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
		change_destination_script: ScriptBuf, feerate_sat_per_1000_weight: u32,
		locktime: Option<LockTime>, secp_ctx: &Secp256k1<C>,
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
	type EcdsaSigner = InMemorySigner;

	// We return the destination and shutdown scripts derived by the BDK wallet.
	// `get_destination_script` now takes a `channel_keys_id` and returns `ScriptBuf`.
	fn get_destination_script(&self, _channel_keys_id: [u8; 32]) -> Result<ScriptBuf, ()> {
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
	// Note: `generate_channel_keys_id` and `derive_channel_signer` no longer take
	// `channel_value_satoshis` in 0.2.
	fn generate_channel_keys_id(
		&self, inbound: bool, user_channel_id: u128,
	) -> [u8; 32] {
		self.inner.generate_channel_keys_id(inbound, user_channel_id)
	}

	fn derive_channel_signer(
		&self, channel_keys_id: [u8; 32],
	) -> Self::EcdsaSigner {
		self.inner.derive_channel_signer(channel_keys_id)
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

```kotlin [Kotlin]
class LDKKeysManager(seed: ByteArray, startTimeSecs: Long, startTimeNano: Int, wallet: Wallet) {
  var inner: KeysManager
  var wallet: Wallet
  var signerProvider: LDKSignerProvider

  init {
      this.inner = KeysManager.of(seed, startTimeSecs, startTimeNano, true)
      this.wallet = wallet
      signerProvider = LDKSignerProvider()
      signerProvider.ldkkeysManager = this
  }

  // We drop all occurences of `SpendableOutputDescriptor::StaticOutput` (since they will be
  // spendable by the BDK wallet) and forward any other descriptors to
  // `KeysManager::spend_spendable_outputs`.
  //
  // Note you should set `locktime` to the current block height to mitigate fee sniping.
  // See https://bitcoinops.org/en/topics/fee-sniping/ for more information.
  fun spend_spendable_outputs(
      descriptors: Array<SpendableOutputDescriptor>,
      outputs: Array<TxOut>,
      changeDestinationScript: ByteArray,
      feerateSatPer1000Weight: Int,
      locktime: Option_u32Z
  ): Result_TransactionNoneZ {
      val onlyNonStatic: Array<SpendableOutputDescriptor> = descriptors.filter { it !is SpendableOutputDescriptor.StaticOutput }.toTypedArray()

      return inner.spend_spendable_outputs(
          onlyNonStatic,
          outputs,
          changeDestinationScript,
          feerateSatPer1000Weight,
          locktime,
      )
  }
}

class LDKSignerProvider : SignerProvider.SignerProviderInterface {
  var ldkkeysManager: LDKKeysManager? = null

  // Note: `generate_channel_keys_id` and `derive_channel_signer` no longer take
  // `channelValueSatoshis` in 0.2.
  override fun generate_channel_keys_id(inbound: Boolean, userChannelId: UInt128?): ByteArray {
      return ldkkeysManager!!.inner.as_SignerProvider().generate_channel_keys_id(inbound, userChannelId)
  }

  override fun derive_channel_signer(channelKeysId: ByteArray?): EcdsaChannelSigner {
      return ldkkeysManager!!.inner.as_SignerProvider().derive_channel_signer(channelKeysId)
  }

  // We return the destination and shutdown scripts derived by the BDK wallet.
  // `get_destination_script` now takes a `channelKeysId`.
  @OptIn(ExperimentalUnsignedTypes::class)
  override fun get_destination_script(channelKeysId: ByteArray): Result_CVec_u8ZNoneZ {
      val address = ldkkeysManager!!.wallet.getAddress(AddressIndex.New)
      return Result_CVec_u8ZNoneZ.ok(address.address.scriptPubkey().toBytes().toUByteArray().toByteArray())
  }

  // Only applies to cooperative close transactions.
  override fun get_shutdown_scriptpubkey(): Result_ShutdownScriptNoneZ {
      val address = ldkkeysManager!!.wallet.getAddress(AddressIndex.New).address

      return when (val payload: Payload = address.payload()) {
          is Payload.WitnessProgram -> {
              val ver = when (payload.version.name) {
                  in "V0".."V16" -> payload.version.name.substring(1).toIntOrNull() ?: 0
                  else -> 0 // Default to 0 if it doesn't match any "V0" to "V16"
              }

              val result = ShutdownScript.new_witness_program(
                  WitnessVersion(ver.toByte()),
                  payload.program.toUByteArray().toByteArray()
              )
              Result_ShutdownScriptNoneZ.ok((result as Result_ShutdownScriptInvalidShutdownScriptZ.Result_ShutdownScriptInvalidShutdownScriptZ_OK).res)
          }
          else -> {
              Result_ShutdownScriptNoneZ.err()
          }
      }
  }
}

```

:::
