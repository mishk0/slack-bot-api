var Collection = require('./collection.js');
var util = require('util');

var Channels = function(data) {
    this._update(data);

    this.type = 'channels';
    this.apiName = 'channels.list';
};

util.inherits(Channels, Collection);

module.exports = Channels;
