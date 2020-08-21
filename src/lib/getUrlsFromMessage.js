module.exports = ({ message }) => {
  if (!message) return []
  
  // we can't use destructuring default values here because empty values are returned as null
  const conversation = message.conversation || ''
  const text = message.extendedTextMessage && message.extendedTextMessage.text || ''

  return (conversation + text).match(/\bhttps?:\/\/\S+/gi) || []
}