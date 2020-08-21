const auth = require('./auth')
const playlist = require('./playlist')

module.exports = {
  ...auth,
  ...playlist,
}