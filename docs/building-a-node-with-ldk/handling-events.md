# Handling Events

LDK requires that you handle many different events throughout your app's life cycle. You can learn more by reading about our event-driven [architecture](/introduction/architecture.md).

To start handling events in your application, run:

::: code-group

```rust [Rust]
use lightning::events::Event;

// In the async event handler passed to lightning_background_processor::process_events_async
match event {
  Event::PaymentSent { payment_preimage, payment_hash, .. } => {
    // Handle successful payment
  }
  // Note: in 0.2 `PaymentFailed` carries a `payment_id` and an optional
  // `reason` — the old `rejected_by_dest` field is gone.
  Event::PaymentFailed { payment_id, payment_hash, reason } => {
    // Handle failed payment
  }
  Event::FundingGenerationReady { .. } => {
    // Generate the funding transaction for the channel
  }
  // The Event enum has many more variants — handle the rest as needed.
  _ => {}
}
```

```kotlin [Kotlin]
import org.ldk.structs.Event

// In the `ChannelManagerConstructor.EventHandler` you pass to `chain_sync_completed`
if (event is Event.PaymentSent) {
    // Handle successful payment
}

if (event is Event.PaymentFailed) {
    // Handle failed payment
}

if (event is Event.FundingGenerationReady) {
    // Create a funding tx to be broadcast
}
```

```typescript [TypeScript]
import * as ldk from "lightningdevkit";

// There is no BackgroundProcessor in the TypeScript bindings — pull events
// yourself by passing an EventHandler to `process_pending_events`.
const handler = ldk.EventHandler.new_impl({
  handle_event(event: ldk.Event): ldk.Result_NoneReplayEventZ {
    if (event instanceof ldk.Event_PaymentSent) {
      // Handle successful payment
    } else if (event instanceof ldk.Event_PaymentFailed) {
      // Handle failed payment
    } else if (event instanceof ldk.Event_FundingGenerationReady) {
      // Create a funding tx to be broadcast
    }
    return ldk.Result_NoneReplayEventZ.constructor_ok();
  },
} as ldk.EventHandlerInterface);

// Call this whenever the channel manager / chain monitor signals work is pending.
channelManager.as_EventsProvider().process_pending_events(handler);
chainMonitor.as_EventsProvider().process_pending_events(handler);
```

:::

References: [Rust `Event` docs](https://docs.rs/lightning/0.2.2/lightning/events/enum.Event.html), [Java/Kotlin `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/src/main/java/org/ldk/structs/Event.java), [TypeScript `Event` bindings](https://github.com/lightningdevkit/ldk-garbagecollected/blob/v0.2.0.0/ts/structs/Event.mts)
