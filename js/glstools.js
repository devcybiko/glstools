module.exports = {
    random: function (lo, hi) {
        return Math.floor(Math.random() * (hi - lo + 1) + lo);
    },
    shuffle: function (arr) {
        let copy = arr.slice();
        let results = [];
        let cnt = copy.length;
        for (let i = 0; i < cnt; i++) {
            let r = this.random(0, copy.length - 1);
            results.push(copy[r]);
            copy.splice(r, 1);
        }
        console.log(results);
        return results;
    },
    checkRestricted: function (src, restricted) {
        return !src.split("").some(ch => restricted.indexOf(ch) !== -1);
    },
    replaceAll: function (target, search, replacement) {
        return target.replace(new RegExp(search, 'g'), replacement);
    },

    // Caesar shift by Evan Hahn (evanhahn.com)
    // caesarShift('Attack at dawn!', 12);    // Returns "Mffmow mf pmiz!"
    // caesarShift('Mffmow mf pmiz!', -12);    // Returns "Attack at dawn!"
    encrypt: function (str, amount) {
        if (amount < 0)
            return this.encrypt(str, amount + 26);
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
    sleep$: async function(ms) { //note that the $ indicates it returns a promise - it's a$ynchronous
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    } 
}

