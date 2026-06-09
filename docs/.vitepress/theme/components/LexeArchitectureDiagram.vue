<script setup lang="ts">
/*
 * Lexe architecture diagram — recreated from the Claude Design handoff
 * ("Lexe Architecture Diagram.html"). The diagram itself lives in the
 * LexeArchitectureSvg child so the inline figure and the zoom overlay share
 * one source; this component owns the palette, legend, caption, and the
 * click-to-zoom lightbox.
 *
 * Adapted for this VitePress site:
 *  - theming follows the site's global light/dark switch (`html.dark`)
 *    instead of the prototype's own data-theme toggle + localStorage;
 *  - typography inherits the site font (the prototype's proprietary
 *    Cash Sans is not shipped here).
 *
 * Topology: persistence runs from the Node out through the Lexe Cloud
 * boundary up into User cloud storage; the App talks only to the Reverse
 * Proxy (TLS-in-TLS). Protocol color-coding: amber = Lightning / Noise
 * transport, blue = TLS family, thick blue = TLS-in-TLS, dashed gray =
 * datastore link.
 */
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import LexeArchitectureSvg from './LexeArchitectureSvg.vue'

const zoomed = ref(false)
const open = () => { zoomed.value = true }
const close = () => { zoomed.value = false }
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

// Lock page scroll while the lightbox is open.
watch(zoomed, (v) => {
  if (typeof document !== 'undefined') document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <figure class="lexe-arch lexe-palette">
    <div class="figure">
      <button
        type="button"
        class="zoom-trigger"
        aria-label="Zoom in on the architecture diagram"
        title="Click to zoom"
        @click="open"
      >
        <LexeArchitectureSvg />
        <span class="zoom-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
          </svg>
        </span>
      </button>

      <div class="legend">
        <span class="lg"><svg width="34" height="10" viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="var(--amber)" stroke-width="2.6" stroke-linecap="round"/></svg>Lightning channel &amp; Noise transport</span>
        <span class="lg"><svg width="34" height="10" viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="var(--blue)" stroke-width="2.6" stroke-linecap="round"/></svg>Encrypted transport (TLS / HTTPS)</span>
        <span class="lg"><svg width="34" height="10" viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="var(--blue-deep)" stroke-width="5.4" stroke-linecap="round"/></svg>TLS-in-TLS, end-to-end to the app</span>
        <span class="lg"><svg width="34" height="10" viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="var(--dash)" stroke-width="1.8" stroke-dasharray="2 6" stroke-linecap="round"/></svg>Datastore reference</span>
      </div>

      <p class="footnote">TLS terminates <em>inside</em> the enclave; node state is encrypted before it leaves over the network to be persisted in the user's cloud storage.</p>
    </div>

    <Teleport to="body">
      <Transition name="lexe-zoom-fade">
        <div v-if="zoomed" class="lexe-zoom lexe-palette" role="dialog" aria-modal="true" aria-label="Lexe architecture diagram" @click="close">
          <button type="button" class="zoom-close" aria-label="Close" @click.stop="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <div class="zoom-stage" @click.stop>
            <LexeArchitectureSvg class="zoom-svg" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </figure>
</template>

<style scoped>
.lexe-arch {
  margin: 28px 0;
}

.figure {
  border-radius: 22px;
  background: var(--panel);
  padding: 26px 26px 18px;
  transition: background 0.25s ease;
}

/* The diagram is wrapped in a button so it's a keyboard-operable zoom
   target; strip the native button chrome and signal the affordance. */
.zoom-trigger {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: zoom-in;
  position: relative;
  border-radius: 12px;
}
.zoom-trigger:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 4px;
}

.zoom-hint {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--panel);
  border: 1px solid var(--hair);
  color: var(--ink-2);
  opacity: 0;
  transition: opacity 0.18s ease;
  pointer-events: none;
}
.zoom-trigger:hover .zoom-hint,
.zoom-trigger:focus-visible .zoom-hint {
  opacity: 1;
}
.zoom-hint svg {
  width: 16px;
  height: 16px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 26px;
  margin-top: 22px;
  padding: 0 4px;
}
.lg {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: var(--ink-2);
  font-weight: 400;
}
.lg svg { flex: none; }

.footnote {
  margin-top: 16px;
  font-size: 12.5px;
  color: var(--ink-3);
  line-height: 1.5;
}

