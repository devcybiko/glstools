require('magic-globals');
const StringBuffer = require('./StringBuffer')

class Tokenizer {
    constructor(s) {
        this._sb = new StringBuffer(s);
        this._cursor = 0;
        this._line = 0;
        this._context = [
            { _quote1: /^"$/, _end: '"'},
            { _quote2: /^'$/, _end: "'"},
            { _quote3: /^`$/, _end: '`'},
            { _bracketed: /^\[$/, _end: ']'},
            { _comment: /^[/]{2}$/, _end: '\n'},
            { _block_comment: /^[/][*]$/, _end: '*/'},
            { int: /^[1-9]\d*$/},
            { digits: /^\d+$/},
            { float: /^\d+[.]\d*$/},
            { scientific: /^\d+[.]\d*[eE][+-]?\d*$/},
            { variable: /^[a-zA-Z_]\w+$/ },
            { term: /^\w+$/ },
            { number: /^\d+$/ },
            { spaces: /^\s+$/ },
            { terminal: /^[^\s\w\d]$/ },
        ]
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
    getContext() {
        return this._context;
    }
    setContext(context) {
        this._context = context;
    }
    getLine() {
        return this._line;
    }
    setLine(line) {
        this._line = line;
    }
    getChar() {
        return this._sb.get(this._cursor);
    }
    setChar(c) {
        return this._sb.set(this._cursor, c);
    }
    scanto(startquote, endquote, escape) {
        let value = startquote;
        for (let c = this.nextChar(escape);
            c;
            c = this.nextChar(escape)) {
            value += c;
            if (value.endsWith(endquote)) break;
        }
        return value;
    }
    nextChar(escape='\\') {
        let [i, c] = this._sb.next(this._cursor);
        if (c === escape) {
            [i, c] = this._sb.next(i); // get the next character
            if (c === '\n') [i, c] = this._sb.next(i); // swallow backslash - newline
            else if (c === 'n') c = '\n'; // convert backslash - n to newline
            // console.log({c});
        } 
        if (c === '\n') this._line++;
        this._cursor = i;
        return c;
    }
    matches(value) {
        //console.log(__line, value);
        for (let i = 0; i < this._context.length; i++) {
            let entry = this._context[i];
            let name = Object.keys(entry)[0]; // will this always work?
            let pattern = entry[name];
            let match = value.match(pattern);
            if (match) {
                //console.log({__line, name, match});
                return { name, value, entry };
            }
        }
       //console.log({__line});
        return null;
    }
    next(escape='\\') {
        let me = "next";
        //console.log({me, pattern, skip});
        let c = this.nextChar();
        let patternValue = "";
        let realValue = "";
        let lastValue = null;
        let isEscaped = false;
        while (c) {
            // console.log({c});
            if (c === escape) { // don't include this in the pattern matching this round
                c = this.nextChar();
                //console.log({__line, escape, c, value: patternValue});
                isEscaped = true;
                realValue += c;
            } else {
                patternValue += c;
                realValue += c;
            }
            let match = this.matches(patternValue);
            if (!match) {
                //console.log({__line, match, value: patternValue});
                this.unget();
                break;
            } else if (match.name[0] === '_') { // special concession for quoted strings
                    let name = match.name;
                    let endQuote = match.entry['end_'];
                    realValue = this.scanto(realValue, endQuote, escape);
                    lastValue =  {name, value: realValue};
                    break;
            }
            lastValue = {name: match.name, value: realValue};
            c = this.nextChar();
        }
        if (c && lastValue === null) {
            throw {msg: "Could not parse: '" + c + "'", line: this.getLine()};
        }
        return lastValue;
    }
}
module.exports = Tokenizer;