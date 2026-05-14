import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type DefaultTheme } from 'vitepress'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// VuePress 1 still occupies the top-level `node_modules/vue` slot (Vue 2.7.x).
// Force Vite to resolve `vue` and `vue/*` from VitePress's nested Vue 3.
// Remove this alias once VuePress is dropped in Phase 7b.
const vitepressVueDir = path.resolve(
  __dirname,
  '../../node_modules/vitepress/node_modules/vue',
)

const githubUrl = 'https://github.com/lightningdevkit'
const discordUrl = 'https://discord.gg/5AcknnMfBw'

const docsSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Documentation',
    collapsed: false,
    items: [
      {
        text: 'Introduction',
        link: '/introduction/',
        collapsed: true,
        items: [
          { text: 'Use Cases', link: '/introduction/use-cases' },
          { text: 'Architecture', link: '/introduction/architecture' },
          { text: 'Peer Management', link: '/introduction/peer-management' },
          { text: 'Persistent Storage', link: '/introduction/persistent_storage' },
          { text: 'Blockchain Data', link: '/introduction/blockchain_data' },
          { text: 'Wallet Management', link: '/introduction/wallet_management' },
          { text: 'Networking', link: '/introduction/networking' },
          { text: 'Private Key Management', link: '/introduction/private_key_management' },
          { text: 'Transactions', link: '/introduction/transactions' },
          { text: 'Random Number Generation', link: '/introduction/random_number_generation' },
        ],
      },
      {
        text: 'Building a node with LDK',
        collapsed: true,
        items: [
          { text: 'Introduction', link: '/building-a-node-with-ldk/introduction' },
          { text: 'Installation', link: '/building-a-node-with-ldk/installation' },
          { text: 'Setting up a Channel Manager', link: '/building-a-node-with-ldk/setting-up-a-channel-manager' },
          { text: 'Handling Events', link: '/building-a-node-with-ldk/handling-events' },
          { text: 'Setting up a Peer Manager', link: '/building-a-node-with-ldk/setting-up-a-peer-manager' },
          { text: 'Connect to Peers', link: '/building-a-node-with-ldk/connect-to-peers' },
          { text: 'Opening a Channel', link: '/building-a-node-with-ldk/opening-a-channel' },
          { text: 'Sending Payments', link: '/building-a-node-with-ldk/sending-payments' },
          { text: 'Receiving Payments', link: '/building-a-node-with-ldk/receiving-payments' },
          { text: 'Closing a Channel', link: '/building-a-node-with-ldk/closing-a-channel' },
        ],
      },
      { text: 'Running a sample LDK node', link: '/running-a-sample-ldk-node' },
      {
        text: 'Blockchain Data',
        collapsed: true,
        items: [
          { text: 'Introduction', link: '/blockchain_data/introduction' },
          { text: 'Chain Activity', link: '/blockchain_data/chain_activity' },
          { text: 'Block Source', link: '/blockchain_data/block_source' },
          { text: 'Full Blocks', link: '/blockchain_data/full_blocks' },
          { text: 'Pre-filtered Blocks', link: '/blockchain_data/pre_filtered_blocks' },
          { text: 'Confirmed Transactions', link: '/blockchain_data/confirmed_transactions' },
          { text: 'Transaction Broadcasting', link: '/blockchain_data/transaction_broadcasting' },
        ],
      },
      { text: 'Key Management', link: '/key_management' },
      { text: 'Fee Estimation', link: '/fee_estimation' },
      { text: 'Probing and Path Finding', link: '/probing' },
      { text: 'Examples', link: '/examples' },
    ],
  },
  {
    text: 'API Reference',
    collapsed: false,
    items: [
      {
        text: 'Rust',
        collapsed: true,
        items: [
          { text: 'lightning', link: 'https://docs.rs/lightning/*/lightning/' },
          { text: 'lightning-background-processor', link: 'https://docs.rs/lightning-background-processor/*/lightning_background_processor/' },
          { text: 'lightning-block-sync', link: 'https://docs.rs/lightning-block-sync/*/lightning_block_sync/' },
          { text: 'lightning-invoice', link: 'https://docs.rs/lightning-invoice/*/lightning_invoice/' },
          { text: 'lightning-net-tokio', link: 'https://docs.rs/lightning-net-tokio/*/lightning_net_tokio/' },
          { text: 'lightning-persister', link: 'https://docs.rs/lightning-persister/*/lightning_persister/' },
          { text: 'lightning-rapid-gossip-sync', link: 'https://docs.rs/lightning-rapid-gossip-sync/*/lightning_rapid_gossip_sync/' },
          { text: 'lightning-transaction-sync', link: 'https://docs.rs/lightning-transaction-sync/*/lightning_transaction_sync/' },
          { text: 'lightning-custom-message', link: 'https://docs.rs/lightning-custom-message/*/lightning_custom_message/' },
        ],
      },
      { text: 'Swift', link: 'https://github.com/arik-so/SwiftLightning/tree/master/Documentation' },
    ],
  },
]

export default defineConfig({
  title: 'Lightning Dev Kit Documentation',
  description: 'LDK is a flexible lightning implementation with supporting batteries (or modules).',

  cleanUrls: true,
  lastUpdated: true,

  srcExclude: [
    'brainstorms/**',
    'plans/**',
    'todos/**',
    'README.md',
  ],

  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/img/favicon/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['link', { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/fonts/ibm-plex-mono-400.woff2' }],
    ['meta', { name: 'msapplication-config', content: '/browserconfig.xml' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://lightningdevkit.org/' }],
    ['meta', { property: 'og:image', content: 'https://lightningdevkit.org/card.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: 'https://lightningdevkit.org/card.png' }],
  ],

  markdown: {
    lineNumbers: false,
  },

  themeConfig: {
    logo: '/img/logo.svg',

    editLink: {
      pattern: 'https://github.com/lightningdevkit/lightningdevkit.org/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    nav: [
      { text: 'Docs', link: '/introduction/' },
      { text: 'Case Studies', link: '/case-studies' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Discord', link: discordUrl },
      { text: 'GitHub', link: githubUrl },
    ],

    sidebar: {
      '/': docsSidebar,
    },

    socialLinks: [
      { icon: 'github', link: githubUrl },
      { icon: 'twitter', link: 'https://twitter.com/lightningdevkit' },
      { icon: 'discord', link: discordUrl },
    ],

    footer: {
      copyright: `Copyright © ${new Date().getUTCFullYear()} LDK Developers`,
    },
  },

  vite: {
    resolve: {
      alias: [
        { find: /^vue$/, replacement: path.join(vitepressVueDir, 'index.mjs') },
        { find: /^vue\/(.*)$/, replacement: path.join(vitepressVueDir, '$1') },
      ],
    },
  },
})