/* ---- Zoom lightbox (teleported to <body>) ---- */
.lexe-zoom {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vmin;
  background: rgba(0, 0, 0, 0.62);
  cursor: zoom-out;
}
.zoom-stage {
  background: var(--panel);
  border: 1px solid var(--hair);
  border-radius: 18px;
  padding: 22px;
  max-width: 96vw;
  max-height: 92vh;
  overflow: auto;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
  cursor: default;
}
.lexe-zoom .zoom-svg {
  width: auto;
  height: auto;
  max-width: calc(96vw - 44px);
  max-height: calc(92vh - 44px);
}
.zoom-close {
  position: fixed;
  top: 16px;
  right: 18px;
  width: 42px;
  height: 42px;
  border-radius: 9999px;
  border: 1px solid var(--hair);
  background: var(--panel);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.zoom-close svg { width: 20px; height: 20px; }

.lexe-zoom-fade-enter-active,
.lexe-zoom-fade-leave-active {
  transition: opacity 0.2s ease;
}
.lexe-zoom-fade-enter-from,
.lexe-zoom-fade-leave-to {
  opacity: 0;
}
.lexe-zoom-fade-enter-active .zoom-stage {
  transition: transform 0.22s ease;
}
.lexe-zoom-fade-enter-from .zoom-stage {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .lexe-zoom-fade-enter-active,
  .lexe-zoom-fade-leave-active,
  .lexe-zoom-fade-enter-active .zoom-stage {
    transition: none;
  }
}
</style>

<!--
  Palette lives in a NON-scoped block on purpose: the dark override needs
  the real ancestor selector `html.dark .lexe-palette`. In a scoped block Vue
  rewrites `:global(html.dark) .lexe-palette` and drops the trailing part, so
  the dark vars would land on `<html>` and lose to the light vars. The
  `.lexe-palette` class is carried by both the inline figure and the
  teleported overlay, so the custom properties resolve in either context
  (the overlay sits under <body> but stays a descendant of `html.dark`).
-->
<style>
.lexe-palette {
  --page: #ffffff; --panel: #ffffff; --ink: #0c0c0c; --ink-2: #5b5b5b; --ink-3: #8a8a8a;
  --amber: #e08a0b; --blue: #2c6be0; --blue-deep: #1f56c7; --dash: #b7b7b7;
  --lexe-stroke: #2b2b2b; --lexe-fill: #ffffff;
  --vm-fill: #fafafa; --vm-stroke: #9a9a9a;
  --sgx-fill: #f0f0f0; --sgx-stroke: #9a9a9a;
  --lsp-fill: #eaeaea; --lsp-stroke: #cfcfcf;
  --node-fill: #dee9ff; --node-stroke: #2c6be0; --node-fg: #16306e;
  --rp-fill: #ffffff; --rp-stroke: #2b2b2b;
  --app-fill: #cfe0ff; --app-stroke: #2c6be0; --app-fg: #16306e;
  --db-fill: #f2f2f2; --db-stroke: #8c8c8c;
  --stor-fill: #dce7ff; --stor-stroke: #2c6be0; --stor-fg: #16306e;
  --ln-fill: #ffffff; --ln-stroke: #6b6b6b; --ln-fg: #1c1c1c;
  --chip-fill: #ffffff; --chip-stroke: #2c6be0;
  --hair: #e7e7e7; --shadow: rgba(0, 0, 0, 0.1);
}

html.dark .lexe-palette {
  /* Base surfaces follow the site's dark theme background so the figure
     blends with the page instead of reading as a black box. Nested
     containers step lighter from there to preserve the depth hierarchy. */
  --page: var(--vp-c-bg); --panel: var(--vp-c-bg); --ink: #ffffff; --ink-2: #b6b6b6; --ink-3: #7a7a7a;
  --amber: #f6a623; --blue: #5e92f2; --blue-deep: #5e92f2; --dash: #5a5a5a;
  --lexe-stroke: #9a9a9a; --lexe-fill: #202027;
  --vm-fill: #272730; --vm-stroke: #565656;
  --sgx-fill: #2f2f39; --sgx-stroke: #565656;
  --lsp-fill: #34343d; --lsp-stroke: #3a3a3a;
  --node-fill: #15294e; --node-stroke: #5e92f2; --node-fg: #d6e4ff;
  --rp-fill: var(--vp-c-bg); --rp-stroke: #9a9a9a;
  --app-fill: #15294e; --app-stroke: #5e92f2; --app-fg: #d6e4ff;
  --db-fill: #2a2a31; --db-stroke: #6a6a6a;
  --stor-fill: #15294e; --stor-stroke: #5e92f2; --stor-fg: #d6e4ff;
  --ln-fill: var(--vp-c-bg); --ln-stroke: #8a8a8a; --ln-fg: #ededed;
  --chip-fill: var(--vp-c-bg); --chip-stroke: #5e92f2;
  --hair: var(--vp-c-divider); --shadow: rgba(0, 0, 0, 0);
}
</style>
