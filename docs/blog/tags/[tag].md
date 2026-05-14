---
title: Tag
---

<script setup>
import { useData } from 'vitepress'
import { data as allPosts } from '../posts.data.mts'
import { slugify } from '../_taxonomy.ts'
import { computed } from 'vue'

const { params } = useData()
const tagged = computed(() =>
  allPosts.filter((p) => p.tags.some((t) => slugify(t) === params.value.tag))
)
</script>

# Posts tagged "{{ $params.name }}"

<p v-if="tagged.length === 0">No posts found.</p>

<BlogPostList :posts="tagged" />

[← Back to all tags](/blog/tags/)
