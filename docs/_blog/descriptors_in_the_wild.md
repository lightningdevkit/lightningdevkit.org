---
title: "Descriptors in the wild"
description: "Guide to setup a 2-of-2 multisig using Bitcoin Core and BDK"
authors: 
    - Gabriele Domenichini
date: "2020-11-18"
tags: ["guide", "descriptor"]
hidden: true
draft: false
---

I have tried to setup a 2 of 2 multi signature infrastructure with two 
different wallets, which know nothing about each other, but are compliant with 
two very important protocols: [Output Descriptors] and [Partially Signed 
Bitcoin Transactions][PSBT] described in BIP 174.

Before these two protocols came into existence, making a multi signature setup 
and spending from it was possible only if the involved parties were using the 
same wallet (eg. Electrum Desktop Wallet). This limitation was due to the fact 
that the two parties had to agree: 

* on the particular type of script and address to use
* on the way the transaction would be shared composed and signed with all the 
involved parties.

[Output Descriptors] are a way to express which kind scriptPubKey and 
addresses to produce with a key or a series of keys.

[PSBT] is instead the standard protocol used to create a transaction and to enrich 
it with the necessary signatures and other components, to make it valid and complete.

Together they provide a common ground to create and use a multi signature 
infrastructure in a heterogeneous environment, and this is what I have put 
to test.

## The use case

Imagine Alice and Bob owning a company and being willing to put the corporate cash 
in a 2of2 multi signature setup, so that each one of them have to agree and sign each
transaction.

## The role of Descriptors

If Alice and Bob cannot agree on the software to use, to monitor the same financial 
situation, the two software must control and produce exactly the same series
of multisignature addresses. 

To make two different software produce the same addresses in a deterministic way 
we must ensure that they:
* produce the same pair of public keys
* combine them in the same order
* put them inside the same scriptPubKey to produce the same address

Here is where the [Output Descriptors] come into play. They describe:

* the sequence of public keys each extended key (xpub) will produce 
* the sequence in which the new public keys of various parties will enter into 
the script
* the type of script the wallet will prepare with that group keys and so the type
of address the group of keys will produce.

**By sharing the same Descriptor, every compliant wallet will derive 
deterministically the same series of multisig addresses**.

Imagine Alice using Bitcoin Core (from now on ["Core"][Bitcoin Core]) as a 
Wallet and Bob using a "Last generation" wallet, Bitcoin Development Kit 
(from now on ["BDK"][BDK]), which uses descriptors and miniscript natively.

Each of these two software wallets should be able to:

* Create a new address which is seen as belonging to the multi signature 
wallet in both software
* Express the consent of each party by partially signing the transaction in a way 
the other wallet can understand and complete it with its own signature.

The infrastructure of multiple Extended keys combined toghether to produce 
multiple multisignature addresses is often referred as 
*[Hierarchical Deterministic][HDWallet] multi signature wallet or HDM*. 

What follows are the steps to create the HDM usable both in Core and 
in BDK.

*Note: In Core, [Descriptor wallets] are still experimental and in general, 
both wallets should be tested for descriptor capabilities only in testnet.*

## Our playground

We will build a 2of2 key set up that will be used cooperatively by Bitcoin Core 
and Bitcoin Development Kit.
The steps Alice and Bob will do are:

1. creation of the seed and the derived Extended Master Public and send it to 
the other party
2. Create the multi signature descriptor for each wallet
3. Use each other's software to receive testnet coins from a faucet
4. return part of the coins to the faucet signing the transaction with both 
wallets.

We need:
* [Bitcoin Dev Kit][BDK]
* [Bitcoin Core] (v0.21.0 or later)

### 1. Creating the seeds and the derived Extended Public keys 

#### Seeds and Extended Master Public

We build an Extended Private Master Key for both wallet and derive a BIP84 
Extended Master Public for Bitcoin Core and then for BDK.

For Bitcoin Core (Alice):

