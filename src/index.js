

const {
  batchSet,
  getMeta,
  setMeta,
} = require('./lib/storage')

const {
  publish,
} = require('./lib/notify')

const {
  appName,
} = require('./lib/env')

const adapters = require('./adapters')

const parseWhatsAppMessages = require('./lib/parseWhatsAppMessages')
const getServiceNameFromUrl = require('./lib/getServiceNameFromUrl')


module.exports.fetchLatestMessages = async () => {  
  const { 
    whatsapp
  } = adapters

  await whatsapp.init()

  const {
    paginationToken,
  } = await getMeta() || {}

  const messageGroupIterator = whatsapp.getGroupMessages({
    paginationToken
  })  

  let totalMessages = 0

  for await (let res of messageGroupIterator) {
    const items = parseWhatsAppMessages(res.messages)
    totalMessages = totalMessages + items.length
    console.log(`GOT ${items.length} NEW ITEMS. (${totalMessages} total)`)

    if (items.length > 0)
      await batchSet(items)

    await setMeta({
      paginationToken: res.nextPaginationToken,
    })
  }
};

module.exports.handleAuthResponse = async ({ 
  serviceName,
  response
}) => {
  const service = adapters[serviceName]

  if (!service)
    throw new Error('unknownService: ' + serviceName)

  await service.handleAuthResponse(response)

  return true
}

module.exports.addTrack = async ({ url }) => {
  console.log('WILL ADD URL', url)
  const { spotify } = adapters
  if (!url)
    return

  // try to load an adapter for this service. If we can't then quit  
  const serviceName = getServiceNameFromUrl(url)
  const service = adapters[serviceName]
  if (!service)
    return

  await spotify.init()

  // remove trailing and leading periods and spaces
  const sanitizedUrl = url.replace(/^[\s.]+|[\s.]+$/g,"");

  // if this is a spotify url, we can add it directly
  if (serviceName === 'spotify') {
    await spotify.addTrack(sanitizedUrl)
    return true
  }

  // try to get the track artist and title. If we can't then quit
  const trackInfo = await service.getDetailsFromUrl(sanitizedUrl).catch(console.warn)
  if (!trackInfo)
    return

  // try to find this track on spotify. If we can't then quit
  const spotifyTrack = await spotify.findTrack(trackInfo)
  if (!spotifyTrack)
    return

  await spotify.addTrack(spotifyTrack.uri)
  return true
}

module.exports.login = async (serviceName) => {
  const service = adapters[serviceName]

  if (!service)
    throw new Error('unknownService: ' + serviceName)
  
  const body = await service.generateLogin()

  await publish(`${appName} wants you to login to ${serviceName}:\n${body}`)
}