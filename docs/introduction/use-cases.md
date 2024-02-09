# Use Cases for LDK

The standard Lightning use case is running a standalone node on one's laptop.
Here's some other use cases that LDK supports.

## Mobile Devices

Mobile devices with Lightning have unique requirements often not well served by
today's Lightning ecosystem. Not only do they need to operate with minimal
footprint, they also have intermittent data access and cannot shutdown safely.
More importantly, many existing wallets already have business logic to handle
blockchain data, keys, and storage, and do not wish to duplicate much of that
logic to integrate Lightning (at worst fetching the blockchain twice). LDK
offers a flexible API to allow users to integrate Lightning with their own keys,
blockchain data, and storage. To allow full flexibility in footprint, the API
supports routing data being fetched via the Lightning P2P protocol, an external
service, or routes can be calculated off-device. It also provides cross-platform
compatibility for free, allowing synchronization of Lightning state across
devices and, as long as there is protection from simultaneous updates, users to
access their wallet on any device. See the [architecure](../architecture) page for more
details on the interfaces LDK provides for integration.

## HSMs (Hardware Security Modules)

LDK Supports various HSM configurations. In conjunction with the [Validating Lightning Signer](https://vls.tech/)project, an external HSM can be
used to verify most protocol details about states before signing, ensuring host
compromise cannot steal funds by broadcasting revoked states. For nodes seeking
a higher level of assurance, the entire LDK channel state machine can
be run on an offline device, communicating with the outside world via a proxy
host which maintains TCP connections with peers. Such a configuration ensures
all details of the Lightning protocol are enforced without consideration of host
compromise.

## Production Lightning Nodes

Many large Bitcoin transactors have large amounts of custom-built infrastructure
for interacting with the Bitcoin blockchain. Such tight integration with
business logic may be difficult with existing Lightning implementations focusing
on standalone operation. For such transactors, LDK offers the possibility of
integrating a library in their native runtime, storing and handling Lightning
data and events in the same way they do blockchain events.
