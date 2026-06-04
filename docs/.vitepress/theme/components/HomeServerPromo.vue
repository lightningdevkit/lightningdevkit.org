<template>
  <!-- "Feature hero" promo: LDK Server as a two-column feature hero with an
       eyebrow, lead, feature chips and a strong CTA, followed by a dashed
       divider and a compact LDK Node strip. Both sit in one full-bleed soft
       band (Server above Node). -->
  <section class="ldk-feature-hero vp-home-extras">
    <div class="fh-band">
      <div class="fh-promo">
        <div class="fh-content">
          <div class="fh-eyebrow">Latest from LDK</div>
          <h2>LDK Server</h2>
          <p class="fh-lead">
            A production-ready Lightning node you can deploy and scale — no glue
            code required.
          </p>
          <ul class="fh-chips">
            <li class="fh-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Clean API
            </li>
            <li class="fh-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Enterprise features
            </li>
            <li class="fh-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Built-in LSP support
            </li>
          </ul>
          <a
            class="fh-cta"
            href="https://github.com/lightningdevkit/ldk-server"
            rel="noopener noreferrer"
          >
            Get started →
          </a>
        </div>
        <div class="fh-icon" aria-hidden="true">
          <svg viewBox="0 0 202 202">
            <use href="/img/illustrations.svg#node" />
          </svg>
        </div>
      </div>

      <div class="fh-divider"></div>

      <div class="fh-node">
        <div class="fh-node-icon" aria-hidden="true">
          <svg viewBox="0 0 202 202">
            <use href="/img/illustrations.svg#ldk-node" />
          </svg>
        </div>
        <div class="fh-node-copy">
          <h3>LDK Node</h3>
          <p>Build a mobile Lightning wallet fast with our ready-to-go solution</p>
        </div>
        <a
          class="fh-node-cta"
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
.ldk-feature-hero {
  /* No top gap: the soft band sits flush below the section above. */
  margin-top: 0;
}

/* Full-bleed soft band: cancel the section's 24px side padding so the
   background fills edge-to-edge (matches the other home bands). */
.fh-band {
  background: var(--vp-c-brand-soft);
  margin-left: -24px;
  margin-right: -24px;
  padding: 16px 24px 56px;
}

@media (min-width: 1241px) {
  .fh-band {
    /* Extend to the dashed page-frame lines once visible. */
    margin-left: -48px;
    margin-right: -48px;
    padding-left: 48px;
    padding-right: 48px;
  }
}

/* ---- Server feature hero ---- */
.fh-promo {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: center;
  padding: 48px 0 40px;
  text-align: center;
}

@media (min-width: 721px) {
  .fh-promo {
    grid-template-columns: 1fr clamp(220px, 30vw, 340px);
    gap: 56px;
    text-align: left;
  }
}

.fh-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 14px;
}

.ldk-feature-hero .fh-content h2 {
  margin: 0;
  font-size: clamp(34px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.022em;
  border: 0;
  padding: 0;
}

.fh-lead {
  color: var(--vp-c-text-2);
  font-size: 19px;
  line-height: 1.5;
  margin: 16px 0 26px;
  max-width: 42ch;
}

@media (max-width: 720px) {
  .fh-lead {
    margin-left: auto;
    margin-right: auto;
  }
}

.fh-chips {
  list-style: none;
  margin: 0 0 32px;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 720px) {
  .fh-chips {
    justify-content: center;
  }
}

.fh-chip {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
}

.fh-chip svg {
  width: 18px;
  height: 18px;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.fh-cta {
  display: inline-block;
  padding: 16px 34px;
  border-radius: 11px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text, var(--vp-c-white));
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.fh-cta:hover {
  background: var(--vp-button-brand-hover-bg);
}

.fh-icon {
  justify-self: center;
}

.fh-icon svg {
  display: block;
  width: clamp(200px, 30vw, 300px);
  height: clamp(200px, 30vw, 300px);
}

/* ---- dashed divider between Server and Node ---- */
.fh-divider {
  border-top: 1px dashed var(--vp-c-divider);
}

/* ---- compact Node strip ---- */
.fh-node {
  display: grid;
  grid-template-columns: 84px 1fr auto;
  gap: 24px;
  align-items: center;
  padding: 28px 0 6px;
}

.fh-node-icon {
  justify-self: center;
}

.fh-node-icon svg {
  display: block;
  width: 84px;
  height: 84px;
}

.ldk-feature-hero .fh-node-copy h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.fh-node-copy p {
  margin: 2px 0 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
}

.fh-node-cta {
  display: inline-block;
  padding: 11px 24px;
  border-radius: 999px;
  border: 2px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s;
}

.fh-node-cta:hover {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

@media (max-width: 720px) {
  .fh-node {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
    gap: 16px;
  }
}
</style>
