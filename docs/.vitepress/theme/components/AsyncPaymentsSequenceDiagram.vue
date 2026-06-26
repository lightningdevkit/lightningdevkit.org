<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { withBase } from 'vitepress'

// Reusable async-payments sequence diagram, embedded in both the blog post
// (/blog/async-payments-receiving-while-offline) and the implementation guide
// (/async-payments). Single source of truth so the two pages stay in sync.
//
// Both images are 2x renders of the "Async Payments Diagram" sequence view
// from the Claude Design project, one per colour mode. The active image is
// chosen purely by CSS off the `html.dark` class VitePress sets before paint,
// so there's no theme flash. Clicking the diagram opens a full-screen
// lightbox so the detail is legible at full size.
const light = withBase('/img/async-payments-sequence.png')
const dark = withBase('/img/async-payments-sequence-dark.png')

const zoomed = ref(false)

function open() {
  zoomed.value = true
}
function close() {
  zoomed.value = false
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// Lock background scroll and wire Escape only while the lightbox is open.
watch(zoomed, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) {
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})

const alt =
  'Sequence diagram: an async payment flows from sender to an often-offline ' +
  'recipient via their LSPs — the sender fetches a static invoice, locks the ' +
  'HTLC on hold with its LSP, leaves an onion message, and the recipient ' +
  'releases the payment when it next comes online.'
</script>

<template>
  <figure class="async-payments-diagram">
    <img
      class="diagram-light"
      :src="light"
      :alt="alt"
      width="960"
      height="938"
      loading="lazy"
      role="button"
      tabindex="0"
      aria-label="Zoom in on the async payments sequence diagram"
      @click="open"
      @keydown.enter.prevent="open"
      @keydown.space.prevent="open"
    />
    <img
      class="diagram-dark"
      :src="dark"
      :alt="alt"
      width="960"
      height="938"
      loading="lazy"
      role="button"
      tabindex="0"
      aria-label="Zoom in on the async payments sequence diagram"
      @click="open"
      @keydown.enter.prevent="open"
      @keydown.space.prevent="open"
    />
    <figcaption>
      How an async payment flows from sender to an often-offline recipient via
      their LSPs.
    </figcaption>
  </figure>

  <Teleport to="body">
    <div
      v-if="zoomed"
      class="async-payments-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Async payments sequence diagram, enlarged"
      @click="close"
    >
      <img class="lb-light" :src="light" alt="" />
      <img class="lb-dark" :src="dark" alt="" />
    </div>
  </Teleport>
</template>

<style scoped>
.async-payments-diagram {
  margin: 32px auto;
  max-width: 760px;
}

/* Shared visual styling — note `display` is intentionally NOT set here, so the
   per-image show/hide rules below win without a specificity fight. */
.async-payments-diagram img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  cursor: zoom-in;
}

.async-payments-diagram .diagram-light {
  background: #ffffff;
}

.async-payments-diagram .diagram-dark {
  background: #1a1a1e;
}

.async-payments-diagram figcaption {
  margin-top: 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  text-align: center;
}

.async-payments-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vmin;
  background: rgba(0, 0, 0, 0.8);
  cursor: zoom-out;
}

.async-payments-lightbox img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
}

/* Theme-driven swap: show one image per colour mode. VitePress sets the
   `html.dark` class before paint, so there's no flash. The `html.dark`
   selectors outrank the defaults on specificity. */
.diagram-dark,
.lb-dark {
  display: none;
}
.diagram-light,
.lb-light {
  display: block;
}
html.dark .diagram-dark,
html.dark .lb-dark {
  display: block;
}
html.dark .diagram-light,
html.dark .lb-light {
  display: none;
}
</style>
