const { resolve } = require("path");
const themeConfig = require("@spiralbtc/vuepress-devkit-theme/config");

const title = "Lightning Dev Kit Documentation";
const baseUrl = "https://lightningdevkit.org";
const githubUrl = "https://github.com/lightningdevkit";
const discordUrl = "https://discord.gg/5AcknnMfBw";
const themeColor = "#ffffff";

const docsSidebar = [
  {
    title: "Documentation",
    collapsable: false,
    children: [
      {
        title: "Introduction",
        path: "/introduction/",
        collapsable: true,
        children: [
          ["/introduction/use-cases", "Use Cases"],
          ["/introduction/architecture", "Architecture"],
          ["/introduction/peer-management", "Peer Management"],
          ["/introduction/persistent_storage", "Persistent Storage"],
          ["/introduction/blockchain_data", "Blockchain Data"],
          ["/introduction/wallet_management", "Wallet Management"],
          ["/introduction/networking", "Networking"],
          ["/introduction/private_key_management", "Private Key Management"],
          ["/introduction/transactions", "Transactions"],
          [
            "/introduction/random_number_generation",
            "Random Number Generation",
          ],
        ],
      },
      {
        title: "Building a node with LDK",
        collapsable: true,
        children: [
          ["/building-a-node-with-ldk/introduction", "Introduction"],
          ["/building-a-node-with-ldk/installation", "Installation"],
          [
            "/building-a-node-with-ldk/setting-up-a-channel-manager",
            "Setting up a Channel Manager",
          ],
          ["/building-a-node-with-ldk/handling-events", "Handling Events"],
          [
            "/building-a-node-with-ldk/setting-up-a-peer-manager",
            "Setting up a Peer Manager",
          ],
          ["/building-a-node-with-ldk/connect-to-peers", "Connect to Peers"],
          ["/building-a-node-with-ldk/opening-a-channel", "Opening a Channel"],
          ["/building-a-node-with-ldk/sending-payments", "Sending Payments"],
          [
            "/building-a-node-with-ldk/receiving-payments",
            "Receiving Payments",
          ],
          ["/building-a-node-with-ldk/closing-a-channel", "Closing a Channel"],
        ],
      },
      "/running-a-sample-ldk-node",
      {
        title: "Blockchain Data",
        collapsable: true,
        children: [
          ["/blockchain_data/introduction", "Introduction"],
          ["/blockchain_data/chain_activity", "Chain Activity"],
          ["/blockchain_data/block_source", "Block Source"],
          ["/blockchain_data/full_blocks", "Full Blocks"],
          ["/blockchain_data/pre_filtered_blocks", "Pre-filtered Blocks"],
          ["/blockchain_data/confirmed_transactions", "Confirmed Transactions"],
          [
            "/blockchain_data/transaction_broadcasting",
            "Transaction Broadcasting",
          ],
        ],
      },
      "/key_management",
      "/fee_estimation",
      "/probing",
      "/examples",
    ],
  },
  {
    title: "API Reference",
    collapsable: false,
    children: [
      {
        title: "Rust",
        collapsable: true,
        children: [
          ["https://docs.rs/lightning/*/lightning/", "lightning"],
          [
            "https://docs.rs/lightning-background-processor/*/lightning_background_processor/",
            "lightning-background-processor",
          ],
          [
            "https://docs.rs/lightning-block-sync/*/lightning_block_sync/",
            "lightning-block-sync",
          ],
          [
            "https://docs.rs/lightning-invoice/*/lightning_invoice/",
            "lightning-invoice",
          ],
          [
            "https://docs.rs/lightning-net-tokio/*/lightning_net_tokio/",
            "lightning-net-tokio",
          ],
          [
            "https://docs.rs/lightning-persister/*/lightning_persister/",
            "lightning-persister",
          ],
          [
            "https://docs.rs/lightning-rapid-gossip-sync/*/lightning_rapid_gossip_sync/",
            "lightning-rapid-gossip-sync",
          ],
          [
            "https://docs.rs/lightning-transaction-sync/*/lightning_transaction_sync/",
            "lightning-transaction-sync",
          ],
          [
            "https://docs.rs/lightning-custom-message/*/lightning_custom_message/",
            "lightning-custom-message",
          ],
        ],
      },
      [
        "https://github.com/arik-so/SwiftLightning/tree/master/Documentation",
        "Swift",
      ],
    ],
  },
];

