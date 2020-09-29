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
const mmap = require('./js/mmap/index.js');

module.exports = {mmap, files, strings, procs, maths, chars, debug, aws, StringBuffer, Tokenizer, List, Entry};