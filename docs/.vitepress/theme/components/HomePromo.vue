<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <section class="ldk-promo vp-home-extras">
    <div class="ldk-promo-inner">
      <h2>LDK Node</h2>
      <p>Build a mobile Lightning wallet fast with our ready-to-go solution</p>
      <a
        class="ldk-promo-cta"
        href="https://docs.rs/ldk-node/*/ldk_node/"
        rel="noopener noreferrer"
      >
        Get Started
      </a>
    </div>
  </section>
</template>

<style scoped>
.ldk-promo {
  margin-top: 64px;
}

.ldk-promo-inner {
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.ldk-promo h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  border: 0;
  padding: 0;
}

.ldk-promo p {
  margin: 0 0 20px;
  color: var(--vp-c-text-2);
}

.ldk-promo-cta {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 20px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text, var(--vp-c-white));
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.ldk-promo-cta:hover {
  background: var(--vp-button-brand-hover-bg);
}
</style>
