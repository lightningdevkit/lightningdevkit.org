# Handling Events

LDK requires that you handle many different events throughout your app's life cycle. You can learn more by reading about our event-driven [architecture](/overview/architecture.md).

To start handling events in your application, run:

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
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
  <template v-slot:java>
 
  ```java
  import org.ldk.batteries.ChannelManagerConstructor

  ChannelManagerConstructor channelManagerConstructor = new ChannelManagerConstructor(
    Network.LDKNetwork_Bitcoin, 
    UserConfig.default(), 
    latestBlockHash,
    latestBlockHeight, 
    keysManager.as_KeysInterface(), 
    feeEstimator, 
    chainMonitor,
    router, 
    txBroadcaster, 
    logger
  );
  ```

  </template>

   <template v-slot:kotlin>
 
  ```kotlin
  import org.ldk.batteries.ChannelManagerConstructor

  val channelManagerConstructor = ChannelManagerConstructor(
      Network.LDKNetwork_Regtest,
      userConfig,
      latestBlockHash,
      latestBlockHeight,
      keysManager.as_KeysInterface(),
      feeEstimator,
      chainMonitor,
      router,
      txBroadcaster,
      logger
  );
  ```

  </template>
</CodeSwitcher>

