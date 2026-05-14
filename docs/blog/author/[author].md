---
title: Author
---

<script setup>
import { useData } from 'vitepress'
import { data as allPosts } from '../posts.data.mts'
import { slugify } from '../_taxonomy.ts'
import { computed } from 'vue'

const { params } = useData()
const authored = computed(() =>
  allPosts.filter((p) => p.authors.some((a) => slugify(a) === params.value.author))
)
</script>

# Posts by {{ $params.name }}

<p v-if="authored.length === 0">No posts found.</p>

<BlogPostList :posts="authored" />

[← Back to all authors](/blog/author/)
