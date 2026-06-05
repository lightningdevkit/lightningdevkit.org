# LDK 0.2 API reference (for docs update)

Verified June 2026 against docs.rs/lightning/0.2.2, ldk-sample, and ldk-garbagecollected @ v0.2.0.0
(Java/Kotlin + TypeScript bindings). Versions to cite:

- Rust `lightning` 0.2.2; siblings (`-net-tokio`, `-background-processor`, `-block-sync`,
  `-persister`, `-rapid-gossip-sync`, `-transaction-sync`) 0.2.0; `lightning-invoice` 0.34.x.
- Kotlin `org.lightningdevkit:ldk-java:0.2.0` (release tag v0.2.0.0).
- TypeScript `lightningdevkit@0.2.0-0` (MUST pin; `latest` tag is 0.1.8-0). WASM, pure ESM,
  needs `await initializeWasmWebFetch(url)` / `initializeWasmFromBinary(bytes)` before use.

## Cross-cutting breaking changes vs the current docs
- `ConfirmationTarget`: NO Background/Normal/HighPriority. Now: MaximumFeeEstimate,
  UrgentOnChainSweep, MinAllowedAnchorChannelRemoteFee, MinAllowedNonAnchorChannelRemoteFee,
  AnchorChannelFee, NonAnchorChannelFee, ChannelCloseMinimum, OutputSpendingFee.
- `ChannelManager::new` needs router + message_router + 3 signer args + current_timestamp.
- `KeysManager::new(seed, secs, nanos, v2_remote_key_derivation: bool)` — new bool.
- `ChainMonitor::new(.., entropy_source, peer_storage_key)` — 2 new trailing args.
- `Persist` keys on `MonitorName` (not OutPoint); returns ChannelMonitorUpdateStatus;
  added archive_persisted_channel / get_and_clear_completed_updates.
- `BroadcasterInterface::broadcast_transactions(&[&Transaction])` (batch).
- `Logger::log(Record)` by value; Record has level/args/module_path/file/line/peer_id/channel_id/payment_hash.
- `create_channel(.., user_channel_id: u128, temporary_channel_id: Option, override_config)`.
- Announced flag: UserConfig.channel_handshake_config.announce_for_forwarding (renamed; was announced_channel).
- `funding_transaction_generated(channel_id, counterparty_node_id, tx)` — needs counterparty + ChannelId.
- `close_channel(&channel_id, &counterparty_node_id)`; force_close_broadcasting_latest_txn needs error_message.
- Invoice creation: `channel_manager.create_bolt11_invoice(params)` (Rust) /
  `channelManager.create_bolt11_invoice(amount, desc, expiry, minCltv, paymentHash)` (Kotlin/TS).
  OLD `utils::create_invoice_from_channelmanager` REMOVED (lightning-invoice 0.34 dropped utils+payment modules).
- Sending: Rust `pay_for_bolt11_invoice(invoice, payment_id, amount, RouteParametersConfig, Retry)`
  or `send_payment(payment_hash, RecipientOnionFields, payment_id, RouteParameters, Retry)`.
  Kotlin `pay_for_bolt11_invoice(...)` / `send_payment(...)`. TS: PaymentParameters.constructor_from_bolt11_invoice
  + RouteParameters.constructor_from_payment_params_and_value + send_payment. `payment_parameters_from_invoice` REMOVED.
- Events (lightning::events::Event): PaymentReceived→PaymentClaimable (+ distinct PaymentClaimed);
  PaymentFailed { payment_id, payment_hash: Option, reason: Option<PaymentFailureReason> } (no rejected_by_dest);
  PaymentSent gained payment_id/fee_paid_msat/bolt12_invoice; SpendableOutputs gained channel_id.
  PaymentPurpose: Bolt11InvoicePayment / Bolt12OfferPayment / Bolt12RefundPayment / SpontaneousPayment.
- Peer enumeration: `get_peer_node_ids()` REMOVED → Rust `list_peers()`/`peer_by_node_id()`;
  Kotlin `peerManager.list_peers()` -> PeerDetails[] (._counterparty_node_id).
