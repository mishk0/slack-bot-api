# slack-bot-api
Simple javascript api for Slack
## Usage
```js
var SlackBot = require('../app.js');
var bot = new SlackBot({
    token: 'xoxb-012345678-ABC1DFG2HIJ3',
    name: 'My Bot',
    onMessage: onMessage
});

bot.postMessage('username', 'Hello user!');

function onMessage(data) {
    // all ingoing events
    console.log(data);
}
```
