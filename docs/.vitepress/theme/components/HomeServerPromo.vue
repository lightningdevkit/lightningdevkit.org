<template>
  <section class="ldk-server vp-home-extras">
    <div class="ldk-server-inner">
      <div class="ldk-server-content">
        <h2>LDK Server</h2>
        <p>
          Deployable with a clean API, enterprise features, and built-in
          LSP support
        </p>
        <a
          class="ldk-server-cta"
          href="https://github.com/lightningdevkit/ldk-server"
          rel="noopener noreferrer"
        >
          Get Started
        </a>
      </div>
      <div class="ldk-server-icon" aria-hidden="true">
        <svg viewBox="0 0 202 202">
          <use href="/img/illustrations.svg#node" />
        </svg>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ldk-server {
  /* No top gap: the soft band sits flush below the LDK Node band above. */
  margin-top: 0;
}

.ldk-server-inner {
  /* Mobile: same pattern as the LDK Node section — illustration on top,
     content below, everything centered. (Content is first in the DOM for
     the desktop swap, so column-reverse puts the icon on top here.) */
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 32px;
  background: var(--vp-c-brand-soft);
  padding: 64px 24px;
  text-align: center;
  /* Full-bleed soft band (matches the LDK Node section): cancel the
     section's 24px side padding so the background fills edge-to-edge. */
  margin-left: -24px;
  margin-right: -24px;
}

@media (min-width: 721px) {
  .ldk-server-inner {
    /* Desktop: text left, illustration right (swapped vs LDK Node),
       grouped and aligned to the right of the section. */
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    text-align: right;
  }
}

@media (min-width: 1241px) {
  .ldk-server-inner {
    /* Extend the band to the dashed page-frame lines once visible. */
    margin-left: -48px;
    margin-right: -48px;
    padding-left: 48px;
    padding-right: 48px;
  }
}

.ldk-server-content {
  max-width: 30rem;
}

.ldk-server-icon {
  flex-shrink: 0;
}

.ldk-server-icon svg {
  display: block;
  width: 180px;
  height: 180px;
}

.ldk-server-content h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  border: 0;
  padding: 0;
}

.ldk-server-content p {
  margin: 0 0 20px;
  color: var(--vp-c-text-2);
}

.ldk-server-cta {
  display: inline-block;
  padding: 10px 24px;
  border-radius: 24px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text, var(--vp-c-white));
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.ldk-server-cta:hover {
  background: var(--vp-button-brand-hover-bg);
}
</style>
