<template>
  <footer class="footer">
    <div class="wrap">
      <div class="wrap-border">
        Copyright © 2021 LDK Developers
      </div>
    </div>
  </footer>
</template>

<style lang="stylus">
.footer
  border-top var(--docs-border-dashed)
  @media (min-width: $MQNarrow)
    position relative
    z-index 10
  .wrap-border
    padding var(--docs-space-l)
    @media (min-width: $MQMobile)
      padding-left 19.5rem !important
    @media (min-width: $MQNarrow)
      padding-left 23.6rem !important
</style>
