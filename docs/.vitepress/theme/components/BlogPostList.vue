<script setup lang="ts">
import { withBase } from 'vitepress'
import { slugify, type Post } from '../../../blog/_taxonomy.ts'

defineProps<{
  posts: Post[]
}>()

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
  <ul class="blog-post-list">
    <li v-for="post in posts" :key="post.url" class="blog-post">
      <a :href="withBase(post.url)" class="blog-post-title">{{ post.title }}</a>
      <div class="blog-post-meta">
        <time v-if="post.date" :datetime="post.date">{{ formatDate(post.date) }}</time>
        <span v-if="post.authors.length" class="blog-post-authors">
          by
          <template v-for="(author, idx) in post.authors" :key="author">
            <a :href="withBase(`/blog/author/${slugify(author)}/`)">{{ author }}</a>
            <span v-if="idx < post.authors.length - 1">, </span>
          </template>
        </span>
      </div>
      <p v-if="post.description" class="blog-post-description">{{ post.description }}</p>
      <ul v-if="post.tags.length" class="blog-post-tags">
        <li v-for="tag in post.tags" :key="tag">
          <a :href="withBase(`/blog/tags/${slugify(tag)}/`)">{{ tag }}</a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<style scoped>
.blog-post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.blog-post {
  padding: 24px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.blog-post:last-child {
  border-bottom: 0;
}

.blog-post-title {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-decoration: none;
  margin-bottom: 4px;
}

.blog-post-title:hover {
  color: var(--vp-c-brand-1);
}

.blog-post-meta {
  color: var(--vp-c-text-3);
  font-size: 13px;
  margin-bottom: 8px;
}

.blog-post-meta a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.blog-post-meta a:hover {
  color: var(--vp-c-brand-1);
}

.blog-post-description {
  margin: 0 0 12px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

.blog-post-tags {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.blog-post-tags li a {
  display: inline-block;
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.blog-post-tags li a:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>
