const { test } = require('tap')
const proxyquire = require('proxyquire')

const group = proxyquire('../group', {
  '../../../config.json': {
    whatsapp: {
      groupId: 'some-group',
    }
  },
  './_client': {
    loadConversation: async (groupId, count, paginationToken, loadForward) => [{
      groupId,
      count,
      key: paginationToken, 
      loadForward,
    }]
  }
})

test('getGroupmessages', async assert => {
  const expected = {
    value: {
      messages: [{
        groupId: 'some-group',
        count: 25,
        key: 'some-token',
        loadForward: false,
      }],
      nextPaginationToken: 'some-token',
    },
    done: false,
  }

  const iterator = group.getGroupMessages({
    paginationToken: 'some-token'
  })

  const result = await iterator.next()

  assert.deepEqual(result, expected, 'calls loadConversation with paramss')
})