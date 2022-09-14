---
title: "Zero-Confirmation Channels"
description: "A 0-conf channel allows peers to start using a channel as soon as the funding transaction is broadcast."
date: "2022-09-15"
authors:
  - John Cantrell
tags:
  - 0-Conf Channels 
  - Lightning Network
--- 

Support for 0-conf channels became available in the Lightning Development Kit’s June 2022, [107 release](https://github.com/lightningdevkit/rust-lightning/releases/tag/v0.0.107). A 0-conf channel allows peers to start using a channel as soon as the funding transaction is broadcast instead of waiting for multiple confirmations. By temporarily trusting the person initiating the channel open, 0-conf channels enable instant onboarding to the Lightning Network.

## What is a confirmation?

A confirmation refers to each block that has been mined with a particular transaction included in the chain. When a transaction is first broadcast to the network but has not yet been included in a block, it has zero confirmations. When the transaction is included in a block, it is said to have one confirmation. Each block mined on top of the first block gives a transaction additional confirmations.

## Why does the number of confirmations matter?

It’s a way to measure the security and finality of transactions. The only way a miner can reverse a transaction is by a process called reorganization. This requires the miner to build a chain of blocks with more work than the currently accepted chain. Each block mined on top of a block that contains a transaction makes it harder to reorganize. In bitcoin’s history, we’ve seen a 4-block reorganization only a couple of times, a 3-block reorganization a handful of times, a 2-block reorganization a few dozen times, and hundreds of 1-block reorganizations.

This is why you should wait six confirmations before considering a high-value transaction complete. A 0-conf transaction is dangerous to accept if you don’t trust the sender since there’s no guarantee that it will ever be included in a block. It’s possible that the fee is too low or another transaction double spends its inputs.

## What does this have to do with the Lightning Network?

When you open a channel on the Lightning Network, you create and broadcast a transaction that funds a multi-sig address shared between channel partners. Most implementations wait for six confirmations before letting a channel route payments. Like any transaction, it could be double-spent, have erroneously low fees, or be reorganized out by miners. If you receive money over a channel where the funding transaction is never confirmed, you will lose any money received or forwarded over that channel.

That brings us to 0-conf channels, which can be used once the transaction appears in both parties' mempools without being mined. This means that the same risks exist when accepting payments over a 0-conf channel as on-chain payments with zero confirmations. However, If you accept a 0-conf payment or channel then you are putting trust into the system.

0-conf channels are somewhat controversial because one of bitcoin’s main benefits is that it enables peer-to-peer payments without requiring you to trust your peers or any other intermediaries. With 0-conf channels, you trust that your peer won’t attempt to double-spend the transaction inputs and that miners will include and build on top of this transaction. While you can do some things to gain confidence that the transaction will confirm, such as verifying the fee rate and being well connected to the network, you can never be certain.  

Despite the trust required to operate a 0-conf channel, it’s worth noting that in the case of 0-conf channels, the trust is only with your peer, which is not necessarily the person sending you the money. This is quite different from 0-conf on-chain payments where you have to trust every individual sender.

## Why or when might 0-conf channels be useful?

Well, they enable instant lightning payments where trust is minimized as confirmations occur. This can be useful in situations where you already trust your peers to some extent, such as friends, family, or reliable business relationships.

0-conf channels can also enable some interesting liquidity/onboarding use-cases. If you trust your LSP or wallet provider, it’s possible to receive a payment over Lightning without having to set up a channel first.  Your LSP or wallet provider can open a 0-conf channel with you on-demand as your first payment arrives.

## Conclusion

0-conf channels can be a useful tool in situations where there is some trust. Do not accept 0-conf channels by default or from people you don’t know. Check out [this video](https://www.youtube.com/watch?v=JjuN6aVv9DI) to see how support for 0-conf channels was added to Sensei, an LDK-based lightning node.