var test = require('unit.js');
var files = require('../js/index').files;

describe('testing gls.files', function () {
    it('can read a text file', function () {
        let text = files.read('test/glsfiles-test01.txt');
        let expected = `Line one #comment
Line two #blank line

Line three #last line`;
        test.assert.equal(text, expected);
    });
    it('can read a file as a list', function () {
        let list = files.readList('test/glsfiles-test01.txt');
        let expected = [`Line one #comment`, `Line two #blank line`, ``, `Line three #last line`];
        test.value(list).hasValues(expected);
    });
    it('can read a file as a script', function () {
        let list = files.readScript('test/glsfiles-test01.txt');
        let expected = [`Line one`, `Line two`, `Line three`];
        test.value(list).hasValues(expected);
    });
    it('can read a file as regex', function () {
        let regex = files.readRegExp('test/glsfiles-test02.txt');
        let expected = [/foo/i, /bar/i, /^.*Greg.*Smith$/i];
        for(let i=0; i<regex.length; i++) {
            test.value(regex[i]).is(expected[i]);
        }
    });
    it('can read a file as csv', function () {
        let csv = files.readCSV('test/glsfiles-test03.txt');
        let expected = [
            {col1:'a1',col2:' a2',col3:' a3'}, 
            {col1:'b1',col2:' b2',col3:' b3'}, 
            {col1:'c1',col2:' c2',col3:' c3'}];
        test.value(csv).is(expected);
    });
    it('can read a file as json', function () {
        let json = files.readJSON('test/glsfiles-test04.txt');
        let expected = {
            "a": ["a1", "a2", "a3"],
            "b": ["b1", "b2", "b3"],
            "c": ["c1", "c2", "c3"]
        };
        test.value(json).is(expected);
    });
    it('can read a file as jsonc', function () {
        let json = files.readJSONC('test/glsfiles-test05.txt');
        let expected = {
            "a": ["a1", "a2", "a3"],
            "b": ["b1", "b2", "b3"],
            "c": ["c1", "c2", "http://google.com"]
        };
        test.value(json).is(expected);
    });
});