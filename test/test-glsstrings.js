var test = require('unit.js');
var strings = require('../js/index').strings;
var {log} = require('../js/log');

describe('testing gls.strings', function () {
    it('can check for restricted characters', function () {
        let zzz = strings.checkRestricted("This is a test", "Zz");
        test.value(zzz).is(true);
        let ttt = strings.checkRestricted("This is a test", "Tt");
        test.value(ttt).is(false);
    });
    it('can do caesar cipher', function () {
        let text = "This is a test";
        let salad = strings.caesar(text, -12);
        let unsalad = strings.caesar(salad, 12);
        test.value(text).is(unsalad);
    });
});