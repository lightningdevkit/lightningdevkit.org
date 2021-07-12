<template>
  <LayoutWrap>
    <main class="page">
      <div class="theme-default-content">
        <h1>{{ title || 'Blog' }}</h1>
        <div
          v-for="post in posts"
          :key="post.path"
        >
          <h2 class="index-post-title">
            <router-link :to="post.path">{{ post.title || post.frontmatter.title }}</router-link>
          </h2>
          <PostMeta :post="post" />
          <router-link v-if="post.frontmatter.coverImage" :to="post.path">
            <img
              :src="post.frontmatter.coverImage"
              class="cover-image"
            />
          </router-link>
          <hr />
        </div>
        <Pagination v-if="$pagination.length > 1" />
      </div>
    </main>
  </LayoutWrap>
</template>

<script>
import LayoutWrap from '@theme/components/LayoutWrap.vue'
import PostMeta from '@theme/components/PostMeta.vue'
import { Pagination } from '@vuepress/plugin-blog/lib/client/components'
import { capitalize } from '../../filters'

export default {
  name: 'IndexPost',

  components: {
    LayoutWrap,
    Pagination,
    PostMeta,
  },

  props: [
    'items',
    'title'
  ],

  computed: {
    posts() {
      return this.items || this.$pagination.pages.sort(
        (a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
      )
    }
  },

  filters: {
    capitalize
  }
}
</script>

<style scoped>
h2 {
  margin-bottom: 0;
}
</style>
