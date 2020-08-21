const { test } = require('tap')
const proxyquire = require('proxyquire')

let tracksRemovedFromPlaylist

const playlist = proxyquire('../playlist', {
  '../../../config.json': {
    spotify: {
      playlistId: 'playlist-123'
    }
  },
  './_client': {
    getAlbumTracks: async id => ({
      body: {
        items: [{
          uri: 'spotify:track:1-' + id,
        }, {
          uri: 'spotify:track:2-' + id,
        }, {
          uri: 'spotify:track:3-' + id,
        }]
      }
    }),
    addTracksToPlaylist: async (playlistId, uris) => ({
      playlistId,
      uris,
    }),
    removeTracksFromPlaylist: async (playlistId, uris) => {
      tracksRemovedFromPlaylist = { playlistId, uris }
    }
  }
})


test('addTrack', async assert => {
  const expected = {
    playlistId: 'playlist-123',
    uris: [ 'spotify:track:some-great-hit' ]
  }

  const expectedRemoved = {
    playlistId: 'playlist-123',
    uris: [{ uri: 'spotify:track:some-great-hit' }]
  }

  const result = await playlist.addTrack('https://open.spotify.com/track/some-great-hit')
  
  assert.deepEquals(tracksRemovedFromPlaylist, expectedRemoved, 'first removes uris')
  assert.deepEquals(result, expected, 'then add track from url')
})


test('addTrack - album', async assert => {
  const expected = {
    playlistId: 'playlist-123',
    uris: [ 'spotify:track:1-some-great-hit', 'spotify:track:2-some-great-hit', 'spotify:track:3-some-great-hit' ]
  }

  const result = await playlist.addTrack('https://open.spotify.com/album/some-great-hit')
  
  assert.deepEquals(result, expected, 'add album from url')
})
