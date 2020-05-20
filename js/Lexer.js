require('magic-globals');
const is = require('./glschars');
const StringBuffer = require('./StringBuffer')

class Parser {
    constructor(s) {
        this._sb = new StringBuffer(s);
        this._cursor = 0;
        this.SEP = ",";
        this.WORD = /\w/;
        this.SPACE = /\s/;
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
    static _handleEscape(s) {
        let r = "";
        for (let i = 0; i < s.length; i++) {
            let c = s[i];
            if (c === '\\') c = s[++i] || '';
            r += c;
        }
        return r;
    }
    static _ungetChar(s, i, lineno) {
        let c = s[i];
        if (c === '\n') lineno--;
        if (0 < i) {
            i--;
            if (0 < i) c = s[i - 1];
        }
        return [c, i, lineno];
    }
    static _nextChar(s, i, lineno) {
        let c = null;
        if (0 <= i && i < s.length) {
            c = s[i++];
        }
        if (c === '\n') lineno++;
        return [c, i, lineno];
    }
    static _skipSpaces(s, i, lineno, terminators = "", reReadLastChar = false) { // skip spaces and return terminator
        let spaces = null;
        let c = null;
        let dummy = null;
        [c, i, lineno] = Parser._nextChar(s, i, lineno, 1);
        while (c) {
            if (terminators.includes(c)) break;
            if (!is.space(c)) break;
            spaces += c;
            [c, i, lineno] = Parser._nextChar(s, i, lineno, 1);
        }
        // if (!returnChar) [c, i, lineno] = Parser._ungetChar(s, i, lineno);
        if (reReadLastChar) [dummy, i, lineno] = [dummy, i, lineno] = Parser._ungetChar(s, i, lineno, 1);
        return [spaces, c, i, lineno];
    }
    static _getKey(s, i, lineno) {
        let key = "";
        let c = null;
        let spaces = null;
        [spaces, c, i, lineno] = Parser._skipSpaces(s, i, lineno, "", false);
        while (c) {
            if (c === ":" || is.space(c)) break;
            if (true) key += c;
            // if (is.var(c)) key += c;
            else throw `${lineno}: Bad character '${c}'`;
            [c, i, lineno] = Parser._nextChar(s, i, lineno);
        }
        key = key.trim();
        if (is.space(c)) [spaces, c, i, lineno] = Parser._skipSpaces(s, i, lineno, "\n", false);
        if (c !== ':') throw `${lineno}: Key '${key}' expected ':', got '${c}'`;
        return [key, c, i, lineno];
    }
    static _getValue(s, i, lineno) {
        let value = "";
        let c = null;
        let spaces = null;
        let lastChar = null;
        [spaces, c, i, lineno] = Parser._skipSpaces(s, i, lineno, "\n", false);
        while (c) {
            if (c === '\\') {
                [c, i, lineno] = Parser._nextChar(s, i, lineno);
                if (c === '\n') {
                    [c, i, lineno] = Parser._nextChar(s, i, lineno); // ignore \ at end of line, combining two lines
                    continue;
                }
                c = '\\' + c; // pass the \x characters trough
            }
            if (c === '\n') break;
            value += c;
            [c, i, lineno] = Parser._nextChar(s, i, lineno);
        }
        value = value.trim();
        if (value[0] === '[' && value.slice(-1) === ']') value = Parser._parseArray(value.slice(1, -1), lineno);
        else if (value[0] === '[') throw `${lineno}: Cannot begin value with '[' (check for multiline error, or consider escaping with '\\')`;
        return [value, c, i, lineno];
    }
    static _parseArray(value, lineno) {
        let s = value;
        let i = 0;
        let c = null;
        let term = "";
        let list = new List();
        let last = i;
        [c, i, lineno] = Parser._nextChar(s, i, lineno);
        while (c) {
            if (c === '\\') { //
                [c, i, lineno] = Parser._nextChar(s, i, lineno);
                [c, i, lineno] = Parser._nextChar(s, i, lineno);
            } else if (c === Parser.SEP) {
                term = s.substring(last, i - 1);
                let [entry] = Entry._parse(term, 0, lineno);
                list.add(entry);
                [c, i, lineno] = Parser._nextChar(s, i, lineno);
                last = i;
            } else {
                [c, i, lineno] = Parser._nextChar(s, i, lineno);
            }
        }
        term = s.substring(last, i);

        let [entry] = Entry._parse(term, 0, lineno);
        list.add(entry);
        return list;
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

let TERMINALS = "():"
function test2_term(p, last_data) {
    let data = last_data || {};
    let value;
    let c = p.skip();
    if (c === ')') return data;
    let key = p.nextToken();
    if (!key) throw "Bad character '" + p.getChar() + "' found at " + p.getCursor();
    let colon = p.nextToken(":");
    if (!colon) throw "Bad character '" + p.getChar() + "' found at " + p.getCursor();
    c = p.skip();
    if (c === '(') {
        value = test2_lpar(p);
    } else {
        value = p.nextToken();
        if (!value) throw "Bad character '" + p.getChar() + "' found at " + p.getCursor();
    }
    data[key] = value;
    return test2_term(p, data);
}

function test2_lpar(p) {
    let c = p.nextToken("(");
    let data;
    if (c === "(") {
        data = test2_term(p);
    }
    return data;
}
function test2() {
    let p = new Parser("  (token1:  (token2: (token3: \n token4) token5:token6)))  ");
    let data = test2_lpar(p);
    console.log(JSON.stringify(data));
}

//test1();
test2();

module.export = Parser;