
module.exports = {
    merge: function(...objects) {
        let merged = {};
        for (let obj of objects) {
            merged = { ...merged, ...obj } 
        }
        return merged;
    },
    deleteKey: function(obj, key) {
        delete obj[key];
    }
}