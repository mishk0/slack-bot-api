var util = require('util');
var Common = require('./common.js');
var Vow = require('vow');
var find = require('./utils.js').find;

var Collection = function() {};

util.inherits(Collection, Common);

Collection.prototype.update = function(data) {
    if (typeof data === 'string') {
        this.token = data;

        return;
    }
    this.data = data;
};

/**
 * Get
 * @returns {vow.Promise}
 */
Collection.prototype.getData = function() {

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
Collection.prototype.getElemByName = function(name) {
    return this.getData().then(function(data) {
        return find(data[this.type], { name: name });
    }.bind(this));
};

Collection.prototype.getIdByName = function(name) {
    return this.getElemByName(name).then(function(channel) {
        return channel.id;
    });
};

module.exports = Collection;
