var Collection = require('./collection.js');
var util = require('util');
var find = require('./utils.js').find;
var Vow = require('vow');

var Ims = function(data) {
    this._update(data);

    this.type = 'ims';
    this.apiName = 'im.list';
};

util.inherits(Ims, Collection);

/**
 * Opens a "direct message" channel with another member of your Slack team
 * @param {string} userId
 * @returns {vow.Promise}
 */
Ims.prototype.open = function(userId) {
    return this.getData().then(function(data) {
        var chatId = find(data.ims, { user: userId }).id;

        return chatId ? Vow.fulfill(chatId) : this._api('im.open', {user: userId });
    });
};

module.exports = Ims;