```
# new Extended wallet data
export core_key=$(bdk-cli key generate)

# New Extended Master Private

export core_xprv=$(echo $core_key | jq -r '.xprv')

# Now I derive the xpubs (one for receiving and one for the change) 
# together with informations about the derivation path to be communicated 
# to BDK wallet's owner (Bob).

export core_xpub_84_for_rec_desc=$(bdk-cli key derive --path m/84h/0h/0h/0 --xprv $core_xprv | jq -r '.xpub')
export core_xpub_84_for_chg_desc=$(bdk-cli key derive --path m/84h/0h/0h/1 --xprv $core_xprv | jq -r '.xpub')
```

For BDK (Bob) we do the same:

```
# new Extended wallet data

export BDK_key=$(bdk-cli key generate)

# New Extended Master Private

export BDK_xprv=$(echo $BDK_key | jq -r '.xprv')

# Now I build the derived xpubs to be communicated (to Alice).

export BDK_xpub_84_for_rec_desc=$(bdk-cli key derive --path m/84h/0h/0h/0 --xprv $BDK_xprv | jq -r '.xpub')
export BDK_xpub_84_for_chg_desc=$(bdk-cli key derive --path m/84h/0h/0h/1 --xprv $BDK_xprv | jq -r '.xpub')
```

### 2. Creation of the multi signature descriptor for each wallet 

To build a multisig wallet, each wallet owner must compose the descriptor 
adding:
* his derived extended **private** key AND 
* all the extended **public** keys of the other wallets involved in the 
multi signature setup 

*The different nature of the two keys (one is private and one is public) is 
due to the fact that each wallet, to be able to partially sign the transaction, 
**must manage the private key of the wallet's owner*** AND have the other 
party's public key. Otherwise, if we put both public keys, we would obtain 
a watch-only wallet unable to sign the transactions. If we 
had both extended private keys inside the descriptor, we would allow each party 
to finalize the transactions autonomously.

#### In Bitcoin Core:

In our case, the multi signature descriptor for Bitcoin Core will be composed 
with:

* The BIP84 derived Extended **Public** Key from BDK
* The BIP84 derived Extended **Private** Key from Core. 

BDK wallet's owner will send to Core's owner the derived xpub for this purpose.
This is how the Core's multisig descriptor will be created and put into an 
environment variable:

```
export core_rec_desc="wsh(multi(2,$BDK_xpub_84_for_rec_desc,$core_xprv/84'/0'/0'/0/*))"
```

Where of course `$BDK_xpub_84_for_rec_desc`is the derived master public created 
in BDK and received by Core's owner.

The meaning of what is before and after is illustrated in the doc that explain 
the use of [Output Descriptors in Bitcoin Core][Output Descriptors].

We add the necessary checksum using the specific `bitcoin-cli` call.

```
export core_rec_desc_chksum=$core_rec_desc#$(bitcoin-cli -testnet getdescriptorinfo $core_rec_desc | jq -r '.checksum')
```

We repeat the same to build the descriptor to receive the change.

```
export core_chg_desc="wsh(multi(2,$BDK_xpub_84_for_chg_desc,$core_xprv/84'/0'/0'/1/*))"
export core_chg_desc_chksum=$core_chg_desc#$(bitcoin-cli -testnet getdescriptorinfo $core_chg_desc|jq -r '.checksum')
```

#### In BDK:

For BDK we set the derivation for receiving addresses and change addresses 
in the command line (maybe setting an alias)

Building the descriptor:

