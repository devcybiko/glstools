//
// a test function for random sample code
//

const gls = require("../js/index");

let out = gls.files.readJSON('./test/glsfiles-test04.txt');
console.log(out);

let numbers = 6;
let foo = new Array(numbers);
let bar = foo.fill(0);
console.log(foo);
console.log(bar);