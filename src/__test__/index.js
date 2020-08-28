const { test, beforeEach } = require('tap')
const proxyquire = require('proxyquire')

let authResponse
let trackAdded
let didInit 
let meta
let didPublish
let items = []

beforeEach(done => {
  authResponse = null
  trackAdded = null
  didInit = null
  meta = null
  didPublish = null
  items = []
  done()
})

const index = proxyquire('../index', {
  './adapters': {
    whatsapp: {
      init: async () => didInit = 'whatsapp',
      generateLogin: async () => 'whatsappLogin',
      getGroupMessages: ({ paginationToken }) => [{
        messages: [ 'message1', 'message2' ],
        nextPaginationToken: paginationToken + 1,
      }, {
        messages: [ 'message3', 'message4' ],
        nextPaginationToken: paginationToken + 2,
      }]
    },
    spotify: {
      init: async () => didInit = 'spotify',
      handleAuthResponse: async response => authResponse = response,
      addTrack: async uri => trackAdded = { uri },
      generateLogin: async () => 'spotifyLogin',
      findTrack: async track => {
        if (track.title.includes('unknown'))
          return

        return { uri: JSON.stringify(track) }
      }
    },
    bandcamp: {
      getDetailsFromUrl: async url => ({
        artist: 'bandcamp',
        title: url,
      })
    },
    soundcloud: {
      getDetailsFromUrl: async url => ({
        artist: 'soundcloud',
        title: url,
      })
    },
    youtube: {
      getDetailsFromUrl: async url => ({
        artist: 'youtube',
        title: url,
      })
    },
    'throwerror.com': {
      getDetailsFromUrl: async () => { throw 'some-error' }
    }
  },
  './lib/storage': {
    batchSet: async i => items.push(...i),
    getMeta: async () => meta,
    setMeta: async m => meta = m,
  },
  './lib/parseWhatsAppMessages': messages => messages,
  './lib/notify': {
    publish: str => didPublish = str
  },
  './lib/env': {
    appName: 'fooApp'
  },
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

test('login - spotify', async assert => {
  const expected = 'fooApp wants you to login to spotify:\nspotifyLogin'
  await index.login('spotify')

  assert.equals(didPublish, expected, 'publishes login notification')
})

test('login - whatsapp', async assert => {
  const expected = 'fooApp wants you to login to whatsapp:\nwhatsappLogin'
  await index.login('whatsapp')

  assert.equals(didPublish, expected, 'publishes login notification')
})


test('addTrack - spotify', async assert => {

  const expected = { uri: 'http://spotify.com/some-track' }

  await index.addTrack({ 
    url: 'http://spotify.com/some-track .' // should sanitize the url
  })

  assert.equals(didInit, 'spotify', 'didInit')
  assert.deepEquals(trackAdded, expected, 'adds track to spotify')
})

test('addTrack - bandcamp', async assert => {
  const expected = { uri: '{"artist":"bandcamp","title":"http://bandcamp.com/some-track"}' }

  await index.addTrack({ 
    url: 'http://bandcamp.com/some-track .' // should sanitize the url
  })

  assert.equals(didInit, 'spotify', 'didInit')
  assert.deepEquals(trackAdded, expected, 'adds track to spotify')
})

test('addTrack - soundcloud', async assert => {
  const expected = { uri: '{"artist":"soundcloud","title":"http://soundcloud.com/some-track"}' }

  await index.addTrack({ 
    url: 'http://soundcloud.com/some-track .' // should sanitize the url
  })

  assert.equals(didInit, 'spotify', 'didInit')
  assert.deepEquals(trackAdded, expected, 'adds track to spotify')
})


test('addTrack - youtube', async assert => {
  const expected = { uri: '{"artist":"youtube","title":"http://youtube.com/some-track"}' }

  await index.addTrack({ 
    url: 'http://youtube.com/some-track .' // should sanitize the url
  })

  assert.equals(didInit, 'spotify', 'didInit')
  assert.deepEquals(trackAdded, expected, 'adds track to spotify')
})

test('addTrack - unknown', async assert => {
  await index.addTrack({ 
    url: 'http://unknown.com/some-track'
  })

  assert.equal(didInit, null, 'does not init spotify')
  assert.equals(trackAdded, null, 'does not add track to spotify')
})

test('addTrack - error getting title', async assert => {
  await index.addTrack({ 
    url: 'http://throwerror.com/some-track'
  })

  assert.equals(didInit, 'spotify', 'didInit')
  assert.equals(trackAdded, null, 'does not add track to spotify')
})

test('addTrack - missing on spotify', async assert => {
  await index.addTrack({ 
    url: 'http://youtube.com/unknown-track .' // should sanitize the url
  })

  assert.equals(didInit, 'spotify', 'didInit')
  assert.equals(trackAdded, null, 'does not add track to spotify')
})