```
export BDK_rec_desc="wsh(multi(2,$BDK_xprv/84'/0'/0'/0/*,$core_xpub_84_for_rec_desc))"`
```

Please note that the order of the extended key in the descriptor MUST be the 
same in the 2 wallets.

*We have chosen to put BDK first and in each software wallet, the public key 
derived from BDK will always come first. In alternative, we could have chosen to 
produce the descriptor, [chosing a `soretedmulti` multisignature setup][sortedmulti]*.

```
export BDK_rec_desc_chksum=$BDK_rec_desc#$(bitcoin-cli -testnet getdescriptorinfo $BDK_rec_desc | jq -r '.checksum')
export BDK_chg_desc="wsh(multi(2,$BDK_xprv/84'/0'/0'/1/*,$core_xpub_84_for_chg_desc))"
export BDK_chg_desc_chksum=$BDK_chg_desc#$(bitcoin-cli -testnet getdescriptorinfo $BDK_chg_desc | jq -r '.checksum')
```

To take a look at the variables we have produced so far:
```
env  | grep 'core_'
env  | grep 'BDK_'
```

Now we will use the multisig descriptor wallet to receive testnet coins with 
Alice and Bob's software

### 3. Use each other's software to receive testnet coins from a faucet

#### In Bitcoin Core

Alice must create an empty, experimental new "descriptors wallet" in Core and 
to import the multisig Output Descriptor.

```
bitcoin-cli -testnet createwallet "multisig2of2withBDK" false true "" false true false
````
The flag are to:
* use the private keys
* make it empty
* no password provided to the wallet
* reusing of addresses not allowed
* "new experimental descriptors wallet"
*  don't load it on start up

```
bitcoin-cli -testnet -rpcwallet=multisig2of2withBDK importdescriptors "[{\"desc\":\"$core_rec_desc_chksum\",\"timestamp\":\"now\",\"active\":true,\"internal\":false},{\"desc\":\"$core_chg_desc_chksum\",\"timestamp\":\"now\",\"active\":true,\"internal\":true}]"
```
Now Alice asks for her first receiving multisignature address.

```
export first_address=$(bitcoin-cli -testnet -rpcwallet=multisig2of2withBDK getnewaddress)
echo $first_address
```

#### BDK
In BDK Bob can specify directly the descriptors on the command line to produce 
the multisig address, because BDK is descriptors aware natively.

```
repl -d "$BDK_rec_desc_chksum" -c "$BDK_chg_desc_chksum" -n testnet -w $BDK_fingerprint get_new_address`
```

Et voilà: if we have done everything correctly, the newly created address in 
Core is the same of the newly created address in BDK. this is part of the 
"miracle" of descriptors' interoperability.

#### We ask for testnet coins giving the first created address.

To find testnet coins for free, you can just google "testnet faucet" and you 
should find some satoshis to play with. Just give to the site your first 
generated address and, in twenty minutes, you will find the satoshis in 
your balance both in Core and in BDK.

```
# to check it in Core:

bitcoin-cli -testnet -rpcwallet=multisig2of2withBDK getbalance

# In BDK:

# Sync with the blockchain
repl -d "$BDK_rec_desc_chksum" -c "$BDK_chg_desc_chksum" -n testnet -w $BDK_fingerprint sync
# Get the balance
repl -d "$BDK_rec_desc_chksum" -c "$BDK_chg_desc_chksum" -n testnet -w $BDK_fingerprint get_balance
```
Some testnet faucets have an address to send back the unused satoshi after 
the use. Take note of that because we will use it in the next step.

### 4. we return part of the satoshis received back to the faucet

```
export psbt=$(bitcoin-cli -testnet -rpcwallet=multisig2of2withBDK walletcreatefundedpsbt "[]" "[{\"tb1qrcesfj9f2d7x40xs6ztnlrcgxhh6vsw8658hjdhdy6qgkf6nfrds9rp79a\":0.000012}]" | jq -r '.psbt')

