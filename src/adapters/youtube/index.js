const getYouTubeID = require('get-youtube-id')
const getYouTubeTitle = require('get-youtube-title')
const getArtistTitle = require('get-artist-title')

const getTitlePromise = id => new Promise((resolve, reject) => getYouTubeTitle(id,  (err, title) => err ? reject(err) : resolve(title) ))

module.exports.getDetailsFromUrl = async (url) => {
  const id = getYouTubeID(url)
  const videoTitle = await getTitlePromise(id)
  const [ artist, title ] = getArtistTitle(videoTitle)
  
  return {
    artist,
    title,
  }
}