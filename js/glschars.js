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
    space : function(c) {
        return /\s/.test(c)
    },
    escapeable: function(c) {
        return this._escapeChars[c];
    },
    var: function(c) {
        return ("01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".indexOf(c) !== -1);
    },
    upper: function(s) {
        return s[0].toUpperCase() === s;
    },
    lower: function(s) {
        return s[0].toLowerCase() === s;
    }
}