export psbt=$(bitcoin-cli -testnet -rpcwallet=multisig2of2withBDK walletprocesspsbt $psbt | jq -r '.psbt')
{
  "psbt": "cHNidP8BAIkCAAAAATj90EC+NAuXj7y6SseZJucoJM6sGnUcVm9koTveZECTAAAAAAD+////AmACAAAAAAAAIgAg98ol9j4AalD71E0mV5QV0uM6/vCT+pi2twxr/zrvLROwBAAAAAAAACIAIB4zBMipU3xqvNDQlz+PCDXvpkHH1Q95Nu0mgIsnU0jbAAAAAAABAIkCAAAAAQS+ObgGG6UwtvaO3KYph2E3/ws7Q83RbmR3rxC0fKYSAQAAAAD+////AtAHAAAAAAAAIgAg6GXadcNj7k4yKUbnVlTLiedXQFXYdCBoNygop/PISNDAHQAAAAAAACIAIBQpiDTgPIMt0ld8cmuYqlY+EIPjvrmMqZruDhs61hQNAAAAAAEBK9AHAAAAAAAAIgAg6GXadcNj7k4yKUbnVlTLiedXQFXYdCBoNygop/PISNAiAgNt0j7Ae0iA7qlLolruNqLWkPA96J0qgMLK1M7WOGMAfUcwRAIgS6x0i1J1HRzllIPf4WlFY+Dl8kCCLK81TL2djZxTFXMCICJVBKkKNxu1w1mRVor6iFTSVXiJjmWwBXVeJLISvBwAAQEFR1IhArn3tec7n7318rnWqf0dIIwtLtfxo6Zt0HV70UvZYaWvIQNt0j7Ae0iA7qlLolruNqLWkPA96J0qgMLK1M7WOGMAfVKuIgYCufe15zufvfXyudap/R0gjC0u1/Gjpm3QdXvRS9lhpa8YNEw2cFQAAIAAAACAAAAAgAAAAAAAAAAAIgYDbdI+wHtIgO6pS6Ja7jai1pDwPeidKoDCytTO1jhjAH0YO/laXFQAAIAAAACAAAAAgAAAAAAAAAAAAAEBR1IhAqccvA3rL13D1K4GeWjcahDsO3P8oaVNBttk4MlCKXIcIQLHKhjmPuCQjyS77ZfaMN2tdgNKcf/+57VXGZhz/UWTl1KuIgICpxy8DesvXcPUrgZ5aNxqEOw7c/yhpU0G22TgyUIpchwYNEw2cFQAAIAAAACAAAAAgAEAAAADAAAAIgICxyoY5j7gkI8ku+2X2jDdrXYDSnH//ue1VxmYc/1Fk5cYO/laXFQAAIAAAACAAAAAgAEAAAADAAAAAAA=",
  "complete": false 
}
```

Exactly! Note the `"complete": false`. We have processed the transaction with 
Core but we miss one of the necessary key of the multisig 2of2 setup (The one 
contained inside BDK).

`tb1qrcesfj9f2d7x40xs6ztnlrcgxhh6vsw8658hjdhdy6qgkf6nfrds9rp79a` is the address 
we got from the faucet site to return the satoshis.

The [PSBT] is sent over to the BDK wallet owner who tries to sign the 
transaction:

```
repl -d "$BDK_rec_desc_chksum" -c "$BDK_chg_desc_chksum" -n testnet -w $BDK_fingerprint sign --psbt $psbt
{
  "is_finalized": true,
  "psbt": "cHNidP8BAIkCAAAAATj90EC+NAuXj7y6SseZJucoJM6sGnUcVm9koTveZECTAAAAAAD+////AmACAAAAAAAAIgAg98ol9j4AalD71E0mV5QV0uM6/vCT+pi2twxr/zrvLROwBAAAAAAAACIAIB4zBMipU3xqvNDQlz+PCDXvpkHH1Q95Nu0mgIsnU0jbAAAAAAABAIkCAAAAAQS+ObgGG6UwtvaO3KYph2E3/ws7Q83RbmR3rxC0fKYSAQAAAAD+////AtAHAAAAAAAAIgAg6GXadcNj7k4yKUbnVlTLiedXQFXYdCBoNygop/PISNDAHQAAAAAAACIAIBQpiDTgPIMt0ld8cmuYqlY+EIPjvrmMqZruDhs61hQNAAAAAAEBK9AHAAAAAAAAIgAg6GXadcNj7k4yKUbnVlTLiedXQFXYdCBoNygop/PISNAiAgNt0j7Ae0iA7qlLolruNqLWkPA96J0qgMLK1M7WOGMAfUcwRAIgS6x0i1J1HRzllIPf4WlFY+Dl8kCCLK81TL2djZxTFXMCICJVBKkKNxu1w1mRVor6iFTSVXiJjmWwBXVeJLISvBwAASICArn3tec7n7318rnWqf0dIIwtLtfxo6Zt0HV70UvZYaWvRzBEAiBkVDLgVEwvENnLx+04o7gGpGjFDBwAXTJmf8Yvo35oygIgbuBkHsvPC9jmZcMZ9P+Pwp01yxSaWo+5feyPmd3ai1kBAQVHUiECufe15zufvfXyudap/R0gjC0u1/Gjpm3QdXvRS9lhpa8hA23SPsB7SIDuqUuiWu42otaQ8D3onSqAwsrUztY4YwB9Uq4iBgNt0j7Ae0iA7qlLolruNqLWkPA96J0qgMLK1M7WOGMAfRg7+VpcVAAAgAAAAIAAAACAAAAAAAAAAAAiBgK597XnO5+99fK51qn9HSCMLS7X8aOmbdB1e9FL2WGlrxg0TDZwVAAAgAAAAIAAAACAAAAAAAAAAAABBwABCNoEAEcwRAIgZFQy4FRMLxDZy8ftOKO4BqRoxQwcAF0yZn/GL6N+aMoCIG7gZB7LzwvY5mXDGfT/j8KdNcsUmlqPuX3sj5nd2otZAUcwRAIgS6x0i1J1HRzllIPf4WlFY+Dl8kCCLK81TL2djZxTFXMCICJVBKkKNxu1w1mRVor6iFTSVXiJjmWwBXVeJLISvBwAAUdSIQK597XnO5+99fK51qn9HSCMLS7X8aOmbdB1e9FL2WGlryEDbdI+wHtIgO6pS6Ja7jai1pDwPeidKoDCytTO1jhjAH1SrgABAUdSIQKnHLwN6y9dw9SuBnlo3GoQ7Dtz/KGlTQbbZODJQilyHCECxyoY5j7gkI8ku+2X2jDdrXYDSnH//ue1VxmYc/1Fk5dSriICAqccvA3rL13D1K4GeWjcahDsO3P8oaVNBttk4MlCKXIcGDRMNnBUAACAAAAAgAAAAIABAAAAAwAAACICAscqGOY+4JCPJLvtl9ow3a12A0px//7ntVcZmHP9RZOXGDv5WlxUAACAAAAAgAAAAIABAAAAAwAAAAAA"
}
```
The signature has succeded (note the "is_finalized": true,) and now we can 
broadcast the transction.
```
repl -d "$BDK_rec_desc_chksum" -c "$BDK_chg_desc_chksum" -n testnet -w $BDK_fingerprint broadcast --psbt "cHNidP8BAIkCAAAAATj90EC+NAuXj7y6SseZJucoJM6sGnUcVm9koTveZECTAAAAAAD+////AmACAAAAAAAAIgAg98ol9j4AalD71E0mV5QV0uM6/vCT+pi2twxr/zrvLROwBAAAAAAAACIAIB4zBMipU3xqvNDQlz+PCDXvpkHH1Q95Nu0mgIsnU0jbAAAAAAABAIkCAAAAAQS+ObgGG6UwtvaO3KYph2E3/ws7Q83RbmR3rxC0fKYSAQAAAAD+////AtAHAAAAAAAAIgAg6GXadcNj7k4yKUbnVlTLiedXQFXYdCBoNygop/PISNDAHQAAAAAAACIAIBQpiDTgPIMt0ld8cmuYqlY+EIPjvrmMqZruDhs61hQNAAAAAAEBK9AHAAAAAAAAIgAg6GXadcNj7k4yKUbnVlTLiedXQFXYdCBoNygop/PISNAiAgNt0j7Ae0iA7qlLolruNqLWkPA96J0qgMLK1M7WOGMAfUcwRAIgS6x0i1J1HRzllIPf4WlFY+Dl8kCCLK81TL2djZxTFXMCICJVBKkKNxu1w1mRVor6iFTSVXiJjmWwBXVeJLISvBwAASICArn3tec7n7318rnWqf0dIIwtLtfxo6Zt0HV70UvZYaWvRzBEAiBkVDLgVEwvENnLx+04o7gGpGjFDBwAXTJmf8Yvo35oygIgbuBkHsvPC9jmZcMZ9P+Pwp01yxSaWo+5feyPmd3ai1kBAQVHUiECufe15zufvfXyudap/R0gjC0u1/Gjpm3QdXvRS9lhpa8hA23SPsB7SIDuqUuiWu42otaQ8D3onSqAwsrUztY4YwB9Uq4iBgNt0j7Ae0iA7qlLolruNqLWkPA96J0qgMLK1M7WOGMAfRg7+VpcVAAAgAAAAIAAAACAAAAAAAAAAAAiBgK597XnO5+99fK51qn9HSCMLS7X8aOmbdB1e9FL2WGlrxg0TDZwVAAAgAAAAIAAAACAAAAAAAAAAAABBwABCNoEAEcwRAIgZFQy4FRMLxDZy8ftOKO4BqRoxQwcAF0yZn/GL6N+aMoCIG7gZB7LzwvY5mXDGfT/j8KdNcsUmlqPuX3sj5nd2otZAUcwRAIgS6x0i1J1HRzllIPf4WlFY+Dl8kCCLK81TL2djZxTFXMCICJVBKkKNxu1w1mRVor6iFTSVXiJjmWwBXVeJLISvBwAAUdSIQK597XnO5+99fK51qn9HSCMLS7X8aOmbdB1e9FL2WGlryEDbdI+wHtIgO6pS6Ja7jai1pDwPeidKoDCytTO1jhjAH1SrgABAUdSIQKnHLwN6y9dw9SuBnlo3GoQ7Dtz/KGlTQbbZODJQilyHCECxyoY5j7gkI8ku+2X2jDdrXYDSnH//ue1VxmYc/1Fk5dSriICAqccvA3rL13D1K4GeWjcahDsO3P8oaVNBttk4MlCKXIcGDRMNnBUAACAAAAAgAAAAIABAAAAAwAAACICAscqGOY+4JCPJLvtl9ow3a12A0px//7ntVcZmHP9RZOXGDv5WlxUAACAAAAAgAAAAIABAAAAAwAAAAAA"
{
  "txid": "a0b082e3b0579822d4a0b0fa95a4c4662f6b128ffd43fdcfe53c37473ce85dee"
}
```

## Conclusion

We have built an HDM and we have used it with two indipendent wallets, which 
are compatible with [BIP 174][PSBT] and [Output Descriptors]. Hopefully we 
will see many other compatible wallets beyound [Bitcoin Core] and [BDK], 
with which we will be able to easily set up multi signature schemes.


[Descriptor wallets]: https://github.com/bitcoin/bitcoin/pull/16528
[Electrum]: https://electrum.org
[Output Descriptors]: https://bitcoinops.org/en/topics/output-script-descriptors/
[PSBT]: https://en.bitcoin.it/wiki/BIP_0174
[HDWallet]: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
[sortedmulti]: https://github.com/bitcoin/bitcoin/pull/17056?ref=tokendaily
[BDK]: https://bitcoindevkit.org/
[Bitcoin Core]: https://bitcoincore.org/
[pycoin]: https://github.com/richardkiss/pycoin
