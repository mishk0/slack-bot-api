var Vow = require('vow');
var Slack = require('./slack.js');
var assert = require('./utils.js').assert;
var find = require('./utils.js').find;
var util = require('util');

var Channels = require('./channels.js');
var Users = require('./users.js');
var Groups = require('./groups.js');
var Ims = require('./ims.js');

/**
 * @param {object} params
 * @constructor
 */
function Bot(params) {
    this.channels = new Channels(params.token);
    this.users = new Users(params.token);
    this.ims = new Ims(params.token);
    this.groups = new Groups(params.token);

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
    return this.users.getElemByName(name)
        .then(function(data) {

            return this.ims.open(data.id);
        }.bind(this))
        .then(function(id) {
            return this._post(id, text, params);
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
    return this.channels.getIdByName(name)
        .then(function(id) {
            return this._post(id, text, params);
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
    return this.groups.getIdByName(name)
        .then(function(id) {
            return this._post(id, text, params);
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
    return Vow.all([this.channels.getData(), this.users.getData(), this.groups.getData()]).then(function(data) {
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
