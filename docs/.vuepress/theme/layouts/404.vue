<template>
  <LayoutWrap>
    <main class="page">
      <div class="theme-default-content">
        <h1>404 - Not Found</h1>

        <blockquote>{{ getMsg() }}</blockquote>

        <RouterLink to="/">
          Take me home.
        </RouterLink>
      </div>
    </main>
  </LayoutWrap>
</template>

<script>
import LayoutWrap from '@theme/components/LayoutWrap.vue'

const msgs = [
  `There's nothing here.`,
  `How did we get here?`,
  `That's a Four-Oh-Four.`,
  `Looks like we've got some broken links.`
]

export default {
  name: 'NotFound',

  components: {
    LayoutWrap
  },

  methods: {
    getMsg () {
      return msgs[Math.floor(Math.random() * msgs.length)]
    }
  }
}
</script>
