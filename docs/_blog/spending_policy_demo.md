---
title: "Spending Policy Demo"
description: "Demonstrate how to use a descriptor wallet with different spending policies"
authors: 
    - Steve Myers
    - Thunderbiscuit"
date: "2021-02-23"
tags: ["guide", "descriptor"]
hidden: true
draft: false
---

In this post we will use the [bdk-cli](https://github.com/bitcoindevkit/bdk-cli) tool to demonstrate how to use the [bdk](https://github.com/bitcoindevkit/bdk) library to: 

1. generate *testnet* public and private keys
2. create [PSBT](https://bitcoinops.org/en/topics/psbt/)s that can be spent based on different [miniscript spending policies](http://bitcoin.sipa.be/miniscript/)
3. cooperatively sign and finalize the resulting PSBTs
4. broadcast and confirm spending transactions

The scenario we will simulate is a wallet with two spending policies:

A. **three** out of **three** signers must sign spending transaction input [UTXO](https://developer.bitcoin.org/glossary.html)s, **OR** 

B. **two** out of **three** signers must sign **AND** the input UTXOs must be a relative number of blocks older than the spending transaction's block

In a real-world wallet a longer relative time-lock would probably be used, but we chose a two block time-lock to make testing easier.

*Note: If you repeat these instructions on your own your extended keys, addresses, and other values will be different than shown in this post, but the end results should be the same.*

## Initial Setup

### Step 0: Install a recent version `bdk-cli`

```bash
cargo install bdk-cli --features repl,electrum,esplora

# confirm bdk-cli is installed
bdk-cli --version
BDK CLI 0.2.0

# bdk-cli usage can be explored with the `help` sub-command
bdk-cli help
```

### Step 1: Generate private extended keys

Generate new extended private keys for each of our wallet participants:

```bash
bdk-cli key generate | tee alice-key.json
{
  "fingerprint": "5adb4683",
  "mnemonic": "witness poverty pulse crush era item game rose bargain quantum spawn sure way behave also basket journey worry stem entry toddler floor way bone",
  "xprv": "tprv8ZgxMBicQKsPeAuGznXJZwfWHgWo86dFuufRBZN7ZT44UzoNG2cYmZLNLrnsm7eXhGSeccRU2nTtxunT11UkpqrRhJQefBnFJeHBddF68bg"
}

bdk-cli key generate | tee bob-key.json
{
  "fingerprint": "5fdec309",
  "mnemonic": "shiver atom february jealous spy gallery upset height captain snake tooth master ugly orbit amazing nice parrot elevator own olympic great relief ozone violin",
  "xprv": "tprv8ZgxMBicQKsPei56wJPNt9u2132Ynncp2qXdfSHszobnyjaGjQwxQBGASUidc1unmEmpyMQ9XzLgvbN36MDW7LNziVFdXVGMrx6ckMHuRmd"
}

bdk-cli key generate | tee carol-key.json
{
  "fingerprint": "de41e56d",
  "mnemonic": "upon bridge side tool style lounge need faculty middle nation armed corn valve that undo ribbon rent digital adapt capable embody zero shiver carpet",
  "xprv": "tprv8ZgxMBicQKsPf2edJLnXsF2AKwkCshCy2Z7fQD6FxiNVGsbkvpLRfxM8FSKrLqqpLFzLzVUBwgE9F5MQASrbedKCrGk1NG8oJgqYtmTLQEU"
}
```

### Step 2: Extract private extended keys

Here we use the `jq` Unix command to parse the json output of the `bdk-cli` commands.

```bash
export ALICE_XPRV=$(cat alice-key.json | jq -r '.xprv')

export BOB_XPRV=$(cat bob-key.json | jq -r '.xprv')

export CAROL_XPRV=$(cat carol-key.json | jq -r '.xprv')
```

### Step 3: Derive public extended keys

For this example we are using the [BIP-84](https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki) key path: `m/84h/1h/0h/0/*` to derive extended public keys to share with other wallet participants. 

Note that the `key derive` sub-command will generate a tpub for the last hardened node in the given derivation path. You'll also notice that `bdk-cli` will returns our tpub with the key origin (fingerprint/path) added to it (the metadata part that looks like `[5adb4683/84'/1'/0']` right before the tpub). This key origin information is not necessary in order to use a tpub and generate addresses, but it's good practice to include it because some signers require it.

```bash
export ALICE_XPUB=$(bdk-cli key derive --xprv $ALICE_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
echo \"$ALICE_XPUB\"
"[5adb4683/84'/1'/0']tpubDCyRBuncqwyAjSNiw1GWLmwQsWyhgPMEBpx3ZNpnCwZwf3HXerspTpaneN81KRxkwj8vjqH9pNWEPgNhen7dfE212SHfxBBbsCywxQGxvvu/0/*"

export BOB_XPUB=$(bdk-cli key derive --xprv $BOB_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
echo \"$BOB_XPUB\"
"[5fdec309/84'/1'/0']tpubDDQcUeBH9JFtgZEsHZBhmRu8AuZ8ceJY1umnipPVEg1had2coGMCWdFBXNnZWKoCPic3EMgDZTdmkAVNoakwNZu2ESSW36rQvts6VXGx4bU/0/*"

export CAROL_XPUB=$(bdk-cli key derive --xprv $CAROL_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
echo \"$CAROL_XPUB\"
"[de41e56d/84'/1'/0']tpubDCdxmvzJ5QBjTN8oCjjyT2V58AyZvA1fkmCeZRC75QMoaHcVP2m45Bv3hmnR7ttAwkb2UNYyoXdHVt4gwBqRrJqLUU2JrM43HippxiWpHra/0/*"
```

### Step 4: Create wallet descriptors for each participant

We used the [BDK Playground Policy Compiler](https://bitcoindevkit.org/bdk-cli/playground/) to compile the [miniscript](http://bitcoin.sipa.be/miniscript/) policy:

`thresh(3,pk(Alice),pk(Bob),pk(Carol),older(2))`

To the [output descriptor](https://bitcoindevkit.org/descriptors/):

`wsh(thresh(3,pk(Alice),s:pk(Bob),s:pk(Carol),sdv:older(2)))`

This descriptor requires spending transaction inputs must be signed by all three signers, or by two signers and the spent UTXOs must be older than two blocks. 

Each participant's descriptor only uses their own XPRV key plus the XPUB keys of the other participants.

```bash
export ALICE_DESCRIPTOR="wsh(thresh(3,pk($ALICE_XPRV/84'/1'/0'/0/*),s:pk($BOB_XPUB),s:pk($CAROL_XPUB),sdv:older(2)))"

export BOB_DESCRIPTOR="wsh(thresh(3,pk($ALICE_XPUB),s:pk($BOB_XPRV/84'/1'/0'/0/*),s:pk($CAROL_XPUB),sdv:older(2)))" 

export CAROL_DESCRIPTOR="wsh(thresh(3,pk($ALICE_XPUB),s:pk($BOB_XPUB),s:pk($CAROL_XPRV/84'/1'/0'/0/*),sdv:older(2)))"
```

## Policy A. Three signatures

### Step 1a: Create a testnet [segwit0](https://en.bitcoin.it/wiki/Segregated_Witness) receive address

This step can be done independently by Alice, Bob, or Carol.

```bash
bdk-cli wallet -w carol -d $CAROL_DESCRIPTOR get_new_address
{
  "address": "tb1qpqglt6yntay0se5vj3a7g36rql5pyzzp0w6jknfch2c0unwphsxs22g96e"
}
```

### Step 2a: Send testnet bitcoin from a faucet to receive address

After a faucet payment is sent, use a testnet block explorer to confirm the transaction was included in a block. 

[https://mempool.space/testnet/address/tb1qpqglt6yntay0se5vj3a7g36rql5pyzzp0w6jknfch2c0unwphsxs22g96e](https://mempool.space/testnet/address/tb1qpqglt6yntay0se5vj3a7g36rql5pyzzp0w6jknfch2c0unwphsxs22g96e)

### Step 3a: Sync participant wallets and confirm balance

This step must be done by Alice, Bob, and Carol so their individual descriptor wallets know about the faucet transaction they will later be spending the output of.

```bash
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR sync       
{}
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR get_balance
{
  "satoshi": 10000
}

bdk-cli wallet -w bob -d $BOB_DESCRIPTOR sync       
{}
bdk-cli wallet -w bob -d $BOB_DESCRIPTOR get_balance
{
  "satoshi": 10000
}

bdk-cli wallet -w carol -d $CAROL_DESCRIPTOR sync       
{}
bdk-cli wallet -w carol -d $CAROL_DESCRIPTOR get_balance
{
  "satoshi": 10000
}
```

### Step 4a: View wallet spending policies

This can also be done by any wallet participant, as long as they have the same descriptor and extended public keys from the other particpants..

```bash
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR policies
{
  "external": {
    "contribution": {
      "conditions": {
        "0": [
          {}
        ],
        "3": [
          {
            "csv": 2
          }
        ]
      },
      "items": [
        0,
        3
      ],
      "m": 3,
      "n": 4,
      "type": "PARTIAL"
    },
    "id": "ydtnup84",
    "items": [
      {
        "contribution": {
          "condition": {},
          "type": "COMPLETE"
        },
        "fingerprint": "5adb4683",
        "id": "uyxvyzqt",
        "satisfaction": {
          "type": "NONE"
        },
        "type": "SIGNATURE"
      },
      {
        "contribution": {
          "type": "NONE"
        },
        "fingerprint": "5fdec309",
        "id": "dzkmxcgu",
        "satisfaction": {
          "type": "NONE"
        },
        "type": "SIGNATURE"
      },
      {
        "contribution": {
          "type": "NONE"
        },
        "fingerprint": "de41e56d",
        "id": "ekfu5uaw",
        "satisfaction": {
          "type": "NONE"
        },
        "type": "SIGNATURE"
      },
      {
        "contribution": {
          "condition": {
            "csv": 2
          },
          "type": "COMPLETE"
        },
        "id": "8kel7sdw",
        "satisfaction": {
          "type": "NONE"
        },
        "type": "RELATIVETIMELOCK",
        "value": 2
      }
    ],
    "satisfaction": {
      "type": "NONE"
    },
    "threshold": 3,
    "type": "THRESH"
  },
  "internal": null
}
```

### Step 5a: Create spending transaction

The transaction can also be created by Alice, Bob, or Carol, or even an untrusted coordinator that only has all three tpubs. 

Note that the argument provided to the --external_policy flag contains the id retrieved from the `policies` subcommand in the above step, in this case `ydtnup84`.

```bash
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR create_tx -a --to tb1qm5tfegjevj27yvvna9elym9lnzcf0zraxgl8z2:0 --external_policy "{\"ydtnup84\": [0,1,2]}"
{
  "details": {
    "fees": 169,
    "height": null,
    "received": 0,
    "sent": 10000,
    "timestamp": 1614058791,
    "transaction": null,
    "txid": "3b9a7ac610afc91f1d1a0dd844e609376278fe7210c69b7ef663c5a8e8308f3e"
  },
  "psbt": "cHNidP8BAFIBAAAAAYx7T0cL7EoUYBEU0mSL6+DS4VQafUzJgAf0Ftlbkya5AQAAAAD/////AWcmAAAAAAAAFgAU3RacollkleIxk+lz8my/mLCXiH0AAAAAAAEBKxAnAAAAAAAAIgAgCBH16JNfSPhmjJR75EdDB+gSCEF7tStNOLqw/k3BvA0BBXchA3c1Ak2kcGOzOh6eRXFKfpnpzP1lzfcXIYhxFGZG51mxrHwhA75YDXRLDLt+eX5UsE03mIGUSsQP2MrJ9lm17cGXDw2mrJN8IQIvNjaP+mwNC0DtgaB6ENB/DPPlbUDR6+NZ4Sw070jzOKyTfHZjUrJpaJNThyIGAi82No/6bA0LQO2BoHoQ0H8M8+VtQNHr41nhLDTvSPM4DO66tnIAAAAAAAAAACIGA3c1Ak2kcGOzOh6eRXFKfpnpzP1lzfcXIYhxFGZG51mxGFrbRoNUAACAAQAAgAAAAIAAAAAAAAAAACIGA75YDXRLDLt+eX5UsE03mIGUSsQP2MrJ9lm17cGXDw2mDEMxpeYAAAAAAAAAAAAA"
}

export UNSIGNED_PSBT=$(bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR create_tx -a --to tb1qm5tfegjevj27yvvna9elym9lnzcf0zraxgl8z2:0 --external_policy "{\"ydtnup84\": [0,1,2]}" | jq -r ".psbt")
```

### Step 6a: Sign and finalize PSBTs

```bash
# ALICE SIGNS
export ALICE_SIGNED_PSBT=$(bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR sign --psbt $UNSIGNED_PSBT | jq -r ".psbt")

# BOB SIGNS
export ALICE_BOB_SIGNED_PSBT=$(bdk-cli wallet -w bob -d $BOB_DESCRIPTOR sign --psbt $ALICE_SIGNED_PSBT | jq -r ".psbt")

# CAROL SIGNS
export FINAL_PSBT=$(bdk-cli wallet -w carol -d $CAROL_DESCRIPTOR sign --psbt $ALICE_BOB_SIGNED_PSBT | jq -r ".psbt")

## PSBT is finalized
bdk-cli wallet -w carol -d $CAROL_DESCRIPTOR sign --psbt $ALICE_BOB_SIGNED_PSBT
{
  "is_finalized": true,
  "psbt": "cHNidP8BAFIBAAAAAYx7T0cL7EoUYBEU0mSL6+DS4VQafUzJgAf0Ftlbkya5AQAAAAD/////AWcmAAAAAAAAFgAU3RacollkleIxk+lz8my/mLCXiH0AAAAAAAEBKxAnAAAAAAAAIgAgCBH16JNfSPhmjJR75EdDB+gSCEF7tStNOLqw/k3BvA0iAgIvNjaP+mwNC0DtgaB6ENB/DPPlbUDR6+NZ4Sw070jzOEcwRAIgRPXSwFLfzD1YQzw5FGYA0TgiQ+D88hSOVDbvyUZDiPUCIAbguaSGgCbBAXo5sIxpZ4c1dcGkYyrrqnDjc1jcdJ1CASICA3c1Ak2kcGOzOh6eRXFKfpnpzP1lzfcXIYhxFGZG51mxSDBFAiEA0kdkvlA+k5kUBWVUM8SkR4Ua9pnXF66ECVwIM1l0doACIF0aMiORVC35+M3GHF2Vl8Q7t455mebrr1HuLaAyxBOYASICA75YDXRLDLt+eX5UsE03mIGUSsQP2MrJ9lm17cGXDw2mRzBEAiBPJlQEnuVDHgfgOdTZNlIcRZz2iqHoMWfDmLMFqJSOQAIgCuOcTKp/VaaqwIjnYfMKO3eQ1k9pOygSWt6teT1o13QBAQV3IQN3NQJNpHBjszoenkVxSn6Z6cz9Zc33FyGIcRRmRudZsax8IQO+WA10Swy7fnl+VLBNN5iBlErED9jKyfZZte3Blw8NpqyTfCECLzY2j/psDQtA7YGgehDQfwzz5W1A0evjWeEsNO9I8zisk3x2Y1KyaWiTU4ciBgIvNjaP+mwNC0DtgaB6ENB/DPPlbUDR6+NZ4Sw070jzOBjeQeVtVAAAgAEAAIAAAACAAAAAAAAAAAAiBgN3NQJNpHBjszoenkVxSn6Z6cz9Zc33FyGIcRRmRudZsQwpbm6KAAAAAAAAAAAiBgO+WA10Swy7fnl+VLBNN5iBlErED9jKyfZZte3Blw8NpgxDMaXmAAAAAAAAAAABBwABCP1TAQUARzBEAiBE9dLAUt/MPVhDPDkUZgDROCJD4PzyFI5UNu/JRkOI9QIgBuC5pIaAJsEBejmwjGlnhzV1waRjKuuqcONzWNx0nUIBRzBEAiBPJlQEnuVDHgfgOdTZNlIcRZz2iqHoMWfDmLMFqJSOQAIgCuOcTKp/VaaqwIjnYfMKO3eQ1k9pOygSWt6teT1o13QBSDBFAiEA0kdkvlA+k5kUBWVUM8SkR4Ua9pnXF66ECVwIM1l0doACIF0aMiORVC35+M3GHF2Vl8Q7t455mebrr1HuLaAyxBOYAXchA3c1Ak2kcGOzOh6eRXFKfpnpzP1lzfcXIYhxFGZG51mxrHwhA75YDXRLDLt+eX5UsE03mIGUSsQP2MrJ9lm17cGXDw2mrJN8IQIvNjaP+mwNC0DtgaB6ENB/DPPlbUDR6+NZ4Sw070jzOKyTfHZjUrJpaJNThwAA"
```

### Step 7a: Broadcast finalized PSBT

```bash
bdk-cli wallet -w carol -d $CAROL_DESCRIPTOR broadcast --psbt $FINAL_PSBT
{
  "txid": "3b9a7ac610afc91f1d1a0dd844e609376278fe7210c69b7ef663c5a8e8308f3e"
}
```

### Step 8a: Confirm transaction included in a testnet block

[https://mempool.space/testnet/tx/3b9a7ac610afc91f1d1a0dd844e609376278fe7210c69b7ef663c5a8e8308f3e](https://mempool.space/testnet/tx/3b9a7ac610afc91f1d1a0dd844e609376278fe7210c69b7ef663c5a8e8308f3e)

And new wallet balance is now zero.

```bash
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR sync
{}
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR get_balance
{
  "satoshi": 0
}
```

### DONE!

## Policy B. Two signatures after a relative time lock

Now we will use the same extended private and public keys, and the same descriptors to receive and spend testnet bitcoin using only two of our participants signatures after the transaction input's relative time-lock has expired. 

### Step 1b: Create a new testnet receive address

The receive address can still be generated by Alice, Bob, or Carol.

```bash
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR get_new_address
{
  "address": "tb1q886w2zmtakwxpngs9kn7y0a7tvd6e24u58sse2sv92zrjpnenfhqtfnmw9"
}
```

### Step 2b: Fund new address from testnet faucet

After the faucet payment is sent, confirm using a testnet block explorer to verify the transaction was included in a block. 

[https://mempool.space/testnet/address/tb1q886w2zmtakwxpngs9kn7y0a7tvd6e24u58sse2sv92zrjpnenfhqtfnmw9](https://mempool.space/testnet/address/tb1q886w2zmtakwxpngs9kn7y0a7tvd6e24u58sse2sv92zrjpnenfhqtfnmw9)

### Step 3b: Sync wallet and confirm wallet balance

This step must be done by Alice and Bob so their individual descriptor wallets know about the faucet transaction they will later be spending the output of.

```bash
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR sync       
{}
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR get_balance
{
  "satoshi": 10000
}

bdk-cli wallet -w bob -d $BOB_DESCRIPTOR sync       
{}
bdk-cli wallet -w bob -d $BOB_DESCRIPTOR get_balance
{
  "satoshi": 10000
}

# NO CAROL SHE LOST HER KEY!
```

### Step 4b: Create spending transaction

This spending transaction uses Alice and Bob's keys plus a two block relative time-lock, see above [Step 4a](#step-4a-view-wallet-spending-policies) for the policy id. The transaction can be created by Alice or Bob.

A time based relative time-lock can be used instead of one based on blocks but is slightly more complicated to calculate. See 
[BIP-68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki#specification) for the details.

```bash
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR create_tx -a --to tb1qm5tfegjevj27yvvna9elym9lnzcf0zraxgl8z2:0 --external_policy "{\"ydtnup84\": [0,1,3]}"
{
  "details": {
    "fees": 169,
    "height": null,
    "received": 0,
    "sent": 10000,
    "timestamp": 1614059434,
    "transaction": null,
    "txid": "6a04c60dff8eeb14dc0848c663d669c34ddc30125d9564364c9414e3ff4a7d28"
  },
  "psbt": "cHNidP8BAFICAAAAAYmc6mhj4Cf4pcJyBvxSbCd9IB1yDGs+plzb95t7++v0AAAAAAACAAAAAWcmAAAAAAAAFgAU3RacollkleIxk+lz8my/mLCXiH0AAAAAAAEBKxAnAAAAAAAAIgAgOfTlC2vtnGDNEC2n4j++Wxusqryh4QyqDCqEOQZ5mm4BBXchAlUVWMkNwGkCxDe4ZAcyz7HI+Vpmo4A5//OvkV33PCpprHwhAq9NOHBbPEdKr8IzYEomNTk1eokAkLQ9+ZMuS/OlX+nFrJN8IQOrU70B/wo/oUUCKFQ2cIsBxx6SysE7uVwxyu0ozM4zYqyTfHZjUrJpaJNThyIGAlUVWMkNwGkCxDe4ZAcyz7HI+Vpmo4A5//OvkV33PCppGFrbRoNUAACAAQAAgAAAAIAAAAAAAQAAACIGAq9NOHBbPEdKr8IzYEomNTk1eokAkLQ9+ZMuS/OlX+nFDEMxpeYAAAAAAQAAACIGA6tTvQH/Cj+hRQIoVDZwiwHHHpLKwTu5XDHK7SjMzjNiDO66tnIAAAAAAQAAAAAA"
}

export UNSIGNED_PSBT2=$(bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR create_tx -a --to tb1qm5tfegjevj27yvvna9elym9lnzcf0zraxgl8z2:0 --external_policy "{\"ydtnup84\": [0,1,3]}" | jq -r ".psbt")
```

### Step 5b: Sign and finalize PSBTs

```bash
# ALICE SIGNS
export ALICE_SIGNED_PSBT2=$(bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR sign --psbt $UNSIGNED_PSBT2 | jq -r ".psbt")

# BOB SIGNS
export FINAL_PSBT2=$(bdk-cli wallet -w bob -d $BOB_DESCRIPTOR sign --psbt $ALICE_SIGNED_PSBT2 | jq -r ".psbt")

# CAROL DOES *NOT* SIGN
```

### Step 6b: Broadcast finalized PSBT

```bash
bdk-cli wallet -w bob -d $BOB_DESCRIPTOR broadcast --psbt $FINAL_PSBT2
thread 'main' panicked at 'called `Result::unwrap()` on an `Err` value: Electrum(Protocol(String("sendrawtransaction RPC error: {\"code\":-26,\"message\":\"non-BIP68-final\"}")))', src/bdk_cli.rs:168:50

# Oops we didn't wait long enough for the relative time lock to expire

# Try again in ~20 mins and it is successfully broadcast

bdk-cli wallet -w bob -d $BOB_DESCRIPTOR broadcast --psbt $FINAL_PSBT2          
{
  "txid": "6a04c60dff8eeb14dc0848c663d669c34ddc30125d9564364c9414e3ff4a7d28"
}
```

### Step 7b: View confirmed transaction

[https://mempool.space/testnet/tx/6a04c60dff8eeb14dc0848c663d669c34ddc30125d9564364c9414e3ff4a7d28](https://mempool.space/testnet/tx/6a04c60dff8eeb14dc0848c663d669c34ddc30125d9564364c9414e3ff4a7d28)

And wallet balance is again zero

```bash
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR sync
{}
bdk-cli wallet -w alice -d $ALICE_DESCRIPTOR get_balance
{
  "satoshi": 0
}
```

### Done again!

In this demo we showed how to receive and spend bitcoin using two different descriptor wallet policies using the `bdk` library and `bdk-cli` wallet tool.
