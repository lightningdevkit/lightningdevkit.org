# Confirmed Transactions

Up until this point, we've explored how to notify LDK of chain activity using
blocks. But what if you're sourcing chain activity from a place that doesn't
provide a block-centric interface, like Electrum?

LDK's `ChannelManager` and `ChainMonitor` implement a
[`chain::Confirm`](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html)
interface to support this use case, analogous to the block-oriented
[`chain::Listen`](https://docs.rs/lightning/*/lightning/chain/trait.Listen.html)
interface which we've been using up until now. With this alternative approach,
you still need to give LDK information about chain activity,
but only for transactions of interest. To this end, you must call
`Confirm::transactions_confirmed` when any transactions identified by 
[`chain::Filter`](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html)'s
`register_tx`/`register_output` methods are confirmed.

You also need to notify LDK of any transactions with insufficient confirmations
that have been reorganized out of the chain. Transactions that need to be monitored for such
reorganization are returned by `Confirm::get_relevant_txids`. If any of these transactions become
unconfirmed, you must call `Confirm::transaction_unconfirmed`.

Lastly, you must notify LDK whenever a new chain tip is available using
the `Confirm::best_block_updated` method. See the documentation for a full
picture of how this interface is intended to be used.

::: tip Note
Note that the described methods of `Confirm` must be called in accordance with the ordering requirements
described in the [`Confirm` documentation](https://docs.rs/lightning/*/lightning/chain/trait.Confirm.html#order)
:::

::: tip Note
Note that the described methods of `Confirm` must be called both on the
`ChannelManager` *and* the `ChainMonitor`.
:::

::: tip Note
Be advised that `chain::Confirm` is a less mature interface than
`chain::Listen`. As such, there is not yet a utility like
`lightning-block-sync` to use for interacting with clients like Electrum.
:::
