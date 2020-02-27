var test = require('unit.js');
var gls = require('../js/index').files;

describe('testing glsfiles', function () {
    it('can read a text file', function () {
        let text = gls.readFile('test/glsfiles-test01.txt');
        let expected = `Line one #comment
Line two #blank line

Line three #last line`;
        test.assert.equal(text, expected);
    });
    it('can read a file as a list', function () {
        let list = gls.readListFile('test/glsfiles-test01.txt');
        let expected = [`Line one #comment`, `Line two #blank line`, ``, `Line three #last line`];
        test.value(list, function (it, i) {
            list[i] === expected[i]
        });
    });
    it('can read a file as a script', function () {
        let list = gls.readScriptFile('test/glsfiles-test01.txt');
        let expected = [`Line one`, `Line two`, `Line three`];
        test.value(list, function (it, i) {
            list[i] === expected[i]
        });
    });
    it('can read a file as regex', function () {
        let regex = gls.readScriptFile('test/glsfiles-test02.txt');
        let expected = [/foo/, /bar/, /^.*Greg.*Smith$/];
        test.value(regex, function (it, i) {
            regex[i] === expected[i]
        });
    });
    it('can read a file as csv', function () {
        let regex = gls.readCSVFile('test/glsfiles-test03.txt');
        let expected = [{col1:'a9',col2:'a2',col3:'a3'}, {col1:'b1',col2:'b2',col3:'b3'}, {col1:'c1',col2:'c2',col3:'c3'}];
        test.value(regex, function (it, i) {
            regex[i] === expected[i]
        });
    });
});