require('magic-globals');
const Tokenizer = require('./Tokenizer');
const Entry = require('./Entry');
const strings = require('./glsstrings');

/**
 */
class List {
    constructor(key, value, line) {
        this._list = [];
        if (key) this.add(key, value, line);
    }
    [Symbol.iterator]() {
        let i = 0;
        return {
            next: () => {
                if (i < this.length()) return { value: this.getEntry(i++), done: false };
                else return { done: true };
            }
        }
    }

    get(key) {
        if (typeof(key) === "string") return this.find(key);
        return this.getEntry(key).getValue();
    }

    getEntry(key) {
        if (typeof(key) === "string") return this.find(i);
        if (typeof (key) !== 'number') throw "index may only be a 'number' or a 'string'";
        return this._list[key];
    }

    set(key, value, line) {
        let oldEntry = this.getEntry(key);
        if (!oldEntry) return this.add(key, value, line);
        oldEntry.setValue(value);
        oldEntry.setLine(line || oldEntry.getLine());
        return this;
    }

    add(keyOrEntry, value, line) {
        if (value === undefined) { // single param - key is an entry
            value = keyOrEntry;
        } else {
            value = new Entry(keyOrEntry, value, line);
        }
        let className = value.constructor.name;
        if (className !== 'Entry') throw "List value may only be an 'Entry'";
        this._list.push(value);
        return this;
    }
    length() {
        return this._list.length;
    }

    find(name) {
        for (let i = 0; i < this.length(); i++) {
            let entry = this.getEntry(i);
            if (entry.getKey() === name) return entry.getValue();
        }
        return null;
    }

    findAll(name) {
        let results = [];
        for (let i = 0; i < this.length(); i++) {
            let entry = this.getEntry(i);
            if (entry.getKey() === name) results.push(entry.getValue());
        }
        return results;
    }

    findDFS(name) {
        for (let i = 0; i < this.length(); i++) {
            let entry = this.getEntry(i);
            if (entry.getKey() === name) return entry.getValue();
            if (List.isList(entry.getValue())) {
                let result = entry.getValue().findDFS(name);
                if (result) return result;
            }
        }
        return null;
    }

    findAllDFS(name) {
        let results = [];
        this.visit(entry => {
            if (entry.getKey() === name) results.push(entry.getValue());
        });
        return results;
    }

    /**
     * visitor pattern.
     * recursive dfs descent
     * callback(entry) - return TRUE if you want to PRUNE the tree (stop descending)
     */
    visit(callback) {
        for (let entry of this._list) {
            let prune = callback(entry);
            if (!prune && List.isList(entry.getValue())) {
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
    static isList(obj) {
        if (!obj) return false;
        return obj.constructor.name === 'List';
    }
    static parse(s) {
        let t = new Tokenizer(s);
        let context = [
            { _comment: /^[//]$/, end_: '\n'},
            { _bracketed: /^\[$/, end_: ']' },
            { term: /^\w+$/ },
            { spaces: /^\s+$/ },
            { terminal: /^[^\s\w/]$/ },
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
        // console.log({token, line: t.getLine()});
        return token;
    }

    static _array(s, line) {
        let list = new List();
        s = strings.substring(s, 1, -1);
        s = strings.replaceAll(s, /[\\]/, "\\\\"); // some kind of f'd up. need to double-up escapes
        let t = new Tokenizer(s);
        t.setLine(line);
        let context = [
            { terminal: /^[,:]$/ },
            { term: /^[^,:]+$/ },
        ];
        t.setContext(context);
        for (let token = List._next(t);
            token;
            token = List._next(t)) {
                if (token.value === ',') continue;
                if (token.name != "term") throw { msg: "Expected a term", token, line: t.getLine() };
            // ({token});
            let colon = List._next(t);
            // console.log({colon});
            if (colon === null || colon.value != ':') throw { msg: "Expected a colon", token, line: t.getLine() };
            let value = List._next(t);
            // console.log({value});
            if (value === null) throw { msg: "Missing value" };
            let entry = new Entry(token.value.trim(), value.value.trim(), t.getLine());
            // console.log(entry);
            list.add(entry);
        }
        return list;
    }

    static _entry(t) {
        let key = List._next(t);
        while (key.name === '_comment') { // comment
            key = List._next(t);
        }
        if (key.value === ')') return null;
        if (key.name !== "term") throw { msg: "Invalid key for Entry", key, line: t.getLine() };
        let colon = List._next(t);
        if (colon.value !== ":") throw { msg: "Expected a colon - did you use an = when you meant : ?", colon, line: t.getLine() };
        let value = t.scanto("", "\n").trim(); // get the rest of the line
        // console.log({value});
        if (value === '(') value = List._lpar(t);
        if (value[0] === '[') value = List._array(value, t.getLine());
        // console.log({key, value});
        let entry = new Entry(key.value, value, t.getLine());
        return entry;
    }

    static _lpar(t) {
        let list = new List();
        for (let entry = List._entry(t);
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