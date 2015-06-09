var request = require('request');
var Vow = require('vow');
var qs = require('querystring');
var extend = require('extend');
var WebSocket = require('ws');
var util = require('util');
var utils = require('./libs/utils.js');
var find = utils.find;
var assert = utils.assert;
var EventEmitter = require('events').EventEmitter;

/**
 * @param {object} params
 * @constructor
 */
function Bot(params) {
    this.token = params.token;
    this.name = params.name;

    assert(params.token, 'token must be defined');
    this.login();
}

util.inherits(Bot, EventEmitter);

/**
 * Starts a Real Time Messaging API session
 */
Bot.prototype.login = function() {
    this._api('rtm.start').then(function(data) {
        this.wsUrl = data.url;
        this.channels = data.channels;
        this.users = data.users;
        this.ims = data.ims;
        this.groups = data.groups;

        this.emit('start');

        this.connect();
    }.bind(this));
};

/**
 * Establish a WebSocket connection
 */
Bot.prototype.connect = function() {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', function(data) {
        this.emit('open', data);
    }.bind(this));

    this.ws.on('close', function(data) {
        this.emit('close', data);
    }.bind(this));

    this.ws.on('message', function(data) {
        try {
            this.emit('message', JSON.parse(data));
        } catch (e) {
            console.log(e);
        }
    }.bind(this));
};

/**
 * Get channels
 * @returns {vow.Promise}
 */
Bot.prototype.getChannels = function() {
    if (this.channels) {
        return Vow.fulfill({ channels: this.channels });
    }
    return this._api('channels.list');
};

/**
 * Get users
 * @returns {vow.Promise}
 */
Bot.prototype.getUsers = function() {
    if (this.users) {
        return Vow.fulfill({ members: this.users });
    }

    return this._api('users.list');
};

/**
 * Get groups
 * @returns {vow.Promise}
 */
Bot.prototype.getGroups = function() {
    if (this.groups) {
        return Vow.fulfill({ groups: this.groups });
    }

    return this._api('groups.list');
};

/**
 * Get user by name
 * @param {string} name
 * @returns {object}
 */
Bot.prototype.getUser = function(name) {
    return this.getUsers().then(function(data) {
        return find(data.members, { name: name });
    });
};

/**
 * Get channel by name
 * @param {string} name
 * @returns {object}
 */
Bot.prototype.getChannel = function(name) {
    return this.getChannels().then(function(data) {
        return find(data.channels, { name: name });
    });
};

/**
 * Get group by name
 * @param {string} name
 * @returns {object}
 */
Bot.prototype.getGroup = function(name) {
    return this.getGroups().then(function(data) {
        return find(data.groups, { name: name });
    });
};

/**
 * Get channel ID
 * @param {string} name
 * @returns {string}
 */
Bot.prototype.getChannelId = function(name) {
    return this.getChannel(name).then(function(channel) {
        return channel.id;
    });
};

/**
 * Get group ID
 * @param {string} name
 * @returns {string}
 */
Bot.prototype.getGroupId = function(name) {
    return this.getGroup(name).then(function(group) {
        return group.id;
    });
};

/**
 * Get "direct message" channel ID
 * @param {string} name
 * @returns {vow.Promise}
 */
Bot.prototype.getChatId = function(name) {
    return this.getUser(name).then(function(data) {

        var chatId = find(this.ims, { user: data.id }).id;

        return chatId || this.openIm(data.id);
    }.bind(this)).then(function(data) {
        return typeof data === 'string' ? data : data.channel.id;
    });
};

/**
 * Opens a "direct message" channel with another member of your Slack team
 * @param {string} userId
 * @returns {vow.Promise}
 */
Bot.prototype.openIm = function(userId) {
    return this._api('im.open', {user: userId});
};

/**
 * Posts a message to a channel by ID
 * @param {string} id - channel ID
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Bot.prototype.postMessage = function(id, text, params) {
    params = extend({
        text: text,
        channel: id,
        username: this.name
    }, params || {});

    return this._api('chat.postMessage', params);
};

/**
 * Posts a message to user by name
 * @param {string} name
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Bot.prototype.postMessageToUser = function(name, text, params) {
    return this.getChatId(name).then(function(chatId) {
        return this.postMessage(chatId, text, params);
    }.bind(this));
};

/**
 * Posts a message to channel by name
 * @param {string} name
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Bot.prototype.postMessageToChannel = function(name, text, params) {
    return this.getChannelId(name).then(function(channelId) {
        return this.postMessage(channelId, text, params);
    }.bind(this));
};

/**
 * Posts a message to group by name
 * @param {string} name
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Bot.prototype.postMessageToGroup = function(name, text, params) {
    return this.getGroupId(name).then(function(groupId) {
        return this.postMessage(groupId, text, params);
    }.bind(this));
};

/**
 * Posts a message to group | channel | user
 * @param name
 * @param text
 * @param params
 * @returns {vow.Promise}
 */
Bot.prototype.postTo = function(name, text, params) {
    return Vow.all([this.getChannels(), this.getUsers(), this.getGroups()]).then(function(data) {
        var all = [].concat(data[0].channels, data[1].members, data[2].groups);
        var result = find(all, {name: name});

        assert(Object.keys(result).length, 'wrong name');

        if (result['is_channel']) {
            return this.postMessageToChannel(name, text, params);
        } else if (result['is_group']) {
            return this.postMessageToGroup(name, text, params);
        } else {
            return this.postMessageToUser(name, text, params);
        }
    }.bind(this));
};

/**
 * Send request to API method
 * @param {string} methodName
 * @param {object} params
 * @returns {vow.Promise}
 * @private
 */
Bot.prototype._api = function(methodName, params) {
    params = extend(params || {}, {token: this.token});

    var path = methodName + '?' + qs.stringify(params);

    var data = {
        url: 'https://slack.com/api/' + path
    };

    return new Vow.Promise(function(resolve, reject) {

        request.get(data, function(err, request, body) {
            if (err) {
                reject(err);

                return false;
            }

            try {
                body = JSON.parse(body);

                // Response always contain a top-level boolean property ok,
                // indicating success or failure
                if (body.ok) {
                    resolve(body);
                } else {
                    reject(body);
                }

            } catch (e) {
                reject(e);
            }
        });
    });
};

module.exports = Bot;
