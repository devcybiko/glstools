var test = require('unit.js');
var { Tokenizer } = require('../index');
var { log } = require('../js/log');

describe('testing gls.Tokenizer', function () {
    it('handles Simple tokens', function () {
        let p = new Tokenizer("   token1  token2 token3 \n token4  ");
        let expected = ["token1", "token2", "token3", "token4"];
        let results = [];
        for (let token = p.next();
            token;
            token = p.next()) {
            let s = token.value.trim();
            if (s) results.push(s);
        }
        test.value(results).is(expected);
    });
    it('handles complex tokens', function () {
        let s = `(1 1. 1.e 1.- 1.e3 1.E+ 1.3E6 1.3E-6 
        007 007bond 150 $ % [baker is 00the name of the baker], 
        // this is a comment
        /****
         *  this is a block comment
         * this is line two
         * this is the end of the block comment ******/ 
        \`this \\is \\nthe name of the other baker\`, 
        'this is another quoted string', (charlie:delta, \nepsilon:faragon, garligon:harligon), )`;
        let expected = [
            { name: 'terminal', value: '(' },
            { name: 'int', value: '1' },
            { name: 'float', value: '1.' },
            { name: 'scientific', value: '1.e' },
            { name: 'float', value: '1.' },
            { name: 'terminal', value: '-' },
            { name: 'scientific', value: '1.e3' },
            { name: 'scientific', value: '1.E+' },
            { name: 'scientific', value: '1.3E6' },
            { name: 'scientific', value: '1.3E-6' },
            { name: 'digits', value: '007' },
            { name: 'term', value: '007bond' },
            { name: 'int', value: '150' },
            { name: 'terminal', value: '$' },
            { name: 'terminal', value: '%' },
            { name: '_bracketed', value: '[baker is 00the name of the baker]' },
            { name: 'terminal', value: ',' },
            { name: '_comment', value: '// this is a comment\n' },
            {
                name: '_block_comment',
                value: '/****\n' +
                    '         *  this is a block comment\n' +
                    '         * this is line two\n' +
                    '         * this is the end of the block comment ******/'
            },
            {
                name: '_quote3',
                value: '`this is \nthe name of the other baker`'
            },
            { name: 'terminal', value: ',' },
            { name: '_quote2', value: "'this is another quoted string'" },
            { name: 'terminal', value: ',' },
            { name: 'terminal', value: '(' },
            { name: 'variable', value: 'charlie' },
            { name: 'terminal', value: ':' },
            { name: 'variable', value: 'delta' },
            { name: 'terminal', value: ',' },
            { name: 'variable', value: 'epsilon' },
            { name: 'terminal', value: ':' },
            { name: 'variable', value: 'faragon' },
            { name: 'terminal', value: ',' },
            { name: 'variable', value: 'garligon' },
            { name: 'terminal', value: ':' },
            { name: 'variable', value: 'harligon' },
            { name: 'terminal', value: ')' },
            { name: 'terminal', value: ',' },
            { name: 'terminal', value: ')' }
        ];
        let results = [];
        let p = new Tokenizer(s);
        for (let token = p.next();
            token;
            token = p.next()) {
            if (token.name !== 'spaces') results.push(token);
        }
        test.value(results).is(expected);
    });
});