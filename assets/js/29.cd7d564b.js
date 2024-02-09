(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{382:function(t,n,e){"use strict";e.r(n);var s=e(7),a=Object(s.a)({},(function(){var t=this,n=t._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("p",[n("a",{attrs:{href:"https://github.com/lightningdevkit/ldk-node",target:"_blank",rel:"noopener noreferrer"}},[t._v("LDK Node"),n("OutboundLink")],1),t._v(" is a ready-to-go Lightning node library built using "),n("a",{attrs:{href:"https://lightningdevkit.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("LDK"),n("OutboundLink")],1),t._v(" and "),n("a",{attrs:{href:"https://bitcoindevkit.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("BDK"),n("OutboundLink")],1),t._v(". LDK Node provides a straightforward interface and an integrated on-chain wallet, enabling users to quickly and easily set up a self-custodial Lightning node. With LDK Node, developers can get a Lightning Node up and running within a day.")]),t._v(" "),n("h2",{attrs:{id:"a-lightweight-solution"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#a-lightweight-solution"}},[t._v("#")]),t._v(" A Lightweight Solution")]),t._v(" "),n("p",[t._v("LDK fully implements the Lightning protocol as a highly modular Rust library. LDK's flexibility allows developers to integrate Lightning functionality into "),n("a",{attrs:{href:"https://lightningdevkit.org/case-studies/",target:"_blank",rel:"noopener noreferrer"}},[t._v("many types of applications"),n("OutboundLink")],1),t._v(", including those with pre-existing infrastructure or complex architectures. The public API comprises more than 900 exposed methods, letting users adjust and interact with protocol layers in great detail. While this customization is great for builders, it often comes with the added cost of increased complexity.")]),t._v(" "),n("p",[t._v("LDK provides sane defaults where possible. However, correctly and effectively setting up all interconnected modules requires a deeper understanding of protocol fundamentals and some familiarity with the LDK API. Moreover, because LDK adheres to the separation-of-concerns principle, it is wallet-agnostic and deliberately doesn't come with an included on-chain wallet. Therefore, the integration with a suitable on-chain wallet is left to the user.")]),t._v(" "),n("p",[t._v("As a result, it can take a bit of effort to get started with LDK. That's why we created LDK Node, a more fully-baked solution.")]),t._v(" "),n("h2",{attrs:{id:"ldk-node-simplifying-self-custodial-lightning-integration"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#ldk-node-simplifying-self-custodial-lightning-integration"}},[t._v("#")]),t._v(" LDK Node: Simplifying Self-custodial Lightning Integration")]),t._v(" "),n("p",[t._v("LDK Node was designed to hide protocol complexities without infringing on usability. LDK Node's much smaller API surface makes its reduced complexity evident. Compared to LDK's above 900 exposed methods, LDK Node's API currently only encompasses around 30 API calls. While simplicity and minimalism are at its core, LDK Node remains configurable enough to operate a fully functional self-custodial Lightning node in various use cases.")]),t._v(" "),n("p",[t._v("There is a trade-off between simplicity and expressiveness when designing an API while handling protocol complexity. The API needs to become more complicated to increase configurability and the interconnectivity of components. As a result, the user must spend more time examining, learning, and scrutinizing the API before finally being able to use it. While the LDK API errs on the side of expressiveness, LDK Node leans towards simplicity.")]),t._v(" "),n("p",[t._v("This first release of LDK Node comes with an opinionated set of design choices and ready-to-go modules:")]),t._v(" "),n("ul",[n("li",[t._v("The integrated "),n("a",{attrs:{href:"https://bitcoindevkit.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("BDK"),n("OutboundLink")],1),t._v(" wallet handles on-chain data.")]),t._v(" "),n("li",[t._v("Chain data is sourced from an "),n("a",{attrs:{href:"https://github.com/Blockstream/esplora",target:"_blank",rel:"noopener noreferrer"}},[t._v("Esplora"),n("OutboundLink")],1),t._v(" server, while support for Electrum and "),n("code",[t._v("bitcoind")]),t._v(" RPC will follow soon.")]),t._v(" "),n("li",[t._v("Wallet and channel state may be persisted to an "),n("a",{attrs:{href:"https://sqlite.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("SQLite"),n("OutboundLink")],1),t._v(" database, to file system, or to a custom back-end to be implemented by the user. Support for "),n("a",{attrs:{href:"https://github.com/lightningdevkit/vss-server",target:"_blank",rel:"noopener noreferrer"}},[t._v("Versioned Storage Service (VSS)"),n("OutboundLink")],1),t._v(" will follow soon.")]),t._v(" "),n("li",[t._v("Gossip data may be sourced via Lightning's peer-to-peer network or the "),n("a",{attrs:{href:"https://docs.rs/lightning-rapid-gossip-sync/0.0.115/lightning_rapid_gossip_sync/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Rapid Gossip Sync (RGS)"),n("OutboundLink")],1),t._v(" protocol.")]),t._v(" "),n("li",[t._v("Entropy for Lightning and on-chain wallets may be sourced from raw bytes or a "),n("a",{attrs:{href:"https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",target:"_blank",rel:"noopener noreferrer"}},[t._v("BIP39"),n("OutboundLink")],1),t._v(" mnemonic. In addition, LDK Node offers the means to generate and persist the entropy bytes to disk.")])]),t._v(" "),n("h2",{attrs:{id:"mobile-first-self-custody"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#mobile-first-self-custody"}},[t._v("#")]),t._v(" Mobile-first Self-Custody")]),t._v(" "),n("p",[t._v("The main goal of the Lightning protocol is to enable fast, private, and secure Bitcoin transactions for the end-user. However, today most Lightning deployments are custodial services that may only be queried by the client device in the end-user's hands. This is understandable: deploying self-custodial Lightning nodes on end-user devices can take a lot of work to get right, as there are many pitfalls to avoid.")]),t._v(" "),n("p",[t._v("To this end, one of the primary goals of LDK Node is to simplify the integration of self-custodial Lightning nodes in mobile applications. The features of the initial release are centered around mobile deployments. The integration with an Esplora chain data source and a Rapid Gossip Sync server allows the node to operate in mobile environments that may be limited in terms of bandwidth and overall traffic quota.")]),t._v(" "),n("p",[t._v("LDK Node itself is written in "),n("a",{attrs:{href:"https://www.rust-lang.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Rust"),n("OutboundLink")],1),t._v(" and may therefore be natively added as a library dependency to any "),n("code",[t._v("std")]),t._v(" Rust program. However, beyond its Rust API, it offers "),n("a",{attrs:{href:"https://www.swift.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Swift"),n("OutboundLink")],1),t._v(", "),n("a",{attrs:{href:"https://kotlinlang.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Kotlin"),n("OutboundLink")],1),t._v(", and "),n("a",{attrs:{href:"https://www.python.org/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Python"),n("OutboundLink")],1),t._v(" language bindings based on "),n("a",{attrs:{href:"https://github.com/mozilla/uniffi-rs/",target:"_blank",rel:"noopener noreferrer"}},[t._v("UniFFI"),n("OutboundLink")],1),t._v(". Moreover, "),n("a",{attrs:{href:"https://github.com/LtbLightning/ldk-node-flutter",target:"_blank",rel:"noopener noreferrer"}},[t._v("Flutter"),n("OutboundLink")],1),t._v(" bindings are also available to allow usage of the LDK Node library in mobile environments.")]),t._v(" "),n("h2",{attrs:{id:"getting-started"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#getting-started"}},[t._v("#")]),t._v(" Getting Started")]),t._v(" "),n("p",[t._v("The primary abstraction of the library is the "),n("a",{attrs:{href:"https://docs.rs/ldk-node/*/ldk_node/struct.Node.html",target:"_blank",rel:"noopener noreferrer"}},[n("code",[t._v("Node")]),n("OutboundLink")],1),t._v(", which can be retrieved by setting up and configuring a "),n("a",{attrs:{href:"https://docs.rs/ldk-node/*/ldk_node/struct.Builder.html",target:"_blank",rel:"noopener noreferrer"}},[n("code",[t._v("Builder")]),n("OutboundLink")],1),t._v(" to your liking and calling one of the "),n("code",[t._v("build")]),t._v(" methods. "),n("code",[t._v("Node")]),t._v(" can then be controlled via commands such as "),n("code",[t._v("start")]),t._v(", "),n("code",[t._v("stop")]),t._v(", "),n("code",[t._v("connect_open_channel")]),t._v(", "),n("code",[t._v("send_payment")]),t._v(", etc.")]),t._v(" "),n("p",[n("a",{attrs:{href:"https://docs.rs/ldk-node/*/ldk_node/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Read Full API Documentation"),n("OutboundLink")],1)]),t._v(" "),n("div",{staticClass:"language-rust extra-class"},[n("pre",{pre:!0,attrs:{class:"language-rust"}},[n("code",[n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("use")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("ldk_node"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Builder")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("NetAddress")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("use")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("ldk_node"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),t._v("lightning_invoice"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Invoice")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("use")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("ldk_node"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),t._v("bitcoin"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),t._v("secp256k1"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("PublicKey")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("use")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("ldk_node"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),t._v("bitcoin"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Network")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("use")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token namespace"}},[t._v("std"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")])]),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("str")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("FromStr")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("fn")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function-definition function"}},[t._v("main")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("mut")]),t._v(" builder "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Builder")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("new")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tbuilder"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("set_network")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Network")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Testnet")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tbuilder"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("set_esplora_server")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v('"https://blockstream.info/testnet/api"')]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("to_string")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tbuilder"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("set_gossip_source_rgs")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v('"https://rapidsync.lightningdevkit.org/testnet/snapshot"')]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("to_string")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" node "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" builder"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("build")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unwrap")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\tnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("start")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unwrap")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" funding_address "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" node"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("new_onchain_address")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// .. fund address ..")]),t._v("\n\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" node_id "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("PublicKey")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("from_str")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v('"NODE_ID"')]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unwrap")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" node_addr "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("NetAddress")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("from_str")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v('"IP_ADDR:PORT"')]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unwrap")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("connect_open_channel")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("node_id"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" node_addr"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("10000")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("None")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unwrap")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" event "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" node"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("wait_next_event")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t"),n("span",{pre:!0,attrs:{class:"token macro property"}},[t._v("println!")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v('"EVENT: {:?}"')]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" event"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("event_handled")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" invoice "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Invoice")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("::")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("from_str")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v('"INVOICE_STR"')]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unwrap")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("send_payment")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("&")]),t._v("invoice"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unwrap")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\tnode"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("stop")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("unwrap")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),n("h2",{attrs:{id:"outlook"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#outlook"}},[t._v("#")]),t._v(" Outlook")]),t._v(" "),n("p",[t._v("The 0.1 release is only the beginning for LDK Node. Development for the next release has already started, and we'll be looking to add support for sourcing chain data from Electrum or "),n("code",[t._v("bitcoind")]),t._v(" RPC, and supporting persistence to a "),n("a",{attrs:{href:"https://github.com/lightningdevkit/vss-server",target:"_blank",rel:"noopener noreferrer"}},[t._v("VSS"),n("OutboundLink")],1),t._v(" backend (see the "),n("a",{attrs:{href:"https://github.com/lightningdevkit/ldk-node/issues/107",target:"_blank",rel:"noopener noreferrer"}},[t._v("v0.2 tracking issue"),n("OutboundLink")],1),t._v("). Additionally, integration with the "),n("a",{attrs:{href:"https://github.com/BitcoinAndLightningLayerSpecs/lsp",target:"_blank",rel:"noopener noreferrer"}},[t._v("LSP specification"),n("OutboundLink")],1),t._v(" is actively being worked on (see the "),n("a",{attrs:{href:"https://github.com/lightningdevkit/ldk-lsp-client",target:"_blank",rel:"noopener noreferrer"}},[t._v("LSP Client"),n("OutboundLink")],1),t._v(" repository) and will come to LDK Node as soon as it's ready. Beyond these planned feature updates to the LDK Node library, we're also considering further deployment targets, including adding server-grade modules in the future.")]),t._v(" "),n("h2",{attrs:{id:"further-resources"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#further-resources"}},[t._v("#")]),t._v(" Further Resources")]),t._v(" "),n("ul",[n("li",[n("a",{attrs:{href:"https://github.com/lightningdevkit/ldk-node",target:"_blank",rel:"noopener noreferrer"}},[t._v("Github Repository"),n("OutboundLink")],1)]),t._v(" "),n("li",[n("a",{attrs:{href:"https://docs.rs/ldk-node/*/ldk_node/",target:"_blank",rel:"noopener noreferrer"}},[t._v("API Documentation"),n("OutboundLink")],1)]),t._v(" "),n("li",[n("a",{attrs:{href:"https://crates.io/",target:"_blank",rel:"noopener noreferrer"}},[t._v("Rust Crate"),n("OutboundLink")],1)])]),t._v(" "),n("h2",{attrs:{id:"showcases"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#showcases"}},[t._v("#")]),t._v(" Showcases")]),t._v(" "),n("ul",[n("li",[n("a",{attrs:{href:"https://github.com/reez/Monday",target:"_blank",rel:"noopener noreferrer"}},[t._v("Monday Wallet: Example wallet built with on LDK Node Swift bindings"),n("OutboundLink")],1)])])])}),[],!1,null,null,null);n.default=a.exports}}]);