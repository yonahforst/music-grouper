const { test } = require('tap')
const proxyquire = require('proxyquire')

const index = proxyquire('../index', {
  'bandcamp-scraper': {
    getAlbumInfo: (url, cb) => {
      cb(null, {
        artist: 'bandcamp',
        title: url,
      })
    }
  }
})

test('getDetailsFromUrl', async assert => {
  const expected = {
    artist: 'bandcamp',
    title: 'http://some.url',
  }

  const result = await index.getDetailsFromUrl('http://some.url')

  assert.deepEquals(result, expected, 'fetches track info')
})