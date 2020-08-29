const {
  fetchLatestMessages,
  handleAuthResponse,
  addTrack,
  login,
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

module.exports.processNewRecord = async ({
  Records
}) => {
  for (const record of Records) {
    const track = parseStreamEvent(record)
    await addTrack(track)
  }
}

// use the old style callback to prevent lambda from closing 
// as soon as a promise is returned. This way it says open until
// the event loop is empty. We need this because the whatsapp login
// is async, it requires the user to scan the QR code and only then
// do we get credentials which we can save. So it's important for
// the function to stay awake long enough to receive and save those.

module.exports.loginToServices = ({
  serviceNames,
}, context, callback) => {
  for (const serviceName of serviceNames) {
    login(serviceName)
  }
  callback()
}