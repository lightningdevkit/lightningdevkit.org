import { createContentLoader } from 'vitepress'
import type { Post } from './_taxonomy.ts'

declare const data: Post[]
export { data }

export default createContentLoader('blog/*.md', {
  excerpt: false,
  transform(raw): Post[] {
    return raw
      .filter(({ url }) => {
        // Skip meta pages — only individual articles get aggregated.
        if (url === '/blog/' || url === '/blog/index') return false
        if (url.startsWith('/blog/tags/')) return false
        if (url.startsWith('/blog/author/')) return false
        return true
      })
      .map(({ url, frontmatter }) => ({
        url,
        title: frontmatter.title ?? '',
        description: frontmatter.description ?? '',
        date: frontmatter.date ?? '',
        authors: Array.isArray(frontmatter.authors) ? frontmatter.authors : [],
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
