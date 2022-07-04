# Getting started

Welcome to the Lightning Development Kit documentation!

If you have any questions about anything related to LDK, feel free to ask our community on [GitHub Discussions](https://github.com/orgs/lightningdevkit/discussions) or join us on [Discord](https://discord.gg/5AcknnMfBw). 

## System Requirements
MacOS, Windows and Linux are supported.

## Installation
To add LDK to a project, run:

:::: tabs
::: tab "Rust"
```rust
/*
Add the following dependencies to your cargo.toml and replace {VERSION} with the 
version number you want to use from
*/

[dependencies]
lightning = { version = VERSION, features = ["max_level_trace"] }
lightning-block-sync = { version = VERSION, features = [ "rpc-client" ] }
lightning-invoice = { version = VERSION }
lightning-net-tokio = { version = VERSION }
lightning-persister = { version = VERSION }
lightning-background-processor = { version = VERSION }
lightning-rapid-gossip-sync = { version = VERSION }
```
:::
::: tab "Java"

```xml
<!--
For Maven, add the following dependency to your POM and replace {VERSION} with the 
version number you want to use from
-->

<dependency>
  <groupId>org.lightningdevkit</groupId>
  <artifactId>ldk-java</artifactId>
  <version>{VERSION}</version>
</dependency>
```

```kotlin
/* 
For Gradle, add the following dependency to your build.gradle and replace {VERSION} with
the version number you want to use from
*/ 

dependencies {
   // ...
    implementation 'org.lightningdevkit:ldk-java:{VERSION}'
   // ...
}
```
:::
::: tab "Kotlin"
```kotlin
/* To include the LDK Kotlin bindings in an Android project download the latest binary from https://github.com/lightningdevkit/ldk-garbagecollected/releases and place it in your libs directory.
Then add to your build.gradle file:
*/

dependencies {
    // ...
    implementation fileTree(include: ['*.aar'], dir: 'libs')
    // ...
}
```
:::

::: tab "Javascript/Typescript"
```javascript
npm i lightningdevkit --save
```
:::
::::

Example usage after installation is complete:
:::: tabs
::: tab "Rust"
```rust
use lightning::chain::chaininterface::{FeeEstimator};```
:::

::: tab "Java"
```java
import org.ldk.structs.FeeEstimator
```
:::

::: tab "Kotlin"
```kotlin
import org.ldk.structs.FeeEstimator
```
:::

::: tab "JavaScript/Typescript"
```javascript
import { FeeEstimator } from "lightningdevkit";
import * as fs from "fs";
import { strict as assert } from "assert";
 
const wasm_file = fs.readFileSync("node_modules/lightningdevkit/liblightningjs.wasm");
await ldk.initializeWasmFromBinary(wasm_file);
```
:::
::::