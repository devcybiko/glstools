var test = require('unit.js');
var maths = require('../js/index').maths;
var { log } = require('../js/log');

describe('testing gls.maths', function () {
    it('generate random numbers', function () {
        let high = 6;
        let numbers = new Array(high);
        numbers = numbers.map((value, i) => log(i));
        let samples = 100000;
        let error = 0.1;
        for (let i = 0; i < samples; i++) {
            let rnd = maths.random(1, high);
            numbers[rnd] = numbers[rnd] + 1;
        }
        numbers = numbers.slice(1);
        test.value(numbers).matchEach(function (it) {
            let min = (samples * (1 - error)) / high;
            let max = (samples * (1 + error)) / high;
            log(numbers);
            log(`${min} ${it} ${max}`);
            return min < it && it < max;
        });
    });
});