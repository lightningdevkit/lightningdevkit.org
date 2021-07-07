const { resolve } = require('path')
const implicitFigures = require('markdown-it-implicit-figures')
const slugify = require('./slugify')
const preprocessMarkdown = resolve(__dirname, 'preprocessMarkdown')

const title = 'Lightning Dev Kit Documentation'
const baseUrl = 'https://lightningdevkit.org'
const themeColor = '#ffffff'
const pageSuffix = '/'
const info = { name: title }
const extractDescription = text => {
  if (!text) return
  const paragraph = text.match(/^[A-Za-z].*(?:\n[A-Za-z].*)*/m)
  return paragraph ? paragraph.toString().replace(/[\*\_\(\)\[\]]/g, '') : null
}

module.exports = {
  title,
  description: 'LDK is a flexible lightning implementation with supporting batteries (or modules).',
  head: [
    ['link', { rel: 'preload', href: '/fonts/manrope-v4-latin-regular.woff2', as: 'font', crossorigin: true }],
    ['link', { rel: 'preload', href: '/fonts/manrope-v4-latin-600.woff2', as: 'font', crossorigin: true }],
    ['link', { rel: 'preload', href: '/fonts/ibm-plex-mono-v6-latin-regular.woff2', as: 'font', crossorigin: true }],
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
      url: (_, $site, path) => `${baseUrl}${path.replace('.html', pageSuffix)}`
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
    ['sitemap', {
      hostname: baseUrl,
      exclude: ['/404.html']
    }],
    ['tabs'],
    ['@vuepress/medium-zoom']
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
    sidebarDepth: 2,
    nav: [
      {
        text: 'Docs',
        link: '/overview/'
      },
      {
        text: 'Slack',
        link: 'https://join.slack.com/t/lightningdevkit/shared_invite/zt-tte36cb7-r5f41MDn3ObFtDu~N9dCrQ',
        rel: 'noopener noreferrer github'
      },
      {
        text: 'GitHub',
        link: 'https://github.com/lightningdevkit',
        rel: 'noopener noreferrer github'
      }
    ],
    sidebar: [
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
  }
}
