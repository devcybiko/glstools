require('magic-globals');
const is = require('./glschars');
const StringBuffer = require('./StringBuffer')

class Tokenizer {
    constructor(s) {
        this._sb = new StringBuffer(s);
        this._cursor = 0;
        this.WORD = /\w/;
        this.SPACE = /\s/;
        this.TERMINALS = "()!@#$%^&*{}[]|\\?/>.<,\"'";
    }
    unget(inc = -1) {
        this._cursor = this._sb.bound(this._cursor + inc);
    }
    setCursor(i) {
        this._cursor = this._sb.bounds(i);
    }
    getCursor() {
        return this._cursor;
    }
    getChar() {
        return this._sb.get(this._cursor);
    }
    setChar(c) {
        return this._sb.set(this._cursor, c);
    }
    nextChar() {
        let [i, c] = this._sb.next(this._cursor);
        this._cursor = i;
        return c;
    }
    skip(pattern = this.SPACE) {
        let me = "skip";
        let c = this.nextChar();
        //console.log({me, c, pattern});
        while (c != null) {
            //console.log({me, c});
            if (!this.matches(pattern, c)) {
                this.unget();
                break;
            }
            c = this.nextChar();
        }
        return c;
    }
    matches(pattern, target) {
        let me = "matches";
        let type = typeof (pattern);
        //console.log({me, pattern, target, type})
        if (type === "string") return pattern.includes(target);
        if (type === "object" && pattern.constructor.name === "RegExp") return target.match(pattern);
        throw "Uknown pattern of type='" + pattern.constructor.name + "'";
    }
    nextToken(pattern = this.WORD, skip = this.SPACE) {
        let me = "nextToken";
        //console.log({me, pattern, skip});
        let c;
        let token = "";
        if (skip) this.skip(skip);
        c = this.nextChar();
        //console.log({me, c});
        while (c != null) {
            //console.log({me, token, c});
            if (!this.matches(pattern, c)) {
                this.unget();
                break;
            }
            token += c;
            c = this.nextChar();
        }
        return token;
    }

}

function test1() {
    let p = new Parser("   token1  token2 token3 \n token4  ");
    for (let token = p.nextToken();
        token;
        token = p.nextToken()) {
        console.log({ token });
    }
    p.nextChar();
    for (let token = p.nextToken();
        token;
        token = p.nextToken()) {
        console.log({ token });
    }
}

test1() {
    let s = "(a:b, (c:d, e:f, g:h), )";
    
module.exports = Tokenizer;