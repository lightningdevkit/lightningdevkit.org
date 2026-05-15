import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'

import './style.css'

import HomeFeatures from './components/HomeFeatures.vue'
import HomePromo from './components/HomePromo.vue'
import HomeCaseStudies from './components/HomeCaseStudies.vue'
import HomeCrossPromo from './components/HomeCrossPromo.vue'
import SiteFooter from './components/SiteFooter.vue'
import BlogPostList from './components/BlogPostList.vue'
import NavLogo from './components/NavLogo.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-title-before': () => h(NavLogo),
      'home-features-after': () => [
        h(HomeFeatures),
        h(HomePromo),
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
  },
} satisfies Theme
