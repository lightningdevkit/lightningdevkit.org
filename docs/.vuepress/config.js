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
      '/getting-started',
      {
        title: 'Basic Features',
        collapsable: true,
        children: [
          ['/basic-features/key_management', 'Key management'],
          ['/basic-features/blockchain_data', 'Blockchain data'],
          ['/basic-features/connecting_peers', 'Connecting peers'],
          ['/basic-features/managing_channels', 'Managing channels'],
          ['/basic-features/sending_payments', 'Sending payments'],
          ['/basic-features/receiving_payments', 'Receiving Payments']
        ]
      },
      '/examples',
      '/batteries',
      '/architecture',
      '/use_cases',
    ]
  },
  {
    title: 'API Reference',
    collapsable: false,
    children: [
      ['https://docs.rs/lightning/0.0.99/lightning/', 'Rust'],
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
    editLinks: true,
    sidebarDepth: 0,
    nav: [
      {
        text: 'Docs',
        link: '/getting-started/'
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
              text: 'Getting Started',
              link: '/getting-started/'
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
