<template>
  <LayoutWrap>
    <main class="page">
      <div class="theme-default-content">
        <h1 v-if="this.$page.path.startsWith('/blog/tags/')">Tags</h1>
        <h1 v-else>Authors</h1>
        <ul>
          <li v-for="item in items" :key="item.name">
            <router-link :to="item.path">{{ displayName(item.name) }}</router-link>
          </li>
        </ul>
      </div>
    </main>
  </LayoutWrap>
</template>

<script>
import LayoutWrap from '@theme/components/LayoutWrap.vue'
import { capitalize } from '../../filters'

export default {
  name: 'FrontmatterKey',

  components: {
    LayoutWrap
  },

  computed: {
    items() {
      return this.$frontmatterKey.list
    }
  },

  methods: {
    displayName(name) {
      return this.$page.path.startsWith('/blog/tags/') ? capitalize(name) : name
    }
  }
}
</script>
