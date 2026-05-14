import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readBlogPosts, slugify } from '../_taxonomy.ts'

const blogDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export default {
  async paths() {
    const posts = await readBlogPosts(blogDir)
    const authors = new Set<string>()
    for (const post of posts) {
      for (const author of post.authors) authors.add(author)
    }
    return [...authors].map((author) => ({
      params: { author: slugify(author), name: author },
    }))
  },
}
