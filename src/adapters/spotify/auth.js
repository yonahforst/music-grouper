const client = require('./_client')
const { get, set } = require('../../lib/secrets')

const CREDENTIALS_KEY = 'accessToken/spotify'

const scopes = ['playlist-modify-public', 'playlist-modify-private']

module.exports.createAuthorizeURL = () => client.createAuthorizeURL(scopes)

module.exports.handleAuthResponse = async ({ code }) => {
  const { body } = await client.authorizationCodeGrant(code)

  const credentials = {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  }

  await set(CREDENTIALS_KEY, credentials)

  client.setCredentials(credentials)
}

module.exports.init = async () => {  
  let credentials = await get(CREDENTIALS_KEY)
  if (!credentials)
    throw new Error('credentialsMissing: spotify')

  if (credentials.expiresAt < Date.now()) {
    client.setRefreshToken(credentials.refreshToken)

    const { body } = await client.refreshAccessToken()
    
    credentials = {
      ...credentials,
      accessToken: body.access_token,
      expiresAt: Date.now() + body.expires_in * 1000,
    }

    await set(CREDENTIALS_KEY, credentials)
    console.log('did refresh credentials: spotify')
  }

  client.setCredentials(credentials)
}