var util = require('util');
var Common = require('./common.js');
var Vow = require('vow');
var find = require('./utils.js').find;

var Collection = function() {};

util.inherits(Collection, Common);

Collection.prototype._update = function(data) {
    this.data = data;
};

/**
 * Get
 * @returns {vow.Promise}
 */
Collection.prototype.getItems = function() {
    if (this.data) {
        var result = {};
        result[this.type] = this.data;

        return Vow.fulfill(result);
    }
    return this._api(this.apiName);
};

/**
 * Get channel by name
 * @param {string} name
 * @returns {object}
 */
Collection.prototype.getItem = function(name) {
    return this.getItems().then(function(data) {
        return find(data[this.type], { name: name });
    }.bind(this));
};

Collection.prototype.getItemId = function(name) {
    return this.getItem(name).then(function(channel) {
        return channel.id;
    });
};

/**
 * Posts a message to channel by name
 * @param {string} name
 * @param {string} text
 * @param {object} params
 * @returns {vow.Promise}
 */
Collection.prototype.postMessage = function(name, text, params) {
    return this.getItemId(name).then(function(itemId) {
        return this._post(itemId, text, params);
    }.bind(this));
};

module.exports = Collection;


