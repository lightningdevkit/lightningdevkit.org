# Running a sample LDK node
Let's run our first LDK node. We'll ensure we have a compatible Rust toolchain installed, setup Polar to create a local lightning network and then start running the node.

::: tip Not recommended for production use!
This guide is a quick start to get you up and running with an LDK node. It serves as a playground and a foundation to build upon and is NOT recommended for production environments. LDK doesn't come with a pre-packaged node but gives you the tools to build a node from scratch!  
:::

## Installing Rust
If you already have a working installation of the latest Rust compiler, feel free to skip to the next section.

To install the latest version of Rust, we recommend using `rustup`. Install `rustup` by following the instructions on [its website](https://rustup.rs/). Once rustup is installed, ensure the latest toolchain is installed by running the command:
```
rustup default stable
```

## Setup Polar
Next, let's setup Polar, which was built to help Lightning Network application developers quickly spin up one or more networks locally on their computers in regtest mode.

Polar can be [downloaded](https://lightningpolar.com/) for MacOS, Linux, and Windows. The source code is hosted [on Github](https://github.com/jamaljsr/polar/releases/)

Mac and Windows users will need to install [Docker Desktop](https://www.docker.com/products/docker-desktop) as a dependency before using Polar. Linux users will need to download both [Docker Server](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).

After downloading, installing, and running Polar, spin up a new cluster of LND, c-lightning, eclair, and bitcoind nodes. This will create a Docker container within which Polar will operate.

Click the orange **Create Network** button and Polar should display a new interface.

Press the orange Start button in the top right corner to start your local network. It takes a couple seconds for the nodes to boot up, but the indicator lights will eventually turn green signaling that the process has completed.


## Running the LDK Sample Node
Start by cloning the LDK sample node from Github and changing into the new directory
```
git clone https://github.com/lightningdevkit/ldk-sample
cd ldk-sample
```
Now, run the following command:
```
cargo run polaruser:polarpass@127.0.0.1:18443 ./ 9732 regtest hellolightning 0.0.0.0
```

If you have a different setup that doesn't involve Polar you can modify this command so that it contains different credentials. 
```
cargo run <bitcoind-rpc-username>:<bitcoind-rpc-password>@<bitcoind-rpc-host>:<bitcoind-rpc-port> <ldk_storage_directory_path> [<ldk-peer-listening-port>] [bitcoin-network] [announced-listen-addr announced-node-name]
```
`bitcoind`'s RPC username and password likely can be found through `cat ~/.bitcoin/.cookie`.

`bitcoin-network`: defaults to `testnet`. Options: `testnet`, `regtest`, and `signet`.

`ldk-peer-listening-port`: defaults to 9735.

`announced-node-name` and `announced-listen-addr` : default to nothing, disabling any public announcements of this node.

`announced-node-name`: can be any string up to 32 bytes in length, representing this node's alias.
`announced-listen-addr`: can be set to an IPv4 or IPv6 address to announce that as a publicly-connectable address for this node.

Your LDK node should now be in action!

```
LDK startup successful. To view available commands: "help".
LDK logs are available at <your-supplied-ldk-data-dir-path>/.ldk/logs
Local Node ID is 02e8788eb41ac1731352d87ced719afce91a1201cf0d6cca12ee79502db1b0e317.
```

To check out the complete reference for constructing a Lightning node with LDK check out the [Github repo](https://github.com/lightningdevkit/ldk-sample)
