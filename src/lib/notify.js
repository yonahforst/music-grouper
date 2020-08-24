const AWS = require('aws-sdk')

const {
  loginSnsTopicArn
} = require('./env')

const sns = new AWS.SNS({
  region: 'eu-west-1',
});

module.exports.publish = (body) => {
  return sns.publish({
    TopicArn: loginSnsTopicArn,
    Message: body,
  }).promise()
}
