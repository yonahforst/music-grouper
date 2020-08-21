const client = require('./_client')
const { 
  parse, 
  formatURI,
} = require('spotify-uri')

const {
  spotify: {
    playlistId,
  },
} = require('../../../config.json')

const tracksFromUri = async uri => {
  try {
    const parsed = parse(uri);
    
    if (parsed.type == 'track') {
      return [ formatURI(parsed) ]
    } else if (parsed.type == 'album') {
      const { body } = await client.getAlbumTracks(parsed.id)
      return body.items.map(t => t.uri)
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports.addTrack = async (uri) => {
  const trackUris = await tracksFromUri(uri)
  
  if (!trackUris)
    return 

  await client.removeTracksFromPlaylist(playlistId, trackUris.map(uri => ({ uri })))

  return client.addTracksToPlaylist(playlistId, trackUris, { position: 0 })
}