---
title: "Using BDK to create BIP157 SPV wallet (aka Neutrino)"
description: "Tutorial showing usage of compact filters (BIP157) using bdk-cli command line tools"
authors:
    - Rajarshi Maitra
date: "2021-06-20"
tags: ["tutorial", "BDK", "bdk-cli", "compact_filters", "BIP157", "Neutrino"]
hidden: true
draft: false
---

## Introduction

#### Compact Filters:
Compact filters are the latest specification of Bitcoin SPV node implementation as per [BIP157](https://github.com/bitcoin/bips/blob/master/bip-0157.mediawiki) and [BIP158](https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki). Such light clients were envisioned by Satoshi himself in  his original white paper, but due to lack of robust privacy and trust guarantees using conventional [bloomfilters](https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki), these type of nodes never got popular.  

Enters [BIP157](https://github.com/bitcoin/bips/blob/master/bip-0157.mediawiki), which described a new type of filters for Bitcoin Blockchain data, known as `compact_filters`. The [Neutrino](https://github.com/lightninglabs/neutrino) project pioneered the use of compact filter based light client nodes for using with Lightning Network wallets. Using compact filters, a light-node can talk to one or more full nodes, and fetch relevant information from the blockchain, with much more robust privacy and security guarantees than previously possible. Compact filter based nodes are best suitable to be used with mobile wallets, to create more trustless mobile applications on Bitcoin. Any wallet application that needs to have an "eye on the blockchain" has an use for such light clients.

`BIP157` type filters allows to create tiny sized SPV nodes, that can fetch blockchain data and can identify inconsistency, so it can actively defend itself, while also preserving its privacy. Such nodes are most useful for Lightning Network mobile applications.    

Example of such `compact_filters` wallets in wild is [Breeze](https://github.com/breez/breezmobile) Lightning mobile wallet.

Bitcoin core supports serving `BIP157` type filters from `v0.21.0`.  

#### BDK and Compact filters
BDK is a bitcoin wallet development library that can be used to create bitcoin wallets with custom `Database` and `Blockchain` backends. BDK is a [descriptor](https://bitcoindevkit.org/descriptors/) based wallet, i.e. the wallet keychain is described by a set of descriptors. 

Using BDK one can instantiate wallets of various kinds as per requirement. BDK abstracts away all the heavy lifting works, and allow wallet devs to concentrate on logic that they care about, i.e. writing wallet codes. For more detailed documentation on BDK capabilities check these [blog](https://bitcoindevkit.org/blog/2020/12/hello-world/), [bog](https://bitcoindevkit.org/blog/2020/11/descriptors-in-the-wild/) and [docs](https://docs.rs/bdk/).

The main three components of abstraction in BDK are 
  - `Database`
  - `Descriptors`
  - `Blockchain`

BDK comes with default implementations of all them that developers can start with out of the box. Developers can also create there own custom implementations and plug it into BDK (thanks to rust magic of `Traits`).

BDK also supports [BIP158](https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki) communication protocol, which allows creation of `BIP157` type compact filter SPV nodes. This capability is extended to wallet with BDK's `Blockchain` data structure. The [API](https://docs.rs/bdk/0.8.0/bdk/blockchain/trait.Blockchain.html) for `compact_filters` backend is similar to any other kind of backends, so wallet devs don't need to worry about all the details. Its ok if the dev haven't even heard of `BIP157`, BDK takes care of that in background. 

This capability can be unlocked by compiling BDK with the `compact_filters` feature. Once enabled, BDK will be able to create wallets with the `compact_filters` type `Blockchain` backend. (The default backend is electrum server) 

#### bdk-cli
`bdk-cli` is a lightweight [REPL](https://codewith.mu/en/tutorials/1.0/repl) wrapper over the BDK library to facilitate quick and easy demonstration of BDK capabilities in command-line. Wallet devs can use this tool to quickly try out different possibilities with BDK.

In this tutorial, We will use `bdk-cli` to demonstrate some basic wallet functionalities using `compact_filters` backend.

## Tutorial Scope
Basic wallet workflow we will cover: 

  - create and sync a wallet,
  - receive a transaction,
  - create a transaction,
  - sign and broadcast the transaction,
  - fetch updated balance,

The BDK wallet will have a `BIP157` SPV backend (aka `compact_filters` backend) that will connect with a Bitcoin core node serving filter data.

It will publish and extract transaction data through that node.

We will have a Bitcoin Core wallet and a BDK wallet, sending and receiving transactions between each other, in regtest.

## Prerequisites
Following things are required to start with the tutorial.

1. A Bitcoin Core regtest node listening at `localhost:18444` signalling for compact filter support. 
2. `bdk-cli` compiled with `compact_filter` features.

If you already have these two setup and working, you can skip this and jump to the [Tutorial](#tutorial) section.

#### Install and run `bitcoind` 
You can definitely do it with your own `bitcoind` installation. `BIP157` support has been included in Bitcoin Core `v0.21.0`. So anything above that will work.

You also need to ensure proper configuration settings for signalling `compact_filters` support.  

For ease of testing, the BDK project hosts docker images that can be used to spawn Bitcoin Core with all the relevant configurations.

- spawn a regtest node using [bitcoin-regtest-box](https://github.com/bitcoindevkit/bitcoin-regtest-box) docker file. 
  
  Start the regtest box docker container.

  ```shell
  $ docker run --detach --rm -p 127.0.0.1:18443-18444:18443-18444/tcp --name bdk-box bitcoindevkit/bitcoind
  ```
  This will spin up a docker container running `bicoind` and listening to port `18444` and `18333`. You can keep this terminal alive to see communication events with BDK and the node.

- Check node is reachable

  In another terminal try connecting to the node with `bitcoin-cli`
  ```shell
  $ docker exec -it bdk-box /root/bitcoin-cli -regtest getnetworkinfo
  {
    "version": 210000,
    "subversion": "/Satoshi:0.21.1/",
    "protocolversion": 70016,
    "localservices": "0000000000000449",
    "localservicesnames": [
      "NETWORK",
      "WITNESS",
      "COMPACT_FILTERS",
      "NETWORK_LIMITED"
      ...
    ],
  }

  ```
  In the output, the `version` should show `210000`. `localservicesnames` should contain `"COMPACT_FILTERS"`. If you see this, then Bitcoin Core is correctly configured.

#### Install and run bdk-cli
- Install `bdk-cli` with `compact_filters` feature

  ```shell
  $ cargo install --git https://github.com/bitcoindevkit/bdk-cli.git bdk-cli --features compact_filters
  ```
- Check installation
  ```shell
  $ bdk-cli --help
  ...
  USAGE:
      bdk-cli [OPTIONS] <SUBCOMMAND>
  FLAGS:
      -h, --help Prints help information
      -V, --version Prints version information
  OPTIONS:
      -n, --network <NETWORK> Sets the network [default: testnet]

  SUBCOMMANDS:
      help      Prints this message or the help of the given subcommand(s)
      key       Key management sub-commands
      repl      Enter REPL command loop mode
      wallet    Wallet options and sub-commands
  ```
Once these are setup correctly, you can start with the tutorial next.

  

## Tutorial
[Note: For brevity `bdk-cli` results are stored in command line variables using `jq` tool. It is recommended to check the full results to see different information returned by `bdk-cli` commands.]

### Bitcoin Core Wallet Generation

This is standard procedure with `bitcoin-cli`.

- Create a wallet and generate 101 blocks. 
  ```shell
  $ docker exec -it bdk-box /root/bitcoin-cli -regtest createwallet test
  {
    "name": "test",
    "warning": ""
  }
  ```

  ```shell
  $ docker exec -it bdk-box /root/bitcoin-cli -regtest getnewaddress
  bcrt1qatd7yq0jukwusuaufltlejmeydpvnpv43r5gc2
  ```
  ```shell
  $ docker exec -it bdk-box /root/bitcoin-cli -regtest generatetoaddress 101 bcrt1qatd7yq0jukwusuaufltlejmeydpvnpv43r5gc2
  [
  "3813ed6eb716f4743b9657d918799acf743add985a8ded28d8aa3629dd4496b6",
  "70da855913bdf791b6e458c611cebdef79b7a9840eb103ce58c71c1c7e3c49bc",
  "682ca732ef72719cd6f82c5047c7690fb1cd2df2543d035ac4ea99e974b8d172",
  "78799e4771017d4f46aa3c240054e2d61f54cea07ec44cb18ae712761e0aaa1e",
  ...
  ]
  ```
  ```shell
  $ docker exec -it bdk-box /root/bitcoin-cli -regtest getbalance
  50.00000000
  ```
  Now the core wallet has generated new blocks and is funded with test bitcoin.


### BDK Wallet Generation
BDK is a descriptor based wallet library. So in order to use it we will need some descriptors to work with. 

BDK wallet will ask for two descriptors as input, corresponding to `receive` and `change` addresses. Its recommended to have these two descriptors separate as BDK will handle them separately and ensure `change` addresses are never used for receiving funds. 

Or developers can decide to use a single descriptor too, in that case BDK will use that descriptor for deriving both `receive` and `change` addresses.

We will use `bdk-cli` itself to generate such descriptors.

- #### Generate a privatekey 
  ```shell
  $ BDK_xprv=$(bdk-cli key generate | jq -r '.xprv')
  $ echo $BDK_xprv 
  tprv8ZgxMBicQKsPefY7tdq7EKny81n9tfSvUYfSHAZByXdjPAZVysvaB6sFd2YavqfqMBgbHaXUG5oWM6sYvdJn6vnUizzQKTYAJ36bQsfPv4N
  ```
  `bdk-cli key generate` will generate a fresh master key with `mnemonic` and `xprv`. We have extracted the value of extended private key and stored it in `BDK_xprv` variable.

  The returned `mnemonic` can be used to restore back the wallet if wallet data directory is lost. 

- #### Generate Descriptors
	`bdk-cli key derive` can derive an `xpub`s given a `master key` and `derivation_path`.

  We will use the following paths for our `receive` and `change` descriptors 

	- `receive` path: `m/84h/1h/0h/0` 
	- `change` path: `m/84h/1h/0h/1`, 
	
	We can then simply wrap them in a `"wpkh()"` to create our descriptors string and store them. 

  When asked for a new address, BDK will derive one from the `receive` descriptor. 
  
  And while constructing transaction, BDK will use the `change` descriptor to derive change address.

	```shell
  $ BDK_recv_desc="wpkh($(bdk-cli key derive --path m/84h/1h/0h/0 --xprv $BDK_xprv | jq -r '.xprv'))"
  $ echo $BDK_recv_desc
  wpkh([ff09c7c9/84'/1'/0'/0]tprv8hkdEGgwLLnqsdfkJFidpTj5d6z5qFdP6Qwzsviea3HrS9C2mXXaDivPKCCgcaWvnGNX9eciLUQs91PWYXJqrChfnAagViCgG6L5phaNyWr/*) 
  ```
  ```shell
  $ BDK_chng_desc="wpkh($(bdk-cli key derive --path m/84h/1h/0h/1 --xprv $BDK_xprv | jq -r '.xprv'))"
  $ echo $BDK_chng_desc 
  wpkh([ff09c7c9/84'/1'/0'/1]tprv8hkdEGgwLLnqtbYkGG7fSy7v43RF2SQGGjNuZtmBzEHh7H8xgpXBETQAbVPqi8rkvLNFKLYY4rDzXA4fn5Ha1yuazZqhQPe3uNKmFS7648s/*)
  ```
  Note: `BDK_xprv` has been used as the `master key`, this will allow BDK to have signing capabilities. 
  We could have used an `xpub` master key here instead, that would create an `watch-only` wallet.

- #### Create and Sync a wallet
  We will now instruct BDK to create a new wallet with following instructions 

	```shell
  $ bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc sync
  {}
  ```
    - name (`--wallet`) `bdk-test`, 
    - `receive` descriptor (`-d`) as `$BDK_recv_desc` and change descriptor (`-c`) as `$BDK_chng_desc`,
    - connected to a full node (`--node`) listening at `127.0.0.1:18444`,
    - and finally create and sync the wallet with the `sync` command.

  If you are using a `regtest` node, also add `--network regtest`, the default is `testnet`.

  `bdk-cli` makes multiple parallel connections that can be configured with the `--conn-count` parameter (default is 4). This makes syncing parallel and fast. Use `bdk-cli --help` to see all other options. 

  Getting an empty return means wallet creation succeeded.

  BDK has created a wallet named `bdk-test` in its data directory. Which is by default stored at `~/.bdk-bitcoin/compact_filters` folder.

  Looking into that folder different files and directories maintained by BDK can be seen.
  ```shell
  $ ls .bdk-bitcoin/compact_filters/
  000004.log  CURRENT   LOCK  MANIFEST-000003  OPTIONS-000010
  bdk-test    IDENTITY  LOG   OPTIONS-000008
  ```
### Recieve Coins

We will use the `core` wallet to send 5 BTC to our`bdk-test` wallet.

- Fetch a new address using `bdk-cli`
  ```shell
  $ bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc get_new_address
  {
    "address": "bcrt1qx2479wywulf50pqx5uy64zhxq9f3tuvlh8u0s9"
  }
  ```

- Transfer funds to the previous address and generate a block, using `bitcoin-cli`
  ```shell
  $ docker exec -it bdk-box /root/bitcoin-cli -regtest sendtoaddress bcrt1qx2479wywulf50pqx5uy64zhxq9f3tuvlh8u0s9 5


  $ docker exec -it bdk-box /root/bitcoin-cli -regtest generatetoaddress 1 bcrt1qw3ht9xtc9pgyvmqay0ap9fw8mxd27az8el0uz3
  ```

  `core` has sent 5 BTC to our `bdk-test` wallet. Which is confirmed in a new block. 
  
  `bdk-test` can see that now by syncing again. 

  (Note: BDK required explicit `sync()` calls to give wallet developers flexibility on when to sync).
  ```shell
  $ bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc sync
  {}

  $ bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc get_balance
  {
    "satoshi": 500000000
  }
  ```

  We can see `500000000` sats balance in our `bdk-test` wallet. 
  
  BDK has fetched blockchain details concerning its wallet descriptors, from the core node, using compact filters. 

### Creating a transaction.
  Now we want to create a transaction sending coins from `bdk-test` wallet to the `core` wallet.

- fetch a new `core` address
  ```shell
  $ core_addrs=$(docker exec -it bdk-box /root/bitcoin-cli -regtest getnewaddress | tr -d '\r')
  ```

- Create a raw transaction using `bdk-cli` to the above address. This will generate a `psbt` which we will sign.
  ```shell
  $ psbt=$(bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc create_tx --to $core_addrs:200000000 | jq -r '.psbt')
  ```
  (Recommended to check all the other information returned by `bdk-cli create_tx`)  

### Sign and Broadcast the transaction
Asking BDK to sign a transaction is as straight forward as it can get. BDK already holds the `xprv` deatils to sign a transaction. It returns a finalised `signed_psbt` which we will next broadcast to the network.
	
- Sign the transaction
  ```shell
  $ signed_psbt=$(bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc sign --psbt $psbt | jq -r '.psbt')
  ```  

- Broadcast the transaction
  ```shell
  $ bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc broadcast --psbt $signed_psbt 
  {
    "txid": "c343f5b25372e285308eba912d1fe8fade9f64afde6d95306e248e52e0852252"
  }
  ```
  This makes BDK broadcast the transaction via the connected core node, and it returns the corresponding Txid.

### Confirming the Transaction
 The transaction has been received by the `core` node and waiting in its mempool for inclusion in block.
 We can see the transaction via its `txid` received in previous step.

- Check transaction in mempool
  ```shell
  $ docker exec -it bdk-box /root/bitcoin-cli -regtest gettransaction c343f5b25372e285308eba912d1fe8fade9f64afde6d95306e2248e52e0852252
  {
    "amount": 2.00000000,
    "confirmations": 0,
    "trusted": false,
    "txid": "c343f5b25372e285308eba912d1fe8fade9f64afde6d95306e248e52e0852252",
    "walletconflicts": [
    ],
    "time": 1621697202,
    "timereceived": 1621697202,
    "bip125-replaceable": "no",
    "details": [
      {
        "address": "bcrt1q3h4hs6mve5dcl7da3d4acmlp20hh8c3t4mldwe",
        "category": "receive",
        "amount": 2.00000000,
        "label": "",
        "vout": 1
      }
    ],
    "hex": "01000000000101d84e8cb7477f9fe6f265b56d5416ff47da9a70be18f65ec50731b8257c67f2bd0100000000ffffffff0273a2e11100000000160014874270187001febc4cebd8cb083cf2c783e8f1ac00c2eb0b000000001600148deb786b6ccd1b8ff9bd8b6bdc6fe153ef73e22b0247304402201037d9ef5b80392296311c8899b1f12a0987778d694a442a88bafa6fbd7a7c9a022011293176255897444d9c71b0b9cd13b2aedb749b142577566c90a63d61025e2c01210202427d16b29c1c8546255363a74326ee9ab3196770bb3fccc7b679d52f9c1ccf00000000"
  }
  ```
  This means, core has recieved the transaction in its mempool and waiting for confirmation.

- Generate 1 block to confirm the transaction
  ```shell
  $ docker exec -it bdk-box /root/bitcoin-cli -regtest generatetoaddress 1 bcrt1qatd7yq0jukwusuaufltlejmeydpvnpv43r5gc2
  [
    "55436ff0169bbb3e70ab10cb7cdd45ab86204d5d7864a109142d91120d023197"
  ]
  ```

- Sync the `bdk-test` wallet and ask for available balance.
  ```shell
	$ bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc sync
	{}
	
	$ bdk-cli --network regtest wallet --node "127.0.0.1:18444" --wallet bdk-test -d $BDK_recv_desc -c $BDK_chng_desc get_balance
	{
		"satoshi": 299999859
	}
  ```

	If you see the balance updated, voila!

  What happened here is:  
  - core created a new block containing the transaction.
  - `bdk-cli` fetched the corresponding filter data.
  - It noticed it got a concerning transaction.
  - It asked for the details of that transaction from the core node.
  - It updated its wallet details with this new information.
  - The update is reflected in the wallet balance.  

### Shutdown Docker ###

You may now shutdown the regtest docker container. 

Note: This will also clean up any data in the bitcoin core, including the wallet. 

```shell
$ docker kill bdk-box
```

## End Words

In this tutorial we went through the process of receiving, creating, signing and broadcasting transaction using the BDK wallet with `compact_filters` feature. This demonstrates how BDK capabilities can be used to create SPV light wallets with integrated `BIP157` type `compact_filters` node.