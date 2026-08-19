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
