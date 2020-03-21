var test = require('unit.js');
var glist = require('../index').lists;
var gfile = require('../index').files;
var {log} = require('../js/log');

describe('testing gls.lists', function () {
    it('can parse a file', function () {
        let text = gfile.read('test/starter.list');
        let expected = gfile.read('test/starter.list');
        console.log(text);
        let obj = glist.parse(text);
        let json = JSON.stringify(obj, null, 2));
        test.assert.equal(json, expected);
    });
});