const blogSidebar = [
  {
    title: "Blog",
    collapsable: false,
    children: [
      ["/blog/", "Articles"],
      ["/blog/tags/", "Tags"],
      ["/blog/author/", "Authors"],
    ],
  },
];

module.exports = {
  title,
  description:
    "LDK is a flexible lightning implementation with supporting batteries (or modules).",
  theme: resolve(
    __dirname,
    "../../node_modules/@spiralbtc/vuepress-devkit-theme"
  ),
  ...themeConfig({
    baseUrl,
    title,
    themeColor,
    tags: ["Bitcoin", "Lightning", "LDK", "Lightning Dev Kit", "Documentation"],
  }),
  themeConfig: {
    domain: baseUrl,
    logo: "/img/logo.svg",
    displayAllHeaders: false,
    repo: "lightningdevkit/lightningdevkit.org",
    docsDir: "docs",
    docsBranch: "main",
    editLinks: true,
    sidebarDepth: 0,
    algolia: {
      indexName: "lightningdevkit",
      appId: "BH4D9OD16A",
      apiKey: "17ed8a4e16a1cb7d94da4e96f2ff817f",
      // See https://www.algolia.com/doc/api-reference/api-parameters/
      algoliaOptions: {
        typoTolerance: "min",
      },
      // See https://community.algolia.com/docsearch/behavior.html#autocompleteoptions
      autocompleteOptions: {
        openOnFocus: true,
      },
    },
    nav: [
      {
        text: "Docs",
        link: "/introduction/",
      },
      {
        text: "Case Studies",
        link: "/case-studies/",
      },
      {
        text: "Blog",
        link: "/blog/",
      },
      {
        text: "Discord",
        link: discordUrl,
        rel: "noopener noreferrer",
      },
      {
        text: "GitHub",
        link: githubUrl,
        rel: "noopener noreferrer",
      },
    ],
    sidebar: {
      "/_blog/": blogSidebar,
      "/blog/": blogSidebar,
      "/": docsSidebar,
    },
    footer: {
      links: [
        {
          title: "Docs",
          children: [
            {
              text: "Introduction",
              link: "/introduction/",
            },
            {
              text: "Building a node with LDK",
              link: "/building-a-node-with-ldk/introduction",
            },
            {
              text: "Running a sample LDK node",
              link: "/running-a-sample-ldk-node/",
            },
            {
              text: "Architecture",
              link: "/introduction/architecture/",
            },
            {
              text: "Blockchain Data",
              link: "/blockchain_data/introduction/",
            },
            {
              text: "Key Management",
              link: "/key_management/",
            },
            {
              text: "Fee Estimation",
              link: "/fee_estimation/",
            },
            {
              text: "Probing and Path Finding",
              link: "/probing/",
            },
            {
              text: "Examples",
              link: "/examples/",
            },
          ],
        },
        {
          title: "Community",
          children: [
            {
              text: "GitHub",
              link: githubUrl,
              rel: "noopener noreferrer",
            },
            {
              text: "Twitter",
              link: "https://twitter.com/lightningdevkit",
              rel: "noopener noreferrer",
            },
            {
              text: "Chat on Discord",
              link: discordUrl,
              rel: "noopener noreferrer",
            },
            {
              text: "LDK Calendar",
              link: "https://calendar.google.com/calendar/embed?src=c_e6fv6vlshbpoob2mmbvblkkoj4%40group.calendar.google.com",
              rel: "noopener noreferrer",
            },
            {
              text: "LDK Review Club",
              link: "http://ldk.reviews/",
              rel: "noopener noreferrer",
            },
            {
              text: "Code of Conduct",
              link: "/code-of-conduct",
            },
          ],
        },
        {
          title: "Resources",
          children: [
            {
              text: "Case Studies",
              link: "/case-studies/",
            },
            {
              text: "Blog",
              link: "/blog/",
            },
          ],
        },
        {
          title: "Other",
          children: [
            {
              text: "Bitcoin Dev Kit",
              link: "https://bitcoindevkit.org/",
              rel: "noopener noreferrer",
            },
            {
              text: "Reporting a Vulnerability",
              link: "https://github.com/lightningdevkit/rust-lightning/blob/main/SECURITY.md",
              rel: "noopener noreferrer",
            },
          ],
        },
      ],
      copyright: "Copyright © 2024 LDK Developers",
    },
  },
};
