<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <section class="cross-promo">
    <a
      class="cross-promo-link"
      href="https://bitcoindevkit.org/"
      rel="noopener noreferrer"
    >
      <div class="cross-promo-inner">
        <div class="cross-promo-brand">
          <img
            :src="withBase('/img/bdk-mark.svg')"
            alt=""
            class="cross-promo-mark"
            onerror="this.style.display='none'"
          />
          <span class="cross-promo-name">Bitcoin Dev Kit</span>
        </div>
        <div class="cross-promo-divider"></div>
        <p class="cross-promo-description">The on-chain companion to LDK</p>
      </div>
    </a>
  </section>
</template>

<style scoped>
.cross-promo {
  /* Stay within the dashed page-frame (1200px wide, centered) rather
     than bleeding the orange band to the viewport edges. No vertical
     margin so it sits flush below the "Trusted by the best" section. */
  max-width: 1200px;
  margin: 0 auto;
  background: #f7931a;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.cross-promo-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.cross-promo-inner {
  max-width: 1152px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px 24px;
  text-align: center;
}

.cross-promo-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cross-promo-mark {
  width: 32px;
  height: 32px;
  display: block;
}

.cross-promo-name {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-transform: uppercase;
}

.cross-promo-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.5);
  display: none;
}

.cross-promo-description {
  margin: 0;
  color: #ffffff;
  font-size: 15px;
}

@media (min-width: 721px) {
  .cross-promo-inner {
    flex-direction: row;
    gap: 24px;
    text-align: left;
  }

  .cross-promo-divider {
    display: block;
  }
}
</style>
