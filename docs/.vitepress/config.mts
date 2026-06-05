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

const blogSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Blog',
    collapsed: false,
    items: [
      { text: 'Articles', link: '/blog/' },
      { text: 'Tags', link: '/blog/tags/' },
      { text: 'Authors', link: '/blog/author/' },
    ],
  },
]

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
        text: 'Advanced Guides',
        collapsed: true,
        items: [
          { text: 'Blockchain Data', link: '/blockchain_data/' },
          { text: 'Key Management', link: '/key_management' },
          { text: 'Fee Estimation', link: '/fee_estimation' },
          { text: 'Probing and Path Finding', link: '/probing' },
        ],
      },
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
    // Code blocks use a dark navy background in BOTH light and dark mode
    // (--vp-code-block-bg is dark in :root and .dark alike), so both Shiki
    // themes must be dark-on-navy. github-light/github-dark have muted tokens
    // that disappear on the navy; one-dark-pro stays high-contrast and legible.
    theme: {
      light: 'one-dark-pro',
      dark: 'one-dark-pro',
    },
  },

  themeConfig: {
    // Hide the right-hand "On this page" outline on docs pages —
    // not part of the LDK design. Can still be enabled per-page via
    // frontmatter `outline: 'deep'` if a long page benefits from it.
    outline: false,

    // Remove the "Previous/Next page" pager at the bottom of docs pages.
    docFooter: {
      prev: false,
      next: false,
    },

    // Logo and wordmark are rendered together via `NavLogo.vue` in the
    // `nav-bar-title-before` slot, which uses the original sprite at
    // `/img/logo.svg` (with `#small` / `#large` symbols, each a
    // composed bolt + wordmark). No `themeConfig.logo` needed; setting
    // siteTitle to false hides the default plain-text title.
    siteTitle: false,

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
      '/blog/': blogSidebar,
      '/': docsSidebar,
    },

    // Search: VitePress's built-in local search (MiniSearch-powered)
    // ships immediately and runs entirely client-side. Plan is to swap
    // to DocSearch v3 once Algolia approves the application — the
    // legacy v2 index (appId `BH4D9OD16A`, indexName `lightningdevkit`)
    // is deprecated and not compatible with VitePress's search config
    // shape. Apply at https://docsearch.algolia.com/apply (free for
    // OSS docs sites; 1–2 week approval typical).
    //
    // To swap to v3 once credentials arrive, replace the block below
    // with:
    //
    //   search: {
    //     provider: 'algolia',
    //     options: {
    //       appId: '<new v3 appId>',
    //       apiKey: '<new public search-only key>',
    //       indexName: 'lightningdevkit',
    //     },
    //   },
    search: {
      provider: 'local',
    },
    // No `footer` here: VitePress's default VPFooter would render its own
    // copyright above our custom SiteFooter (layout-bottom slot). The
    // SiteFooter carries the single copyright line.
  },

  vite: {
    resolve: {
      // Alias bare `vue` and subpaths to VitePress's nested Vue 3.
      // Point at the PACKAGE DIRECTORY (not a specific file) so esbuild's
      // prebundler can package-resolve via vue's own package.json
      // exports map — pointing at index.mjs directly let the prebundler
      // cache Vue 2 from top-level node_modules.
      alias: [
        { find: /^vue$/, replacement: vitepressVueDir },
        { find: /^vue\/(.*)$/, replacement: path.join(vitepressVueDir, '$1') },
      ],
      dedupe: ['vue'],
    },
  },
})
