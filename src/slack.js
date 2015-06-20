var WebSocket = require('ws');
var util = require('util');
var Common = require('./common.js');

var Slack = function() {};

util.inherits(Slack, Common);

/**
 * Starts a Real Time Messaging API session
 */
Slack.prototype.login = function() {
    this._api('rtm.start').then(function(data) {
        this.channels.update(data.channels);
        this.users.update(data.users);
        this.ims.update(data.ims);
        this.groups.update(data.groups);
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

module.exports = Slack;
