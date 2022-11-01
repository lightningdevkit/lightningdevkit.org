# Opening a Channel

Channels are the basic building blocks of the Lightning Network. With channels, you can transact not only with your immediate peers but with others on the network. Let's explore how to open a channel with LDK.

Now that you have a peer, you can open a channel with them using `ChannelManager`. You'll need the peer's pubkey as before along with:

- the amount in sats to use when funding the channel,
- any msats to push to your peer,
- an id which is given back in the `FundingGenerationReady` event, and
- an optional `UserConfig` for overriding `ChannelManager` defaults

Channels can be announced to the network or can remain private, which is controlled via `UserConfig::announced_channel`.

<CodeSwitcher :languages="{rust:'Rust', java:'Java', kotlin:'Kotlin'}">
  <template v-slot:rust>

```rust
let amount = 10_000;
let push_msat = 1_000;
let user_id = 42;
let config = UserConfig {
  channel_options: ChannelConfig { announced_channel: true, ..Default::default() },
  ..Default::default()
};
match channel_manager.create_channel(pubkey, amount, push_msat, user_id, Some(config)) {
  Ok(_) => println!("EVENT: initiated channel with peer {}", pubkey),
  Err(e) => panic!("ERROR: failed to open channel: {:?}", e),
}
```

  </template>
  <template v-slot:java>

```java
long amount = 10_000L;
long push_msat = 1_000L;
long user_id = 42L;
UserConfig config = UserConfig.with_defaults();
config.get_channel_options().set_announced_channel(true);

Result_NoneAPIErrorZ create_channel_result = channel_manager.create_channel(
    pubkey, amount, push_msat, user_id, config);
assert create_channel_result instanceof Result_NoneAPIErrorZ.Result_NoneAPIErrorZ_OK;
```

  </template>
  <template v-slot:kotlin>

```kotlin
val amount = 100_000L
val pushMsat = 1_000L
val userId = 42L

// public aka announced channel
val userConfig = UserConfig.with_default()

val channelHandshakeConfig = ChannelHandshakeConfig.with_default()
channelHandshakeConfig._announced_channel = true

userConfig._channel_handshake_config = channelHandshakeConfig

val createChannelResult = channelManager.create_channel(
    pubKey.toByteArray(), amount, pushMsat, userId, userConfig
)
```

  </template>
</CodeSwitcher>




