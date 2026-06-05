#!/usr/bin/env node
// One-shot migration script: <CodeSwitcher> (VuePress 1 spiralbtc theme)
// -> ::: code-group (VitePress built-in).
//
// Usage:
//   node scripts/migrate-codeswitcher.mjs <file...>
//
// Idempotent: skips files with no CodeSwitcher blocks. Safe to run twice.
//
// This script is one-shot and can be deleted after the migration lands.

import fs from 'node:fs'

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('Usage: node scripts/migrate-codeswitcher.mjs <file...>')
  process.exit(1)
}

const codeSwitcherRe =
  /<CodeSwitcher\s+:languages="(\{[^"]+\})">([\s\S]*?)<\/CodeSwitcher>/g
const templateRe =
  /<template\s+v-slot:([\w-]+)>([\s\S]*?)<\/template>/g

function parseLanguagesMap(raw) {
  // raw looks like `{rust:'Rust', kotlin:'Kotlin', swift:'Swift'}`.
  const inner = raw.replace(/^\{|\}$/g, '')
  const labels = {}
  for (const pair of inner.split(',')) {
    const m = pair.match(/^\s*['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]\s*$/)
    if (m) labels[m[1]] = m[2]
  }
  return labels
}

function dedent(text) {
  const lines = text.split('\n')
  // Strip pure leading/trailing blank lines for measurement.
  const nonBlank = lines.filter((l) => l.trim().length > 0)
  if (nonBlank.length === 0) return ''
  const indents = nonBlank.map((l) => l.match(/^[ \t]*/)[0].length)
  const minIndent = Math.min(...indents)
  if (minIndent === 0) return lines.join('\n')
  return lines
    .map((l) => (l.length >= minIndent ? l.slice(minIndent) : l))
    .join('\n')
}

function transformTemplate(slotName, slotContent, labels) {
  const label = labels[slotName] || slotName
  const dedented = dedent(slotContent).trim()

  // Inject `[Label]` after the first opening code-fence language tag.
  // Don't change the language token itself — the original may legitimately
  // use a different fence (e.g. kotlin slot rendering as ```java).
  const withLabel = dedented.replace(
    /^(```[\w-]*)\s*$/m,
    (_, fence) => `${fence} [${label}]`,
  )
  return withLabel
}

let totalBlocks = 0
let filesChanged = 0

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8')
  let blocksInFile = 0

  const transformed = original.replace(codeSwitcherRe, (_match, langMap, body) => {
    blocksInFile++
    const labels = parseLanguagesMap(langMap)
    const blocks = []
    let templateMatch
    templateRe.lastIndex = 0
    while ((templateMatch = templateRe.exec(body)) !== null) {
      const [, slot, content] = templateMatch
      blocks.push(transformTemplate(slot, content, labels))
    }
    return `::: code-group\n\n${blocks.join('\n\n')}\n\n:::`
  })

  if (blocksInFile > 0) {
    fs.writeFileSync(file, transformed)
    console.log(`✓ ${file}: ${blocksInFile} block(s)`)
    filesChanged++
    totalBlocks += blocksInFile
  }
}

console.log(
  `\n${totalBlocks} CodeSwitcher block(s) converted across ${filesChanged} file(s).`,
)
