<template>
  <p class="meta">
    By

    <span v-for="(item, index) in post.frontmatter.authors" :key="item">
      <router-link :to="`/blog/author/${item}`" class="meta-link">{{ item }}</router-link><span v-if="index != post.frontmatter.authors.length - 1">, </span>
    </span>

    on

    {{ new Date(post.frontmatter.date).getMonth() + 1 }}/{{ new Date(post.frontmatter.date).getDate() + 1 }}/{{ new Date(post.frontmatter.date).getFullYear() }}

    - Tags:

    <span v-for="(tag, index) in post.frontmatter.tags" :key="tag">
      <router-link :to="`/blog/tags/${tag}`" class="meta-link">{{ tag | capitalize }}</router-link><template v-if="index != post.frontmatter.tags.length - 1">, </template>
    </span>
  </p>
</template>

<script>
import { capitalize } from '../../filters'

export default {
  name: 'PostMeta',

  props: [
    'post'
  ],

  filters: {
    capitalize
  }
}
</script>

<style scoped>
p.meta {
  margin-top: 0 !important;
}
</style>
