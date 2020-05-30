var test = require('unit.js');
var { StringBuffer } = require('../index');
var { log } = require('../js/log');

describe('testing gls.StringBuffer', function () {
    it('Create a stringbuffer and do a string.length', function () {
        let sb = new StringBuffer("This is a test");
        let expected = 14;
        let result = sb.length();
        test.value(result).is(expected);
    });
    it('Create a stringbuffer and check toString()', function () {
        let sb = new StringBuffer("This is a test");
        let expected = "This is a test";
        let result = sb.toString();
        test.value(result).is(expected);
    });
    it('Create a stringbuffer and check next()', function () {
        let s = "This is a test";
        let sb = new StringBuffer(s);
        for (let [i, result] = sb.next(0);
            result;
            [i, result] = sb.next(i)) {
            let expected = s.charAt(i - 1);
            test.value(result).is(expected);
        }
    });
    it('Create a stringbuffer and check inbounds', function () {
        let s = "This is a test";
        let sb = new StringBuffer(s);
        for (let i = 0; i < sb.length(); i++) {
            test.value(true, sb.inBounds(i));
        }
        test.value(false, sb.inBounds(-1));
        test.value(false, sb.inBounds(sb.length()));
        test.value(true, sb.inBounds(sb.length(), 1));
    });
    it('Create a stringbuffer and check get', function () {
        let s = "This is a test";
        let sb = new StringBuffer(s);
        for (let i = -1; i < sb.length() + 1; i++) {
            let expected = s[i];
            let result = sb.get(i);
            test.value(result, expected);
        }
    });
    it('Create a stringbuffer and check set', function () {
        let s = "This is a test";
        let sb = new StringBuffer(s);
        for (let i = 1; i < Math.floor(sb.length() / 2) + 1; i++) {
            let tmp = sb.get(i - 1);
            sb.set(i - 1, sb.get(-i));
            sb.set(-i, tmp);
        }
        test.value(sb.toString(), "tset a si sihT");
    });

});