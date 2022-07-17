# Block Source

Implementing the `BlockSource` interface requires defining methods for fetching
headers, blocks, and the best block hash.


<CodeSwitcher :languages="{rust:'Rust'}">
  <template v-slot:rust>

```rust
impl BlockSource for Blockchain {
	fn get_header<'a>(&'a mut self, header_hash: &'a BlockHash, _height: Option<u32>) -> AsyncBlockSourceResult<'a, BlockHeaderData> {
		// <insert code for fetching block headers>
	}

	fn get_block<'a>(&'a mut self, header_hash: &'a BlockHash) -> AsyncBlockSourceResult<'a, Block> {
		// <insert code for fetching block>
	}

	fn get_best_block<'a>(&'a mut self) -> AsyncBlockSourceResult<'a, (BlockHash, Option<u32>)> {
		// <insert code for fetching the best block hash>
	}
}
```

  </template>
</CodeSwitcher>

<!-- ADD JAVA EXAMPLE -->

For instance, you may implement this interface by querying Bitcoin Core's JSON
RPC interface, which happens to be a sample implementation provided by
`lightning-block-sync`.

Let's walk through the use case where LDK receives full blocks.
