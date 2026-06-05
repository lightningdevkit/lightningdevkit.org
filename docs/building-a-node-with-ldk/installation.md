# Getting started

Welcome to the Lightning Development Kit documentation!

If you have any questions about anything related to LDK, feel free to ask our community on [GitHub Discussions](https://github.com/orgs/lightningdevkit/discussions) or join us on [Discord](https://discord.gg/xaYE3pDQpm).

## Installation

Add LDK to a project by configuring the respective config files:

::: code-group

```toml [Rust]
  # Add the following dependencies to your cargo.toml and replace {VERSION} with the version number you want to use.

  [dependencies]
  lightning = { version = {VERSION}, features = ["max_level_trace"] }
  lightning-block-sync = { version = {VERSION}, features = [ "rpc-client" ] }
  lightning-invoice = { version = {VERSION} }
  lightning-net-tokio = { version = {VERSION} }
  lightning-persister = { version = {VERSION} }
  lightning-background-processor = { version = {VERSION} }
  lightning-rapid-gossip-sync = { version = {VERSION} }

```

```java [Kotlin]
/*
For Gradle, add the following dependency to your build.gradle and replace {VERSION} with
the version number you want to use.
*/

dependencies {
 // ...
  implementation 'org.lightningdevkit:ldk-java:{VERSION}'
 // ...
}

/* To include the LDK Kotlin bindings in an Android project download the latest binary from https://github.com/lightningdevkit/ldk-garbagecollected/releases and place it in your libs directory.
Then add to your build.gradle file:
*/

dependencies {
    // ...
    implementation fileTree(include: ['*.aar'], dir: 'libs')
    // ...
}
```

```bash [TypeScript]
# Install the LDK WASM bindings from npm, replacing {VERSION} with the version
# you want. Pin an explicit version: the npm `latest` tag lags the releases
# (e.g. use 0.2.0-0). The bindings are pure ESM and require a one-time async
# WASM init before use (see below).

npm install lightningdevkit@{VERSION}
```

:::

Example usage after installation is complete:

::: code-group

```rust [Rust]
use lightning::chain::chaininterface::FeeEstimator;
```

```java [Kotlin]
import org.ldk.structs.FeeEstimator
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// Load the WASM once, before using any API:
await ldk.initializeWasmWebFetch("/liblightningjs.wasm");
```

:::
