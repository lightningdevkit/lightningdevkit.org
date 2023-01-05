---
title: "TEOS uses LDK to build open-source watchtower"
description: "Learn how TEOS built an open-source watchtower"
date: "2023-01-12"
authors:
  - Sergi Delgado
tags:
  - Case Studies 
--- 

[The Eye of Satoshi (TEOS)](https://github.com/talaia-labs/rust-teos) is a bitcoin watchtower with a specific focus on lightning. Watchtowers are third-party watching services in charge of preventing cheating on lightning by constantly monitoring the bitcoin network for channel breaches. If found, a watchtower will react with the corresponding penalty transaction, penalizing the misbehaving party and sending all funds to its counterpart.

TEOS needs several building blocks in order to work, from block data processing (including reacting to forks/chain splits), interaction with a bitcoin node (for transaction broadcasting) and general tooling around bitcoin/lightning (transaction parsing, data encoding and decoding, lightning P2P messaging, etc)

TEOS does not have a strong performance requirement, given data is checked in newly processed blocks which are expected to be seen once every 10 mins. However, it may need to potentially compare the processed info against a huge amount of data if offering its service to a substantial amount of nodes, or channels with high traffic.

# What we did?

In our specific case, coming from an initial Python implementation for teos, we needed to choose between sticking to the initial choice of language or re-implement something more robust and with better tooling. Rust was an obvious choice given how it has thrived for bitcoin-related projects. Just by changing languages we could drop a substantial amount of dependencies maintained by us or even unmaintained and replace them with their properly maintained counterparts.

![TEOS architecture](../assets/teos-architecture-diagram.png)

With respect to LDK, it has allowed TEOS to abstract its interaction with `bitcoind`, and remove several components of the original design, given that LDK already does a substantial amount of the low-level heavy lifting (e.g. reorg management). Also, for the upcoming features such as lightning P2P communication, Python lacked proper support for most of lightning’s functionality, so using LDK paid for the invested Rust re-implementation time instead of having to implement and maintain all that related tooling in Python.

Furthermore, it let us take advantage of any future lightning updates that we may need, such as anchors. At the end of the day, using LDK lets you focus on the product/protocol you are building and have to care less about the low-level lightning/bitcoin parts that are needed. 


# Results

We’ve reached a more robust and stable codebase, easier to contribute to and integrate with other projects.

Functionality-wise, we recently reached the same state as the old Python codebase. We are currently focusing on new functionality and integrations. From a project health perspective, we’ve achieved a healthier community, primarily due to using Rust and LDK. Also, it’s easier to make improvements to a project when you speak, literally, the same language and use the same tooling. 

Some additional words on this: LDK’s team has been super helpful both from a Rust to a lightning dev standpoint. They’ve helped us solve several issues and have been open to implementing and accepting PRs for new functionality that we required. 

Learn how you can deploy your own TEOS watchtower on the Bitcoin Developers Youtube [channel](https://www.youtube.com/watch?v=8vzNB_NZt2A).