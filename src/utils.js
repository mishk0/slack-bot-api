function find(arr, params) {
    var result = {};

    arr.forEach(function(item) {
        if (Object.keys(params).every(function(key) { return item[key] === params[key];})) {
            result = item;
        }
    });

    return result;
}

function assert(condition, error) {
    if (!condition) {
        throw new Error('[Slack Bot Error] ' + error);
    }
}

module.exports = {
    find: find,
    assert: assert
};
