const COLOR_MODES = ['light', 'dark']
const THEME_ATTR = 'data-theme'
const STORE_ATTR = 'theme'

function setColorMode(mode) {
  if (COLOR_MODES.includes(mode)) {
    window.localStorage.setItem(STORE_ATTR, mode)
    document.documentElement.setAttribute(THEME_ATTR, mode)
  }
}

module.exports = {
  COLOR_MODES,
  STORE_ATTR,
  THEME_ATTR,
  setColorMode
}
