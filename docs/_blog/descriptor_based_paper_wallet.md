---
title: "Descriptor-based paper wallets"
description: "Demonstrate how to create descriptor-based paper wallet and how to spend them with bdk"
authors: 
    - Riccardo Casatta
    - Steve Myers
date: "2021-03-30"
tags: ["guide", "descriptor", "paper wallets"]
hidden: true
draft: false
---

In this post, we will use the [Rusty Paper Wallet] tool to create a multi-owned descriptor-based paper wallet. We will use [bdk] via the [bdk-cli] tool to test our descriptor and to be able to sweep the funds from our paper wallet to a new address.

## About paper wallets

Paper wallets have a lot of drawbacks, as explained in the [paper wallet Wiki article], as always, do your own research before deciding to use it with mainnet bitcoins. In this post we will
only be using testnet coins.

## Descriptors

The [previous version] of the [Rusty Paper Wallet] followed the original paper wallet design: WIF[^WIF] as secret part with the option to generate a different kind of addresses (legacy, nested segwit, and segwit).

There were plans to [support mnemonic](https://github.com/RCasatta/rusty-paper-wallet/issues/5) instead of WIF keys because it may[^WIF core] save the sweep transaction[^sweep] and there are more wallets capable of importing a mnemonic instead of a WIF.

However, choosing a single address type or having wallet support for a specific format is the kind of problem [descriptors] solve perfectly, so the latest [Rusty Paper Wallet] version now accepts a descriptor and the network as parameters.

## Example use case

So let's say your grandma wants to buy bitcoin and asked for your help.

You are a little afraid she may lose the private key. At the same time, you don't want to duplicate the keys and give those to her daughters Alice and Barbara, because both of them could spend and accuse the other of having done so.

Even though we trust everyone in the family it is better to play it safe and divide the responsibility of protecting Grandma's bitcoin.

This is a perfect case for a 2 of 3 multi-signature paper wallet. This way also protects the participants from having their copy of the wallet stolen. To compromise Grandma's wallet a thief would need to find and steal at least two of them.

Note that you as the wallet creator are still the single point of trust because you are going to generate the keys for everyone. Setups combining self generated keys from the participants is possible future work.

## Creating the paper wallet

For this example the spending descriptor would be:

`wsh(multi(2,Grandma,Alice,Barbara))`

You need [rust] installed to use [Rusty Paper Wallet]. The -n option below explicitly selects
generating `testnet` keys. Use `rusty-paper-wallet --help` to see usage instructions and other
options.

```shell
$ cargo install rusty-paper-wallet
$ rusty-paper-wallet "wsh(multi(2,Grandma,Alice,Barbara))" -n testnet
data:text/html;base64,PCFET0N...
```

The [output] of the command is very long and has been shortened. The string is a [data URI scheme] paste-able in the address bar of a browser. By using a data URI no files are written on the hard disk, leaving less trace of secret material on the computer.
It's also a good idea to use incognito mode in the browser to prevent it from saving the page in the history.

The following is the result:

<iframe src="/images/descriptor-based-paper-wallets/Bitcoin_Paper_Wallet.html" style="width: 100%; height: 800px; border: 1px solid black;"></iframe>

Under the hood, the command created a key pair randomly for every alias present in the descriptor, then replaced the aliases with the created keys and generated the corresponding address. This address is the same for every paper wallet and it is shown in the upper part of the paper wallet (the public part) along with the alias, linking the paper wallet to the owner.

The lower part is the secret part, the written part is the descriptor with the aliases, followed by a legend linking the aliases with the keys. In the legend, all the keys are public but the one of the owner which is a private WIF. The secret QR code instead contains the descriptor already with the keys.

The paper wallet must then be printed, and it is better to use a printer without wifi and also to be aware that some sensitive data may remain in the printer's cache.

Then the paper wallet must be cut along the dotted lines, the secret part should be folded twice over the black zone[^black zone]. The black zone helps to avoid showing the secret parts in the presence of back-light. Once the folding is done the paper wallet should be plasticized to prevent being damaged by water.

## BDK

Any descriptor based wallet can be used to check the balance of and sweep the funds from
Grandma's paper wallet. For this post we'll demonstrate using the [bdk-cli] tool to do these steps.
Another area where [bdk] could be used with [Rusty Paper Wallet] is to compile a more
complicated miniscript spending policy into a descriptor, as we have done in the [spending policy demo] post.

## Funding tx

Since Grandma's wallet was created as a `wsh` descriptor, bitcoin can be sent to it from any
segwit capable wallet, we'll use a public [bitcoin testnet faucet]. Once the funds are sent the
deposit address `tb1qu6lcua9w2zkarjj5xwxh3l3qtcxh84hsra3jrvpszh69j2e54x7q3thycw` we can also use this
address and a testnet explorer to [confirm the funds were received].

## Sweep tx

Now that Grandma's paper wallet is funded it's time to demonstrate how to use [bdk-cli] to sweep these
funds to a new address. Let's assume Grandma lost her original paper wallet and has asked
her daughters to sweep them to a new single signature wallet so she can spend them.

### Step 1: Alice creates and signs a PSBT

Alice uses the private text or QR code from her paper wallet to find her private key and the
public keys for Grandma and Barbara. With this info she creates a PSBT to sweep Grandma's funds
to a new address (in this example we'll send them back to our [bitcoin testnet faucet]). Notice how Alice
includes her wallet's descriptor checksum '#em3q73l5', this [guarantees] she has entered her descriptor correctly.

```shell
$ SWEEP_TO_ADDR=tb1qm5tfegjevj27yvvna9elym9lnzcf0zraxgl8z2

$ ALICE_WIF=cSSKRHDmQEEutp5LD14tAcixu2ehSNPDTqNek1zMa9Pet98qxHq3
$ BARBARA_PUBKEY=02a3f3f2658b9812ddeabfbde2fde03f8a65369e4ed621f29fa8ba0cc519b789fb
$ GRANDMA_PUBKEY=03f1bd2bff8e9c61f58a8d46d18fd8f3149b1f2d76b3c423a7874a5d5811d67cee
$ ALICE_DESCRIPTOR="wsh(multi(2,$GRANDMA_PUBKEY,$ALICE_WIF,$BARBARA_PUBKEY))#em3q73l5"

# confirm descriptor creates the expected deposit address
$ bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR get_new_address
{
  "address": "tb1qu6lcua9w2zkarjj5xwxh3l3qtcxh84hsra3jrvpszh69j2e54x7q3thycw"
}

# sync the wallet and show the balance
$ bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR sync
{}

$ bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR get_balance
{
  "satoshi": 10000
}

# create and sign PSBT
$ UNSIGNED_PSBT=$(bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR create_tx --send_all --to $SWEEP_TO_ADDR:0 | jq -r ".psbt")

$ ALICE_SIGNED_PSBT=$(bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR sign --psbt $UNSIGNED_PSBT | jq -r ".psbt")
```

### Step 2: Barbara signs Alice's signed PSBT and broadcasts the tx

Now it's Barbara's turn to use the private text or QR code from her paper wallet to get her private
key and the public keys for Grandma and Alice. With this info plus Alice's signed PSBT she can
create a fully signed PSBT to broadcast and complete the sweep of Grandma's funds.

```shell
$ ALICE_PUBKEY=02e486e32f0f87136fa042cb53219ace8537ea1d036deb2f4293570b94325d11cb
$ BARBARA_WIF=cSfMLzSZ9NjWUTqL3sFpgWJssnu2qgmE2cm5N1jPDRRJuDcrsPEB
$ GRANDMA_PUBKEY=03f1bd2bff8e9c61f58a8d46d18fd8f3149b1f2d76b3c423a7874a5d5811d67cee
$ BARBARA_DESCRIPTOR="wsh(multi(2,$GRANDMA_PUBKEY,$ALICE_PUBKEY,$BARBARA_WIF))#nxfa5n0z"

# confirm descriptor creates the expected deposit address
$ bdk-cli wallet -w barbara -d $BARBARA_DESCRIPTOR get_new_address
{
  "address": "tb1qu6lcua9w2zkarjj5xwxh3l3qtcxh84hsra3jrvpszh69j2e54x7q3thycw"
}

# sync the wallet and show the balance
$ bdk-cli wallet -w barbara -d $BARBARA_DESCRIPTOR sync
{}

$ bdk-cli wallet -w barbara -d $BARBARA_DESCRIPTOR get_balance
{
  "satoshi": 10000
}

$ FINAL_PSBT=$(bdk-cli wallet -w barbara -d $BARBARA_DESCRIPTOR sign --psbt $ALICE_SIGNED_PSBT | jq -r ".psbt")

$ bdk-cli wallet -w barbara -d $BARBARA_DESCRIPTOR broadcast --psbt $FINAL_PSBT
{
  "txid": "9ecd8e6be92b7edd8bf1799f8f7090e58f813825f826bdb771b4cdb444cdeb59"
}
```

And finally we verify that Alice and Barbara successfully created and broadcast Grandma's [sweep tx].

## Conclusion

In this post we showed how to create a multi-sig descriptor based paper wallet using
[Rusty Paper Wallet] and then sweep the funds from our example paper wallet to a new address. If you
found this post interesting please comment below. Or give it a try yourself and if you run into any
problems or would like to suggest improvements leave an issue in the [Rusty Paper Wallet] or
[bdk-cli] github repos. Thanks!

[paper wallet wiki article]: https://en.bitcoin.it/wiki/Paper_wallet
[previous version]: https://github.com/RCasatta/rusty-paper-wallet/tree/339fa4418d94f6fdd96f3d0301cab8a0bc09e8bd
[Rusty Paper Wallet]: https://github.com/RCasatta/rusty-paper-wallet
[support mnemonic]: https://github.com/RCasatta/rusty-paper-wallet/issues/5
[descriptors]: /descriptors
[bdk]: https://github.com/bitcoindevkit/bdk
[rust]: https://www.rust-lang.org/tools/install
[output]: /images/descriptor-based-paper-wallets/data-url.txt
[data URI scheme]: https://en.wikipedia.org/wiki/Data_URI_scheme
[bdk-cli]: https://github.com/bitcoindevkit/bdk-cli
[bitcoin testnet faucet]: https://bitcoinfaucet.uo1.net/
[confirm the funds were received]: https://mempool.space/testnet/address/tb1qu6lcua9w2zkarjj5xwxh3l3qtcxh84hsra3jrvpszh69j2e54x7q3thycw
[sweep tx]: https://mempool.space/testnet/tx/9ecd8e6be92b7edd8bf1799f8f7090e58f813825f826bdb771b4cdb444cdeb59
[spending policy demo]: /blog/2021/02/spending-policy-demo/#step-4-create-wallet-descriptors-for-each-participant
[guarantees]: https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md#checksums

[^WIF]: Wallet Input Format, a string encoding a ECDSA private key  https://en.bitcoin.it/wiki/Wallet_import_format
[^WIF core]: Unless the user import the WIF directly into bitcoin core
[^sweep]: Some wallets refers to sweep as the action to create a transaction taking all the funds from the paper wallet and sending those to the wallet itself.
[^black zone]: Ideally, the black zone should be twice as long as the secret part to cover it back and front, long descriptor may leave a shorter black zone, ensure to have you printer set with vertical layout for best results.
