<script setup lang="ts">
import { withBase } from 'vitepress'

const githubUrl = 'https://github.com/lightningdevkit'
const discordUrl = 'https://discord.gg/5AcknnMfBw'

interface Link {
  text: string
  link: string
  external?: boolean
}

interface Column {
  title: string
  children: Link[]
}

const columns: Column[] = [
  {
    title: 'Docs',
    children: [
      { text: 'Introduction', link: '/introduction/' },
      { text: 'Building a node with LDK', link: '/building-a-node-with-ldk/introduction/' },
      { text: 'Running a sample LDK node', link: '/running-a-sample-ldk-node/' },
      { text: 'Architecture', link: '/introduction/architecture/' },
      { text: 'Blockchain Data', link: '/blockchain_data/introduction/' },
      { text: 'Key Management', link: '/key_management/' },
      { text: 'Fee Estimation', link: '/fee_estimation/' },
      { text: 'Probing and Path Finding', link: '/probing/' },
      { text: 'Examples', link: '/examples/' },
    ],
  },
  {
    title: 'Community',
    children: [
      { text: 'GitHub', link: githubUrl, external: true },
      { text: 'Twitter', link: 'https://twitter.com/lightningdevkit', external: true },
      { text: 'Chat on Discord', link: discordUrl, external: true },
      {
        text: 'LDK Calendar',
        link: 'https://calendar.google.com/calendar/embed?src=c_e6fv6vlshbpoob2mmbvblkkoj4%40group.calendar.google.com',
        external: true,
      },
      { text: 'LDK Review Club', link: 'http://ldk.reviews/', external: true },
      { text: 'Code of Conduct', link: '/code-of-conduct/' },
    ],
  },
  {
    title: 'Resources',
    children: [
      { text: 'Case Studies', link: '/case-studies/' },
      { text: 'Blog', link: '/blog/' },
    ],
  },
  {
    title: 'Other',
    children: [
      { text: 'Bitcoin Dev Kit', link: 'https://bitcoindevkit.org/', external: true },
      {
        text: 'Reporting a Vulnerability',
        link: 'https://github.com/lightningdevkit/rust-lightning/blob/main/SECURITY.md',
        external: true,
      },
    ],
  },
]

const year = new Date().getUTCFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <div class="footer-columns">
        <div
          v-for="column in columns"
          :key="column.title"
          class="footer-column"
        >
          <h4>{{ column.title }}</h4>
          <ul>
            <li v-for="child in column.children" :key="child.text">
              <a
                v-if="child.external"
                :href="child.link"
                rel="noopener noreferrer"
                target="_blank"
              >
                {{ child.text }}
              </a>
              <a v-else :href="withBase(child.link)">{{ child.text }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="site-footer-copy">Copyright © {{ year }} LDK Developers</div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  /* White background, with the dashed page-frame lines (z-index 1) left
     visible — they run down through the footer's side gutters. No
     stacking context here, so the lines paint over the background. */
  background: var(--vp-c-bg);
  padding: 64px 24px 32px;
}

.site-footer-inner {
  max-width: var(--ldk-content-width);
  margin: 0 auto;
}

.footer-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

@media (min-width: 541px) {
  .footer-columns {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (min-width: 961px) {
  .footer-columns {
    grid-template-columns: repeat(4, 1fr);
    gap: 48px;
  }
}

.footer-column h4 {
  margin: 0 0 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-1);
}

.footer-column ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-column li {
  line-height: 1.5;
}

.footer-column a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 14px;
}

.footer-column a:hover {
  color: var(--vp-c-brand-1);
}

.site-footer-copy {
  color: var(--vp-c-text-3);
  font-size: 13px;
  text-align: center;
  padding-top: 24px;
}
</style>
