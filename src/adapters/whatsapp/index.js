const auth = require('./auth')
const group = require('./group')

module.exports = {
  ...auth,
  ...group,
}