var test = require('unit.js');
var gls = require('../js/index').files;

describe('testing gls.files', function () {
    it('can read a text file', function () {
        let text = gls.read('test/glsfiles-test01.txt');
        let expected = `Line one #comment
Line two #blank line

Line three #last line`;
        test.assert.equal(text, expected);
    });
    it('can read a file as a list', function () {
        let list = gls.readList('test/glsfiles-test01.txt');
        let expected = [`Line one #comment`, `Line two #blank line`, ``, `Line three #last line`];
        test.value(list).hasValues(expected);
    });
    it('can read a file as a script', function () {
        let list = gls.readScript('test/glsfiles-test01.txt');
        let expected = [`Line one`, `Line two`, `Line three`];
        test.value(list).hasValues(expected);
    });
    it('can read a file as regex', function () {
        let regex = gls.readRegExpFile('test/glsfiles-test02.txt');
        let expected = [new RegExp("foo", "i"), new RegExp("bar", "i"), new RegExp("/^.*Greg.*Smith$", "i")];
        test.value(regex).hasValues(expected);
    });
    it('can read a file as csv', function () {
        let csv = gls.readCSVFile('test/glsfiles-test03.txt');
        let expected = [{col1:'a9',col2:'a2',col3:'a3'}, {col1:'b1',col2:'b2',col3:'b3'}, {col1:'c1',col2:'c2',col3:'c3'}];
        test.value(csv, function (it, i) {
            return csv[i] === expected[i]
        });
    });
});