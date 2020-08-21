const { test } = require('tap')
const proxyquire = require('proxyquire')

const client = proxyquire('../_client', {
  'spotify-web-api-node': function MockSpotify(config) {
    this.config = config
  },
  '../../../config.json': {
    spotify: {
      clientId: 'some-client-id',
      clientSecret: 'some-client-secret',
      redirectUri: 'some-redirect-uri',
    }
  }
})

test('client', assert => {

  const expected = {
    clientId: 'some-client-id',
    clientSecret: 'some-client-secret',
    redirectUri: 'some-redirect-uri',
  }

  assert.deepEqual(client.config, expected, 'instantiates from config.json')
  assert.end()
})