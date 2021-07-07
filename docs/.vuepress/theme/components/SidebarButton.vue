<template>
  <div
    class="sidebar-button"
    @click="$emit('toggle-sidebar')"
  >
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="icon">
      <g class="hamburger" fill="currentColor">
        <path d="M33.75 11.6699H6.25C5.55964 11.6699 5 12.2296 5 12.9199C5 13.6103 5.55964 14.1699 6.25 14.1699H33.75C34.4404 14.1699 35 13.6103 35 12.9199C35 12.2296 34.4404 11.6699 33.75 11.6699Z"/>
        <path d="M28.75 18.752H6.25C5.55964 18.752 5 19.3116 5 20.002C5 20.6923 5.55964 21.252 6.25 21.252H28.75C29.4404 21.252 30 20.6923 30 20.002C30 19.3116 29.4404 18.752 28.75 18.752Z"/>
        <path d="M33.75 25.8301H6.25C5.55964 25.8301 5 26.3897 5 27.0801C5 27.7704 5.55964 28.3301 6.25 28.3301H33.75C34.4404 28.3301 35 27.7704 35 27.0801C35 26.3897 34.4404 25.8301 33.75 25.8301Z"/>
      </g>
      <g class="close" stroke="currentColor">
        <path d="M10 10L30 30" stroke-width="2" stroke-linecap="round"/>
        <path d="M30 10L10 30" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>
  </div>
</template>

<style lang="stylus">
.sidebar-button
  cursor pointer
  display none
  width 35px
  height 35px
  .icon
    display block
    width 100%
    height 100%
    .close
      display none

@media (max-width: $MQMobile)
  .sidebar-button
    display block

.sidebar-open
  .icon
    .close
      display block
    .hamburger
      display none
</style>
