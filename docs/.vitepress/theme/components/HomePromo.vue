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
  /* No top gap: the soft band fills its section from the top, flush
     with the divider below the case-studies section. */
  margin-top: 0;
}

.ldk-promo-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: center;
  background: var(--vp-c-brand-soft);
  padding: 64px 24px;
  text-align: center;
  /* Full-bleed soft band rather than a floating rounded card: cancel
     the section's 24px side padding so the background fills the section
     edge-to-edge with square corners. The inner padding above keeps the
     content aligned to the page gutter. */
  margin-left: -24px;
  margin-right: -24px;
}

.ldk-promo-icon {
  justify-self: center;
}

@media (min-width: 721px) {
  .ldk-promo-inner {
    grid-template-columns: 200px 1fr;
    text-align: left;
  }

  .ldk-promo-icon {
    justify-self: stretch;
  }
}

@media (min-width: 1241px) {
  .ldk-promo-inner {
    /* Once the dashed page-frame is visible, extend the band to the
       frame lines (calc(50% ± 600px)) — 24px past each section edge —
       and grow the inner padding to keep content on the page gutter. */
    margin-left: -48px;
    margin-right: -48px;
    padding-left: 48px;
    padding-right: 48px;
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
  font-weight: 700;
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
