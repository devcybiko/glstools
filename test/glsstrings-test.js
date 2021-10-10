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
    it('password returns expected value with default salt', function() {
        let password = "This is a test";
        let expected = "4a29dbe470f64af82ec3bcd1b660d9508bec0fdb238884b7ca049f94aec132e65b8f45499d6104d9f8af55360b35da368f50fd7e8821e052847ac79a755d0630";
        let result = strings.passwordEncrypt(password);
        test.value(expected).is(result);
    });
    it('password returns expected value with user-specified salt', function() {
        let password = "This is a test";
        let expected = "23af28fcffeaadf3c0e45129477e957eb9059678a1c6c074e239149eeba72a713d171b7b38361aee09e00c4bddaa42c104da76d6ab04454f5e1a1081919c4c42";
        let result = strings.passwordEncrypt(password, "0f3e");
        test.value(expected).is(result);
    });
    it('password compare works as expected', function() {
        let password = "This is a test";
        let hashedPassword = "23af28fcffeaadf3c0e45129477e957eb9059678a1c6c074e239149eeba72a713d171b7b38361aee09e00c4bddaa42c104da76d6ab04454f5e1a1081919c4c42";
        let compare = strings.passwordCompare(password, hashedPassword, "0f3e");
        test.value(compare).is(true);
    });
    it('password compare also checks for negative results, as expected', function() {
        let password = "yo momma";
        let hashedPassword = "23af28fcffeaadf3c0e45129477e957eb9059678a1c6c074e239149eeba72a713d171b7b38361aee09e00c4bddaa42c104da76d6ab04454f5e1a1081919c4c42";
        let compare = strings.passwordCompare(password, hashedPassword, "0f3e");
        test.value(compare).is(false);
    });
    it('hash code', function() {
        let complicatedPhrase = "Elton John - Tiny Dancer";
        let expected = "b5188c9d4366676231c0c0b5877c1c8e";
        let hash = strings.hash(complicatedPhrase);
        test.value(expected).is(hash);
    });
    it('hash code with prefix', function() {
        let complicatedPhrase = "Elton John - Tiny Dancer";
        let expected = "song-b5188c9d4366676231c0c0b5877c1c8e";
        let hash = strings.hash(complicatedPhrase, "song");
        test.value(expected).is(hash);
    });
});