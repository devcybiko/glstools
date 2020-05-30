/*

LIST - read/write a lisp-like syntax that supports comments

( - begins a list - an ordered set of key-value pairs
) - ends a list 

entry: key-value
   - a one-line key-value pair. no quoting, all on one line
   - no commas or semicolons to end the value, no special characters but slash and backslash
   - key has the usual variable naming conventions
   - value begins with the first non-space character (if you want spaces use '\ ')
   - value ends on the end of line
   - UNLESS the line ends with a backslash '\'
   - NOTE: all values in LIST are returned as strings
// - inserts a comment anywhere and continues to end of line
   - if you want to insert the literal '//' prepend each slash with \
NOTES:
   - indentation and whitespaces are ignored
   - Lists are implemented as arrays of key-value pairs
   - key-value pairs are implemented as an array of 2 values (key,value)

parse() - reads text PSON and returns a JS object where all values are strings
stringify() - serializes an object into PSON. All objects are ignored. 
            - All non-strings are converted to strings

        // expand escaped characters
        // remove comments
        // allow for end-of-line escapes that continue on to the next line
        // keep newlines and spaces 
        // - except on line continuations (indented continuation lines remove pre-spaces, but not post-spaces)
        // - except at EOLN for key:value pairs (if you want spaces add '\ ' for each space)
        // NOTE: If you want spaces at the end of a line, add a trailing comment //

Macros - are invoked with a commment followed by a pound sign: //#MacroName
    - //#Include <relative filename> (see _cwd below) 
        -- inserts the named file at that point in the file
        -- it is recursive. So, included files can include other files as well
        -- note: everything is relative to the last element of _cwd

_cwd: an array of current working directories
    Used when //#Include macro is implemented
    The _cwd[-1] is used as the relative path to the file included.
    So, if you want to use relative includes, you have to 
    lists._cwd.push(<the current path>);
    lists.parse(lines);
    lists._cwd.pop();
*/

const is = require('../js/glschars');
const dbg = require('../js/glsdebug');
const gfile = require('../js/glsfiles');
const strings = require('../js/glsstrings');

dbg.off();
// dbg.set(dbg.VERBOSE)

