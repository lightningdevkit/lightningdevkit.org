# Pre-filtered Blocks

For environments that are resource constrained, receiving and processing all
transaction data may not be feasible. LDK handles this case by signaling back
which transactions and outputs it is interested in. This information can then be
used to filter blocks prior to sending them to your node.

For example, if your block source is an Electrum client, you can pass along this
information to it. Or, if you are making use of a BIP 157 client, you can check
if a block contains relevant transactions before fetching it.

So how does this work in practice? `ChainMonitor` is parameterized by an
optional type that implements `chain::Filter`:

<CodeSwitcher :languages="{rust:'Rust', java:'Java'}">
  <template v-slot:rust>

```rust
impl chain::Filter for Blockchain {
	fn register_tx(&self, txid: &Txid, script_pubkey: &Script) {
		// <insert code for you to watch for this transaction on-chain>
	}

	fn register_output(&self, output: WatchedOutput) -> Option<(usize, Transaction)> {
		// <insert code for you to watch for any transactions that spend this
		// output on-chain>
		// If you are fetching pre-filtered blocks, and do not fetch in-block
		// descendants of transactions, return any in-block spend of the given
		// output.
		// Otherwise return None.
	}
}
```

  </template>
  <template v-slot:java>

```java
Filter tx_filter = Filter.new_impl(new Filter.FilterInterface() {
	@Override
	public void register_tx(byte[] txid, byte[] script_pubkey) {
		// <insert code for you to watch for this transaction on-chain>
	}

	@Override
	Option_C2Tuple_usizeTransactionZZ register_output(WatchedOutput output) {
		// <insert code for you to watch for any transactions that spend this
		// output on-chain>
		// If you are fetching pre-filtered blocks, and do not fetch in-block
		// descendants of transactions, return any in-block spend of the given
		// output.
		// Otherwise return Option_C2Tuple_usizeTransactionZZ.none().
	}
});
```

  </template>
</CodeSwitcher>

When this is provided, `ChainMonitor` will call back to the filter as channels
are opened and blocks connected. This gives the opportunity for the source to
pre-filter blocks as desired.

Regardless, when a block is connected, its header must be processed by LDK.
