var https = require('https');
var request = require('request');
var Vow = require('vow');
var qs = require('querystring');
var fs = require('fs');
var extend = require('extend');
var WebSocket = require('ws');

function Bot(params) {
    this.token = params.token;
    this.name = params.name;
    this.onMessage = params.onMessage;

    assert(params.token, 'token must be defined');
    this.login();
}

Bot.prototype.login = function() {
    this._api('rtm.start').then(function(data) {
        this.wsUrl = data.url;
        this.channels = data.channels;
        this.users = data.users;
        this.ims = data.ims;

        this.connect();
    }.bind(this))
};

Bot.prototype.connect = function() {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('message', function(data) {
        if (this.onMessage) {
            this.onMessage(data);
        }
    }.bind(this));
};

Bot.prototype.getChannels = function() {
    if (this.channels) {
        return Vow.fulfill({ channels: this.channels });
    }
    return this._api('channels.list');
};

Bot.prototype.getUsers = function() {
    if (this.users) {
        return Vow.fulfill({ members: this.users });
    }

    return this._api('users.list');
};

Bot.prototype.getUser = function(name) {
    return this.getUsers().then(function(data) {
        return _find(data.members, { name: name});
    });
};

Bot.prototype.getChannel = function(name) {
    return this.getChannels().then(function(data) {
        return _find(data.channels, { name: name});
    });
};

Bot.prototype.getChatId = function(name) {
    return this.getUser(name).then(function(data) {

        return this._api('im.open', {user: data.id});
    }.bind(this)).then(function(data) {
        return data.channel.id;
    });
};

Bot.prototype.postMessage = function(name, text) {
    return this.getChatId(name).then(function(chatId) {
        return this._api('chat.postMessage', {
            text: text,
            channel: chatId,
            username: this.name
        })
    }.bind(this))
};

Bot.prototype._api = function(method_name, params) {
    params = extend(params || {}, {token: this.token});

    var path = method_name + '?' + qs.stringify(params);

    var data = {
        method: 'GET',
        url: 'https://slack.com/api/' + path
    };

    return new Vow.Promise(function(resolve, reject) {
        request(data, function(err, request, body) {
            if (err) {
                reject(err);

                return false;
            }

            resolve(JSON.parse(body));
        })
    });
};

function _find(arr, params) {
    var result = {};

    arr.forEach(function(item) {
        if (Object.keys(params).every(function(key) { return item[key] === params[key]})) {
            result = item;
        }
    });

    return result;
}

function assert(condition, error) {
    if (!condition) {
        throw new Error('[Slack Bot Error] ' + error);
    }
}

module.exports = Bot;