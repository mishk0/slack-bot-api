var Vow = require('vow');
var Slack = require('./src/slack.js');
var extend = require('extend');
var assert = require('./src/utils.js').assert;
var find = require('./src/utils.js').find;
var util = require('util');

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

util.inherits(Bot, Slack);

/**
 * Posts a message to user by name
 * @param {string} name
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Bot.prototype.postMessageToUser = function(name, text, params) {
    return this.users.postMessage(name, text, params);
};

/**
 * Posts a message to channel by name
 * @param {string} name
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Bot.prototype.postMessageToChannel = function(name, text, params) {
    return this.channels.postMessage(name, text, params);
};

/**
 * Posts a message to group by name
 * @param {string} name
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Bot.prototype.postMessageToGroup = function(name, text, params) {
    return this.groups.postMessage(name, text, params);
};

/**
 * Posts a message to group | channel | user
 * @param name
 * @param text
 * @param params
 * @returns {vow.Promise}
 */
Bot.prototype.postTo = function(name, text, params) {
    return Vow.all([this.channels.getItems(), this.users.getItems(), this.groups.getItems()]).then(function(data) {
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

module.exports = Bot;
