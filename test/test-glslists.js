var test = require('unit.js');
var glist = require('../index').lists;
var {log} = require('../js/log');

describe('testing gls.lists', function () {
    it('can read parse a file', function () {
        let text = files.read('test/starter.list');
        let obj = glist.parse(test);
        console.log(obj);
        let expected = [];
        test.assert.equal(text, expected);
    });
});