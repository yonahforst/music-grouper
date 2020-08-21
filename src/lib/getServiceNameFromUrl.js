module.exports = url => {
  const { hostname } = new URL(url);

  if (hostname.includes('spotify'))
    return 'spotify'

  return hostname
}