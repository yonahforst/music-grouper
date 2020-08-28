module.exports = url => {
  const { hostname } = new URL(url);

  if (hostname.includes('spotify'))
    return 'spotify'

  if (hostname.includes('youtu'))
    return 'youtube'
  
  if (hostname.includes('soundcloud'))
    return 'soundcloud'

  if (hostname.includes('bandcamp'))
    return 'bandcamp'

  return hostname
}