<template>
  <footer class="footer">
    <div class="wrap">
      <div class="wrap-border">
        <div class="inner">
          Copyright © 2021 LDK Developers
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="stylus">
.footer
  @media (min-width: $MQNarrow)
    position relative
    z-index 10
  .wrap-border
    border-top var(--docs-border-dashed)
    padding var(--docs-space-l)
    @media (min-width: $MQMobile)
      padding-left 19.5rem !important
    @media (min-width: $MQNarrow)
      padding-left 23.6rem !important
      .inner
        padding-left 1.6rem
        padding-right 1.6rem
</style>
