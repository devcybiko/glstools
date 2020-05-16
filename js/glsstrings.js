module.exports = {
    checkRestricted: function (src, restricted) {
        return !src.split("").some(ch => restricted.indexOf(ch) !== -1);
    },
    replaceAll: function (target, search, replacement) {
        return target.replace(new RegExp(search, 'g'), replacement);
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
    isLower: function(s) {
        return s.toLowerCase() === s;
    },
    isUpper: function(s) {
        return s.toUpperCase() === s;
    },
    expand: function(str, env) {
        if (!env) return str;
        let code = "(function(){";
        for(let key of Object.keys(env)) {
            let val = env[key];
            code += `let ${key} = "${val}";\n`;
        }
        code += 'return `'+str+'`;})()';
        return eval(code);
    },
    meta: function(str, env, limit=8) {
        if (!env) return str;
        let last;
        let result = str;
        while (limit && (last !== result)) {
            last = result;
            result = this.expand(last, env);
            limit--;
        };
        return result;
    }
}

