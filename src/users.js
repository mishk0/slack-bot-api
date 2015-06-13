var Collection = require('./collection.js');
var util = require('util');

var Users = function(data) {
    this._update(data);

    this.type = 'members';
    this.apiName = 'users.list'
};

util.inherits(Users, Collection);

/**
 * Get "direct message" channel ID
 * @param {string} name
 * @returns {vow.Promise}
 */
Users.prototype.getItemId = function(name) {
    return this.getItem(name).then(function(data) {
        return this.openIm(data.id);
    }.bind(this)).then(function(data) {
        return typeof data === 'string' ? data : data.channel.id;
    });
};


module.exports = Users;