var request = require('request');
var extend = require('extend');
var WebSocket = require('ws');
var util = require('util');
var find = require('./utils.js').find;
var Channels = require('./channels.js');
var Users = require('./users.js');
var Groups = require('./groups.js');
var Ims = require('./ims.js');
var EventEmitter = require('events').EventEmitter;
var Vow = require('vow');
var qs = require('querystring');

var Slack = function() {};

util.inherits(Slack, EventEmitter);

/**
 * Starts a Real Time Messaging API session
 */
Slack.prototype.login = function() {
    this._api('rtm.start').then(function(data) {
        this.channels = new Channels(data.channels);
        this.users = new Users(data.users);
        this.ims = new Ims(data.ims);
        this.groups = new Groups(data.groups);
        this.wsUrl = data.url;

        this.emit('start');
        this.connect();
    }.bind(this));
};

/**
 * Establish a WebSocket connection
 */
Slack.prototype.connect = function() {
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
 * Posts a message to a channel by ID
 * @param {string} id - channel ID
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Slack.prototype._post = function(id, text, params) {
    params = extend({
        text: text,
        channel: id,
        username: this.name
    }, params || {});

    return this._api('chat.postMessage', params);
};

/**
 * Opens a "direct message" channel with another member of your Slack team
 * @param {string} userId
 * @returns {vow.Promise}
 */
Slack.prototype.openIm = function(userId) {
    var chatId = find(this.ims.getItems(), { user: userId }).id;

    return chatId ? Vow.fulfill(chatId) : this._api('im.open', {user: userId });
};

/**
 * Send request to API method
 * @param {string} methodName
 * @param {object} params
 * @returns {vow.Promise}
 * @private
 */
Slack.prototype._api = function(methodName, params) {
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

module.exports = Slack;