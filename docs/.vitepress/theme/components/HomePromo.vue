<template>
  <section class="ldk-promo vp-home-extras">
    <div class="ldk-promo-inner">
      <div class="ldk-promo-icon" aria-hidden="true">
        <svg viewBox="0 0 202 202">
          <use href="/img/illustrations.svg#ldk-node" />
        </svg>
      </div>
      <div class="ldk-promo-content">
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
    </div>
  </section>
</template>

<style scoped>
.ldk-promo {
  margin-top: 64px;
}

.ldk-promo-inner {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
  align-items: center;
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 32px;
}

@media (max-width: 720px) {
  .ldk-promo-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .ldk-promo-icon {
    justify-self: center;
  }
}

.ldk-promo-icon svg {
  display: block;
  width: 180px;
  height: 180px;
}

.ldk-promo-content h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  border: 0;
  padding: 0;
}

.ldk-promo-content p {
  margin: 0 0 20px;
  color: var(--vp-c-text-2);
}

.ldk-promo-cta {
  display: inline-block;
  padding: 10px 24px;
  border-radius: 24px;
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
