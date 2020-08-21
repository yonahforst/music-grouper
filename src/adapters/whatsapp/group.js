const client = require('./_client')

const { 
  whatsapp: {
    groupId,
  },
} = require('../../../config.json')

async function* getGroupMessages({
  paginationToken,
}) {  
  while (true) {
    const messages = await client.loadConversation(groupId, 25, paginationToken, false)
    
    if (messages.length == 0 ) {
      console.log('no new messages')
      return
    }

    paginationToken = messages[messages.length - 1].key

    yield {
      messages,
      nextPaginationToken: paginationToken,
    }
  }
}

module.exports = {
  getGroupMessages,
}