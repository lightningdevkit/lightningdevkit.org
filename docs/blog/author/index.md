---
title: Authors
description: Browse blog posts by author
---

<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../posts.data.mts'
import { slugify } from '../_taxonomy.ts'

const authors = computed(() => {
  const counts = new Map()
  for (const post of posts) {
    for (const author of post.authors) {
      counts.set(author, (counts.get(author) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, slug: slugify(name) }))
    .sort((a, b) => a.name.localeCompare(b.name))
})
</script>

# Authors

<ul class="blog-taxonomy-list">
  <li v-for="author in authors" :key="author.slug">
    <a :href="withBase(`/blog/author/${author.slug}/`)">{{ author.name }}</a>
    <span class="blog-taxonomy-count">{{ author.count }}</span>
  </li>
</ul>

<style scoped>
.blog-taxonomy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
}

.blog-taxonomy-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.blog-taxonomy-list li:hover {
  border-color: var(--vp-c-brand-1);
}

.blog-taxonomy-list a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 500;
}

.blog-taxonomy-list li:hover a {
  color: var(--vp-c-brand-1);
}

.blog-taxonomy-count {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 12px;
}
</style>
