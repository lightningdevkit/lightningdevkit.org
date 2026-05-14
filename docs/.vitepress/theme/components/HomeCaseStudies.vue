<script setup lang="ts">
import { withBase } from 'vitepress'

const logos = [
  { src: '/img/bitkit.svg', alt: 'Bitkit' },
  { src: '/img/alby-hub-featured.svg', alt: 'Alby Hub' },
  { src: '/img/cashapp-badge.svg', alt: 'Cash App' },
]
</script>

<template>
  <section class="case-studies vp-home-extras">
    <div class="case-studies-inner">
      <div class="logo-wrapper">
        <img
          v-for="logo in logos"
          :key="logo.src"
          :src="withBase(logo.src)"
          :alt="logo.alt"
        />
      </div>
      <div class="case-studies-inner-content">
        <h2>Trusted by the best</h2>
        <p class="description">Innovative projects are building with LDK</p>
        <a :href="withBase('/case-studies')">All case studies →</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.case-studies {
  margin-top: 64px;
}

.case-studies-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 40px;
}

@media (max-width: 720px) {
  .case-studies-inner {
    grid-template-columns: 1fr;
  }
}

.logo-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  justify-content: center;
}

.logo-wrapper img {
  max-height: 48px;
  max-width: 140px;
  opacity: 0.85;
}

.case-studies-inner-content h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  border: 0;
  padding: 0;
}

.case-studies-inner-content .description {
  margin: 0 0 16px;
  color: var(--vp-c-text-2);
}

.case-studies-inner-content a {
  color: var(--vp-c-brand-1);
  font-weight: 500;
  text-decoration: none;
}

.case-studies-inner-content a:hover {
  color: var(--vp-c-brand-2);
}
</style>
