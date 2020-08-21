const { test } = require('tap')
const proxyquire = require('proxyquire')

const credentialsKey = 'accessToken/whatsapp'
const secrets = {}
let credentialsSet

const auth = proxyquire('../auth', {
  '../../lib/secrets': {
    get: key => secrets[key],
  },
  './_client': {
    connectSlim: async credentials => credentialsSet = credentials,
    authInfo: {},
  }
})

test('init - missing credentials', assert => {
  assert.rejects(auth.init(), new Error('credentialsMissing: whatsapp'), 'rejects if credentials are missing')
  assert.end()
})


test('init - valid credentials', async assert => {

  const expected = {
    foo: 'bar',
  }

  secrets[credentialsKey] = expected

  await auth.init()

  assert.deepEqual(credentialsSet, expected, 'loads credentials from storage and sets them')
})