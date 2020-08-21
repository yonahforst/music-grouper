const client = require('./_client')

const {
  get,
} = require('../../lib/secrets')

const CREDENTIALS_KEY = 'accessToken/whatsapp'

module.exports = {
  init: async () => {
    if (client.authInfo.clientID)
      return //youre already connected

    const credentials = await get(CREDENTIALS_KEY)

    if (!credentials)
      throw new Error('credentialsMissing: whatsapp')

    await client.connectSlim(credentials)
  },
}