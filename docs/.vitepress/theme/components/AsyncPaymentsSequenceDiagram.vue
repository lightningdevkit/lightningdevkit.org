<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { withBase } from 'vitepress'

// Reusable async-payments sequence diagram, embedded in both the blog post
// (/blog/async-payments-receiving-while-offline) and the implementation guide
// (/async-payments). Single source of truth so the two pages stay in sync.
//
// The image is a 2x render of the "Async Payments Diagram" sequence view from
// the Claude Design project; the card is light-only, so the figure sits on a
// light surface in both colour modes. Clicking it opens a full-screen
// lightbox so the detail is legible at full size.
const src = withBase('/img/async-payments-sequence.png')

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
</script>

<template>
  <figure class="async-payments-diagram">
    <img
      :src="src"
      alt="Sequence diagram: an async payment flows from sender to an often-offline recipient via their LSPs — the sender fetches a static invoice, locks the HTLC on hold with its LSP, leaves an onion message, and the recipient releases the payment when it next comes online."
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
      <img :src="src" alt="" />
    </div>
  </Teleport>
</template>

<style scoped>
.async-payments-diagram {
  margin: 32px auto;
  max-width: 760px;
}

.async-payments-diagram img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
  /* The diagram is a light-mode card; keep it on a light surface so it reads
     cleanly in dark mode too. */
  background: #ffffff;
  cursor: zoom-in;
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
  background: #ffffff;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
}
</style>
