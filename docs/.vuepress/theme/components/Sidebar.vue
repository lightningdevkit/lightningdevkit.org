<template>
  <aside class="sidebar">
    <NavLinks />

    <slot name="top" />

    <SidebarLinks
      :depth="0"
      :items="items"
    />
    <slot name="bottom" />
  </aside>
</template>

<script>
import SidebarLinks from '@theme/components/SidebarLinks.vue'
import NavLinks from '@theme/components/NavLinks.vue'

export default {
  name: 'Sidebar',

  components: { SidebarLinks, NavLinks },

  props: ['items']
}
</script>

<style lang="stylus">
.sidebar
  --border-left-width .25rem
  color var(--docs-nav-link)
  background var(--docs-body-bg)
  border-right var(--docs-border-dashed)
  ul
    padding 0
    margin 0
    list-style-type none
  a
    display inline-block
  .nav-links
    display none
    padding var(--docs-space-m) 0
    border-bottom var(--docs-border-dashed)
    .repo-link
      dispay none
    .nav-item
      display block
      line-height 1.25rem
      font-size 1.1em
      padding 0.5rem 0 0.5rem 1.5rem
  & > .sidebar-links
    padding var(--docs-space-l) 0
    & > li > a.sidebar-link
      font-size 1.1em
      line-height 1.7
      font-weight var(--docs-font-weight-semibold)
    & > li:not(:first-child)
      margin-top .75rem

@media (max-width: $MQMobile)
  .sidebar
    .nav-links
      display block
      .dropdown-wrapper .nav-dropdown .dropdown-item a.router-link-active::after
        top calc(1rem - 2px)
    & > .sidebar-links
      padding 1rem 0

@media (min-width: $MQMobile)
  .sidebar
    border-left var(--docs-border-dashed)
    margin-left var(--docs-wrap-space-outer);

@media (min-width: 1280px)
  .sidebar
    left auto
    border-left 0
    margin-left calc(var(--docs-wrap-space-inner) * -1)
</style>
