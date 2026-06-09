---
title: "Lexe Uses LDK to Run Self-Custodial Lightning in Secure Enclaves"
description: "Learn how Lexe uses LDK to run self-custodial Lightning nodes inside Intel SGX secure enclaves with free, always-on node hosting"
date: "2026-06-05"
authors:
  - Max Fang
tags:
  - case-studies
---

[Lexe](https://lexe.app) is building the world's most cost-effective and reliable self-custodial Lightning nodes running inside secure hardware enclaves in the cloud. By leveraging the hardware-based isolation guarantees of Intel SGX, Lexe can offer a wallet that sends and receives payments 24/7 without retaining custody of users' funds, as Lexe cannot read the keys inside of the enclaves.

Lexe wallet users enjoy reliable receives to BOLT 12 offers, BIP 353, and Lightning Address, with always-on uptime for Nostr Wallet Connect. Lexe's TEE-based architecture also drastically reduces node hosting costs, allowing Lexe to offer enterprise-grade Lightning node hosting for free.

# The Challenge: Secure Enclaves are Highly Constrained

Secure enclaves (also called Trusted Execution Environments or TEEs) use hardware-based isolation to protect the programs running inside—server administrators cannot read the program memory or corrupt its execution. Among the available TEEs, we chose Intel SGX specifically for its minimal trusted computing base (TCB), which only includes the enclave application and the underlying hardware. In contrast, AWS Nitro, AMD SEV, and Intel TDX usually include an entire Linux kernel in their TCB, resulting in a significantly larger attack surface (an additional ~40 million lines of code which typically aren't hardened against malicious hypervisors).

Despite these security advantages, running Lightning inside enclaves comes with severe technical constraints. Lightning is a highly stateful protocol requiring constant peer communication, regular persistence of critical channel data, and blockchain monitoring. Enclaves have no direct access to filesystems, networking, or other standard OS facilities, meaning that the vast majority of existing applications simply will not run inside of an enclave.

To maintain the security boundary, all I/O must pass through carefully controlled interfaces. All persisted data must be encrypted and transmitted over a network, rather than written directly to disk. All communication between the enclave and the user's mobile client requires end-to-end encryption and protection against man-in-the-middle attacks, with TLS connections terminating inside the enclave itself.

# Why LDK Was Essential

Other Lightning implementations like LND or Core Lightning assume direct access to disk storage, network sockets, and system resources. They're designed as monolithic daemons that manage their own threads, persistence, and networking. While these implementations are well-suited for their target use cases, trying to retrofit them to run in an enclave would require extensive modifications that would be prohibitively difficult to maintain and audit.

LDK's highly modular approach, including the separation of Lightning protocol logic from all I/O operations, made it the only viable choice. LDK explicitly delegates these responsibilities to the host application through well-defined trait interfaces.

# Lexe's Architecture with LDK

<LexeArchitectureDiagram />

Our architecture leverages LDK's modularity in multiple places:

## Persistence

Since enclaves cannot access local disk directly, we implement custom logic within the [`Persist`](https://docs.rs/lightning/0.1.5/lightning/chain/chainmonitor/trait.Persist.html) trait to encrypt node state and write it to remote storage via a network call. Because we persist over a network, we need async persistence; thankfully, LDK's persistence trait is runtime-agnostic, supporting both sync (blocking) and async (non-blocking) persistence implementations. Encrypting the node state ensures that even if an attacker compromises Lexe's infrastructure, they cannot read user secrets, only meaningless ciphertext.

## Chain Interface

Since `bitcoind` cannot run inside an enclave, we need another way to get blockchain data. While other Lightning implementations require block-based synchronization from a full node or SPV client, LDK allows transaction-based synchronization via the [`Confirm`](https://docs.rs/lightning/0.1.5/lightning/chain/trait.Confirm.html) trait, along with a ready-to-use Esplora client implementation via the [`lightning-transaction-sync`](https://docs.rs/lightning-transaction-sync) crate. This transaction-based approach is very efficient—instead of every Lexe user node processing the entirety of every block, each node syncs only the specific transactions relevant to its channels and on-chain wallet.

## Shared Components

Enclaves have the particular requirement that all memory used by the node must be allocated up-front. Simultaneously, we want to do payment routing *inside* the enclave, in order to preserve user privacy. Normally, this would require each user node to maintain its own copy of the entire network graph and route scorer, which can easily exceed 400 MiB of RAM, meaning we have to allocate at least 500 MiB (or more!) per user, which would be prohibitively expensive for thousands of concurrent users.

Instead, we adopted what we call our "meganode" architecture: running hundreds of user nodes per enclave process instead of just one. LDK makes this possible by letting us share the [`NetworkGraph`](https://docs.rs/lightning/0.1.5/lightning/routing/gossip/struct.NetworkGraph.html) and [`ProbabilisticScorer`](https://docs.rs/lightning/0.1.5/lightning/routing/scoring/struct.ProbabilisticScorer.html) (which don't contain sensitive data) across all user nodes, while keeping each user's keys and channel state completely isolated. The result is a 10-100x improvement in per-user memory requirements.

# Conclusion

LDK's modularity enabled us to achieve what seemed impossible: running Lightning nodes inside SGX enclaves.

Users maintain full custody while their nodes run 24/7 in our infrastructure, finally solving Lightning's offline receive problem. SGX's hardware isolation prevents even Lexe from accessing user funds, while remote attestation and reproducible builds let users verify the exact code running on their behalf.

Lexe's meganode architecture delivers 10-100x memory efficiency by sharing the network graph and other non-sensitive components across users. This dramatic reduction in resource consumption enables free node hosting with sustainable economics.

Users can send and receive payments 24/7 without managing any infrastructure. Developers integrate Lightning through our SDK without the operational burden of node management, uptime, or channel maintenance.

LDK's flexibility let us solve what seemed impossible: running Lightning in a secure enclave with no filesystem, no direct networking, and fixed memory allocation. The same modularity that enabled our unusual architecture will enable others—Lightning on embedded devices, hardware wallets, or environments we haven't yet imagined. By solving the Lightning trilemma—delivering self-custody, convenience, and low cost all at once—we can finally build Lightning wallets that just work.

# Further Reading

- [Lexe Wallet](https://lexe.app)
- [Lexe Sidecar SDK](https://github.com/lexe-app/lexe-sidecar-sdk)
- [Lexe's security model in detail](https://github.com/lexe-app/lexe-public/blob/master/SECURITY.md)
- [Lexe monorepo](https://github.com/lexe-app/lexe-public)
