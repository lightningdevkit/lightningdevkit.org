import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'

import './style.css'

import HomeFeatures from './components/HomeFeatures.vue'
import HomeServerPromo from './components/HomeServerPromo.vue'
import HomeCaseStudies from './components/HomeCaseStudies.vue'
import HomeCrossPromo from './components/HomeCrossPromo.vue'
import SiteFooter from './components/SiteFooter.vue'
import BlogPostList from './components/BlogPostList.vue'
import BlogPostHeader from './components/BlogPostHeader.vue'
import CaseStudiesPage from './components/CaseStudiesPage.vue'
import LexeArchitectureDiagram from './components/LexeArchitectureDiagram.vue'
import NavLogo from './components/NavLogo.vue'
import AsyncPaymentsSequenceDiagram from './components/AsyncPaymentsSequenceDiagram.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-title-before': () => h(NavLogo),
      'doc-before': () => h(BlogPostHeader),
      'home-features-after': () => [
        h(HomeFeatures),
        h(HomeServerPromo),
        h(HomeCaseStudies),
        h(HomeCrossPromo),
      ],
      'layout-bottom': () => h(SiteFooter),
    })
  },
  enhanceApp({ app }) {
    // Register globally so blog markdown pages can use <BlogPostList>
    // without per-file script setup imports.
    app.component('BlogPostList', BlogPostList)
    app.component('CaseStudiesPage', CaseStudiesPage)
    app.component('LexeArchitectureDiagram', LexeArchitectureDiagram)
    // Shared between the blog post and the async-payments guide.
    app.component('AsyncPaymentsSequenceDiagram', AsyncPaymentsSequenceDiagram)
  },
} satisfies Theme
