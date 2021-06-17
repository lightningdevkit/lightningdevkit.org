const { resolve } = require('path')
const implicitFigures = require('markdown-it-implicit-figures')
const slugify = require('./slugify')
const preprocessMarkdown = resolve(__dirname, 'preprocessMarkdown')

const title = 'Lightning Dev Kit Documentation'
const baseUrl = 'https://lightningdevkit.org'
const pageSuffix = '/'
const info = { name: title }
const extractDescription = text => {
  if (!text) return
  const paragraph = text.match(/^[A-Za-z].*(?:\n[A-Za-z].*)*/m)
  return paragraph ? paragraph.toString().replace(/[\*\_\(\)\[\]]/g, '') : null
}

module.exports = {
  title,
  description: "LDK is a flexible lightning implementation with supporting batteries (or modules).",
  head: [
    ["link", { rel: "preload", href: "/fonts/manrope-v4-latin-regular.woff2", as="font", crossorigin: true }],
    ["link", { rel: "preload", href: "/fonts/manrope-v4-latin-600.woff2", as="font", crossorigin: true }],,
    ["link", { rel: "preload", href: "/fonts/ibm-plex-mono-v6-latin-regular.woff2", as="font", crossorigin: true }]
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
    logo: "/img/logo/ldk.svg",
    displayAllHeaders: false,
    repo: "lightningdevkit/ldk-doc",
    docsDir: "docs",
    editLinks: true,
    notSatisfiedLinks: true, // our own addition, see theme/components/PageEdit.vue
    sidebarDepth: 0,
    nav: [
      {
        text: "Overview",
        link: "/overview/"
      },
      {
        text: "Getting Started",
        link: "/use_cases/"
      },
      {
        text: "Docs",
        link: "/docs/"
      },
      {
        text: "Slack",
        link: "https://lightningdevkit.slack.com/",
        rel: "noopener noreferrer github"
      },
      {
        text: "GitHub",
        link: "https://github.com/lightningdevkit",
        rel: "noopener noreferrer github"
      }
    ],
    sidebar: [
    ]
  }
}
