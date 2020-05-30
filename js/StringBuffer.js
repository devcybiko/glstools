require('magic-globals');

class StringBuffer {
    constructor(s) {
        this._s = s.split('');
    }
    length() {
        return this._s.length;
    }
    /**
     * returns true if i is between [0, s.length-1]
     * when post=1 returns true if i is between [0, s.length]
     * @param {*} i 
     * @param {*} post 
     */
    inBounds(i, post=0) {
        if (i >= this._s.length + post) return false;
        if (i < 0) return false;
        return true;
    }


    bound(i) {
        if (i < 0) i = this.length() + i;
        return i;
    }
    /**
     * returns the character at i
     * returns null if out of bounds
     */
    get(i) {
        i = this.bound(i);
        if (!this.inBounds(i)) return null;
        return this._s[i];
    }

    /**
     * sets the selected character
     * returns null if bad 'c' or i out of bounds
     * else returns 'this'
     */
    set(i, c) {
        if (c.length != 1) return null;
        i = this.bound(i);
        if (!this.inBounds(i)) return null;
        this._s[i] = c;
        return this;
    }

    /**
     * add s to the end of StringBuffer
     */
    append(s) {
        return this.insert(this._s.length, s);
    }
    /**
     * insert string at point 'i'
     */
    insert(i, s) {
        i = this.bound(i);
        if (!this.inBounds(i, 1)) return null;
        let tmp = this._s.join('');
        let a = tmp.substring(0, i);
        let b = tmp.substring(i);
        this._s = (a + s + b).split('');
        return this;
    }

    /**
     * returns a String, substring of StringBuffer
     */
    substring(a,b) {
        a = this.bound(a);
        b = this.bound(b,1);
        if (!this.inBounds(a)) return null;
        if (!this.inBounds(b)) return null;
        let s = this._s.join('');
        return s.substring(a,b);
    }

    /**
     * substring function, but returns a StringBuffer
     */
    substr(a,b) {
        return new StringBuffer(this.substring(a,b));
    }

    /**
     * returns the current character at 'i'
     * increments 'i' 
     * returns i and the character at original value of i
     * inc may be zero or negative
     * returned 'i' is truncated to [0,_s.length]
     * returned char is null if 'i' is out of range
     * @param {*} i 
     * @param {*} inc 
     */
    next(i, inc=1) {
        let c = this.get(i);
        i += inc;
        i = this.bound(i);
        return [i, c];
    }
    /**
     * increments i 
     * returns i and the next character at i
     * inc may be zero or negative
     * returns incremented 'i'
     * and 'char' which may be null if out of bounds
     *
     *  ***Does not check for out of bounds 'i'***
     *
     * @param {*} i 
     * @param {*} inc 
     */
    inext(i, inc=1) { 
        let c = this.get(i);
        i += inc;
        return [i, c];
    }
    toString() {
        return this._s.join('');
    }
}

module.exports = StringBuffer;