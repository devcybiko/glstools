require('magic-globals');
const Tokenizer = require('./Tokenizer');
const Entry = require('./Entry');
const strings = require('./glsstrings');

/**
 */
class List {
    constructor(key, value) {
        this._list = [];
        if (key) this.add(key, value);
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
    add(key, value) {
        if (value === undefined) { // single param - key is an entry
            value = key;
        } else {
            value = new Entry(key, value);
        }
        let className = value.constructor.name;
        if (className !== 'Entry') throw "List value may only be an 'Entry'";
        this._list.push(value);
        return this;
    }
    length() {
        return this._list.length;
    }

    /**
     * visitor pattern.
     * recursive dfs descent
     * callback(entry) - return TRUE if you want to PRUNE the tree (stop descending)
     */
    visit(callback) {
        for (let entry of this._list) {
            let prune = callback(entry);
            if (!prune && entry.getValue().constructor.name === "List") {
                entry.getValue().visit(callback);
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
        let t = new Tokenizer(s);
        let context = [
            { _bracketed: /^\[$/, _end: ']' },
            { term: /^\w+$/ },
            { spaces: /^\s+$/ },
            { terminal: /^[^\s\w]$/ },
        ];
        t.setContext(context);
        let token = List._next(t);
        if (token.value !== '(') throw { msg: "expected '('", token, line: t.getLine() };
        return List._lpar(t);
    }

    static _next(t, spaces = false, escape) {
        let token = t.next(escape);
        if (!token || spaces) return token;
        if (token.name === 'spaces') token = t.next(escape); // we're assuming you can never return spaces twice in a row
        return token;
    }

    static _array(s) {
        let list = new List();
        s = strings.substring(s, 1, -1);
        s = strings.replaceAll(s, /[\\]/, "\\\\"); // some kind of f'd up. need to double-up escapes
        let t = new Tokenizer(s);
        let context = [
            { terminal: /^[,:\\]$/ },
            { term: /^[^,:\\]+$/ },
        ];
        t.setContext(context);
        for(let token = List._next(t);
            token;
            token = List._next(t)) {
                if (token.value === ',') continue;
                if (token.name != "term") throw {msg: "Expected a term", token, line: t.getLine()};
                // ({token});
                let colon = List._next(t);
                // console.log({colon});
                if (colon === null || colon.value != ':') throw {msg: "Expected a colon", token, line: t.getLine()};
                let value = List._next(t);
                // console.log({value});
                if (value === null) throw {msg: "Missing value"};
                let entry = new Entry(token.value.trim(), value.value.trim());
                // console.log(entry);
                list.add(entry);
            }
        return list;
    }

    static _entry(t) {
        let key = List._next(t);
        if (key.value === ')') return null;
        if (key.name !== "term") throw { msg: "Invalid key for Entry", key, line: t.getLine() };
        let colon = List._next(t);
        if (colon.value !== ":") throw { msg: "Expected a colon - did you use an = when you meant : ?", colon, line: t.getLine() };
        let value = t.scanto("", "\n").trim(); // get the rest of the line
        // console.log({value});
        if (value === '(') value = List._lpar(t);
        if (value[0] === '[') value = List._array(value);
        // console.log({key, value});
        let entry = new Entry(key.value, value);
        return entry;
    }

    static _lpar(t) {
        let list = new List();
        for(let entry = List._entry(t);
            entry;
            entry = List._entry(t)) {
                //console.log(entry);
                list.add(entry);
        }
        return list;
    }
}
List.tabs = 0;

module.exports = List;