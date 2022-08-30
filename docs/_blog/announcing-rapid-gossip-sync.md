---
title: "Announcing Rapid Gossip Sync"
description: "Rapid Gossip Sync is a protocol that allows nodes to catch up with channel gossip data by relying on semi-trusted servers."
date: "2022-08-30"
authors:
  - Arik Sosman
tags:
  - Gossip 
  - Network Graph 
--- 

If you've run a Lightning node, you'll have noticed that initialization can be time-consuming. Merely opening a channel requires six block confirmations or about one hour. However, even if your node already has open channels but has been offline for a while, restarting it still requires fetching the latest channel graph data (commonly referred to as "gossip”) and verifying that all its channels have remained intact.

While most Lightning implementations have mechanisms to quickly catch up to the latest block, one bottleneck that may remain is the exchange of aforementioned gossip, which rarely takes more than a couple of minutes but significantly impacts UX when initiating locally-routed payments from a mobile device. Assuming that an app remains closed until you need to send a payment, even a one-minute waiting period becomes a major payment flow disruptor. This issue is commonly resolved by sharing the intended payment recipient with a Lightning Service Provider, thus compromising privacy to offload the route calculation to a server.

For that reason, we're very excited to announce Rapid Gossip Sync, a protocol that allows nodes to catch up with channel gossip data by relying on semi-trusted servers. 

## Exchanging Gossip Today

Before we delve too deeply into the optimizations that Rapid Gossip Sync relies on, first a primer on how gossip works today. It involves three main message types: channel announcements, channel updates, and node announcements. (The last of which isn’t really relevant to this post.)

As their names imply, channel announcements are sent when a public channel opens, and updates when changes are made to a channel. One peculiar characteristic of channels is that they aren't symmetrical: depending on the direction, some of their properties may vary. For instance, if Alice and Bob have a channel, Alice may charge higher fees for forwarding payments to Bob than Bob to Alice. Unlike channel updates, channel announcements do not carry directional information, so that scenario would require that different channel updates be broadcast to the network for each direction. Similarly, opening a new channel also requires sending at least two channel updates to initialize direction-specific properties.

One of the noteworthy properties of gossip is that a lot of data is duplicated across messages. For example, each channel announcement and update contains the genesis block hash. Similarly, each channel announcement contains both nodes’ public keys, exacerbating data redundancy for well-connected nodes. So, to reduce bandwidth requirements, we decided to see if we could strip data to create a more efficient way of conveying the same information. 

In the next few paragraphs, we'll outline a selection of the various optimizations we came up with. 

## Rapid Gossip Sync

Firstly, the idea of Rapid Gossip Sync is that gossip data is pre-processed by one or multiple semi-trusted servers. These validate the signatures sent via regular gossip and verify the channels against the blockchain. This should obviate client-side signature verification and allow us to entirely remove signatures from the messages.

Secondly, the server sends batches of gossip data, representing snapshots of recent channel graphs. Given that the server batches the data, global properties across all announcements and updates (such as the chain hash) can be stripped out and sent just once. Similarly, since clients are primarily interested in new information, a single timestamp (the latest one) suffices to determine what data the client has or hasn't seen before when it requests the latest gossip snapshot. 

The most crucial optimization that comes with Rapid Gossip Sync is that it doesn't send redundant updates. So even if a node sends 100 channel updates, and the only mutated property is its base fee, there would be no need to send out any other unchanged properties. To do that, we overloaded the channel flag byte, which would otherwise only use two bits to indicate an update's affected direction and whether a channel is disabled.

Channel updates are sent frequently and often refer to channels the client hasn't seen before, meaning that the server must include all properties, not just the mutated ones. This realization led us to notice that many properties were set to the same value across different channel updates, so we decided to measure what values occurred most frequently. Then, to reduce data overhead, we declare those most commonly occurring values as defaults at the start of every gossip snapshot. Any property whose value matches the default can be omitted from the snapshot if a channel update refers to a previously unknown channel. The only difficulty arising from that optimization is distinguishing whether a channel update is new or incremental. As it happens, the last remaining bit of the channel flags lends itself perfectly for this purpose. This way, when an update is new, a set property bit will indicate a deviation from the default specified at the beginning of the snapshot. Otherwise, that same bit, when set, would instead indicate a mutation. In either case, when a property's bit flag is not set, its corresponding value needn't be sent over the wire.

Finally, short channel IDs need to be specified for each announcement and update. Since they require 8 bytes per message, we were able to reduce memory requirements by sorting announcements and updates incrementally, and then successively specifying channel IDs in terms of their relative delta, which can be expressed in fewer than 8 bytes by using the BigSize data type.

## Rapid Gossip Sync Server

The Rapid Gossip Sync protocol can only function with a corresponding server. Its operating principle is straightforward: connect to a set of peers on the Lightning Network, monitor the gossip, and persist the timestamped changes to a database. Upon receiving a client’s request, determine which changes have occurred after the provided timestamp and serialize the delta in Rapid Gossip Sync’s compact snapshot format. However, this comes with some caveats. 

Channel updates sometimes percolate slowly through the network, resulting in disagreements between the included timestamp and what the server detects. To avoid ambiguity, the server marks all announcements and updates with a "seen" timestamp, canonically ordering all events and making difference determination straightforward. Each snapshot returned to the client includes the latest "seen" timestamp across every announcement and update.

Additionally, calculating graph delta on the fly is resource-intensive and can last tens of seconds. To avoid this, the Rapid Gossip Sync server calculates static delta snapshots at regular 24-hour-intervals. This means that any snapshot a client receives is, on average, 12 hours behind the current state of the graph. Depending on your use case, snapshot calculation frequency may be tweaked. 

## Trust Model

Many mobile Lightning wallets delegate routing to servers, which jeopardizes some of the Lightning Network’s privacy benefits. Despite the marginal improvements stemming from the fact that transactions don’t end up on-chain, your payment history remains one data dump away from becoming public knowledge.

By relying on a Rapid Gossip Sync server, mobile wallets no longer need to compromise UX to gain the privacy benefit of client-side routing. The trust model shifts the onus of verifying the channel graph against the blockchain and validating node signatures to the server. That would allow a malicious Rapid Gossip Sync server to partially omit graph data to force payments to be routed through itself. If the server is widely used, it could also concentrate routing through another network node to facilitate a denial of service attack.

Considering that most mobile Lightning wallets communicate with their developers' servers, these concerns can be easily mitigated by deploying a Rapid Gossip Sync server to enable your mobile wallet to route privately without third parties or sacrificing UX. 

## Conclusion

Let's look at our data usage improvements with the above optimizations factored in.

Without Rapid Gossip Sync, we measured sync data using a random set of 80,000 channel announcements and 160,000 channel updates and identified an average of approximately 53MB. 

With Rapid Gossip Sync, a snapshot representing the same graph took up 4.7MB and, after gzip, only 2MB. The time to process and apply that snapshot on a mobile phone was less than 0.4 seconds. For more detailed numbers, please refer to the [Rapid Gossip Sync README](https://github.com/lightningdevkit/rust-lightning/tree/main/lightning-rapid-gossip-sync).

We're excited for you to try Rapid Gossip Sync out and invite you to look at the [server code](https://github.com/lightningdevkit/rapid-gossip-sync-server). If you don't wish to operate a Rapid Gossip Sync snapshotting server, feel free to try our deployment, which is available at rapidsync.lightningdevkit.org.

