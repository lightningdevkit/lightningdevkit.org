import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readBlogPosts, slugify } from '../_taxonomy.ts'

const blogDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export default {
  async paths() {
    const posts = await readBlogPosts(blogDir)
    const tags = new Set<string>()
    for (const post of posts) {
      for (const tag of post.tags) tags.add(tag)
    }
    return [...tags].map((tag) => ({
      params: { tag: slugify(tag), name: tag },
    }))
  },
}
