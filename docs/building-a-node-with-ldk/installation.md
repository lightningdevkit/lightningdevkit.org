# Getting started

Welcome to the Lightning Development Kit documentation!

If you have any questions about anything related to LDK, feel free to ask our community on [GitHub Discussions](https://github.com/orgs/lightningdevkit/discussions) or join us on [Discord](https://discord.gg/xaYE3pDQpm).

## System Requirements

MacOS, Windows and Linux are supported.

## Installation

To add LDK to a project, run:

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin'}">
  <template v-slot:rust>
 
  ```toml
    # Add the following dependencies to your cargo.toml and replace {VERSION} with the version number you want to use.

    [dependencies]
    lightning = { version = {VERSION}, features = ["max_level_trace"] }
    lightning-block-sync = { version = {VERSION}, features = [ "rpc-client" ] }
    lightning-invoice = { version = {VERSION} }
    lightning-net-tokio = { version = {VERSION} }
    lightning-persister = { version = {VERSION} }
    lightning-background-processor = { version = {VERSION} }
    lightning-rapid-gossip-sync = { version = {VERSION} }

````

</template>
<template v-slot:kotlin>

```java
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
````

  </template>

</CodeSwitcher>

Example usage after installation is complete:

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin'}">
  <template v-slot:rust>

```rust
use lightning::chain::chaininterface::FeeEstimator;
```

  </template>
  
  <template v-slot:kotlin>

```java
import org.ldk.structs.FeeEstimator
```

  </template>
  
</CodeSwitcher>

::: tip Installing LDK Swift
Import LDK through the Swift package manager.
:::
