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
- `message` - event fired, when something happens in Slack. Description of all events <a href="https://api.slack.com/rtm">here</a>,
- `open` - websocket connection is open and ready to communicate,
- `close` - websocket connection is closed.
- `error` - an error occurred while connecting to Slack

### Methods

- `getChannels()` (return: promise) - returns a list of all channels in the team,
- `getGroups()` (return: promise) - returns a list of all groups in the team,
- `getUsers()` (return: promise) - returns a list of all users in the team,
- `getChannel(name)` (return: promise) - gets channel by name,
- `getGroup(name)` (return: promise) - gets group by name,
- `getUser(name)` (return: promise) - gets user by name,
- `getChannelId(name)` (return: promise) - gets channel ID by name,
- `getGroupId(name)` (return: promise) - gets group ID by name,
- `getUserId(name)` (return: promise) - gets user ID by name,
- `getChatId(name)` (return: promise) - it returns or opens and returns a direct message channel ID,
- `postMessage(id, text, params)` (return: promise) - posts a message to channel | group | user by ID,
- `postTo(name, message [, params, callback])` (return: promise) - posts a message to channel | group | user by name,
- `postMessageToUser(name, message [, params, callback])` (return: promise) - posts a direct message by user name,
- `postMessageToGroup(name, message [, params, callback])` (return: promise) - posts a message to private group by name,
- `postMessageToChannel(name, message [, params, callback])` (return: promise) - posts a message to channel by name.


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
    
    // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
    bot.postMessageToChannel('general', 'meow!', params);
    
    // define existing username instead of 'user_name'
    bot.postMessageToUser('user_name', 'meow!', params); 
    
    // If you add a 'slackbot' property, 
    // you will post to another user's slackbot channel instead of a direct message
    bot.postMessageToUser('user_name', 'meow!', { 'slackbot': true, icon_emoji: ':cat:' }); 
    
    // define private group instead of 'private_group', where bot exist
    bot.postMessageToGroup('private_group', 'meow!', params); 
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
The simplest way for handling response is callback function, which is specified as a last argument:
```js
bot.postMessageToUser('user1', 'hi', function(data) {/* ... */});
bot.postMessageToUser('user1', 'hi', params, function(data) {/* ... */});
```

But also you can use promises.

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

