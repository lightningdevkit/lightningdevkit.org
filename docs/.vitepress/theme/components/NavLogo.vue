<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <a class="nav-logo-link" :href="withBase('/')" aria-label="Lightning Dev Kit Documentation">
    <svg role="img" class="logo" aria-hidden="true" preserveAspectRatio="xMinYMid meet">
      <use class="small" :href="withBase('/img/logo.svg#small')" />
      <use class="large" :href="withBase('/img/logo.svg#large')" />
    </svg>
  </a>
</template>

<style scoped>
.nav-logo-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--vp-c-brand-1);
}

/* The `logo.svg` sprite uses fill="currentColor", so setting `color`
   on the SVG flows down to the paths. */
.logo {
  height: 28px;
  width: 70px;
  display: block;
  color: var(--vp-c-brand-1);
}

/* Sprite has two variants: `#small` (bolt + LDK condensed) and
   `#large` (bolt + LIGHTNING DEV KIT). Mobile base shows the condensed
   mark; the wider breakpoint below swaps in the full wordmark. */
.logo .small {
  display: inline;
}
.logo .large {
  display: none;
}

@media (min-width: 641px) {
  .logo {
    width: 200px;
    height: 36px;
  }
  .logo .small {
    display: none;
  }
  .logo .large {
    display: inline;
  }
}
</style>
