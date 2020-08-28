const auth = require('./auth')
const playlist = require('./playlist')
const search = require('./search')

module.exports = {
  ...auth,
  ...playlist,
  ...search,
}