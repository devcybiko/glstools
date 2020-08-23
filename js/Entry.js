class Entry {
    constructor(key, value, line=0) {
        this._key = key;
        this._value = value;
        this._line = line;
    }

    getKey() {
        return this._key;
    }
    setKey(key) {
        if (typeof (key) !== 'string') {
            throw "Entry key may only be a 'string'";
        }
        this._key = key;
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        // console.log({ value });
        let className = value.constructor.name;
        if (className !== 'String' && className !== 'List') throw "Entry value may only be a 'String' or 'List'";
        this._value = value;
    }
    getLine() {
        return this._line;
    }
    setLine(line) {
        this._line = line;
    }
    escapedValue() {
        let s = this._value;
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
        // return `{${this._key}: ${this.escapedValue()}}`;
        return `${this._key}: ${this.escapedValue()}`;
    }
    static isEntry(obj) {
        if (!obj) return false;
        return obj.constructor.name === 'Entry';
    }

}

module.exports = Entry;