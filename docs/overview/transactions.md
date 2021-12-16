# Transactions

## Transaction Filtering

Clients running a light client may wish to filter for transactions on a separate server, in which case LDK will tell them about transactions to filter for. 

[LDK's `Filter` API reference](https://docs.rs/lightning/*/lightning/chain/trait.Filter.html)

More information is available in the [Blockchain Data guide](/blockchain_data/introduction).

## Fee Estimation 

LDK let's you decide your source for fee estimation. This could be Bitcoin Core's fee estimation through `estimatesmartfee` RPC method or third-party [fee-estimators](https://b10c.me/blog/003-a-list-of-public-bitcoin-feerate-estimation-apis/).

[LDK's `FeeEstimator` docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.FeeEstimator.html)

LDK's sample node implementation uses Bitcoin Core's fee estimation API [here.](https://github.com/lightningdevkit/ldk-sample/blob/2cd778e7acc959689e3b8462c529ffb3509aa1ec/src/bitcoind_client.rs#L98-L154)

## Transaction Broadcasting

You can broadcast transactions in a few ways, using Bitcoin core or other [external API's](https://en.bitcoin.it/wiki/Transaction_broadcasting)

[LDK's `BroadcasterInterface` docs](https://docs.rs/lightning/*/lightning/chain/chaininterface/trait.BroadcasterInterface.html)

LDK's sample node implementation uses Bitcoin Core's transaction broadcasting API [here.](https://github.com/lightningdevkit/ldk-sample/blob/2cd778e7acc959689e3b8462c529ffb3509aa1ec/src/bitcoind_client.rs#L235-L257) 