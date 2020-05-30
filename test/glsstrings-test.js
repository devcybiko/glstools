var test = require('unit.js');
var strings = require('../index').strings;
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
    it('normal expand using backtics', function() {
        let x = "lovely";
        let y = "bunch";
        let result = `I have a ${x} ${y} of coconuts`;
        test.value("I have a lovely bunch of coconuts").is(result);
    });
    it('can expand contexts', function() {
        let x = "lovely";
        let y = "bunch";
        let result = strings.expand("I have a ${x} ${y} of coconuts", {x: "smelly", y:"lot"});
        test.value("I have a smelly lot of coconuts").is(result);
    });
    it('can expand contexts only once', function() {
        let x = "lovely";
        let y = "bunch";
        let result = strings.expand("I have a ${x} ${y} of coconuts", {x: "very ${z}", y:"lot", z:"really ${a}", a: "smelly"});
        test.value("I have a very ${z} lot of coconuts").is(result);
    });
    it('but meta expands contexts within contexts', function() {
        let x = "lovely";
        let y = "bunch";
        let result = strings.meta("I have a ${x} ${y} of coconuts", {x: "very ${z}", y:"lot", z:"really ${a}", a: "smelly"});
        test.value("I have a very really smelly lot of coconuts").is(result);
    });
    it('and meta expands circular references but within limits to prevent stack overflow', function() {
        let x = "lovely";
        let y = "bunch";
        let result = strings.meta("I have a ${x} ${y} of coconuts", {x: "very ${x}", y:"lot", z:"really ${a}", a: "smelly"}, 4);
        test.value("I have a very very very very ${x} lot of coconuts").is(result);
    });
    it('and meta expands long circular references but within limits to prevent stack overflow', function() {
        let x = "lovely";
        let y = "bunch";
        let result = strings.meta("I have a ${x} ${y} of coconuts", {x: "very ${z}", y:"lot", z:"really ${a}", a: "smelly ${x}"}, 8);
        test.value("I have a very really smelly very really smelly very really ${a} lot of coconuts").is(result);
    });
    it('substring uses negative end values', function() {
        let s = "This is a test";
        let expected = "This is a ";
        let result = strings.substring(s, 0, -4);
        test.value(expected).is(result);
    });
});