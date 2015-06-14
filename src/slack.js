var extend = require('extend');
var WebSocket = require('ws');
var util = require('util');
var find = require('./utils.js').find;
var Channels = require('./channels.js');
var Users = require('./users.js');
var Groups = require('./groups.js');
var Ims = require('./ims.js');
var Common = require('./common.js');
var Vow = require('vow');

var Slack = function() {};

util.inherits(Slack, Common);

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
 * Opens a "direct message" channel with another member of your Slack team
 * @param {string} userId
 * @returns {vow.Promise}
 */
Common.prototype.openIm = function(userId) {
    var chatId = find(this.ims.getItems(), { user: userId }).id;

    return chatId ? Vow.fulfill(chatId) : this._api('im.open', {user: userId });
};

module.exports = Slack;