module.exports = {
    _cwd: ["."],
    _env: [{}],
    _getLine: function (lines, i) {
        dbg.begin()
        dbg.verbose(i);
        if (i >= lines.length) throw `ERROR: Unexpected EOF at line ${i}`;
        let line = "";
        for (let j = i; j < lines.length; j++) {
            line += lines[j];
            i = j;
            if (line.endsWith("\\")) {
                line = line.substring(0, line.length - 1);
                continue;
            }
            if (line.length > 0) break;
        }
        dbg.verbose(`${i}: ${line}`);
        dbg.end()
        i++;
        return [line, i];
    },
    _split: function (s, c) {
        let result = [];
        s = s.trim();
        let word = "";
        for (let i = 0; i < s.length; i++) {
            if (s[i] === '\\') { // allows escaping the split character
                word += s[i];
                i++;
                word += s[i];
            } else if (s[i] === c) {
                result.push(word);
                word = "";
            } else {
                word += s[i];
            }
        }
        if (word) result.push(word);
        return result;
    },
    _escape: function (s) {
        dbg.begin();
        s = s.trim();
        let t = "";
        for (let i = 0; s[i]; i++) {
            if (s[i] === '\\') {
                let c = s[++i];
                let escaped = is.escapeable(c);
                if (!escaped && !c) c = '\\';
                if (escaped) c = escaped;
                t += c;
            } else {
                t += s[i];
            }
        }
        dbg.end();
        return t;
    },
    _macroInclude(i, lines, fname) {
        let cwd = this._cwd[this._cwd.length-1];
        let includedLines = gfile.readList(fname, this._env[this._env.length-1]);
        lines.splice(i, 1, ...includedLines);
    },
    _expandMacros(i, lines) {
        let line = lines[i];
        let icomment = line.indexOf(" //"); // allows for http://url.com
        let imacro = line.indexOf(" //#");
        let startComment = !!line.startsWith("//");
        let startMacro = !!line.startsWith("//#");
        if (startMacro || imacro >= 0) {
            let macro;
            if (imacro >=0) macro = line.substring(imacro + 4).trim();
            else macro = line.substring(3).trim();
            imacro = macro.indexOf(' ');
            let macroCmd = macro.substring(0, imacro);
            let macroParams = macro.substring(imacro + 1);
            eval(`this._macro${macroCmd}(i, lines, macroParams)`);
        } else if (startComment || icomment >= 0) {
            // comment processing
            if (icomment >= 0) lines[i] = lines[i].substring(0, icomment);
            else lines[i] = '';
        }
    },
    _preprocessLines: function (lines) {
        dbg.begin();
        let result = [];
        for (let i=0; i<lines.length; i++) {
            this._expandMacros(i, lines);
            let line = lines[i].trim();
            result.push(line);
        }
        dbg.end();
        return result;
    },
    _parseKeyValue: function (line, lines, i) {
        dbg.begin();
        dbg.verbose(i);
        let colon = line.indexOf(':');
        let key, value;
        if (colon >= 0) {
            key = line.substring(0, colon).trim();
            value = line.substring(colon + 1).trim();
        } else {
            key = '';
            value = line.trim();
        }
        dbg.verbose({ key, value });
        if (value === '(') { // list identifier on a line by itself
            let [obj, next] = this._parseMain(value, lines, i); // multi-line object
            dbg.verbose({ next, i, value });
            value = obj;
            i = next;
        } else if (value[0] === '(') { // we're expecting a complete list on one line
            let [obj, next] = this._parseMain(value, lines, i); // single-line object
            value = obj;
            dbg.verbose({ next, i, value });
            i = next;
        } else {
            value = this._escape(value);
        }
        dbg.verbose({ key, value, i });
        dbg.end();
        return [key, value, i];
    },
    _parseList: function (currentLine, lines, i) { // parses one object and returns that object and index
        dbg.begin();
        let obj = [];
        if (currentLine.endsWith(')')) { // handle one-line entry
            let line = currentLine.substring(1, currentLine.length - 1);
            let items = this._split(line, ',').map(item => this._escape(item.trim()));
            for (let j = 0; j < items.length; j++) {
                let [key, value, next] = this._parseKeyValue(items[j], lines, i);
                obj.push([key, value]);
            }
            dbg.verbose(obj);
            dbg.verbose(i);
            dbg.end();
            return [obj, i];
        }
        while (true) {
            let [line, next] = this._getLine(lines, i);
            i = next;
            if (line === ')') {
                break;
            } else if (is.var(line[0])) {
                let [key, value, next] = this._parseKeyValue(line, lines, i);
                obj.push([key, value]);
                i = next;
            } else {
                throw `line: ${i + 1}: parse error in "${line}"`;
            }
        }
        dbg.verbose(obj);
        dbg.verbose(i);
        dbg.end();
        return [obj, i]
    },

    _parseMain: function (currentLine, lines, i) { // the full string and an index into the string, returns {object, i}
        dbg.begin();
        let result = [];
        if (currentLine[0] === '(') {
            result = this._parseList(currentLine, lines, i);
        } else {
            throw `line ${i + 1}: Expected ( in "${currentLine}"`;
        }
        dbg.verbose(result);
        dbg.end();
        return result;
    },

    // expects a string which is a PSON string
    // returns an object
    parse: function (s = "()") {
        dbg.begin(s);
        is._escapeChars['s'] = ' '; // create special escape character for space
        let lines = s.trim().split('\n');
        lines = this._preprocessLines(lines);
        let [line, i] = this._getLine(lines, 0);
        let [obj, next] = this._parseMain(line, lines, i);
        dbg.end();
        return obj;
    },
    get: function (list, name) {
        for (entry of list) {
            if (entry[0] === name) return entry[1];
        }
        return undefined;
    },
    stringify: function (obj) {
        //
    }
}
// Array.prototype.get = function(name) {
//     for(entry of this) {
//         console.log(entry.key);
//         if (entry.key === name) return entry.value;
//     }
//     return undefined;
// }

// Array.prototype.getAll = function(name) {
//     let result = [];
//     for(entry of this) {
//         if (entry[0] === name) result.push(entry.value);
//     }
//     return undefined;
// }

// Object.defineProperty(Array.prototype, 'sortf', {
//     value: function(compare) { return [].concat(this).sort(compare); }
// });

Object.defineProperty(Array.prototype, 'get', {
    value: function (name) {
        for (entry of this) {
            if (entry.key === name) return entry.value;
        }
        return undefined;
    }
});

Object.defineProperty(Array.prototype, 'stringify', {
    value: function (indent=0) {
        let spaces = " ".repeat(indent * 2);
        let spaces1 = " ".repeat((indent+1) * 2);
        let result = '(';
        for (let entry of this) {
            result += '\n' + spaces1 + `${entry.key}:`;
            if (Array.isArray(entry.value)) {
                result += entry.value.stringify(indent+1);
            } else {
                result += entry.value;
            }
        }
        result += '\n';
        result += spaces + ')';
        return result;
    }
});

Object.defineProperty(Array.prototype, 'get$', {
    value: function (name) {
        for (entry of this) {
            if (entry.key === name) return entry.value$;
        }
        return undefined;
    }
});

Object.defineProperty(Array.prototype, 'sortf', {
    value: function (compare) { return [].concat(this).sort(compare); }
});

Object.defineProperty(Array.prototype, "key", {
    get: function key() {
        return this[0];
    }
});

Object.defineProperty(Array.prototype, "keys", {
    get: function keys() {
        let result = [];
        for(let entry of this) {
            result.push(entry.key);
        }
        return result;
    }
});

Object.defineProperty(Array.prototype, "value", {
    get: function value() {
        return this[1];
    }
});

Object.defineProperty(Array.prototype, "value$", {
    get: function value() {
        let value = this[1];
        if (typeof value === "string") return [['', value]];
        else return value;
    }
});

Object.defineProperty(Array.prototype, "values", {
    get: function values() {
        let result = [];
        for(let entry of this) {
            result.push(entry.value);
        }
        return result;
    }
});
