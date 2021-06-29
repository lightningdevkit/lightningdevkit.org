const replaceYouTubeLinks = source =>
  source.replace(/\[(!.*)\]\((.*(youtube\.com\/watch|youtu\.be).*?)(?:\s"(.*?)")?\)/gi, (all, preview, url, text) => {
    const [, query] = url.match(/\?(.*)/) || url.match(/.*youtu\.be\/(.*)/)
    const params = query.split('&').reduce((res, param) => {
      let [key, val] = param.split('=')
      if (param === key) {
        key = 'v'
        val = param
      }
      return Object.assign(res, { [key]: val })
    }, {})
    const { v, t } = params
    const path = t ? `${v}?start=${t}` : `${v}?`

    return `
<a href="${url}" class="ytEmbed" data-id="${v}" style="background-image:url(https://img.youtube.com/vi/${v}/hqdefault.jpg);">
  <iframe
    title="YouTube"
    data-src="https://www.youtube-nocookie.com/embed/${path}&autoplay=1&autohide=1&modestbranding=1&color=white&rel=0"
    frameborder="0"
    allow="autoplay;encrypted-media;picture-in-picture"
    allowfullscreen
  ></iframe>
</a>`
  })

// https://webpack.js.org/api/loaders/
module.exports = function (source) {
  const { resourcePath } = this
  let processed = source
  processed = replaceYouTubeLinks(processed)
  return processed
}
