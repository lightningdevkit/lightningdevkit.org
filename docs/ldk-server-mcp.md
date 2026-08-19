# Manage Your Node with an AI Agent

LDK Server already exposes every node operation as an API call. The `ldk-server-mcp` bridge turns those calls into tools an AI agent can use, so "which of my channels are running low on outbound liquidity?" becomes a question you ask rather than a sequence of CLI invocations you run and interpret yourself.

This guide connects a running LDK Server node to opencode, the Claude Code CLI, or the Codex CLI over the [Model Context Protocol](https://spec.modelcontextprotocol.io/) (MCP), then shows what that conversation is genuinely good for — and where it needs a firm hand.

::: warning Alpha
[LDK Server](https://github.com/lightningdevkit/ldk-server) is still under active development and is not ready for production use. Until the v0.1 release, its persisted data model may change in non-backwards-compatible ways. Do not run it with funds you cannot afford to lose, and read [Operating safely](#operating-safely) before pointing an agent at a node that holds real money.
:::

## How it works

Three processes, two hops:

```text
  your agent             ldk-server-mcp          ldk-server           Bitcoin +
 (opencode /    ──────▶  (stdio bridge)  ──────▶ (node daemon) ──────▶ Lightning
  Claude Code /          JSON-RPC 2.0            gRPC over TLS
  Codex CLI)             over stdio              + API key
                                                 127.0.0.1:3536
```

Your agent launches `ldk-server-mcp` as a child process and speaks JSON-RPC 2.0 to it over stdio, one message per line. The bridge translates each tool call into an authenticated gRPC request to your node, over TLS, using the node's API key and self-signed certificate. Nothing new is exposed to the network: the bridge is a local process, and your node keeps listening on loopback.

## Before you start

- A running LDK Server node. If you do not have one yet, follow [Getting Started](https://github.com/lightningdevkit/ldk-server/blob/main/docs/getting-started.md); it needs a Bitcoin chain backend (Bitcoin Core, Electrum, or Esplora) and little else.
- Rust 1.85.0 or later, to build the bridge.
- One of opencode, the Claude Code CLI, or the Codex CLI.
- Ideally a regtest or signet node for your first run. These tools can spend funds and close channels, so get familiar where mistakes are free.

## Step 1: Build the bridge

`ldk-server-mcp` is a crate in the LDK Server workspace, so a clone of the repository is all you need:

```bash
git clone https://github.com/lightningdevkit/ldk-server.git
cd ldk-server
cargo build -p ldk-server-mcp --release
```

The binary lands at `target/release/ldk-server-mcp`. Note its absolute path — every agent below needs it, because your agent, not your shell, is what launches the bridge.

## Step 2: Find your node's credentials

On its first start, LDK Server generates an API key and a self-signed TLS certificate inside its storage directory, and logs the gRPC address it is listening on:

```text
gRPC service listening on 127.0.0.1:3536
```

Unless you set `grpc_service_address` or `storage.disk.dir_path` in your node config, everything the bridge needs is in the default data directory:

| Platform | Default data directory |
| --- | --- |
| macOS | `~/Library/Application Support/ldk-server` |
| Windows | `%APPDATA%\ldk-server` |
| Linux and other Unix | `~/.ldk-server` |

Inside it:

| File | Purpose |
| --- | --- |
| `config.toml` | Node configuration; the bridge reads `grpc_service_address` and `tls.cert_path` from it |
| `tls.crt` | The node's self-signed certificate, used to establish TLS |
| `<network>/api_key` | The 32 random bytes generated on first run — `bitcoin/api_key`, `signet/api_key`, and so on |

The bridge reads that key file itself and hex-encodes it, so in the common case you never handle the key by hand. When you do need the hex form — a node on another machine, or a client you want to configure explicitly — read it out:

```bash
# Linux
xxd -p -c 64 ~/.ldk-server/bitcoin/api_key

# macOS — quote the path, it contains a space
xxd -p -c 64 "$HOME/Library/Application Support/ldk-server/bitcoin/api_key"
```

::: tip Keeping your node config somewhere else?
`ldk-server my-config.toml` runs the node from that file, but the bridge looks for `config.toml` in the default data directory. If your node's TOML lives elsewhere, pass the same file to the bridge with `--config /path/to/my-config.toml` (see Step 3). Otherwise the bridge falls back to defaults, and on a non-mainnet node it will look for your API key under the wrong network.
:::

## Step 3: Connect your agent

If your node runs on the same machine under its default data directory, your agent needs exactly one thing: the path to the binary. The bridge discovers the config, certificate, and API key on its own — which also means no API key ends up in your agent's configuration file.

::: code-group

```bash [Claude Code]
claude mcp add ldk-server -- /abs/path/to/ldk-server-mcp
```

```bash [Codex CLI]
codex mcp add ldk-server -- /abs/path/to/ldk-server-mcp
```

```json [opencode]
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "ldk-server": {
      "type": "local",
      "command": ["/abs/path/to/ldk-server-mcp"],
      "enabled": true
    }
  }
}
```

:::

Claude Code writes to local scope by default; add `--scope project` to share the server through a committed `.mcp.json`, or `--scope user` to have it available in every project. opencode has no add command — it reads `opencode.json` (or `opencode.jsonc`) from your project root or global config directory.

### The same thing, written by hand

`.mcp.json` in your project root for Claude Code, `~/.codex/config.toml` (or `.codex/config.toml` in the project) for Codex, `opencode.json` for opencode:

::: code-group

```json [Claude Code]
{
  "mcpServers": {
    "ldk-server": {
      "command": "/abs/path/to/ldk-server-mcp"
    }
  }
}
```

```toml [Codex CLI]
[mcp_servers.ldk-server]
command = "/abs/path/to/ldk-server-mcp"
args = []
```

```json [opencode]
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "ldk-server": {
      "type": "local",
      "command": ["/abs/path/to/ldk-server-mcp"],
      "enabled": true,
      "environment": {}
    }
  }
}
```

:::

### Pointing at a node that isn't in the default location

Three environment variables override discovery: `LDK_BASE_URL` (the gRPC address), `LDK_API_KEY` (the hex-encoded key from Step 2), and `LDK_TLS_CERT_PATH`.

::: code-group

```bash [Claude Code]
claude mcp add ldk-server \
  --env LDK_BASE_URL=127.0.0.1:3536 \
  --env LDK_API_KEY=<hex_api_key> \
  --env LDK_TLS_CERT_PATH=/path/to/tls.crt \
  -- /abs/path/to/ldk-server-mcp
```

```bash [Codex CLI]
codex mcp add ldk-server \
  --env LDK_BASE_URL=127.0.0.1:3536 \
  --env LDK_API_KEY=<hex_api_key> \
  --env LDK_TLS_CERT_PATH=/path/to/tls.crt \
  -- /abs/path/to/ldk-server-mcp
```

```json [opencode]
{
  "mcp": {
    "ldk-server": {
      "type": "local",
      "command": ["/abs/path/to/ldk-server-mcp"],
      "enabled": true,
      "environment": {
        "LDK_BASE_URL": "127.0.0.1:3536",
        "LDK_API_KEY": "<hex_api_key>",
        "LDK_TLS_CERT_PATH": "/path/to/tls.crt"
      }
    }
  }
}
```

:::

Both CLIs take `--env KEY=value` after the server name and before the `--` separator; everything after `--` is the command that launches the bridge. opencode carries the same variables in the entry's `environment` object.

Precedence runs highest first: the three environment variables, then a `--config <path>` TOML file, then the defaults from Step 2. Two sharp edges are worth knowing. The bridge bypasses the default config file only when all three variables are set — a partial set still loads `config.toml` and overrides it field by field. And to use a config file instead of environment variables, pass it as an argument to the bridge: `-- /abs/path/to/ldk-server-mcp --config /path/to/my-config.toml` for either CLI, or as a second element of opencode's `command` array.

### Confirm it connected

::: code-group

```bash [Claude Code]
claude mcp list             # shows a health status per server
claude mcp get ldk-server   # shows the resolved configuration
# or run /mcp inside a session
```

```bash [Codex CLI]
codex mcp list
```

```text [opencode]
Save opencode.json and restart opencode.
The ldk-server tools then appear in the session's tool list.
```

:::

::: tip Working from the crate README?
Two details in the `ldk-server-mcp` README will not behave as written. It tells Claude Code users to add an `mcpServers` block to `.claude/settings.json`, which is not where Claude Code reads MCP servers from — use `claude mcp add` or `.mcp.json` as above. And its examples set `LDK_BASE_URL` to `localhost:3000`; the gRPC service address defaults to `127.0.0.1:3536`, the address your node prints on startup.
:::

## Step 4: Your first conversation

Start with a question that only reads:

> What's the status of my Lightning node?

Your agent calls `get_node_info`, `get_balances`, `list_channels`, and `list_peers`, then reports back in one place: the node ID, whether the node is synced and to which block, spendable on-chain and Lightning balances, how many channels are usable, and how many peers are currently connected. Four API calls you would otherwise run and cross-reference by hand.

## What your agent can do

Every unary LDK Server RPC is exposed as a tool. Grouped by what they touch:

| Area | Tools |
| --- | --- |
| Node and wallet | `get_node_info`, `get_balances` |
| On-chain | `onchain_receive`, `onchain_send` |
| Receiving over BOLT11 | `bolt11_receive`, `bolt11_receive_for_hash`, `bolt11_claim_for_hash`, `bolt11_fail_for_hash`, `bolt11_receive_via_jit_channel`, `bolt11_receive_variable_amount_via_jit_channel` |
| Sending over BOLT11 | `bolt11_send`, `bolt11_send_underpaying` |
| BOLT12 offers | `bolt12_receive`, `bolt12_send` |
| Other payment paths | `spontaneous_send` (keysend), `unified_send` (BIP 21 URI or BIP 353 name) |
| Channels | `list_channels`, `open_channel`, `close_channel`, `force_close_channel`, `splice_in`, `splice_out`, `update_channel_config` |
| Peers | `list_peers`, `connect_peer`, `disconnect_peer` |
| History | `list_payments`, `get_payment_details`, `list_forwarded_payments` |
| Network graph | `graph_get_node`, `graph_list_nodes`, `graph_get_channel`, `graph_list_channels` |
| Utilities | `decode_invoice`, `decode_offer`, `sign_message`, `verify_signature`, `export_pathfinding_scores` |

Two things are deliberately absent. The streaming `subscribe_events` RPC is not a tool, and neither is the non-RPC `metrics` HTTP endpoint. The practical consequence of the first: your agent cannot sit and wait for an event, so "tell me when this invoice is paid" becomes a poll of `list_payments` or `get_payment_details` rather than a subscription. LDK Server is moving quickly, so ask your agent to list its available tools for the current set rather than treating the table above as final.

## Prompts worth using

The value is not in replacing single commands — `ldk-server-cli` is already good at those. It is in the questions whose answers span several calls and need interpreting.

| Ask this | Tools it reaches for | Why it beats the CLI |
| --- | --- | --- |
| "Give me a morning health check on my node." | `get_node_info`, `get_balances`, `list_channels`, `list_peers` | One summary instead of four outputs to reconcile |
| "Which channels are running low on outbound liquidity?" | `list_channels` | Compares outbound against capacity per channel, and names the ones that matter |
| "Create an invoice for 25,000 sats for the deposit, then check whether it's been paid." | `bolt11_receive`, then `list_payments` or `get_payment_details` | Generates, tracks, and re-checks against the payment hash it just created |
| "Here's an invoice — can I pay it, and what will it cost me?" | `decode_invoice`, `get_balances`, `list_channels` | Decodes the amount and expiry, then checks it against your actual liquidity before you commit |
| "Connect to this node URI and open a 500,000 sat channel." | `connect_peer`, `open_channel` | Sequences peer connection before funding, and reports the funding txid |
| "How much did I earn forwarding payments this week, and through which channels?" | `list_forwarded_payments`, `list_channels` | Aggregates and attributes forwards; the raw list needs the same work done by hand |
| "Tell me about this node before I open a channel to it." | `graph_get_node`, `graph_list_channels`, `list_peers` | Pulls the gossip view of capacity and connectivity into a readable answer |
| "Draft a weekly summary of my node I can paste into a report." | `get_node_info`, `get_balances`, `list_channels`, `list_payments`, `list_forwarded_payments` | The synthesis is the work; the calls are trivial |

Anything in the last three rows that moves funds — `open_channel` in particular — should be reviewed before you approve it. Which is the next section.

## Operating safely

This bridge does not hand your agent a read-only dashboard. An agent that can list your channels can also close them, and an agent that can create an invoice can also pay one. These are the tools that move money or change channel state:

`onchain_send`, `bolt11_send`, `bolt11_send_underpaying`, `bolt12_send`, `spontaneous_send`, `unified_send`, `open_channel`, `splice_in`, `splice_out`, `close_channel`, `force_close_channel`.

::: warning Approve fund-moving calls individually
Every one of these clients can be configured to approve tool calls without asking. Do not do that for this server. A misread prompt with blanket auto-approval is an on-chain transaction you cannot take back — and `force_close_channel` in particular costs fees and locks funds up for the channel's timeout.
:::

A few more habits worth forming:

- **Start on regtest or signet.** LDK Server is pre-v0.1 and its persisted data model may still change incompatibly. Learn the workflow where a mistake costs nothing.
- **Keep credentials out of anything committed.** Prefer the default discovery path from Step 3, where the agent config holds only a binary path. If you commit a project-scoped `.mcp.json`, `.codex/config.toml`, or `opencode.json`, make sure it does not carry `LDK_API_KEY`.
- **Keep the node on loopback.** The bridge is a local child process that talks to `127.0.0.1`; it never needs `grpc_service_address` bound to a routable interface.
- **Your node's logs remain the audit trail.** The agent's transcript shows what it intended; the node's log shows what actually happened. Reconcile the two when something surprises you.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `API key not provided. Set LDK_API_KEY or ensure the api_key file exists at ~/.ldk-server/[network]/api_key` | No key file at the resolved data directory for the resolved network. With no config file, the bridge assumes `bitcoin` — so a signet or regtest node's key goes unfound | Pass `--config` pointing at your node's TOML, or set `LDK_API_KEY` to the hex key from Step 2 |
| `TLS cert path not provided. Set LDK_TLS_CERT_PATH or ensure config file exists at ~/.ldk-server/config.toml` | Neither a config file nor the environment variable told the bridge where the certificate is | Set `LDK_TLS_CERT_PATH`, or pass `--config` for a config file with a `[tls] cert_path` entry |
| `Failed to read server certificate file '...'` | The path exists in configuration but is wrong or unreadable | Check it against `tls.crt` in the data directory from Step 2, and check file permissions |
| The client lists the server, but calls fail to reach the node | The daemon is not running, or it listens somewhere other than `127.0.0.1:3536` | Confirm the node is up and compare its `gRPC service listening on` log line with `LDK_BASE_URL` |
| The client reports the server failed to connect or start | The binary path is wrong, relative, or not executable | Use the absolute path to `target/release/ldk-server-mcp` |
| Answers describe a node that isn't yours — no channels, unexpected network | The bridge resolved different configuration than the daemon runs on | Point both at the same TOML: `ldk-server my-config.toml` and `--config /path/to/my-config.toml` |
| An event-driven request never resolves | Streaming is not exposed as a tool | Ask for a poll instead: check `list_payments` or `get_payment_details` again in a moment |

## Further reading

- [LDK Server](https://github.com/lightningdevkit/ldk-server) — the node daemon, CLI, and client library
- [`ldk-server-mcp`](https://github.com/lightningdevkit/ldk-server/tree/main/ldk-server-mcp) — the bridge's own README
- [Getting Started](https://github.com/lightningdevkit/ldk-server/blob/main/docs/getting-started.md) — install, configure, and run a node
- [API Guide](https://github.com/lightningdevkit/ldk-server/blob/main/docs/api-guide.md) — the gRPC surface behind every tool above
- [Model Context Protocol](https://spec.modelcontextprotocol.io/) — the specification the bridge implements
