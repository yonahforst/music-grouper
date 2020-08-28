const { test } = require('tap')
const proxyquire = require('proxyquire')

const search = proxyquire('../search', {
  './_client': {
    searchTracks: qs => ({
      body: {
        tracks: {
          items: [
            qs
          ]
        }
      }
    })
  }
})
test('search', async assert => {
  const expected = 'track:foo artist:bar'

  const result = await search.findTrack({ artist: 'bar', title: 'foo' })

  assert.deepEquals(result, expected, 'returns first result')
})