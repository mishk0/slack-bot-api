# slack-bot-api
[![license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/mishk0/slack-bot-api/master/LICENSE)

Simple javascript api for Slack
## Usage
```js
var SlackBot = require('../app.js');
var bot = new SlackBot({
    token: 'xoxb-012345678-ABC1DFG2HIJ3', // Add a bot https://my.slack.com/services/new/bot and put the token 
    name: 'My Bot'
});

bot.on('start', function() {
    bot.postMessageToChannel('general', 'hey!');
    bot.postMessageToUser('username', 'hey!');
});

bot.on('message', function() {
    // all ingoing events https://api.slack.com/rtm
    console.log(data);
});
```
