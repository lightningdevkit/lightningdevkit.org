---
title: "Lexe Uses LDK to Run Self-Custodial Lightning in Secure Enclaves"
description: "Learn how Lexe uses LDK to run self-custodial Lightning nodes inside Intel SGX secure enclaves with free, always-on node hosting"
date: "2026-06-05"
authors:
  - Max Fang
tags:
  - case-studies
---

[Lexe](https://github.com/lexe-app/lexe-public) is a self-custodial Bitcoin and Lightning wallet that offers free node hosting. It is the most cost-effective and reliable option for self-custodial Lightning nodes, operating securely within hardware enclaves in the cloud.

By utilizing the hardware-based isolation guarantees of Intel SGX, Lexe provides a wallet that can send and receive payments 24/7 while ensuring that it does not retain custody of users' funds. This is possible because Lexe cannot access the keys stored within the enclaves.

Lexe wallet users benefit from reliable receives to BOLT 12 offers, BIP 353, and Lightning Address, along with constant uptime for Nostr Wallet Connect. Lexe's TEE-based architecture significantly lowers node hosting costs, enabling Lexe to offer enterprise-grade Lightning node hosting at no charge.

# The Challenge: Secure Enclaves are Highly Constrained

Secure enclaves (also called Trusted Execution Environments or TEEs) use hardware-based isolation to protect the programs running inside. This means that server administrators cannot read the program memory or corrupt its execution. Among the available TEEs, we have chosen Intel SGX due to its minimal trusted computing base (TCB), which consists only of the enclave application and the underlying hardware.

In contrast, solutions like AWS Nitro, AMD SEV, and Intel TDX often include an entire Linux kernel in their TCB. This results in a much larger attack surface, adding approximately 40 million lines of code that are often not hardened against malicious hypervisors.

Despite these security advantages, running Lightning within enclaves presents severe technical constraints. Lightning is a highly stateful protocol that requires constant peer communication, regular persistence of critical channel data, and ongoing blockchain monitoring. Enclaves do not have direct access to filesystems, networking, or other standard OS facilities, meaning that most existing applications cannot run inside an enclave.

To maintain the security boundary, all input and output (I/O) must pass through carefully controlled interfaces. Any data that is persisted must be encrypted and transmitted over a network, rather than written directly to disk. Additionally, all communication between the enclave and the user's mobile client requires end-to-end encryption and protection against man-in-the-middle attacks, with TLS connections terminating inside the enclave itself.

# Why LDK Was Essential

Other Lightning implementations, such as LND and Core Lightning, assume direct access to disk storage, network sockets, and system resources. They are designed as monolithic daemons that manage their own threads, persistence, and networking. While these implementations are well-suited for their target use cases, retrofitting them to operate in an enclave would require extensive modifications that would be prohibitively difficult to maintain and audit.

LDK's highly modular approach, including the separation of Lightning protocol logic from all I/O operations, made it the only viable choice. LDK explicitly delegates these responsibilities to the host application through well-defined trait interfaces.

# Lexe's Architecture with LDK

<LexeArchitectureDiagram />

Our architecture leverages LDK's modularity in several key areas:

## Persistence

Enclaves cannot directly access local disk storage, so we implemented custom logic within the `Persist` trait to encrypt node state and write it to remote storage via a network call. Given that we persist data over a network, we require asynchronous persistence. Thankfully, LDK's persistence trait is runtime-agnostic, supporting both sync (blocking) and async (non-blocking) persistence implementations. By encrypting the node state, we ensure that even if an attacker compromises Lexe's infrastructure, they will only see meaningless ciphertext rather than user secrets.

## Chain Interface

Since `bitcoind` cannot run inside an enclave, we needed another way to get blockchain data. While other Lightning implementations require block-based synchronization from a full node or SPV client, LDK allows transaction-based synchronization via the `Confirm` trait. It also provides a ready-to-use Esplora client implementation via the `lightning-transaction-sync` crate. This transaction-based approach is very efficient; instead of requiring every Lexe user node to process the entire contents of every block, each node only syncs specific transactions relevant to its channels and on-chain wallet.

## Shared Components

Enclaves require that all memory used by the node must be allocated up-front. Simultaneously, we wanted to do payment routing *inside* the enclave to preserve user privacy. Normally, this would require each user node to maintain its own copy of the entire network graph and route scorer, which can easily exceed 400 MiB of RAM. This would mean allocating at least 500 MiB (or more!) per user, which would be prohibitively expensive for thousands of concurrent users.

Instead, we adopted what we call our "meganode" architecture, where hundreds of user nodes run within a single enclave process instead of just one. LDK makes this possible by letting us share the `NetworkGraph` and `ProbabilisticScorer` (which don't contain sensitive data) across all user nodes, while keeping each user's keys and channel state completely isolated. As a result, we achieve a 10-100x improvement in memory requirements per user.

# Conclusion

LDK's modularity enabled us to achieve what seemed impossible: running Lightning nodes inside SGX enclaves. Users maintain full custody of their funds while their nodes operate 24/7 in our infrastructure, effectively solving Lightning's offline receive problem. SGX's hardware isolation ensures that even Lexe cannot access user funds, while remote attestation and reproducible builds allow users to verify the exact code running on their behalf.

Lexe's meganode architecture delivers 10-100x memory efficiency by sharing the network graph and other non-sensitive components across users. This significant reduction in resource consumption allows for free node hosting with sustainable economics.

Users can send and receive payments 24/7 without managing any infrastructure. Developers can integrate Lightning through our SDK without the operational burden of node management, uptime, or channel maintenance.

LDK's flexibility has allowed us to run Lightning in a secure enclave with no filesystem, no direct networking, and fixed memory allocation. The modularity that facilitated our unique architecture can also enable others to explore Lightning on embedded devices, hardware wallets, or in environments we have yet to imagine.

By overcoming the Lightning trilemma—providing self-custody, convenience, and low cost all at once—we are finally able to develop Lightning wallets that work seamlessly.

# Further Reading

- [Lexe Wallet](https://lexe.app)
- [Lexe Sidecar SDK](https://github.com/lexe-app/lexe-sidecar-sdk)
- [Lexe's security model in detail](https://github.com/lexe-app/lexe-public/blob/master/SECURITY.md)
- [Lexe monorepo](https://github.com/lexe-app/lexe-public)
