var test = require('unit.js');
var gls = require('glstools').files;

describe('testing glsfiles', function(){
    let text = gls.readFile('glsfiles-test01.txt');
    let expected = `Line one
Line two
Line three`;
    test.assert.equal(text, expected);
});