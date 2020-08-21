const {
  fetchLatestMessages,
  handleAuthResponse,
  addTrack
} = require('./src')

const parseStreamEvent = require('./src/lib/parseStreamEvent')

module.exports.fetchMessagesCron = fetchLatestMessages

module.exports.oauthWebhook = async ({ 
  pathParameters={},
  queryStringParameters={},
}) => {
  return handleAuthResponse({
    serviceName: pathParameters.serviceName,
    response: queryStringParameters,
  })
}

module.exports.parseNewRecord = async ({
  Records
}) => {
  for (const record of Records) {
    const track = parseStreamEvent(record)
    await addTrack(track)
  }
}