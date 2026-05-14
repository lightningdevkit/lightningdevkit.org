<template>
  <section class="cross-promo vp-home-extras">
    <a
      class="cross-promo-link"
      href="https://bitcoindevkit.org/"
      rel="noopener noreferrer"
    >
      <div class="cross-promo-inner">
        <span class="cross-promo-name">Bitcoin Dev Kit</span>
        <div class="divider"></div>
        <p class="cross-promo-description">The on-chain companion to LDK</p>
      </div>
    </a>
  </section>
</template>

<style scoped>
.cross-promo {
  margin: 64px auto;
}

.cross-promo-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.cross-promo-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px 32px;
  transition: border-color 0.2s, background-color 0.2s;
}

.cross-promo-link:hover .cross-promo-inner {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.cross-promo-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--vp-c-divider);
}

.cross-promo-description {
  margin: 0;
  color: var(--vp-c-text-2);
}
</style>
