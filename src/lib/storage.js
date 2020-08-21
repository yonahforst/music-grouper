const AWS = require('aws-sdk');

const {
  dynamodbTableName,
} = require('./env')

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'eu-west-1',
});

const META_ID = '___meta___'

const inGroupsOf = (count, func) => async array => {
  let i = 0
  let results = []
  
  while (i * count < array.length) {
    const items = array.slice(i * count, (i + 1) * count)
    const result = await func(items)
    results.push(result)
    i++
  }
  return results
} 


function batchSet(items) {
  const updatedAt = new Date().toISOString() 

  const params = {
    RequestItems: {
      [ dynamodbTableName ]: items.map(({
        id,
        url,
        metadata,
      }) => ({
        PutRequest: {
          Item: {
            id,
            url,
            metadata: JSON.stringify(metadata),
            updatedAt,
          },
        },
      }))
    }
  };

  return docClient.batchWrite(params).promise()
    .then(() => {});
}

function setMeta(payload) {
  const params = {
    TableName: dynamodbTableName,
    Item: {
      id: META_ID,
      metadata: JSON.stringify(payload),
      updatedAt: new Date().toISOString(),
    },
  };

  return docClient.put(params).promise()
    .then(() => {});
}

function getMeta() {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      id: META_ID,
    },
  };

  return docClient.get(params).promise()
    .then(({ Item }) => Item && JSON.parse(Item.metadata));
}

module.exports = {
  batchSet: inGroupsOf(25, batchSet),
  setMeta,
  getMeta,
};
