# Introduction

Lightning Development Kit (LDK) is a flexible Lightning implementation with supporting modules.

You can build a Lightning node without needing to worry about getting all of the Lightning state machine, routing, and on-chain punishment code (and other chain interactions) exactly correct. LDK tends to be suitable for use cases where a degree of customization is desired, e.g. your own chain sync, your own key management and/or your own storage/backup logic.

Our [sample node](https://github.com/lightningdevkit/ldk-sample) showcases how LDK can be customised. It fetches blockchain data and transacts on-chain via Bitcoin Core RPC/REST. The individual components of the sample are composable. For example, the sample writes channel state to the local filesystem, but this component could be replaced with one that writes this data to the cloud or to multiple locations. You can pick the off-the-shelf parts you want and replace the rest.

## To jump into integrating LDK with your application

* [Click here for Java](../tutorials/build_a_node_in_java.md)
* [Click here for Rust](../tutorials/build_a_node_in_rust.md)

## References

### [Rust Documentation](https://docs.rs/lightning)

These provide the most searchable and comprehensive documentation on LDK.
If you're using Java and want more information on any method/struct/etc., searching
the Rust docs for the Rust version of that struct/method is your best bet.

### [Swift LDK Documentation](https://github.com/arik-so/SwiftLightning/tree/master/Documentation)

These docs are mainly geared towards how Swift could call LDK C bindings directly, but still may
provide a useful overview of Rust Lightning in the context of language bindings.

### [Rust Sample Node](https://github.com/lightningdevkit/ldk-sample)

The sample serves as a complete reference for constructing a Lightning node with
the LDK. This is a good starting point if you want a self-guided tour!

### [LDK Architecture](../overview/architecture)

Gives a high-level organization of LDK and how the pieces fit together. Variations of this diagram
are used throughout the site. This is the primary source and is still a work in progress.