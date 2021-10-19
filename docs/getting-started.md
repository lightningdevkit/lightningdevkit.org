# Getting Started

Lightning Development Kit (LDK) is a generic library which allows you to build a Lightning node without needing to worry about getting all of the Lightning state machine, routing, and on-chain punishment code (and other chain interactions) exactly correct. LDK tends to be suitable for use cases where a degree of customization is desired, e.g. your own chain sync, your own key management and/or your own storage/backup logic.

We are currently working on a demo node which fetches blockchain data and on-chain funds via Bitcoin Core RPC/REST. The individual pieces of that demo are/will be composable, so you can pick the off-the-shelf parts you want and replace the rest.

