require('dotenv').config()

const Botkit = require('botkit')
const request = require('request')

const watsonMiddleware = require('botkit-middleware-watson')({
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  workspace_id: process.env.WATSON_CONVERSATION_WORKSPACE_ID,
  version_date: '2017-05-26',
})

const controller = Botkit.facebookbot({
  access_token: process.env.MESSENGER_ACCESS_TOKEN,
  verify_token: process.env.MESSENGER_VERIFY_TOKEN,
})

controller.middleware.receive.use(watsonMiddleware.receive)

const bot = controller.spawn({})

controller.setupWebserver('3000',function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function() {
      console.log('We are live!')
  })
})

controller.on('facebook_optin', function(bot, message) {
    bot.reply(message, 'Thanks for checking up out!')
})

controller.hears(['.*'], 'message_received', function(bot, message) {
  console.log(message)

  if (message.watsonError) {
    bot.reply(message, 'I\'m sorry, but for technical reasons I can\'t respond to your message')
  } else {
    bot.reply(message, message.watsonData.output.text.join('\n'))
  }
})
