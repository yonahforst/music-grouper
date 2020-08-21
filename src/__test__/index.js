const { test, beforeEach } = require('tap')
const proxyquire = require('proxyquire')


let authResponse
let trackAdded
let didInit 
let meta
let items = []

beforeEach(done => {
  authResponse = null
  trackAdded = null
  didInit = null
  meta = null
  items = []
  done()
})

const index = proxyquire('../index', {
  './adapters': {
    whatsapp: {
      init: () => didInit = 'whatsapp',
      getGroupMessages: ({ paginationToken }) => [{
        messages: [ 'message1', 'message2' ],
        nextPaginationToken: paginationToken + 1,
      }, {
        messages: [ 'message3', 'message4' ],
        nextPaginationToken: paginationToken + 2,
      }]
    },
    spotify: {
      init: () => didInit = 'spotify',
      handleAuthResponse: response => authResponse = response,
      addTrack: uri => trackAdded = { uri }
    }
  },
  './lib/storage': {
    batchSet: i => items.push(...i),
    getMeta: () => meta,
    setMeta: m => meta = m,
  },
  './lib/parseWhatsAppMessages': messages => messages,
})


test('fetchLatestMessages', async assert => {
  meta = { paginationToken: 3 }
  const expectedItems = [ 'message1', 'message2', 'message3', 'message4' ]
  const expectedMeta = { paginationToken: 5 }
  
  await index.fetchLatestMessages()

  assert.equals(didInit, 'whatsapp', 'didInit')
  assert.deepEquals(items, expectedItems, 'sets items')
  assert.deepEquals(meta, expectedMeta, 'sets meta')
})

test('handleAuthResponse', async assert => {

  const expected = { foo: 'bar' }
  await index.handleAuthResponse({ 
    serviceName: 'spotify',
    response: { foo: 'bar' },
  })

  assert.deepEquals(authResponse, expected, 'sends auth response to correct service')
  assert.rejects(
    index.handleAuthResponse({ serviceName: 'illegal' }), 
    new Error('unknownService: illegal'),
    'throws for unknown service'
  )
})


test('addTrack', async assert => {

  const expected = { uri: 'http://spotify.com/some-track' }

  await index.addTrack({ 
    url: 'http://spotify.com/some-track .' // should sanitize the url
  })

  assert.equals(didInit, 'spotify', 'didInit')
  assert.deepEquals(trackAdded, expected, 'adds track to to correct service')
})