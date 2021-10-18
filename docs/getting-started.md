# Getting Started

Lightning Development Kit (LDK) is a generic library which allows you to build a lightning node without needing to worry about getting all of the lightning state machine, routing, and on-chain punishment code (and other chain interactions) exactly correct. LDK tends to be suitable for use cases where a degree of customization is desired, e.g. your own chain sync, your own key management and/or your own storage/backup logic.

Our [sample node](https://github.com/lightningdevkit/ldk-sample) showcases how LDK can be customised. It fetches blockchain data and on-chain funds via Bitcoin Core RPC/REST. The individual components of the sample are composable. For example, you could write channel state to the local filesystem, a database, the cloud or multiple locations. You can pick the off-the-shelf parts you want and replace the rest. 

