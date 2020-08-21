const getUrlsFromMessage = require('./getUrlsFromMessage')

const messageReducer = (p, c) => {
  const urls = getUrlsFromMessage(c)

  return [
    ...p,
    ...urls.map((url, index) => ({
      url,
      id: `${c.key.id}-${index}`,
      metadata: c,
    }))
  ]
}

module.exports = messages => messages.reduce(messageReducer, [])