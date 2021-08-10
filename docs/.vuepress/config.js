const { resolve } = require('path')
const implicitFigures = require('markdown-it-implicit-figures')
const slugify = require('./slugify')
const preprocessMarkdown = resolve(__dirname, 'preprocessMarkdown')

const title = 'Lightning Dev Kit Documentation'
const baseUrl = 'https://lightningdevkit.org'
const githubUrl = 'https://github.com/lightningdevkit'
const slackUrl = 'https://join.slack.com/t/lightningdevkit/shared_invite/zt-tte36cb7-r5f41MDn3ObFtDu~N9dCrQ'
const themeColor = '#ffffff'
const pageSuffix = '/'
const info = { name: title }
const extractDescription = text => {
  if (!text) return
  const paragraph = text.match(/^[A-Za-z].*(?:\n[A-Za-z].*)*/m)
  return paragraph ? paragraph.toString().replace(/[\*\_\(\)\[\]]/g, '') : null
}
const sitemap = {
  hostname: baseUrl,
  exclude: ['/404.html']
}
const docsSidebar = [
  {
    title: 'Documentation',
    collapsable: false,
    children: [
      '/getting-started',
      {
        title: "Basic Features",
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
  head: [
    ['link', { rel: 'preload', href: '/fonts/manrope-400.woff2', as: 'font', crossorigin: true }],
    ['link', { rel: 'preload', href: '/fonts/manrope-600.woff2', as: 'font', crossorigin: true }],
    ['link', { rel: 'preload', href: '/fonts/ibm-plex-mono-400.woff2', as: 'font', crossorigin: true }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/favicon/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['link', { name: 'msapplication-config', content: '/browserconfig.xml' }],
    ['link', { name: 'msapplication-TileColor', content: themeColor }],
    ['link', { name: 'theme-colorr', content: themeColor }]
  ],
  chainWebpack (config) {
    config.module
      .rule('md')
      .test(/\.md$/)
      .use(preprocessMarkdown)
        .loader(preprocessMarkdown)
        .end()
  },
  plugins: [
    ['seo', {
      siteTitle: (_, $site) => $site.title,
      title: $page => $page.title,
      description: $page => $page.frontmatter.description || extractDescription($page._strippedContent),
      author: (_, $site) => info,
      tags: $page => ($page.frontmatter.tags || ['Bitcoin', 'Lightning Network', 'LDK']),
      twitterCard: _ => 'summary',
      type: $page => 'article',
      url: (_, $site, path) => `${baseUrl}${path.replace('.html', pageSuffix)}`,
      image: ($page, $site) => `${baseUrl}/card.png`
    }],
    ['clean-urls', {
      normalSuffix: pageSuffix,
      indexSuffix: pageSuffix,
      notFoundPath: '/404.html',
    }],
    ['code-copy', {
      color: '#8F979E',
      backgroundTransition: false,
      staticIcon: true
    }],
    ['sitemap', sitemap],
    ['tabs', {
      tabsAttributes: {
        options: { useUrlFragment: false }
      }
    }],
    ['@vuepress/medium-zoom'],
    ['@vuepress/blog', {
      sitemap,
      directories: [
        {
          id: 'blog',
          dirname: '_blog',
          path: '/blog/',
          itemPermalink: '/blog/:slug',
          pagination: {
            lengthPerPage: 10,
            getPaginationPageTitle(pageNumber) {
              return `Page ${pageNumber}`
            }
          }
        },
      ],
      frontmatters: [
        {
          id: 'tags',
          keys: ['tags'],
          path: '/blog/tags/',
          title: '',
          frontmatter: {
            title: 'Tags'
          },
          pagination: {
            getPaginationPageTitle(pageNumber, key) {
              return `${capitalize(key)} - Page ${pageNumber}`
            }
          }
        },
        {
          id: 'author',
          keys: ['author', 'authors'],
          path: '/blog/author/',
          title: '',
          frontmatter: {
            title: 'Authors'
          },
          pagination: {
            getPaginationPageTitle(pageNumber, key) {
              return `${key} - Page ${pageNumber}`
            }
          }
        },
      ],
    }]
  ],
  markdown: {
    extendMarkdown (md) {
      md.use(implicitFigures)
    },
    pageSuffix,
    slugify
  },
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
      {
        text: 'Blog',
        link: '/blog/'
      },
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
              link: '/use_cases/'
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
        {
          title: 'More',
          children: [
            {
              text: 'Blog',
              link: '/blog/'
            }
          ]
        }
      ],
      copyright: 'Copyright © 2021 LDK Developers'
    }
  }
}
