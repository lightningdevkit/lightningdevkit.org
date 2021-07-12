module.exports = {
  capitalize (value) {
    return value.replace(/^\w/, c => c.toUpperCase())
  }
}
