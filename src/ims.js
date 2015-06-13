var Collection = require('./collection.js');
var util = require('util');

var Ims = function(data) {
    this._update(data);

    this.type = 'ims';
    this.apiName = 'im.list'
};

util.inherits(Ims, Collection);