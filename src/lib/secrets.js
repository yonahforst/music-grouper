const AWS = require('aws-sdk')
const { appName } = require('../lib/env')

const ssm = new AWS.SSM({
  region: 'eu-west-1',
});


module.exports.get = async key => {
  const { 
    Parameter: {
      Value
    }
  } = await ssm.getParameter({
    Name: `/${appName}/${key}`,
    WithDecryption: true,
  }).promise();

  return JSON.parse(Value)
}

module.exports.set = (key, obj) => {
  if (typeof obj == 'object')
    obj = JSON.stringify(obj)

  return ssm.putParameter({
    Name: `/${appName}/${key}`,
    Value: obj,
    Type: 'SecureString',
    Overwrite: true,
  }).promise()
}