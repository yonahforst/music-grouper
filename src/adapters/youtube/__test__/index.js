const { test } = require('tap')
const proxyquire = require('proxyquire')

const index = proxyquire('../index', {
  'yt-scraper': {
    videoInfo: async url => ({
      title: 'youtube - ' + url,
    })
  }
})

test('getDetailsFromUrl', async assert => {
  const expected = {
    artist: 'youtube',
    title: 'some url',
  }

  const result = await index.getDetailsFromUrl('some url')

  assert.deepEquals(result, expected, 'fetches track info')
})