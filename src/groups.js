var Collection = require('./collection.js');
var util = require('util');

var Groups = function(data) {
    this.update(data);

    this.type = 'groups';
    this.apiName = 'groups.list';
};

util.inherits(Groups, Collection);

module.exports = Groups;
