var Collection = require('./collection.js');
var util = require('util');

var Users = function(data) {
    this._update(data);

    this.type = 'members';
    this.apiName = 'users.list'
};

util.inherits(Users, Collection);

module.exports = Users;