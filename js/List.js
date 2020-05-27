require('magic-globals');
const is = require('./glschars');
const Lexer = require('./Lexer');
const strings = require('./glsstrings');

class List {
    constructor(entry) {
        this._list = [];
        if (entry) this.add(entry);
    }
    get(i) {
        return this._list[i];
    }
    set(i, value) {
        let className = value.constructor.name;
        if (typeof (i) !== 'number') throw "index may only be a 'number'";
        if (className !== 'Entry') throw "List value may only be an 'Entry'";
        this._list[i] = value;
    }
    add(value) {
        let className = value.constructor.name;
        if (className !== 'Entry') throw "List value may only be an 'Entry'";
        this._list.push(value);
    }
    get length() {
        return this._list.length;
    }
    get list() {
        return this._list;
    }

    /**
     * visitor pattern.
     * recursive dfs descent
     * callback(entry) - return TRUE if you want to PRUNE the tree (stop descending)
     */
    visit(callback) {
        for (let entry of this._list) {
            let prune = callback(entry);
            if (!prune && entry.value.constructor.name === "List") {
                entry.value.visit(callback);
            }
        }
    }

    toString() {
        let indent = "  ".repeat(List.tabs);
        let s = "(";
        for (let entry of this._list) {
            if (entry.constructor.name === "Entry") {
                List.tabs++;
                indent = "  ".repeat(List.tabs);
                s += "\n" + indent + entry.toString();
                List.tabs--;
                indent = "  ".repeat(List.tabs);
            } else {
                List.tabs++;
                s += "\n" + entry.toString();
                List.tabs--;
                indent = "  ".repeat(List.tabs);
            }
        }
        s += "\n" + indent + ")";
        return s;
    }
    static parse(s) {
        let l = new Lexer(s);
        let context = {
            WORDS: /\w/,
            DIGITS: null,
            SPACES: /\s/,
            TERMINALS: "(:)",
            START_QUOTES: "\n",
            END_QUOTES: "\n"
        };
        let patterns = [
            { name: "literalString", pattern: /^\n.*\n$/ },
            { name: "variable", pattern: /^[a-zA-Z_]\w*?$/ },
            { name: "operator", pattern: /[<>!=.+\-*\/%]/ },
            { name: "terminator", pattern: "(:)" },
            { name: "spaces", pattern: /\s/ },
        ];
        l.setContext(context);
        l.setPatterns(patterns);
        let lexeme = l.next();
        if (lexeme.token !== '(') throw { msg: "expected '('", lexeme, line: l.getLine() };
        return List._lpar(l);
    }

    static _lpar(l) {
        let list = new List();
        for (let lexeme = l.next();
            lexeme;
            lexeme = l.next()) {
            console.log({lexeme});
            if (lexeme.token === ')') return list;
            if (lexeme.type === 'spaces') continue;
            if (lexeme.type !== 'variable') throw { msg: "Expected variable", lexeme, line: l.getLine() };
            let name = lexeme.token;
            lexeme = l.next();
            console.log({name, lexeme});
            if (lexeme.token !== ':') throw { msg: "Expected colon - did you use '=' instead?", lexeme, line: l.getLine() };
            let value = l._t.quotedToken("\n").trim();
            console.log({value});
            if (value === '(') {
                value = List._lpar(l);
            } else if (false && value[0] === '[') {
                value = List._array(value);
            }
            let entry = new Entry(name, value);
            list.add(entry);
            console.log(entry);
        }
    }
    static _array(s, lineno=1) {
        let list = new List();
        let l = new Lexer(s);
        let context = {
            WORDS: /\w/,
            DIGITS: null,
            SPACES: /\s/,
            TERMINALS: "[:,]",
            START_QUOTES: "\n",
            END_QUOTES: "\n"
        };
        let patterns = [
            { name: "literalString", pattern: /^\n.*\n$/ },
            { name: "variable", pattern: /^[a-zA-Z_]\w*?$/ },
            { name: "operator", pattern: /[<>!=.+\-*\/%]/ },
            { name: "terminator", pattern: "(:)" },
            { name: "spaces", pattern: /\s/ },
        ];
        l.setContext(context);
        l.setPatterns(patterns);
        let lexem = l.next();
        if (lexeme.token !== '[') throw {msg: "Arrays must be encapsulated by '[' and ']'", line: lineno};
        for(lexeme = l.next();
            lexeme;
            lexeme = l.next()) {
                if (lexeme.token === ']') return list;
                if (!lexmem.type === 'variable') throw { msg: "Expected variable", lexeme, line: lineno };
                let name = lexeme.name;
                lexeme = l.next();
                if (lexeme.token !== ':') throw { msg: "Expected colon - did you use '=' instead?", lexeme, line: l.getLine() };
    }

}
List.tabs = 0;

class Entry {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }

