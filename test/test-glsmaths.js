var test = require('unit.js');
var maths = require('../index').maths;
var { log } = require('../js/log');

describe('testing gls.maths', function () {
    it('generate random numbers', function () {
        let high = 6;
        let numbers = new Array(high).fill(0);
        let samples = 100000;
        let error = 0.1;
        for (let i = 0; i < samples; i++) {
            let rnd = maths.random(1, high)-1;
            numbers[rnd] = numbers[rnd] + 1;
        }
        test.value(numbers).matchEach(function (it) {
            let min = (samples * (1 - error)) / high;
            let max = (samples * (1 + error)) / high;
            return min < it && it < max;
        });
    });
    it('shuffle cards', function () {
        let cards = [];
        for(let i=0; i<4; i++) {
            let suit = "DCHS"[i];
            for(let j=0; j<13; j++) {
                let card = "A234567890JQK"[j];
                cards.push(suit+card);
            }
        }
        let newCards = maths.shuffle(cards);
    });
});