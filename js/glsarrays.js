module.exports = {
    new : function(n, value=0) {
        // fastest method: https://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array/53029824#53029824
        let a = new Array(n); 
        for (let i=0; i<n; ++i) a[i] = value;
        return a;
    }
}