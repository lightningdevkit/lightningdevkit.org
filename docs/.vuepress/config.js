const { resolve } = require('path')
const implicitFigures = require('markdown-it-implicit-figures')
const slugify = require('./slugify')
const preprocessMarkdown = resolve(__dirname, 'preprocessMarkdown')

const title = 'Lightning Dev Kit Documentation'
const baseUrl = 'https://lightningdevkit.org'
const githubUrl = 'https://github.com/lightningdevkit'
const slackUrl = 'https://join.slack.com/t/lightningdevkit/shared_invite/zt-sp65y241-yAjk1~nghitJ~J3YS8cWsQ'
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
    title: 'Lightning Development Kit',
    collapsable: false,
    children: [
      '/overview',
      '/use_cases'
    ]
  },
  {
    title: 'Guides',
    collapsable: false,
    children: [
      '/build_node',
      '/build_node_rust',
      '/using_ldk',
      '/key_mgmt',
      '/blockdata'
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
    ['tabs'],
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
        link: '/overview/'
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
      '/': docsSidebar
    },
    footer: {
      links: [
        {
          title: 'Docs',
          children: [
            {
              text: 'Overview',
              link: '/overview/'
            },
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