- spend_spendable_outputs moved to OutputSpender (Rust `keys_manager.spend_spendable_outputs(.., Option<LockTime>, secp)`;
  Kotlin/TS `keysManager.as_OutputSpender().spend_spendable_outputs(.., Option_u32Z locktime)`).
- Background processing: OLD BackgroundProcessor::start(persister, invoice_payer, ...) GONE.
  Rust: lightning-background-processor `process_events_async(...)` or `BackgroundProcessor::start(...)` (new shape).
  Kotlin: `channelManagerConstructor.chain_sync_completed(kvStore, eventHandler, outputSweeper?, useP2P)`.
  TS: NO BackgroundProcessor — drive manually via EventsProvider.process_pending_events + pm.process_events.

## TypeScript-specific realities (user asked for non-Node TS)
- Must `await ldk.initializeWasmWebFetch("/liblightningjs.wasm")` once before any API call.
- Methods snake_case; static ctors `X.constructor_*`; trait impls `X.new_impl({...} as XInterface)`;
  enum members `LDK<Enum>_<Member>`; 64-bit ints are JS `bigint`.
- No `ChannelManagerConstructor` helper (that's Java/C# only) — use ChannelManager.constructor_new
  and UtilMethods.constructor_C2Tuple_ThirtyTwoBytesChannelManagerZ_read for restart.
- No BackgroundProcessor, no built-in timers.
- NO browser TCP: connect-to-peers requires implementing SocketDescriptor.new_impl({send_data,
  disconnect_socket, eq, hash}) over a WebSocket→TCP proxy; feed bytes via pm.read_event /
  pm.new_inbound_connection / pm.new_outbound_connection, then pm.process_events().
- Best idiomatic source: ldk-garbagecollected ts/test/tests.mts @ v0.2.0.0.

## Key signatures (condensed)
RUST
- create_bolt11_invoice(params: Bolt11InvoiceParameters) -> Result<Bolt11Invoice, SignOrCreationError>
- pay_for_bolt11_invoice(&invoice, payment_id, Option<amount_msats>, RouteParametersConfig, Retry)
- PeerManager::new(MessageHandler{chan_handler, route_handler, onion_message_handler,
  custom_message_handler, send_only_message_handler}, current_time u32, &eph[u8;32], logger, node_signer)
- process_events_async(kv_store, event_handler, chain_monitor, channel_manager, Option<onion_messenger>,
  gossip_sync, peer_manager, Option<liquidity>, Option<sweeper>, logger, Option<scorer>, sleeper, bool, fetch_time)

KOTLIN (ChannelManagerConstructor battery)
- fresh: ChannelManagerConstructor(Network, UserConfig, tipHash, tipHeight, entropySource, nodeSigner,
  signerProvider, feeEstimator, chainMonitor, networkGraph, scoringDecayParams, scoringFeeParams,
  routerWrapper?, txBroadcaster, logger)
- restart: ChannelManagerConstructor(serMgr, serMonitors[], UserConfig, entropySource, nodeSigner,
  signerProvider, feeEstimator, chainMonitor, filter?, serNetGraph, scoringDecayParams, scoringFeeParams,
  serScorer, routerWrapper?, txBroadcaster, logger)
- chain_sync_completed(kvStore: KVStoreSync, eventHandler, outputSweeper?: OutputSweeperSync, useP2P: Boolean)
- peer_manager / nio_peer_handler are null until chain_sync_completed.

TS
- ChainMonitor.constructor_new(Option_FilterZ, broadcaster, logger, feeEst, persister,
  entropySource, nodeSigner.get_peer_storage_key())
- ChannelManager.constructor_new(feeEst, chainWatch, broadcaster, router.as_Router(),
  msgRouter.as_MessageRouter(), logger, entropySource, nodeSigner, signerProvider, config, params, ts:number)
- PeerManager.constructor_new(chanMsgHandler, routingHandler, onionHandler, customHandler,
  chainMonitor.as_SendOnlyMessageHandler(), nonce:number, eph32, logger, nodeSigner)
</content>
</invoke>
