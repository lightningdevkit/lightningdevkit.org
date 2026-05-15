<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <a class="nav-logo-link" :href="withBase('/')" aria-label="Lightning Dev Kit Documentation">
    <svg role="img" class="logo" aria-hidden="true">
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
  height: 36px;
  width: 200px;
  display: block;
  color: var(--vp-c-brand-1);
}

/* Sprite has two variants: `#small` (bolt + LDK condensed) and
   `#large` (bolt + LIGHTNING DEV KIT). Show one based on viewport. */
.logo .small {
  display: none;
}
.logo .large {
  display: inline;
}

@media (max-width: 640px) {
  .logo {
    width: 70px;
    height: 28px;
  }
  .logo .small {
    display: inline;
  }
  .logo .large {
    display: none;
  }
}
</style>
