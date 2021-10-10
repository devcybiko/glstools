const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

module.exports = {
    checkRestricted: function (src, restricted) {
        return !src.split("").some(ch => restricted.indexOf(ch) !== -1);
    },
    replaceAll: function (target, search, replacement) {
        return target.replace(new RegExp(search, 'gm'), replacement);
    },

    // Caesar shift by Evan Hahn (evanhahn.com)
    // caesarShift('Attack at dawn!', 12);    // Returns "Mffmow mf pmiz!"
    // caesarShift('Mffmow mf pmiz!', -12);    // Returns "Attack at dawn!"
    caesar: function (str, amount) {
        if (amount < 0)
            return this.caesar(str, amount + 26);
        var output = '';
        for (var i = 0; i < str.length; i++) {
            var c = str[i];
            if (c.match(/[a-z]/i)) {
                var code = str.charCodeAt(i);
                if ((code >= 65) && (code <= 90))
                    c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
                else if ((code >= 97) && (code <= 122))
                    c = String.fromCharCode(((code - 97 + amount) % 26) + 97)
            }
            output += c;
        }
        return output;
    },
    isLower: function (s) {
        return s.toLowerCase() === s;
    },
    isUpper: function (s) {
        return s.toUpperCase() === s;
    },
    expand: function (str, env) {
        if (!env) return str;
        let result = "";
        let pattern = /\$\{(.*?)\}/gm;
        let matches = str.matchAll(pattern);
        let last = 0;
        for (let match of matches) {
            result += str.substring(last, match.index);
            let exp = env[match[1]];
            if (exp) {
                result += exp;
            } else {
                result += match[0];
            }
            last = match.index + match[0].length;
        }
        result += str.substring(last);
        return result;
    },
    meta: function (str, env, limit = 8) {
        if (!env) return str;
        let last = null;
        let result = str;
        while (limit && (last !== result)) {
            last = result;
            result = this.expand(last, env);
            limit--;
        };
        return result;
    },
    substring: function (str, start = 0, end) {
        if (end < 0) end = str.length + end;
        let result = str.substring(start, end);
        return result;
    },
    tochar: function (s = "") {
        return s.length ? s.charCodeAt(0) : undefined;
    },
    istext: function (s = "", threshold = 1.0) {
        let ok = 0;
        let maxcnt = Math.min(s.length, 1000) || 1;
        for (let i = 0; i < maxcnt; i++) {
            let c = this.tochar(s[i]);
            if ((31 < c && c < 128) || c == 9 || c == 10 || c == 13) ok++
        }
        let diff = ok / maxcnt;
        return diff >= threshold;
    },
    indexOf: function (str, c) {
        return str.indexOf(c) + 1;
    },
    uuid(prefix = "") {
        let uuid = uuidv4();
        return prefix + "-" + uuid;
    },
    passwordEncrypt(password, salt="salt") {
        let hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        let hashedPassword = hash.digest('hex');
        return hashedPassword;
    },
    passwordCompare(password, encryptedPassword, salt) {
        let hashedPassword = this.passwordEncrypt(password, salt);
        return encryptedPassword === hashedPassword;
    },
    hash(s, prefix) {
        const m1 = crypto.createHash('md5'); // can this be cached for performance? does it matter?
        const hash = m1.update(s).digest('hex');
        if (prefix) return prefix + "-" + hash;
        else return hash;
    }
}