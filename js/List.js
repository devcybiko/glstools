require('magic-globals');
const is = require('./glschars');


class List {
    constructor(entry) {
        this._list = [];
        if (entry) this.add(entry);
    }

    static parse(s) {
        let list = null;
        let c = null;
        let i = 0;
        let lineno = 0;
        let spaces = null;
        [spaces, c, i, lineno] = Parser._skipSpaces(s, i, lineno, "", false);
        [list] = List._parse(s, c, i, lineno);
        return list;
    }

    static _parse(s, c, i = 0, lineno = 1) {
        let list = new List();
        let entry = null;
        let spaces = null;
        if (c !== '(') throw `${lineno}: Expected '(' but got '${c}'`;
        while (c !== ')') {
            [entry, i, lineno] = Entry._parse(s, i, lineno);
            if (entry.value === '(') {
                [entry.value, c, i, lineno] = List._parse(s, '(', i, lineno);
                list.add(entry);
                [c, i, lineno] = Parser._nextChar(s, i, lineno, 1); // skip over the ')'
                [spaces, c, i, lineno] = Parser._skipSpaces(s, i, lineno, "", true); // skip to the next valid character (and reRead it)
            } else {
                list.add(entry);
                [spaces, c, i, lineno] = Parser._skipSpaces(s, i, lineno, "", true); // skip to the next valid character (and reRead it)
            }
        }
        return [list, c, i, lineno];
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
        for(let entry of this._list) {
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
        if (typeof(value) === 'string') value = Parser._handleEscape(value); // handle escape charater '\'
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
        let className = value.constructor.name;
        if (className !== 'String' && className !== 'List') throw "Entry value may only be a 'String' or 'List'";
        this._value = value;
    }
    get escapedValue() {
        let s = this.value;
        let r = "";
        if (typeof(s) !== 'string') return s;
        for(let i=0; i<s.length; i++) {
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
        return `${this.key}: ${this.escapedValue}`;
    }
}

class Parser {
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
            if (0 < i) c = s[i-1];
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
        while(c) {
            if (c === '\\') { //
                [c, i, lineno] = Parser._nextChar(s, i, lineno);
                [c, i, lineno] = Parser._nextChar(s, i, lineno);
            } else if (c === Parser.SEP) {
                term = s.substring(last, i-1);
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
Parser.SEP = ",";

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
    console.log("'"+l.toString()+"'");

    l = List.parse(`
    (
        key: value
        key1: (
            key2:value2
        )
    )
    `);
    console.log("'"+l.toString()+"'");

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

    l.visit(entry => {console.log(entry.key)});
    //l.visit(entry => {console.log(entry.key, entry.value.toString()); return entry.key.includes("2")});
}

//test1();
//test2();
test3();

module.export = {List, Entry, Parser};