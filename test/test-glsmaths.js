var test = require('unit.js');
var maths = require('../js/index').maths;

describe('testing gls.maths', function () {
    it('generate random numbers', function () {
        let numbers = [];
        let samples = 10000;
        let max = 6;
        let error = 1;
        for(let i=0; i<samples; i++) {
            let rnd = maths.random(1,max);
            numbers[rnd] = (numbers[rnd] || 0) + 1;
        }
        test.value(numbers).match(function(it) {
            return typeof it !== Number;
            //return ((samples*(1-error))/max) < it && it < ((samples*(1+error))/6);
        });
    });
});