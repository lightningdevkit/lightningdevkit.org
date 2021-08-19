<template>
  <footer class="footer">
    <div class="wrap">
      <div class="wrap-border">
        <div class="inner">
          <div class="footer-content">
            <div
              v-for="block in links"
              :key="block.title"
              class="footer-block"
            >
              <h4>{{ block.title }}</h4>
              <div
                v-for="item in block.children"
                :key="item.link"
              >
                <NavLink :item="item" />
              </div>
            </div>
          </div>
          <p v-if="copyright" class="copyright">{{ copyright }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import NavLink from '@theme/components/NavLink.vue'

export default {
  name: 'Footer',

  components: { NavLink },

  computed: {
    links () {
      return this.$site.themeConfig.footer.links
    },

    copyright () {
      return this.$site.themeConfig.footer.copyright
    }
  }
}
</script>

<style lang="stylus">
.footer
  @media (min-width: $MQNarrow)
    position relative
  .wrap-border
    border-top var(--docs-border-dashed)
    padding 0
    .theme-container:not(.no-sidebar) &
      @media (min-width: $MQMobile)
        padding-left 13.8rem !important
      @media (min-width: $MQNarrow)
        padding-left 16.6rem !important
    .theme-container.no-sidebar &
      .inner
        @media (min-width: $MQNarrow)
          max-width 48rem !important
          margin 0 auto
          border-left var(--docs-border-dashed)
          border-right var(--docs-border-dashed)
          padding var(--docs-space-l)
  .footer-content
    display flex
    flex-wrap wrap
    padding-top var(--docs-space-m)
    @media (min-width: $MQNarrow)
      justify-content space-between
    .footer-block
      padding var(--docs-space-m) var(--docs-space-xxl) var(--docs-space-m) 0
    h4
      margin 0 0 var(--docs-space-s)
  .copyright
    margin-bottom 0
    padding-bottom var(--docs-space-l)
</style>
