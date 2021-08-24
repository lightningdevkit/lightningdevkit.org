<template>
  <header class="navbar">
    <div class="wrap">
      <div class="wrap-border">
        <RouterLink
          :to="$localePath"
          class="home-link"
        >
          <svg
            v-if="$site.themeConfig.logo"
            role="img"
            class="logo"
            :alt="$siteTitle"
          >
            <use :href="`${$withBase($site.themeConfig.logo)}#small`" class="small" />
            <use :href="`${$withBase($site.themeConfig.logo)}#large`" class="large" />
          </svg>
        </RouterLink>

        <div
          class="links"
          :style="linksWrapMaxWidth ? {
            'max-width': linksWrapMaxWidth + 'px'
          } : {}"
        >
          <NavLinks class="can-hide" />
          <AlgoliaSearchBox
            v-if="isAlgoliaSearch"
            :options="algolia"
          />
          <SearchBox v-else-if="$site.themeConfig.search !== false && $page.frontmatter.search !== false" />

          <button type="button" class="theme-switch" @click="toggleColorMode($event)">
            <svg viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g class="theme-switch-dark">
                <path d="M15 20.4219C12.5187 20.4219 10.5 18.4032 10.5 15.9219C10.5 13.4406 12.5187 11.4219 15 11.4219C17.4813 11.4219 19.5 13.4406 19.5 15.9219C19.5 18.4032 17.4813 20.4219 15 20.4219Z" fill="currentColor"/>
                <path d="M19.4541 20.3769L21.3644 22.2862M15 24.9219V22.2219V24.9219ZM15 9.62187V6.92188V9.62187ZM6 15.9219H8.7H6ZM21.3 15.9219H24H21.3ZM8.6361 22.2862L10.5454 20.3769L8.6361 22.2862ZM19.4541 11.4678L21.3644 9.55797L19.4541 11.4678ZM8.6361 9.55797L10.5454 11.4678L8.6361 9.55797Z" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
              </g>
              <g class="theme-switch-light" fill="currentColor">
                <path d="M10.1539 8.75585C10.018 8.75585 9.88774 8.70189 9.79168 8.60583C9.69563 8.50977 9.64166 8.37949 9.64166 8.24365V6.19482C9.64166 6.05898 9.69563 5.9287 9.79168 5.83264C9.88774 5.73658 10.018 5.68262 10.1539 5.68262C10.2897 5.68262 10.42 5.73658 10.5161 5.83264C10.6121 5.9287 10.6661 6.05898 10.6661 6.19482V8.24365C10.6661 8.37949 10.6121 8.50977 10.5161 8.60583C10.42 8.70189 10.2897 8.75585 10.1539 8.75585Z"/>
                <path d="M11.1783 7.73144H9.12945C8.9936 7.73144 8.86332 7.67748 8.76726 7.58142C8.6712 7.48536 8.61724 7.35508 8.61724 7.21924C8.61724 7.08339 8.6712 6.95311 8.76726 6.85705C8.86332 6.761 8.9936 6.70703 9.12945 6.70703H11.1783C11.3141 6.70703 11.4444 6.761 11.5405 6.85705C11.6365 6.95311 11.6905 7.08339 11.6905 7.21924C11.6905 7.35508 11.6365 7.48536 11.5405 7.58142C11.4444 7.67748 11.3141 7.73144 11.1783 7.73144ZM6.05621 13.8779C5.92037 13.8779 5.79009 13.8239 5.69403 13.7279C5.59797 13.6318 5.54401 13.5015 5.54401 13.3657V12.3413C5.54401 12.2054 5.59797 12.0752 5.69403 11.9791C5.79009 11.8831 5.92037 11.8291 6.05621 11.8291C6.19206 11.8291 6.32234 11.8831 6.4184 11.9791C6.51445 12.0752 6.56842 12.2054 6.56842 12.3413V13.3657C6.56842 13.5015 6.51445 13.6318 6.4184 13.7279C6.32234 13.8239 6.19206 13.8779 6.05621 13.8779Z"/>
                <path d="M6.56842 13.366H5.544C5.40816 13.366 5.27788 13.312 5.18182 13.216C5.08576 13.1199 5.0318 12.9896 5.0318 12.8538C5.0318 12.7179 5.08576 12.5877 5.18182 12.4916C5.27788 12.3955 5.40816 12.3416 5.544 12.3416H6.56842C6.70426 12.3416 6.83454 12.3955 6.9306 12.4916C7.02666 12.5877 7.08062 12.7179 7.08062 12.8538C7.08062 12.9896 7.02666 13.1199 6.9306 13.216C6.83454 13.312 6.70426 13.366 6.56842 13.366ZM16.8125 23.6101C12.8583 23.6101 9.64165 20.3934 9.64165 16.4392C9.64165 12.8983 12.2851 9.85021 15.7907 9.34876L16.4658 9.25195L16.37 9.92755C16.326 10.218 16.3027 10.5112 16.3003 10.805C16.3003 14.1942 19.0575 16.9514 22.4468 16.9514C22.708 16.9514 22.9872 16.9294 23.3247 16.8813L23.9998 16.7855L23.9035 17.4606C23.401 20.9666 20.3524 23.6101 16.8125 23.6101Z"/>
              </g>
            </svg>
          </button>
        </div>
        <SidebarButton @toggle-sidebar="$emit('toggle-sidebar')" />
      </div>
    </div>
  </header>
