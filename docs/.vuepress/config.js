const { resolve } = require('path')
const themeConfig = require('squarecrypto-vuepress-devkit-theme/config')

const title = 'Lightning Dev Kit Documentation'
const baseUrl = 'https://lightningdevkit.org'
const githubUrl = 'https://github.com/lightningdevkit'
const slackUrl = 'https://join.slack.com/t/lightningdevkit/shared_invite/zt-tte36cb7-r5f41MDn3ObFtDu~N9dCrQ'
const themeColor = '#ffffff'

const docsSidebar = [
  {
    title: 'Documentation',
    collapsable: false,
    children: [
      {
        title: 'Introduction',
        path: '/introduction/',
        collapsable: true,
        children: [
          ['/introduction/use_cases', 'Use Cases'],
        ]
      },
      '/running-a-sample-ldk-node',
      {
        title: 'Overview',
        collapsable: true,
        children: [
          ['/overview/architecture', 'LDK Architecture'],
          ['/overview/persistent_storage', 'Persistent Storage'],
          ['/overview/blockchain_data', 'Blockchain Data'],
          ['/overview/wallet_management', 'Wallet Management'],
          ['/overview/networking', 'Networking'],
          ['/overview/private_key_management', 'Private Key Management'],
          ['/overview/transactions', 'Transactions'],
          ['/overview/random_number_generation', 'Random Number Generation'],
        ]
      },
      {
        title: 'Payments',
        path: '/payments/',
        collapsable: true,
        children: [
          ['/payments/connecting_peers', 'Connecting Peers'],
          ['/payments/managing_channels', 'Managing Channels'],
          ['/payments/sending_payments', 'Sending Payments'],
          ['/payments/receiving_payments', 'Receiving Payments'],
        ]
      },
      {
        title: 'Blockchain Data',
        collapsable: true,
        children: [
          ['/blockchain_data/introduction', 'Introduction'],
          ['/blockchain_data/chain_activity', 'Chain Activity'],
          ['/blockchain_data/block_source', 'Block Source'],
          ['/blockchain_data/full_blocks', 'Full Blocks'],
          ['/blockchain_data/pre_filtered_blocks', 'Pre-filtered Blocks'],
          ['/blockchain_data/confirmed_transactions', 'Confirmed Transactions'],
          ['/blockchain_data/transaction_broadcasting', 'Transaction Broadcasting'],
        ]
      },
      '/key_management',
      '/examples',
    ]
  },
  {
    title: 'API Reference',
    collapsable: false,
    children: [
      ['https://docs.rs/lightning/*/lightning/', 'Rust'],
      ['https://github.com/arik-so/SwiftLightning/tree/master/Documentation', 'Swift']
    ],
  }
]

const tutorialSidebar = [
  {
    title: 'Tutorials',
    collapsable: false,
    children: [
      '/tutorials/build_a_node_in_java',
      '/tutorials/build_a_node_in_rust'
    ],
  }
]

const blogSidebar = [
  {
    title: 'Blog',
    collapsable: false,
    children: [
      ['/blog/', 'Articles'],
      ['/blog/tags/', 'Tags'],
      ['/blog/author/', 'Authors']
    ]
  }
]

module.exports = {
  title,
  description: 'LDK is a flexible lightning implementation with supporting batteries (or modules).',
  theme: resolve(__dirname, '../../node_modules/squarecrypto-vuepress-devkit-theme'),
  ...themeConfig({
    baseUrl,
    title,
    themeColor,
    tags: ['Bitcoin', 'Lightning', 'LDK', 'Lightning Dev Kit', 'Documentation']
  }),
  themeConfig: {
    domain: baseUrl,
    logo: '/img/logo.svg',
    displayAllHeaders: false,
    repo: 'lightningdevkit/lightningdevkit.org',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    sidebarDepth: 0,
    algolia: {
      indexName: 'lightningdevkit',
      appId: 'BH4D9OD16A',
      apiKey: '17ed8a4e16a1cb7d94da4e96f2ff817f',
      // See https://www.algolia.com/doc/api-reference/api-parameters/
      algoliaOptions: {
        typoTolerance: 'min'
      },
      // See https://community.algolia.com/docsearch/behavior.html#autocompleteoptions
      autocompleteOptions: {
        openOnFocus: true
      }
    },
    nav: [
      {
        text: 'Docs',
        link: '/introduction/'
      },
      {
        text: 'Tutorials',
        link: '/tutorials/build_a_node_in_java'
      },
      // {
      //   text: 'Blog',
      //   link: '/blog/'
      // },
      {
        text: 'Slack',
        link: slackUrl,
        rel: 'noopener noreferrer'
      },
      {
        text: 'GitHub',
        link: githubUrl,
        rel: 'noopener noreferrer'
      }
    ],
    sidebar: {
      '/_blog/': blogSidebar,
      '/blog/': blogSidebar,
      '/tutorials/': tutorialSidebar,
      '/': docsSidebar,
    },
    footer: {
      links: [
        {
          title: 'Docs',
          children: [
            {
              text: 'Payments',
              link: '/payments/'
            }
          ]
        },
        {
          title: 'Community',
          children: [
            {
              text: 'Slack',
              link: slackUrl,
              rel: 'noopener noreferrer'
            },
            {
              text: 'GitHub',
              link: githubUrl,
              rel: 'noopener noreferrer'
            }
          ]
        },
        // {
        //   title: 'More',
        //   children: [
        //     {
        //       text: 'Blog',
        //       link: '/blog/'
        //     }
        //   ]
        // }
      ],
      copyright: 'Copyright © 2021 LDK Developers'
    }
  }
}
