import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'

import './style.css'

import HomeFeatures from './components/HomeFeatures.vue'
import HomePromo from './components/HomePromo.vue'
import HomeCaseStudies from './components/HomeCaseStudies.vue'
import HomeCrossPromo from './components/HomeCrossPromo.vue'
import SiteFooter from './components/SiteFooter.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-features-after': () => [
        h(HomeFeatures),
        h(HomePromo),
        h(HomeCaseStudies),
        h(HomeCrossPromo),
      ],
      'layout-bottom': () => h(SiteFooter),
    })
  },
} satisfies Theme
