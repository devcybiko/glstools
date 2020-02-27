var test = require('unit.js');
var maths = require('../js/index').maths;

describe('testing gls.maths', function () {
    it('generate random numbers', function () {
        let numbers = [];
        let samples = 1000;
        let max = 
        for(let i=0; i<samples; i++) {
            let rnd = maths.random(1,6);
            numbers[rnd] = (numbers[rnd] || 0) + 1;
        }
        test.value(numbers).match(function(it) {
            return ((samples-samples/10)/6) < it && it < (1000/6)
        }
    });
});