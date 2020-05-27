const StringBuffer = require('./StringBuffer')

class Tokenizer {
    constructor(s) {
        this._sb = new StringBuffer(s);
        this._cursor = 0;
<<<<<<< HEAD
        this._line = 1;
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
=======
        this.WORD = /\w|[.]/;
        this.SPACE = /\s/;
        this.TERMINALS = "(:)!@#$%^&*{}[]|\\?/>.<,\"'";
>>>>>>> d4a4dc99788e4a5eb2d0134c2a6ade914d28cddd
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
    getChar() {
        return this._sb.get(this._cursor);
    }
    setChar(c) {
        return this._sb.set(this._cursor, c);
    }
    scanto(startquote, endquote) {
        let value = startquote;
        for (let c = this.nextChar();
            c;
            c = this.nextChar()) {
            value += c;
            if (value.endsWith(endquote)) break;
        }
        return value;
    }
    nextChar() {
        let [i, c] = this._sb.next(this._cursor);
        this._cursor = i;
        if (c === '\n') this._line++;
        return c;
    }
    matches(value) {
        for (let i = 0; i < this._context.length; i++) {
            let entry = this._context[i];
            let name = Object.keys(entry)[0]; // will this always work?
            let pattern = entry[name];
            let match = value.match(pattern);
            //console.log({name, match});
            if (match) {
                return { name, value, entry };
            }
        }
        return null;
    }
<<<<<<< HEAD
    next() {
        let me = "next";
        //console.log({me, pattern, skip});
        let c = this.nextChar();
        let value = "";
        let lastValue = null;
        while (c) {
            // console.log({c});
            value += c;
            let match = this.matches(value);
            if (!match) {
                this.unget();
                break;
            } else if (match.name[0] === '_') { // special concession for quoted strings
                    let name = match.name;
                    let endQuote = match.entry['_end'];
                    value = this.scanto(value, endQuote);
                    lastValue =  {name, value};
                    break;
            }
            lastValue = {name: match.name, value: match.value};
=======
    next(pattern = this.WORD, skip = this.SPACE) {
        let me = "next";
        //console.log({me, pattern, skip});
        let c;
        let token = null;
        if (skip) this.skip(skip);
        c = this.nextChar();
        if (this.matches(this.TERMINALS, c)) return c;
        //console.log({me, c});
        while (c != null) {
            //console.log({me, token, c});
            if (!this.matches(pattern, c)) {
                this.unget();
                break;
            } else if (this)
            token = (token || "") + c;
>>>>>>> d4a4dc99788e4a5eb2d0134c2a6ade914d28cddd
            c = this.nextChar();
        }
        if (c && lastValue === null) {
            throw {msg: "Could not parse: '" + c + "'", line: this.getLine()};
        }
        return lastValue;
    }
}

<<<<<<< HEAD
function test1() {
    let p = new Tokenizer("   token1  token2 token3 \n token4  ");
    for (let token = p.next();
=======
function test2() {
    let p = new Parser("   token1  token2 token3 \n token4  ");
    for (let token = p.nextToken();
>>>>>>> d4a4dc99788e4a5eb2d0134c2a6ade914d28cddd
        token;
        token = p.next()) {
        console.log(token);
    }
    console.log();
}

function test2() {
    let s = `(1 1. 1.e 1.- 1.e3 1.E+ 1.3E6 1.3E-6 
        007 007bond 150 $ % [baker is 00the name of the baker], 
        // this is a comment
        /****
         *  this is a block comment
         * this is line two
         * this is the end of the block comment ******/ 
        \`this \\is \\nthe name of the other baker\`, 
        'this is another quoted string', (charlie:delta, \nepsilon:faragon, garligon:harligon), )`;
    let p = new Tokenizer(s);

    for (let token = p.next();
        token;
        token = p.next()) {
        if (token.name !== 'spaces') console.log(token.value);
    }
}

<<<<<<< HEAD
test1();
test2();
=======
function test1(s) {
    let p = new Tokenizer(s);
    for(let token = p.next();
        token;
        token = p.next()) {
            console.log(token);
    }
}

// test1("(alpha:beta, (gamma:delta, epsilon:fragrau, gemini:halcion), )");
// test1("   token1  token2 token3 \n token4  ");
>>>>>>> d4a4dc99788e4a5eb2d0134c2a6ade914d28cddd

module.exports = Tokenizer;