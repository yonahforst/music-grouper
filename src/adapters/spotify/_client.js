const SpotifyWebApi = require('spotify-web-api-node');
const {
  spotify: {
    clientId,
    clientSecret,
    redirectUri
  },
} = require('../../../config.json')

module.exports = new SpotifyWebApi({
  clientId,
  clientSecret,
  redirectUri,
});
