const files = require('./js/glsfiles');
const strings = require('./js/glsstrings');
const maths = require('./js/glsmaths');
const procs = require('./js/glsprocs');
const chars = require('./js/glschars');
const debug = require('./js/glsdebug');
const aws = require('./js/glsaws/glsaws-index');
const StringBuffer = require('./js/StringBuffer');
const Tokenizer = require('./js/Tokenizer');
const List = require('./js/List');
const Entry = require('./js/Entry');
<<<<<<< HEAD
const mmap = require('./js/mmap/index.js');
const arrays = require('./js/glsarrays.js');
module.exports = {
    arrays, mmap, files, strings, procs, maths, chars, debug, aws, 
    StringBuffer, Tokenizer, List, Entry
};
=======
//const mmap = require('./js/mmap/index.js');
const objects = require('./js/glsobjects.js');
const gex = require('./js/gexlib.js');

<<<<<<< HEAD
module.exports = {gex, objects, files, strings, procs, maths, chars, debug, aws, StringBuffer, Tokenizer, List, Entry};
=======
module.exports = {objects, files, strings, procs, maths, chars, debug, aws, StringBuffer, Tokenizer, List, Entry};
>>>>>>> 389eaab325512dfaab04b3e1337d8a4b5eadcc38
>>>>>>> e36b2d16b1ca3b8879ab820c1552137b1709a5c8
