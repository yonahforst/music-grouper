
const fs = require('fs');
var crypto = require('crypto');

const { batchSet } = require('./src/lib/storage')
const regex = /\[[\d\/ :]*?\].*?(?=(\[[\d\/ :]*?\]|$))/gs

const file = fs.readFileSync('./_chat.txt', { encoding: 'utf8' })
const matches = file.matchAll(regex)

const groupMatches = (matches, size) => {
  const groups = []
  let group = []

  for (const match of matches) {
    if (match[0].match(/\bhttps?:\/\/\S+/gi))
      group.push(match[0])

    if (group.length == size) { //when we reach the desired size
      groups.push(group) //add to the final collection
      group = [] // and reset the group
    }
  }

  if (group.length > 0) // if we have any leftovers
    groups.push(group)

  return groups
}

const messageReducer = (p, c) => {
  const urls = c.match(/\bhttps?:\/\/\S+/gi) || []

  var hash = crypto.createHash('md5').update(c).digest('hex');

  return [
    ...p,
    ...urls.map((url, index) => ({
      url,
      id: `${hash}-${index}`,
      hostname: new URL(url).hostname,
      metadata: { 
        conversation: c,
      },
    }))
  ]
}

const run = async () => {
  const groups = groupMatches(matches, 25)
  for (let group of groups) {
    const parsed = group.reduce(messageReducer, [])
    batchSet(parsed)
  }
}


run()
