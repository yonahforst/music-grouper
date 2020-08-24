const client = require('./_client')
const QRCode = require('qrcode')

const {
  get,
  set,
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
  generateLogin: () => {
    const promise = new Promise(resolve => {
      client.onReadyForPhoneAuthentication = ([ref, publicKey, clientID]) => {
        QRCode.toString(`${ref},${publicKey},${clientID}`, (err, url) => {
          resolve('Scan in the whatsapp app. Expires in 30s \n' + url)
        })
      }
    })
    
    
    client.connectSlim()
    .then(() => set(CREDENTIALS_KEY, client.base64EncodedAuthInfo()))
    .then(() => {
      console.log('WHATSAPP LOGIN SUCCESS')
      client.close()
    })

    return promise
  }

}