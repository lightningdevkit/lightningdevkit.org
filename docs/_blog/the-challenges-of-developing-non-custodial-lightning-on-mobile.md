---
title: "The Challenges of Developing Non-Custodial Lightning on Mobile"
description: "A 0-conf channel allows peers to start using a channel as soon as the funding transaction is broadcast."
date: "2023-12-14"
authors:
  - Matt Corallo
tags:
  - Mobile
  - Non-Custodial
---

Lightning development is tough. While going custodial simplifies the process, it means sacrificing user privacy, censorship resistance, and self-sovereignty, all of which contradict bitcoin’s ethos. Therefore, many companies and projects have started with or redirected their focus from building custodial to non-custodial Lightning applications.

## Obstacles

There are several basic requirements for wallets wanting to add Lightning capabilities, such as connecting to the Lightning Network via a Lightning Implementation, syncing with on-chain transactions, and opening and closing channels. When building a mobile application, developers face additional technical challenges:

## Liquidity

To receive funds via Lightning, someone must have on-chain bitcoin locked up in a channel. Transaction completion is delayed if the receiver has an empty or insufficient channel balance. For example, let’s say that someone has 50,000 sats of inbound liquidity and is trying to receive 100,000 sats. Before the Lightning transaction can be initiated, additional liquidity is required to cover the 100,000 sats total plus fees from channel reserves and anchor outputs, which are mechanisms to improve security. This is done via on-chain transactions, which come with fees.

Additionally, on-chain transactions must be mined into multiple blocks before being confirmed. It’s not a great user experience if someone has to do work upfront and wait roughly 30–60 minutes before they can send or receive money.

[0-conf](https://lightningdevkit.org/blog/zero-confirmation-channels/) channels offer a partial solution, allowing users to receive Lightning instantly. 0-conf enables the client to trust their channel counterparty (usually an application vendor or partner) for a limited time until an on-chain transaction is confirmed. While this helps with speed, the fact that 0conf channels require some level of trust is a trade-off.

Liquidity Service Providers (LSPs) provide liquidity upfront through automated channel and liquidity management. LSPs supply more liquidity than required for immediate payments rather than the exact amount to ensure that remaining funds are in the channel for future transactions. If a user conducts multiple payments, it’s best to avoid doing on-chain transactions for every Lightning transaction.

LSPs do not want to pay excessive on-chain fees, but it’s hard to predict how often people will send and receive transactions and for how much. Therefore, there’s no straightforward way to know how much liquidity should be locked into a given channel. LSPs have to determine how much money they can contribute and how much it'll cost. This can be anywhere from aggressive (locking up a generous amount) to conservative (locking up a small amount). Ultimately, this decision results in a “compression ratio," i.e., the number of on-chain transactions required per Lightning transaction. Some very conservative LSPs may get a compression ratio close to one, saving their users relatively little on fees, but there is nearly always some gain to be had in using Lightning over on-chain.

While predicting what the compression ratio should be remains a major challenge, most solutions today offer some compression information, allowing us to learn and improve. For this reason, it’s worth deploying Lightning for instant transactions at lower costs compared to on-chain, even if it's not as common as it could be. We expect this to get better over time.

# Receive Wakeup

Lightning requires nodes (or, specifically, their cryptographic keys) to be online to exchange signatures and complete payments, meaning the user must be on their phone and with service. Receiving wakeups is problematic because incomplete payments are not great for the Lightning Network—it’s detrimental to keep the money for a payment locked up until someone comes back online.

iOS and Android operating systems help address this problem by allowing a small amount of code to run when notifications are received, even if the relevant application isn’t open. However, suppose an application is infrequently used or the device has a low battery. In that case, the application will often not get any CPU time, resulting in the payment being stuck until the user opens the app.

A lot of work must be done to make it possible for senders and recipients to exchange payments asynchronously, [but a protocol sketch is in the works](https://lists.linuxfoundation.org/pipermail/lightning-dev/2021-October/003307). You can find a more detailed explainer [here](https://gist.github.com/remyers/e0d2bedb7bc87371d1bdbbb6fff2edd1).

# Live Backups

These are especially problematic when a user has to reinstall an application or loses their phone. In addition to needing their seed phrase, they’ll need the latest Lightning state data stored on their device to get their money back reliably.

The Lightning state changes every time a user sends or receives money, so backups must be frequently updated on a server. While some devices use Google Drive or iCloud, those protocols sync asynchronously, often leading to data being out of sync. Cloud methods sanitize data stored on the client well, but they may not ensure reliable full funds recovery if a device is lost.

Advanced versions of live online sync allow users to open the same wallet on multiple devices. Users often do this despite it being challenging to do with Lightning applications since two devices running simultaneously can result in losing funds.

# Privacy-preserving Payment Routing

Another commonly discussed issue is payment routing through the Lightning Network. This isn't easy because the route finder has to have some history of liquidity on the Lightning Network.

The most common method is to rely on a server for route-finding, which sees users' payment history and therefore compromises privacy. This may also pose long-term regulatory concerns for apps relying on such servers.

Without a server, the client needs to download the full Lightning graph. This can be slow and performance-compromising. Worse, the Lightning graph alone doesn’t provide enough information to achieve reliable payment success, leading to the possibility that transactions may take a long time to complete, or not go through at all.

To achieve better payment success, the client must send lots of payments, which can be done via probing (fake payments). Probing trains data on the network graph from a client's perspective and builds up a history of liquidity on the network. While this offers a solution, probing must be done consistently, requiring the client to be online 24/7. This could instead be done by an LSP, which can offer the resulting data to clients. Additionally, information is not super portable across LSPs, so each LSP needs to do its own probing.

# Privacy-preserving Block Fetching

For users to see their transaction history and balance, bitcoin and Lightning wallets need to connect to and download the blockchain. Each block contains a lot of data, making downloading the full blockchain on mobile devices impractical due to bandwidth constraints.

The most common way to obtain blockchain data is to connect to a server using Electrum or Esplora. To do this and get the relevant information, the client has to provide their user’s list of addresses, exposing transaction histories and balances.

It’s difficult to fetch blockchain data without giving up privacy. One way around this is to use compact block filters, which download data from a full node and only download a select amount of blocks. While compact block filters offer better privacy than a server and are more efficient than downloading the entire blockchain, the method isn’t perfect. Compact block filters are slow to sync and still require substantial bandwidth on the user’s device, making it a less enticing tradeoff for many wallets.

A third option, called private information retrieval, is more future-looking. This method is efficient for clients but expensive on the server side.

# Conclusion

There are many obstacles to making non-custodial Lightning work privately on mobile devices, but it is doable. It requires a mobile-focused LN implementation, SDK, and infrastructure operated by an LSP or the application vendor. None of that needs to compromise user privacy or self-sovereignty, even though, in many designs, it does.
