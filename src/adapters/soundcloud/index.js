const scraper = require('soundcloud-scraper');

module.exports.getDetailsFromUrl = async (url) => {
  const { 
    title,
    author: {
      name,
    }
  } = await scraper.getSongInfo(url)

  return {
    title,
    artist: name,
  }
}