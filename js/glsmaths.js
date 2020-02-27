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
        return results;
    }
}