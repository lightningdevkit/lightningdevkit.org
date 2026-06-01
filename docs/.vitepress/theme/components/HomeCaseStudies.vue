<script setup lang="ts">
import { withBase } from 'vitepress'

const logos = [
  { src: '/img/lightspark-logo.svg', alt: 'Lightspark' },
  { src: '/img/alby-logo.webp', alt: 'Alby Hub' },
  { src: '/img/cash-app-logo.png', alt: 'Cash App' },
  { src: '/img/lexe-logo.jpg', alt: 'Lexe' },
]
</script>

<template>
  <section class="home-case-studies vp-home-extras">
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
.home-case-studies {
  /* Override the vp-home-extras 24px side padding with a wider inset so
     the logos and text sit further from the section edges. Vertical
     padding matches the LDK Node band below. */
  padding: 64px 48px;
}

.case-studies-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  text-align: center;
}

@media (min-width: 721px) {
  .case-studies-inner {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
}

.logo-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  justify-content: center;
}

@media (min-width: 721px) {
  .logo-wrapper {
    justify-content: flex-start;
  }
}

/* Equal-height slot for each logo so the different aspect ratios sit
   on the same baseline. Logos are object-fit: contain so they never
   distort; the near-square brand tiles fill the height while the
   Lightspark bar centers within it. */
.logo-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96px;
}

.logo-slot img {
  height: 96px;
  width: auto;
  max-width: 130px;
  object-fit: contain;
}

.case-studies-inner-content h2 {
  margin: 0 0 16px;
  font-size: 32px;
  font-weight: 700;
  border: 0;
  padding: 0;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

@media (min-width: 721px) {
  .case-studies-inner-content h2 {
    font-size: 40px;
  }
}

.case-studies-inner-content .description {
  margin: 0 0 24px;
  color: var(--vp-c-text-2);
  font-size: 18px;
  line-height: 1.5;
}

.case-studies-cta {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: 18px;
  text-decoration: none;
}

.case-studies-cta:hover {
  color: var(--vp-c-brand-2);
}
</style>
