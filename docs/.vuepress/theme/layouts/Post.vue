<template>
  <LayoutWrap>
    <Page :sidebar-items="sidebarItems">
      <template v-slot:top>
        <header class="theme-default-content post-header">
          <h1>{{ $page.title }}</h1>
          <PostMeta :post="$page" />
          <hr/>
        </header>
      </template>
    </Page>
  </LayoutWrap>
</template>

<script>
import LayoutWrap from '@theme/components/LayoutWrap.vue'
import Page from '@theme/components/Page.vue'
import PostMeta from '@theme/components/PostMeta.vue'
import { resolveSidebarItems } from '@parent-theme/util'

export default {
  name: 'Post',

  components: {
    LayoutWrap,
    Page,
    PostMeta
  },

  computed: {
    sidebarItems () {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      )
    }
  }
}
</script>

<style scoped>
.post-header {
  margin-bottom: -6.2rem !important;
  padding-bottom: 0 !important;
}
</style>
