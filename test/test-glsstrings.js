var test = require('unit.js');
var strings = require('../js/index').strings;
var {log} = require('../js/log');

describe('testing gls.strings', function () {
    it('can check for restricted characters', function () {
        let s = strings.checkRestricted("This is a test", ""Tt"");
        log(s);
    });
});