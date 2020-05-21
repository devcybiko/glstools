require('magic-globals');
const is = require('./glschars');
const StringBuffer = require('./StringBuffer')
const Tokenizer = require('./Tokenizer');

class Lexer {
    constructor(s) {
        this.t = new Tokenizer(s);
        this.lexemes = {
            terminal: "(:)!@#$%^&*{}[]|\\?/>.<,\"'",
            int: /^[0-9]+$/,
            word: /^\w+$/,
            float: /^[0-9]+[.][0-9]*$/,
            words: /^(\w|[.])+$/,
        }
    }

    next() {
        let token = this.t.next();
        if (token === null) return null;
        let lex;
        for(lex in this.lexemes) {
            let pattern = this.lexemes[lex];
            if (this.t.matches(pattern, token)) {
                return {type:lex, token:token};
            }
        }
        return {type:null, token:token};
    }
}

function test1(s) {
    let l = new Lexer(s);
    let token;
    // while(token = l.next()) {
    while(token = l.next()) {
        console.log(token);
        //if (token.type === null) break;
    }
}

test1("(alpha:beta, (gamma:50, epsilon:3.14159, gemini:halcion.jackson), )");
test1("   token1  token2 token3 \n token4  ");

module.exports = Lexer;