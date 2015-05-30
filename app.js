var https = require('https');
var request = require('request');
var Vow = require('vow');
var qs = require('querystring');
var fs = require('fs');
var extend = require('extend');

var _cache = {};
var token;

function getChannels() {
    return _get('channels.list');
}

function getUsers() {
    return _get('users.list');
}

function getUser(name) {
    return getUsers().then(function(data) {
        return _find(data.members, { name: name});
    });
}

function getChannel(name) {
    return getChannels().then(function(data) {
        return _find(data.channels, { name: name});
    });
}

function getChatId(name) {
    return getUser(name).then(function(data) {

        return _get('im.open', {user: data.id});
    }).then(function(data) {
        return data.channel.id;
    });
}

function postMessage(name, text) {
    return getChatId(name).then(function(chatId) {
        return _get('chat.postMessage', {
            text: text,
            channel: chatId
        })
    })
}

function _get(method_name, params) {
    token = token || fs.readFileSync('token').toString();

    params = extend(params || {}, {token: token});

    var path = method_name + '?' + qs.stringify(params);

    var data = {
        method: 'GET',
        url: 'https://slack.com/api/' + path
    };

    return new Vow.Promise(function(resolve, reject) {
        if (_cache.path) {
            resolve(cache.path);

            return false;
        }

        request(data, function(err, request, body) {
            if (err) {
                reject(err);

                return false;
            }

            body = JSON.parse(body);

            if (params.cache !== false) {
                _cache[path] = body;
            }

            resolve(body);
        })
    });
}

function _find(arr, params) {
    var result = {};

    arr.forEach(function(item) {
        if (Object.keys(params).every(function(key) { return item[key] === params[key]})) {
            result = item;
        }
    });

    return result;
}

module.exports = {
    getChannels: getChannels,
    getUsers: getUsers,
    getChannel: getChannel,
    getChatId: getChatId,
    postMessage: postMessage,
    getUser: getUser
};