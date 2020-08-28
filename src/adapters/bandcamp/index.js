const bandcamp = require('bandcamp-scraper');

const getAlbumPromise = url => new Promise((resolve, reject) => {
  bandcamp.getAlbumInfo(url, (err, res) => err ? reject(err): resolve(res))
})

module.exports.getDetailsFromUrl = async (url) => {
  const {
    artist,
    title,
  } = await getAlbumPromise(url)

  return {
    title,
    artist,
  }
}