const AWS = require('aws-sdk')

module.exports = ({
  dynamodb: {
    NewImage
  }
}) => AWS.DynamoDB.Converter.unmarshall(NewImage)