# SlackBots.js
[![license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/mishk0/slack-bot-api/master/LICENSE)
[![Build Status](https://travis-ci.org/mishk0/slack-bot-api.svg?branch=master)](https://travis-ci.org/mishk0/slack-bot-api)

This is Node.js library for easy operation with Slack API.

It also exposes all opportunities of <a href="https://api.slack.com/rtm">Slack's Real Time Messaging API</a>.

### Events

- `start` - event fired, when Real Time Messaging API is started,
- `message` - event fired, when something happens in Slack. Description of all events <a href="https://api.slack.com/rtm">here</a>.

### Methods

- `getChannels` (return: promise) - returns a list of all channels in the team,
- `getUsers` (return: promise) - returns a list of all users in the team,
- `getUser` (return: promise) - gets user by name,
- `getChannel` (return: promise) - gets channel by name,
- `getChatId` (return: promise) - it returns or opens and returns a direct message channel ID,
- `postMessage` - posts a message to channel by ID,
- `postMessageToChannel` - posts a message to channel by name,
- `postMessageToUser` - posts a direct message by user name.

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
