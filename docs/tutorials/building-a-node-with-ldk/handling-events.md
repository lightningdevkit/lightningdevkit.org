# Handling Events

LDK requires that you handle many different events throughout your app's life cycle. You can learn more by reading about our event-driven [architecture](/overview/architecture.md).

To start handling events in your application, run:

<CodeSwitcher :languages="{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}">
  <template v-slot:rust>

```rust
use lightning::util::events::{Event};

// In the event handler passed to BackgroundProcessor::start
match event {
  Event::PaymentSent { payment_preimage } => {
          // Handle successful payment
  }
  Event::PaymentFailed { payment_hash, rejected_by_dest } => {
          // Handle failed payment
  }
  Event::FundingGenerationReady { .. } =>
}
```

  </template>

  <template v-slot:kotlin>
 
  ```java
  import org.ldk.structs.Event

if (event is Event.PaymentSent) {
// Handle successful payment
}

if (event is Event.PaymentFailed) {
// Handle failed payment
}

if (event is Event.FundingGenerationReady) {
// Create a funding tx to be broadcast
}

````

</template>

<template v-slot:swift>

```Swift
import LightningDevKit

if let event = event.getValueAsPaymentSent() {
  // Handle successful payment
}

if let event = event.getValueAsPaymentFailed() {
  // Handle failed payment
}

if let event = event.getValueAsFundingGenerationReady() {
  // Create a funding tx to be broadcast
}
````

  </template>

</CodeSwitcher>

References: [Rust `Event` docs](https://docs.rs/lightning/0.0.114/lightning/util/events/enum.Event.html), [Java `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/main/src/main/java/org/ldk/structs/Event.java)
