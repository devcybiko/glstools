module.exports = {
    _escapeChars : {
        '0': '\0',
        'b': '\b',
        'f': '\f',
        'n': '\n',
        'r': '\r',
        't': '\t',
        'v': '\v',
        "'": '\'',
        '"': '\"',
        '\\': '\\'
    },
    isspace : function(c = "") {
        return /\s/.test(c)
    },
    isescape: function(c = "") {
        return this._escapeChars[c];
    },
    isvar: function(c = "") {
        return ("01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".indexOf(c) !== -1);
    },
    isupper: function(s = "") {
        return s.length && s[0].toUpperCase() === s;
    },
    islower: function(s = "") {
        return s.length && s[0].toLowerCase() === s;
    },
    tochar: function(s = "") {
        return s.length ? s.charCodeAt(0) : undefined;
    }
}