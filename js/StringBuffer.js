require('magic-globals');

class StringBuffer {
    constructor(s) {
        this._s = s;
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
    /**
     * returns 0 if i < 0
     * returns s.length-1 if i >= s.length
     * if post=1 returns s.length if i>=s.length
     * else returns i
     * @param {*} i 
     * @param {*} post 
     */
    bound(i, post=0) {
        if (i >= (this._s.length + post)) return this._s.length - 1 + post;
        if (i < 0) return 0;
        return i;
    }
    /**
     * returns the character at i
     * if i is at the end or before the beginning a null is returned
     */
    get(i) {
        if (!this.inBounds(i)) return null;
        return this._s[i];
    }

    /**
     * sets the current character or appends
     */
    set(i, c) {
        if (c.length != 1) return null;
        if (!this.inBounds(i)) return null;
        return this.insert(i, c);
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
        if (!this.inBounds(i, 0, 1)) return null;
        let a = this._s.substring(0, i);
        let b = this._s.substring(i+1);
        this._s = a + s + b;
        return this;
    }

    /**
     * substring on StringBuffer
     * handles negative 'b' as from the end of the string
     */
    substring(a,b) {
        if (b < 0) b = this.length() + b + 1;
        a = this.bound(a);
        b = this.bound(b,1);
        return this._s.substring(a,b);
    }

    /**
     * substring function, but returns a StringBuffer
     */
    substr(a,b) {
        return new StringBuffer(this.substring(a,b));
    }
    /**
     * increments 'i'
     * 'inc' may be zero or negative
     * returns 0 if i goes less than 0
     * returns _s.length if i goes greater than _s.length
     * 
     * @param {int} i 
     * @param {int} inc 
     */
    inc(i, inc=1) {
        i += inc;
        if (i >= this._s.length) i = this._s.length;
        if (i < 0) i = 0;
        return i;
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
        i = this.inc(i, inc);
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
        return this._s;
    }
}

module.exports = StringBuffer;