const { test, beforeEach } = require('tap')
const proxyquire = require('proxyquire')


let secrets = {}
let credentialsSet
let refreshTokenSet

const credentialsKey = 'accessToken/spotify'

beforeEach((done) => {
  secrets = {}
  credentialsSet = null
  refreshTokenSet = null

  done()
})

const auth = proxyquire('../auth', {
  './_client': {
    createAuthorizeURL: scopes => 'http://some.url?' + scopes.join('+'),
    setCredentials: credentials => credentialsSet = credentials,
    setRefreshToken: refreshToken => refreshTokenSet = refreshToken,
    authorizationCodeGrant: async (code) => ({
      body: {
        access_token: 'access-token-' + code,
        refresh_token: 'refresh-token-' + code,
        expires_in: 600,
      }
    }),
    refreshAccessToken: async () => ({
      body: {
        access_token: 'access-token-refreshed',
        expires_in: 600,
      }
    }),
  },
  '../../lib/secrets': {
    get: async key => secrets[key],
    set: async (key, value) => secrets[key] = value,
  }
})

test('createAuthorizeURL', assert => {
  const expected = 'http://some.url?playlist-modify-public+playlist-modify-private'
  const result = auth.createAuthorizeURL()
  assert.deepEqual(result, expected, 'returns an oauth url')
  assert.end()
})

test('handleAuthResponse', async assert => {
  
  const expected = {
    accessToken: 'access-token-foo',
    refreshToken: 'refresh-token-foo',
    expiresAt: /\d+/,
  }
  
  await auth.handleAuthResponse({ code: 'foo' })

  assert.match(secrets[credentialsKey], expected, 'stores credentials in secrets')
  assert.match(credentialsSet, expected, 'sets credentials on client')
})

test('init - missing credentials', assert => {
  assert.rejects(auth.init(), new Error('credentialsMissing: spotify'), 'rejects if credentials are missing')
  assert.end()
})


test('init - expired credentials', async assert => {
  secrets[credentialsKey] = {
    refreshToken: 'refresh-token-foobar',
    expiresAt: 0,
  }

  const expected = {
    accessToken: 'access-token-refreshed',
    refreshToken: 'refresh-token-foobar',
    expiresAt: /\d+/,
  }

  await auth.init()

  assert.match(secrets[credentialsKey], expected, 'stores credentials in secrets')
  assert.match(credentialsSet, expected, 'sets credentials on client')
})


test('init - valid credentials', async assert => {
  const expected = {
    refreshToken: 'refresh-token-foobar',
    accessToken: 'access-token-foobar',
    expiresAt: Date.now() + 999999999,
  }

  secrets[credentialsKey] = expected

  await auth.init()

  assert.match(secrets[credentialsKey], expected, 'stores credentials in secrets')
  assert.match(credentialsSet, expected, 'sets credentials on client')
})