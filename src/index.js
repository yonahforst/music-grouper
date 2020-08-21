

const {
  batchSet,
  getMeta,
  setMeta,
} = require('./lib/storage')

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

  for await (let res of messageGroupIterator) {
    const items = parseWhatsAppMessages(res.messages)

    console.log('GOT NEW ITEMS:', items.length)

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

module.exports.addTrack = async (track) => {
  console.log('WILL ADD TRACK', track)

  if (!track.url)
    return

  const serviceName = getServiceNameFromUrl(track.url)
  const service = adapters[serviceName]

  if (!service)
    return false

  if (service.init)
    await service.init()

  const sanitizedUrl = track.url.replace(/^[\s.]+|[\s.]+$/g,"");
  await service.addTrack(sanitizedUrl)

  return true
}