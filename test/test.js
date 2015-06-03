var expect = require('chai').expect;
var Bot = require('../app.js');
var utils = require('../libs/utils.js');
var bot = new Bot({token: 'token'});
var sinon = require('sinon');
var request = require('request');

describe('slack-bot-api', function() {

    describe('#find', function() {

        it('1', function() {
            var data = [{a: 1, b: 2}, {b: 3, c: 4}];
            expect(utils.find(data, {a: 1})).to.equal(data[0]);
        });
        it('2', function() {
            var data = [{a: 1, b: 2, c: 4}, {b: 3, c: 4}];
            expect(utils.find(data, {a: 1, c: 4})).to.equal(data[0]);
        });
        it('3', function() {
            var data = [{a: 1, b: 2}, {b: 3, c: 4}];
            expect(utils.find(data, {b: 3})).to.equal(data[1]);
        });
        it('4', function() {
            var data = [{a: 1, b: 2}, {b: 3, c: 4}];
            expect(utils.find(data, {a: 1, b: 2, c: 3})).to.not.equal(data[0]);
        });
    });

    describe('#_api', function() {
        it('1', function(cb) {
            var r1;

            sinon.stub(request, 'get', function(data, cb) {
                r1 = data;
                cb(null, null, '{}');
            });

            bot._api('method', {foo: 1, bar: 2, baz: 3}).then(function() {
                expect(r1.url).to.equal('https://slack.com/api/method?foo=1&bar=2&baz=3&token=token');
                cb();
            })
        });
    })
});
