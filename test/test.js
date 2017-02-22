var chai = require('chai');
var Bot = require('../index.js');
var sinon = require('sinon');
var vow = require('vow');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var expect = require('chai').expect;
var request = require('request');

sinon.stub(Bot.prototype, 'login');

describe('slack-this.bot-api', function() {
    beforeEach(function() {
        this.bot = new Bot({token: 'token'});
    });

    describe('#_preprocessParams', function() {
        it('1', function() {
            var input = {
                foo: 1,
                bar: '2',
                baz: true
            };

            var output = {
                foo: 1,
                bar: '2',
                baz: true,
                token: 'token'
            };

            expect(this.bot._preprocessParams(input)).to.deep.equal(output);
        });

        it('2', function() {
            var input = {
                bar: [1, 2, 3],
                baz: null
            };

            var output = {
                bar: JSON.stringify([1, 2, 3]),
                baz: null,
                token: 'token'
            };

            expect(this.bot._preprocessParams(input)).to.deep.equal(output);
        });

        it('3', function() {
            var func = function() {};

            var input = {
                foo: {a: 1, b: 2, c: [1, 2, '3']},
                bar: func
            };

            var output = {
                foo: JSON.stringify({a: 1, b: 2, c: [1, 2, '3']}),
                bar: func,
                token: 'token'
            };

            expect(this.bot._preprocessParams(input)).to.deep.equal(output);
        });
    });


    describe('#_api', function() {
        afterEach(function() {
            request.post.restore();
        });

        it('check url', function(done) {
            var r1;

            sinon.stub(request, 'post', function(data, cb) {
                r1 = data;
                cb(null, null, '{}');
            });

            this.bot._api('method', {foo: 1, bar: 2, baz: 3}).always(function() {
                expect(r1).to.deep.equal(
                    {
                        url: 'https://slack.com/api/method',
                        form: {
                            foo: 1,
                            bar: 2,
                            baz: 3,
                            token: 'token'
                        }
                    }
                );
                done();
            })
        });

        it('response without error', function(done) {
            sinon.stub(request, 'post', function(data, cb) {
                cb(null, null, "{\"ok\": true}");
            });

            this.bot._api('method',  {foo: 1, bar: 2, baz: 3}).then(function(data) {
                expect(data.ok).to.equal(true);
                done();
            })
        });

        it('response with error', function(done) {
            sinon.stub(request, 'post', function(data, cb) {
                cb(null, null, "{\"ok\": false}");
            });

            this.bot._api('method').fail(function(data) {
                expect(data.ok).to.equal(false);
                done();
            })
        });
    });

    describe('#postTo', function() {
        beforeEach(function() {
            sinon.stub(this.bot, 'getChannels');
            sinon.stub(this.bot, 'getUsers');
            sinon.stub(this.bot, 'getGroups');

        });

        afterEach(function() {
            this.bot.getChannels.restore();
            this.bot.getUsers.restore();
            this.bot.getGroups.restore();
        });

        it('1', function(cb) {
            this.bot.getChannels.returns(vow.fulfill({channels: [{name: 'name1', is_channel: true}]}));
            this.bot.getUsers.returns(vow.fulfill({members: []}));
            this.bot.getGroups.returns(vow.fulfill({groups: []}));
            sinon.stub(this.bot, 'postMessageToChannel').returns(vow.fulfill());

            this.bot.postTo('name1', 'text').then(() => {
                expect(this.bot.postMessageToChannel).to.have.callCount(1);
                expect(this.bot.postMessageToChannel).to.have.been.calledWith('name1', 'text');
                cb();
            });

        });

        it('2', function(cb) {
            this.bot.getChannels.returns(vow.fulfill({channels: []}));
            this.bot.getUsers.returns(vow.fulfill({members: [{name: 'name1'}]}));
            this.bot.getGroups.returns(vow.fulfill({groups: []}));
            sinon.stub(this.bot, 'postMessageToUser').returns(vow.fulfill());

            this.bot.postTo('name1', 'text').then(() => {
                expect(this.bot.postMessageToUser).to.have.callCount(1);
                expect(this.bot.postMessageToUser).to.have.been.calledWith('name1', 'text');
                cb();
            });

        });

        it('3', function(cb) {
            this.bot.getChannels.returns(vow.fulfill({channels: []}));
            this.bot.getUsers.returns(vow.fulfill({members: []}));
            this.bot.getGroups.returns(vow.fulfill({groups: [{name: 'name1', is_group: true}]}));
            sinon.stub(this.bot, 'postMessageToGroup').returns(vow.fulfill());

            this.bot.postTo('name1', 'text').then(() => {
                expect(this.bot.postMessageToGroup).to.have.callCount(1);
                expect(this.bot.postMessageToGroup).to.have.been.calledWith('name1', 'text');
                cb();
            });

        });
    });

    describe('#getXyzById', function() {
        beforeEach(function() {
            sinon.stub(this.bot, 'getChannels');
            sinon.stub(this.bot, 'getUsers');
            sinon.stub(this.bot, 'getGroups');
        });

        afterEach(function() {
            this.bot.getChannels.restore();
            this.bot.getUsers.restore();
            this.bot.getGroups.restore();
        });

        it('Channel', function(cb) {
            this.bot.getChannels.returns(vow.fulfill({channels: [{name: 'name1', id: 'C12345678', is_channel: true}]}));

            this.bot.getChannelById('C12345678').then(function(channel) {
                expect(channel).to.be.ok;
                expect(channel.name).to.equal('name1');
                cb();
            });
        });

        it('User', function(cb) {
            this.bot.getUsers.returns(vow.fulfill({members: [{name: 'name1', id: 'U12345678'}]}));

            this.bot.getUserById('U12345678').then(function(user) {
                expect(user).to.be.ok;
                expect(user.name).to.equal('name1');
                cb();
            });
        });

        it('Group', function(cb) {
            this.bot.getGroups.returns(vow.fulfill({groups: [{name: 'name1', id: 'G12345678', is_group: true}]}));

            this.bot.getGroupById('G12345678').then(function(group) {
                expect(group).to.be.ok;
                expect(group.name).to.equal('name1');
                cb();
            });
        });
    });

    describe('#_cleanName', function() {
        it('Start with #', function() {
            var input = '#general';
            var output = 'general';

            expect(this.bot._cleanName(input)).to.deep.equal(output);
        });

        it('Start with @', function() {
            var input = '@general';
            var output = 'general';

            expect(this.bot._cleanName(input)).to.deep.equal(output);
        });

        it('clean', function() {
            var func = function() {};

            var input = 'general';
            var output = 'general';

            expect(this.bot._cleanName(input)).to.deep.equal(output);
        });

        it('Middle with #', function() {
            var input = 'gen#eral';
            var output = 'gen#eral';

            expect(this.bot._cleanName(input)).to.deep.equal(output);
        });
    });

});
