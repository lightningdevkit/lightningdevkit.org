/**
 * Slugify "Self-custody" → "self-custody", "Elias Rohrer" → "elias-rohrer".
 *
 * Kept in a separate module from `posts.data.mts` because VitePress's
 * static-data plugin transforms `.data.{js,ts,mjs,mts}` files so they
 * expose only a `data` named export — any other exports (like this
 * function) get dropped, and consumers get
 * `"slugify" is not exported by "posts.data.mts"` at build time.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export interface Post {
  url: string
  title: string
  description: string
  date: string
  authors: string[]
  tags: string[]
}

/**
 * Read blog frontmatter directly from disk. Used by `[param].paths.mts`
 * files which are loaded by VitePress via `loadConfigFromFile` and
 * bypass the static-data plugin pipeline — so they can't use the
 * `data` export from `posts.data.mts` (would be undefined). The
 * paths files run at build time on Node, hence the `fs` import.
 *
 * Runtime pages (markdown bodies with `<script setup>`) DO get the
 * data-plugin transform and should continue to use the `data` export.
 */
export async function readBlogPosts(blogDir: string): Promise<Post[]> {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const entries = await fs.readdir(blogDir)
  const posts: Post[] = []

  for (const file of entries) {
    if (!file.endsWith('.md')) continue
    if (file.startsWith('_') || file === 'index.md') continue
    const full = path.join(blogDir, file)
    const stat = await fs.stat(full)
    if (!stat.isFile()) continue

    const content = await fs.readFile(full, 'utf8')
    const fm = content.match(/^---\n([\s\S]*?)\n---/)
    if (!fm) continue

    const meta: Record<string, unknown> = {}
    const lines = fm[1].split('\n')
    let currentKey: string | null = null
    let currentList: string[] | null = null
    for (const line of lines) {
      const scalar = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/)
      if (scalar) {
        currentKey = scalar[1]
        currentList = null
        const raw = scalar[2].trim()
        if (raw === '' || raw === '|' || raw === '>') {
          // Likely a list follows on next lines.
          currentList = []
          meta[currentKey] = currentList
        } else {
          meta[currentKey] = raw.replace(/^["']|["']$/g, '')
        }
        continue
      }
      const item = line.match(/^\s+-\s+(.+)$/)
      if (item && currentList) {
        currentList.push(item[1].replace(/^["']|["']$/g, '').trim())
      }
    }

    const slug = file.replace(/\.md$/, '')
    posts.push({
      url: `/blog/${slug}/`,
      title: String(meta.title ?? ''),
      description: String(meta.description ?? ''),
      date: String(meta.date ?? ''),
      authors: Array.isArray(meta.authors) ? meta.authors : [],
      tags: Array.isArray(meta.tags) ? meta.tags : [],
    })
  }

  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
}
