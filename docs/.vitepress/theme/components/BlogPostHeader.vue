<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { slugify } from '../../../blog/_taxonomy.ts'

const { frontmatter } = useData()
const route = useRoute()

// Only individual blog articles get a header: they live under /blog/ and
// carry a `date` in frontmatter (the blog index, tag, and author listing
// pages have a title but no date).
const isPost = computed(
  () => route.path.startsWith('/blog/') && !!frontmatter.value.date
)

const authors = computed<string[]>(() => {
  const a = frontmatter.value.authors
  if (Array.isArray(a)) return a
  if (typeof a === 'string') return [a]
  return []
})

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <header v-if="isPost" class="blog-post-header">
    <h1 class="blog-post-header-title">{{ frontmatter.title }}</h1>
    <div class="blog-post-header-meta">
      <time v-if="frontmatter.date" :datetime="frontmatter.date">{{
        formatDate(frontmatter.date)
      }}</time>
      <span v-if="authors.length" class="blog-post-header-authors">
        by
        <template v-for="(author, idx) in authors" :key="author">
          <a :href="withBase(`/blog/author/${slugify(author)}/`)">{{
            author
          }}</a>
          <span v-if="idx < authors.length - 1">, </span>
        </template>
      </span>
    </div>
  </header>
</template>

<style scoped>
.blog-post-header {
  margin-bottom: 32px;
}

.blog-post-header-title {
  margin: 0 0 12px;
  padding: 0;
  border: 0;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.blog-post-header-meta {
  font-size: 15px;
  color: var(--vp-c-text-2);
}

.blog-post-header-authors a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-weight: 500;
}

.blog-post-header-authors a:hover {
  color: var(--vp-c-brand-1);
}
</style>
