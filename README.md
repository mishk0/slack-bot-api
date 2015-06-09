# SlackBots.js
[![license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/mishk0/slack-bot-api/master/LICENSE)
[![Build Status](https://travis-ci.org/mishk0/slack-bot-api.svg?branch=master)](https://travis-ci.org/mishk0/slack-bot-api)
[![npm](http://img.shields.io/npm/v/slackbots.svg?style=flat)](https://www.npmjs.com/package/slackbots)

This is Node.js library for easy operation with Slack API.

It also exposes all opportunities of <a href="https://api.slack.com/rtm">Slack's Real Time Messaging API</a>.

## Installation

```
npm install slackbots
```

### Events

- `start` - event fired, when Real Time Messaging API is started (via websocket),
- `message` - event fired, when something happens in Slack. Description of all events <a href="https://api.slack.com/rtm">here</a>.

### Methods

- `getChannels` (return: promise) - returns a list of all channels in the team,
- `getUsers` (return: promise) - returns a list of all users in the team,
- `getUser` (return: promise) - gets user by name,
- `getChannel` (return: promise) - gets channel by name,
- `getChatId` (return: promise) - it returns or opens and returns a direct message channel ID,
- `postMessage` - posts a message to channel|group|user by ID,
- `postMessageToChannel` - posts a message to channel by name,
- `postMessageToUser` - posts a direct message by user name,
- `postMessageToGroup` - posts a message to private group by name,
- `postTo` - posts a message to channel|group|user by name.

## Usage
```js
var SlackBot = require('slackbots');

// create a bot
var bot = new SlackBot({
    token: 'xoxb-012345678-ABC1DFG2HIJ3', // Add a bot https://my.slack.com/services/new/bot and put the token 
    name: 'My Bot'
});

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        icon_emoji: ':cat:'
    };
    
    bot.postMessageToChannel('general', 'meow!', params);
    bot.postMessageToUser('username', 'meow!', params);
});
```
PROFIT!
<img src="http://i.imgur.com/hqzTXHm.png" />

```js
/**
 * @param {object} data
 */
bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm
    console.log(data);
});
```

###Response Handler
Error:
```js
bot.postMessageToUser('user1', 'hi').fail(function(data) {
    //data = { ok: false, error: 'user_not_found' }
})
```
Success:
```js
bot.postMessageToUser('user', 'hi').then(function(data) {
    // ...
})
```
Error and Success:
```js
bot.postMessageToUser('user', 'hi').always(function(data) {
    // ...
})
```

