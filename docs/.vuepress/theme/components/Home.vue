<template>
  <main class="home">
    <header class="hero">
      <div class="hero-inner">
        <img
          v-if="data.heroImage"
          :src="$withBase(data.heroImage)"
          :alt="data.heroAlt || 'hero'"
        >

        <h1
          v-if="data.heroText !== null"
          id="main-title"
        >
          {{ data.heroText || $title || 'Hello' }}
        </h1>

        <p
          v-if="data.tagline !== null"
          class="description"
        >
          {{ data.tagline || $description || 'Welcome to your VuePress site' }}
        </p>

        <p
          v-if="data.actionText && data.actionLink"
          class="action"
        >
          <NavLink
            class="action-button"
            :item="actionLink"
          />
        </p>
      </div>
    </header>

    <div
      v-if="data.features && data.features.length"
      class="features"
    >
      <div
        v-for="(feature, index) in data.features"
        :key="index"
        class="feature"
      >
        <img v-if="feature.image" :src="`/img/illustration/${feature.image}.svg`" :alt="feature.title" />
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.details }}</p>
      </div>
    </div>

    <Content class="theme-default-content custom" />
  </main>
</template>

<script>
import NavLink from '@theme/components/NavLink.vue'

export default {
  name: 'Home',

  components: { NavLink },

  computed: {
    data () {
      return this.$page.frontmatter
    },

    actionLink () {
      return {
        link: this.data.actionLink,
        text: this.data.actionText
      }
    }
  }
}
</script>

<style lang="stylus">
.home
  padding $navbarHeight 0 0
  display block
  width 100%
  .hero
    margin 0 calc(var(--docs-wrap-space-inner) * -1)
    border-bottom var(--docs-border-dashed)
    h1
      font-size 64px
      margin-top 0
      margin-bottom var(--docs-space-s)
    .description
      margin-bottom var(--docs-space-l)
    .description
      max-width 35rem
      font-size 1.6rem
      line-height 1.3
    .action-button
      display inline-block
      font-size 1.2rem
      color #fff
      background-color $accentColor
      padding var(--docs-space-s) var(--docs-space-m);
      border-radius 4px
      transition background-color .1s ease
      box-sizing border-box
      background linear-gradient(291.12deg, #0F31F7 23.78%, #76F3CD 102.85%);
      border-radius 8px
      &:hover
        background-color lighten($accentColor, 10%)
    .hero-inner
      padding var(--docs-space-l)
  .intro
    margin 0 calc(var(--docs-wrap-space-inner) * -1)
    border-bottom var(--docs-border-dashed)
    padding var(--docs-space-l)
    text-align center
    h2
      margin 0 0 var(--docs-space-s)
    p
      max-width 35rem
      margin 0 auto
  .features
    display flex
    justify-content space-between
    margin 0 calc(var(--docs-wrap-space-inner) * -1)
  .feature
    flex 1 1 33.333333%
    padding var(--docs-space-l)
    border-bottom var(--docs-border-dashed)
    + .feature
      border-left var(--docs-border-dashed)
    h2
      font-size 24px
      line-height 33px
      border-bottom none
      margin-bottom var(--docs-space-s)
      padding-bottom 0
    p
      max-width 35rem
      &:last-child
        margin 0
    img
      display block
      margin 0 auto
      width 200px
      height 200px
  .content__default
    .features
      display flex
      flex-wrap wrap
      padding 0
    .feature
      flex 1 1 50%
      border-bottom var(--docs-border-dashed)
      h2, h3, h4, h5, h6
        margin-top 0

@media (min-width: $MQMobile)
  .home
    .content__default
      .feature:nth-last-of-type(-n+2)
        border-bottom 0
      .feature:nth-child(odd)
        border-left 0

@media (max-width: $MQMobile)
  .home
    .features
      flex-direction column
      flex-basis 100%
    .feature
      + .feature
        border-left 0
      img
        margin 0
    .content__default
      .feature:last-child
        border-bottom 0

@media (max-width: $MQMobileNarrow)
  .home
    .hero
      .hero-inner
        padding-left var(--docs-space-m)
        padding-right var(--docs-space-m)
        h1
          font-size 2rem
        .description
          font-size 1.2rem
    .feature
      padding-left var(--docs-space-m)
      padding-right var(--docs-space-m)
      img
        margin 0

@media (min-width: $MQNarrow)
  .home
    .hero-inner
    .content__default
      max-width 48rem
      margin 0 auto
      border-left var(--docs-border-dashed)
      border-right var(--docs-border-dashed)
      .intro,
      .features
        margin-left 0
        margin-right 0
</style>
