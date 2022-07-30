# Random Number Generation 

LDK aims to make no system calls, it is therefore restricted from generating its own randomness.

The sample node implementation uses Rust's `rand` crate [here](https://github.com/lightningdevkit/ldk-sample/blob/2cd778e7acc959689e3b8462c529ffb3509aa1ec/src/main.rs#L464-L465) and elsewhere.
