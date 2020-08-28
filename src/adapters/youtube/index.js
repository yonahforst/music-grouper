const ytScraper = require("yt-scraper")
const getArtistTitle = require('get-artist-title')

module.exports.getDetailsFromUrl = async (url) => {
  const result = await ytScraper.videoInfo(url, {
    includeRawData: true
  })

  const [ artist, title ] = getArtistTitle(result.title)
  
  return {
    artist,
    title,
  }
}