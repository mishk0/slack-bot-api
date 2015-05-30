# slack-bot-api
## Usage
```js
var SlackBot = require('../app.js');
var bot = new SlackBot({token: 'xoxb-012345678-ABC1DFG2HIJ3', name: 'My Bot'});

bot.postMessage('username', 'Hello user!');
```
