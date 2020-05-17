class List {
    constructor() {
        this._list = [];
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

    toString() {
        return `${this.key}: ${this.value}`;
    }
}

function main() {
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

    for (let i = 0; i< l.length; i++ ) {
        let entry = l.get(i);
        console.log(entry.toString());
    }
    for (let i = 0; i< l.length; i++ ) {
        let entry = l.get(i);
        console.log(entry.toString());
    }
    console.log("" + x);
}

main();