<script setup lang="ts">
interface Feature {
  symbolId: string
  title: string
  details: string
}

const features: Feature[] = [
  {
    symbolId: 'customizable',
    title: 'Flexible and customizable',
    details:
      "Persistence. Networking. Chain sourcing. Routing. Key management. You name it. LDK easily configures to your application's needs.",
  },
  {
    symbolId: 'focus',
    title: 'High performance',
    details:
      'As lightweight and compact as you need it to be, LDK performs on small-footprint devices and scales in the cloud.',
  },
  {
    symbolId: 'mobile',
    title: 'Any language, any platform',
    details:
      'LDK provides a multi-language native API. Run a Lightning node on mobile, web, HSMs, LSPs, or your existing infrastructure.',
  },
]
</script>

<template>
  <section class="home-features vp-home-extras">
    <div class="home-features-grid">
      <article
        v-for="feature in features"
        :key="feature.symbolId"
        class="home-feature"
      >
        <div class="home-feature-icon">
          <svg viewBox="0 0 202 202" aria-hidden="true">
            <use :href="`/img/illustrations.svg#${feature.symbolId}`" />
          </svg>
        </div>
        <h2 class="home-feature-title">{{ feature.title }}</h2>
        <p class="home-feature-details">{{ feature.details }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.home-features {
  padding-top: 64px;
  padding-bottom: 64px;
}

.home-features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 961px) {
  .home-features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.home-feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 8px 0;
}

.home-feature-icon svg {
  display: block;
  width: 144px;
  height: 144px;
}

.home-feature-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  border: 0;
  padding: 0;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.home-feature-details {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.6;
}
</style>
