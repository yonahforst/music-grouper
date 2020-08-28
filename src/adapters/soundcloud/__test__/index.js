const { test } = require('tap')
const proxyquire = require('proxyquire')

const index = proxyquire('../index', {
  'soundcloud-scraper': {
    getSongInfo: async url => ({
      title: url,
      author: { name: 'soundcloud' },
    })
  }
})

test('getDetailsFromUrl', async assert => {
  const expected = {
    artist: 'soundcloud',
    title: 'http://some.url',
  }

  const result = await index.getDetailsFromUrl('http://some.url')

  assert.deepEquals(result, expected, 'fetches track info')
})