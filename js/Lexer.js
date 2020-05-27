require('magic-globals');
const is = require('./glschars');
const Tokenizer = require('./Tokenizer')

class Lexer {
    constructor(s) {
        this._t = new Tokenizer(s);
        this._patterns = [
            {name: "integer", pattern: /^\d+?$/},
            {name: "exponent", pattern: /^\d+?[eE]$/},
            {name: "literalString", pattern: /^["'`].*["'`]$/},
            {name: "variable", pattern: /^[a-zA-Z_]\w*?$/},
            {name: "operator", pattern: /[<>!=.+\-*\/%]/},
            {name: "terminator", pattern: this._t.getContext().TERMINALS}
        ];
    }
    getContext() {
        this._t.getContext();
    }
    setContext(context) {
        this._t.setContext(context);
    }
    matches(pattern, s) {
        return this._t.matches(pattern, s);
    }
    getLine() {
        return this._t.getLine();
    }
    getPatterns() {
        return this._patterns;
    }
    setPatterns(patterns) {
        this._patterns = patterns;
    }
    next(swallow_spaces = true) {
        let token = this._t.next(swallow_spaces);
        console.log({token});
        if (!token) return null;
        for(let i=0; i<this._patterns.length; i++) {
            let pattern = this._patterns[i];
            if (this.matches(pattern.pattern, token)) {
                let result = {type: pattern.name, token: token};
                return result;
            }
        }
        throw {badToken : token, line : this.getLine()};
    }
}

function test1() {
    let s = "one 100 two:three, \n four:five 3.14159";
    let l = new Lexer(s);
    for(let token = l.next();
        token;
        token = l.next()) {
        console.log(token);
    }
    console.log();
}

function test2() {
    let s = "one 100 two:three, \n $ four:five 3.14159";
    let l = new Lexer(s);
    for(let token = l.next();
        token;
        token = l.next()) {
        console.log(token);
    }
    console.log();
}

function test3() {
    let s = `for(let i=0;\ni<s.length;\ni++)\n{\nconsole.log(i + "this 'is' \\\"a\\\" test");\nlet f = 3.14 e-100;`;
    let l = new Lexer(s);
    l.getPatterns().unshift({name: "reservedWord", pattern: /for|let/});
    for(let token = l.next();
        token;
        token = l.next()) {
        console.log(token);
    }
    console.log();
}

// test1();
// test2();
// test3();

module.exports = Lexer;