</template>

<script>
import AlgoliaSearchBox from '@AlgoliaSearchBox'
import SearchBox from '@SearchBox'
import SidebarButton from '@theme/components/SidebarButton.vue'
import NavLinks from '@theme/components/NavLinks.vue'
import { COLOR_MODES, THEME_ATTR, setColorMode } from '../../themeSwitch'

export default {
  name: 'Navbar',

  components: {
    SidebarButton,
    NavLinks,
    SearchBox,
    AlgoliaSearchBox
  },

  data () {
    return {
      linksWrapMaxWidth: null
    }
  },

  computed: {
    algolia () {
      return this.$themeLocaleConfig.algolia || this.$site.themeConfig.algolia || {}
    },

    isAlgoliaSearch () {
      return this.algolia && this.algolia.apiKey && this.algolia.indexName
    }
  },

  mounted () {
    const MOBILE_DESKTOP_BREAKPOINT = 719 // refer to config.styl
    const NAVBAR_VERTICAL_PADDING = parseInt(css(this.$el, 'paddingLeft')) + parseInt(css(this.$el, 'paddingRight'))
    const handleLinksWrapWidth = () => {
      if (document.documentElement.clientWidth < MOBILE_DESKTOP_BREAKPOINT) {
        this.linksWrapMaxWidth = null
      } else {
        this.linksWrapMaxWidth = this.$el.offsetWidth - NAVBAR_VERTICAL_PADDING
          - (this.$refs.siteName && this.$refs.siteName.offsetWidth || 0)
      }
    }
    handleLinksWrapWidth()
    window.addEventListener('resize', handleLinksWrapWidth, false)
  },

  methods: {
    toggleColorMode (e) {
      e.preventDefault()
      const current = document.documentElement.getAttribute(THEME_ATTR) || COLOR_MODES[0]
      const mode = current === COLOR_MODES[0] ? COLOR_MODES[1] : COLOR_MODES[0]
      setColorMode(mode)
    }
  }
}

function css (el, property) {
  // NOTE: Known bug, will return 'auto' if style value is 'auto'
  const win = el.ownerDocument.defaultView
  // null means not to return pseudo styles
  return win.getComputedStyle(el, null)[property]
}
</script>

<style lang="stylus">
$navbar-vertical-padding = 0.7rem
$navbar-horizontal-padding = 1.5rem

.navbar
  height auto
  color var(--docs-header-text)
  background-color var(--docs-header-bg)
  border-bottom var(--docs-border-dashed)
  .wrap-border
    display flex
    align-items center
    padding-top $navbar-vertical-padding
    padding-bottom $navbar-vertical-padding
    @media (max-width: $MQMobile)
      padding-left 0 !important
      padding-right 0 !important
      border-left 0 !important
      border-right 0 !important
  a, span, img
    display inline-block
  a,
  .theme-switch,
  .sidebar-button
    color var(--docs-header-link)
    text-decoration none
    &:focus,
    &:hover
      color var(--docs-header-link-accent)
  .theme-switch,
  .sidebar-button
    margin-left var(--docs-space-s)
    flex-shrink 0
  .logo
    height 35px
    margin-right 0.8rem
    vertical-align top
    min-width unset

  .links
    margin-left auto
    box-sizing border-box
    white-space nowrap
    display flex
    align-items center
    .search-box
      flex 0 0 auto
      vertical-align top
      margin 0 0 0 var(--docs-space-m)
      input
        color var(--docs-header-text);
        background-color var(--docs-header-bg);
        border-color var(--docs-header-link);
        left 0
      .search-query.ds-hint
        display none !important
  @media (min-width: $MQMobile + 1)
    .logo
      width 125px
      .small
        display none

  @media (max-width: $MQMobile)
    .logo
      width 86px
      .large
        display none
    .can-hide
      display none

.theme-switch
  --docs-theme-switch-icon-size 2rem
  display inline-flex
  align-items center
  justify-content center
  background none
  cursor pointer
  height 40px
  width 40px
  border 0
  padding 0

.theme-switch svg
  height var(--docs-theme-switch-icon-size)
  width var(--docs-theme-switch-icon-size)

.theme-switch-dark
  display inline-block

.theme-switch-light
  display none

:root[data-theme="dark"]
  .theme-switch-dark
    display none
  .theme-switch-light
    display inline-block
  #app .navbar .search-box input
    background-color var(--docs-neutral-900) !important

@media (prefers-color-scheme: dark)
  :root:not([data-theme="light"]) .theme-switch-light,
  :root:not([data-theme="dark"]) .theme-switch-dark
    display inline-block
  :root:not([data-theme="dark"]) #app .navbar .search-box input
    background-color var(--docs-body-bg) !important
</style>
