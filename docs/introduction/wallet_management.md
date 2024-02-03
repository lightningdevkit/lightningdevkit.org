# Wallet Management 

LDK owns on-chain funds as long as they are claimable as a part of a Lightning output which can be contested - once a channel is closed and all on-chain outputs are spendable only by you, LDK provides you notifications that a UTXO is "yours" again and it is up to you to spend it as you wish. 

Additionally, channel funding is accomplished with a generic API which notifies users of the output which needs to appear on-chain, which they can then create a transaction for. Once a transaction is created, LDK handles the rest. This is a large part of our API's goals - making it easier to integrate Lightning into existing on-chain wallets which have their own on-chain logic - without needing to move funds in and out of a separate Lightning wallet with on-chain transactions and a separate private key system.

LDK does not currently provide a sample wallet module, but its sample node implementation uses Bitcoin Core's wallet for UTXO management e.g. [here](https://github.com/lightningdevkit/ldk-sample/blob/2cd778e7acc959689e3b8462c529ffb3509aa1ec/src/main.rs#L245-L260)