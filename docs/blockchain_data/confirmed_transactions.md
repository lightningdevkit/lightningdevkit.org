# Confirmed Transactions

Up until this point, we've explored how to notify LDK of chain activity using
blocks. But what if you're sourcing chain activity from a place that doesn't
provide a block-centric interface, like Electrum?

LDK has a `chain::Confirm` interface to support this use case, analogous to the
block-oriented `chain::Listen` interface which we've been using up until now.
With this alternative approach, you still need to give LDK block headers but
only for blocks containing transactions of interest. These are identified by
`chain::Filter` as before. You also need to notify LDK of any transactions with
insufficient confirmation that have been reorganized out of the chain. Use the
`transactions_confirmed` and `transaction_unconfirmed` methods, respectively.

Additionally, you must notify LDK whenever a new chain tip is available using
the `best_block_updated` method. See the documentation for a full picture of how
this interface is intended to be used.

::: tip Note
Be advised that `chain::Confirm` is a less mature interface than
`chain::Listen`. As such, there is not yet a utility like `lightning-block-sync`
to use for interacting with clients like Electrum.
:::