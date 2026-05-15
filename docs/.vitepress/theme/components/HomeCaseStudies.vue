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
        <div v-for="logo in logos" :key="logo.src" class="logo-slot">
          <img :src="withBase(logo.src)" :alt="logo.alt" />
        </div>
      </div>
      <div class="case-studies-inner-content">
        <h2>Trusted by the best</h2>
        <p class="description">Innovative projects are building with LDK</p>
        <a :href="withBase('/case-studies')" class="case-studies-cta">
          All case studies →
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.case-studies {
  padding-top: 48px;
  padding-bottom: 48px;
}

.case-studies-inner {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 48px;
  align-items: center;
}

@media (max-width: 720px) {
  .case-studies-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.logo-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  justify-content: flex-start;
}

@media (max-width: 720px) {
  .logo-wrapper {
    justify-content: center;
  }
}

/* Equal-height slot for each logo so different aspect ratios still
   sit on the same baseline. Logos are object-fit: contain so they
   never distort. */
.logo-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  width: 120px;
}

.logo-slot img {
  max-height: 56px;
  max-width: 120px;
  object-fit: contain;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.logo-slot img:hover {
  opacity: 1;
}

.case-studies-inner-content h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  border: 0;
  padding: 0;
  line-height: 1.2;
}

.case-studies-inner-content .description {
  margin: 0 0 20px;
  color: var(--vp-c-text-2);
  font-size: 16px;
}

.case-studies-cta {
  color: var(--vp-c-brand-1);
  font-weight: 500;
  text-decoration: none;
}

.case-studies-cta:hover {
  color: var(--vp-c-brand-2);
}
</style>
