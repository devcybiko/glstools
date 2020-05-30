var test = require('unit.js');
var files = require('../index').files;

describe('testing gls.files', function () {
    it('can read a text file', function () {
        let text = files.read('test/data/glsfiles-test01.txt');
        let expected = `Line one #comment
Line two #blank line

Line three #last line`;
        test.assert.equal(text, expected);
    });
    it('can read a file as a list', function () {
        let list = files.readList('test/data/glsfiles-test01.txt');
        let expected = [`Line one #comment`, `Line two #blank line`, ``, `Line three #last line`];
        test.value(list).hasValues(expected);
    });
    it('can read a file as a script', function () {
        let list = files.readScript('test/data/glsfiles-test01.txt');
        let expected = [`Line one`, `Line two`, `Line three`];
        test.value(list).hasValues(expected);
    });
    it('can read a file as regex', function () {
        let regex = files.readRegExp('test/data/glsfiles-test02.txt');
        let expected = [/foo/i, /bar/i, /^.*Greg.*Smith$/i];
        for (let i = 0; i < regex.length; i++) {
            test.value(regex[i]).is(expected[i]);
        }
    });
    it('can read a file as csv', function () {
        let csv = files.readCSV('test/data/glsfiles-test03.txt');
        let expected = [
            { col1: 'a1', col2: ' a2', col3: ' a3' },
            { col1: 'b1', col2: ' b2', col3: ' b3' },
            { col1: 'c1', col2: ' c2', col3: ' c3' }];
        test.value(csv).is(expected);
    });
    it('can read a file as json', function () {
        let json = files.readJSON('test/data/glsfiles-test04.txt');
        let expected = {
            "a": ["a1", "a2", "a3"],
            "b": ["b1", "b2", "b3"],
            "c": ["c1", "c2", "c3"]
        };
        test.value(json).is(expected);
    });
    it('can read a file as jsonc', function () {
        let json = files.readJSONC('test/data/glsfiles-test05.txt');
        let expected = {
            "a": ["a1", "a2", "a3"],
            "b": ["b1", "b2", "b3"],
            "c": ["c1", "c2", "http://google.com"]
        };
        test.value(json).is(expected);
    });
    it('can write a string to a file', function () {
        let testFile = `/tmp/test.txt`;
        let expected = `Line one #comment
        Line two #blank line
        
        Line three #last line`;
        files.write(testFile, expected);
        let lines = files.read(testFile);
        test.value(lines).is(expected);
    });
    it('can write an array of strings to a file', function () {
        let testFile = `/tmp/test.txt`;
        let expected = `Line one #comment
        Line two #blank line
        
        Line three #last line`.split("\n");
        files.writeList(testFile, expected);
        let lines = files.readList(testFile);
        test.value(lines).is(expected);
    });
    it('can create an empty file', function () {
        let testFile = `/tmp/test.txt`;
        files.create(testFile);
        let lines = files.read(testFile);
        test.value(lines).is("");
    });
    it('can create a folder and read it', function () {
        let testFile = `/tmp/glsfiles/testdir`;
        files.create(testFile);
        let dirs = files.readDir(`/tmp/glsfiles`);
        test.value(dirs).is([`testdir`]);
    });
    it('can expand a path', function () {
        let testPath = "/a:/b:/c/d/e";
        let paths = files.parsePath(testPath);
        test.value(paths).is(["/a", "/b", "/c/d/e"]);
    });
    it('can find a file', function () {
        let testPath = ".:./test:./js:";
        let indexjs = files.findFname(testPath + 'index.js');
        test.value(indexjs).is("./index.js");
        let testglsfilesjs = files.findFname(testPath + 'glsfiles-test.js');
        test.value(testglsfilesjs).is("./test/glsfiles-test.js");
        let glscharsjs = files.findFname(testPath + 'glschars.js');
        test.value(glscharsjs).is("./js/glschars.js");
    });
});