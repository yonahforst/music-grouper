const client = require('./_client')

module.exports.findTrack = async ({
  artist,
  title,
}) => {
  const { 
    body: {
      tracks: {
        items=[]
      }
    },
  } = await client.searchTracks(`track:${title} artist:${artist}`)
  
  return items[0]
}