    static parse(s) {
        let entry = null;
        [entry] = Entry._parse(s, 0, 1);
        return entry;
    }

    static _parse(s, i = 0, lineno = 1) {
        let entry = null;
        let c = null;
        let key = null;
        let value = null;
        [key, c, i, lineno] = Parser._getKey(s, i, lineno);
        [value, c, i, lineno] = Parser._getValue(s, i, lineno);
        key = Parser._handleEscape(key); // handle escape charater '\'
        if (typeof (value) === 'string') value = Parser._handleEscape(value); // handle escape charater '\'
        // if (key && value) entry = new Entry(key, value);
        entry = new Entry(key, value);
        return [entry, i, lineno];
    }

    get key() {
        return this._key;
    }
    set key(key) {
        if (typeof (key) !== 'string') {
            throw "Entry key may only be a 'string'";
        }
        this._key = key;
    }
    get value() {

        return this._value;
    }
    set value(value) {
        console.log({ value });
        let className = value.constructor.name;
        if (className !== 'String' && className !== 'List') throw "Entry value may only be a 'String' or 'List'";
        this._value = value;
    }
    get escapedValue() {
        let s = this.value;
        let r = "";
        if (typeof (s) !== 'string') return s;
        for (let i = 0; i < s.length; i++) {
            let c = s[i];
            if (c === '\\') {
                r += c + c;
            } else {
                r += c;
            }
        }
        return r;
    }
    toString() {
        return `{${this.key}: ${this.escapedValue}}`;
    }
}
function test1() {
    let x = new List();
    let l = new List();

    let e = new Entry("e", "f");
    let f = new Entry("f", l);
    let g = new Entry("g", "h");
    let h = new Entry("h", "i");

    x.add(e);
    x.add(f);

    l.add(g);
    l.add(h);

    for (let i = 0; i < l.length; i++) {
        let entry = l.get(i);
        console.log(entry.toString());
    }
    for (let i = 0; i < l.length; i++) {
        let entry = l.get(i);
        console.log(entry.toString());
    }
    console.log("" + x);
}

function test2() {
    let e = Entry.parse("   key : value   ");
    console.log("'" + e.toString() + "'");

    e = Entry.parse("   key : value   \\");
    console.log("'" + e.toString() + "'");
    e = Entry.parse("   key : value  \\   \n..."); // this should probably give { key: 'key', value: 'value   ' } not { key: 'key', value: 'value  ' }
    console.log("'" + e.toString() + "'");
    e = Entry.parse("   key : value  \\\\    \n...");
    console.log("'" + e.toString() + "'");
}

function test3() {
    let l = null;
    l = List.parse(`
    (
        key1: value1
        key2: value2
    )
    `);
    console.log("'" + l.toString() + "'");

    l = List.parse(`
    (   key1: value1
    key2: value2
    )
    `);
    console.log("'" + l.toString() + "'");

    l = List.parse(`
    (
        key: value
        key1: (
            key2:value2
        )
    )
    `);
    console.log("'" + l.toString() + "'");

    let txt = `(
        key-0: value0 \\\\
        key(1$) : (
            key[2]: [class:foo, action:bar("string"\\, "value");, text:This is a test, color:RED]    
            key5 : (
                key6 : value6, and more
                key_number_7:   \\
                        value_7 plus more stuff
            )
        )
        key!@#8: the final value of 8!
    )
    `;
    l = List.parse(txt);
    console.log("'" + l.toString() + "'");
    let serialized = l.toString();
    let deserialized = List.parse(serialized);
    console.log(deserialized.toString());

    l.visit(entry => { console.log(entry.key) });
    //l.visit(entry => {console.log(entry.key, entry.value.toString()); return entry.key.includes("2")});
}

function test4() {
    let s = `(
        alpha: beta
        charlie: delta   dawn   what's that flower you have on
        epsilon: frapsilon for \
too much fun
        gamma : (
            helios : indium
        )
        array : [a:b, c:d, e:f, h:i]
    )`;
    let list = List.parse(s);
    console.log(list.toString());
}
//test1();
//test2();
//test3();
test4();

module.export = { List, Entry };