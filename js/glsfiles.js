const fs = require('fs');
const strings = require('./glsstrings');

module.exports = {
    /**
     * simplistic CSV reader
     * @param {} pagesCSVFname
     */
    readCSV: function (pagesCSVFname, env) {
        let lines = this.readScript(pagesCSVFname, env);
        let header = [];
        let rows = [];
        for (const i in lines) {
            let line = lines[i];
            let cols = line.split(',');
            if (i == 0) {
                header = cols;
                continue;
            }
            let row = {};
            for (const i in header) {
                row[header[i]] = cols[i];
            }
            rows.push(row);
        }
        return rows;
    },

    // reads a file removing all comments (#) and blank lines
    // and converts each line to a regexp
    readRegExp: function (fname, env) {
        let lines = this.readScript(fname, env);
        let rows = [];
        for (const line of lines) {
            let regexp = new RegExp(line, 'i');
            rows.push(regexp);
        }
        return rows;
    },

    /**
     *  reads a file removing all comments (#) and blank lines
     *  (trims all whitespace)
     */
    readScript: function (fname, env) {
        let lines = this.readList(fname, env);
        let rows = [];
        for (let line of lines) {
            let pound = line.indexOf('#');
            if (pound > -1) line = line.substring(0, pound);
            line = line.trim();
            if (line.length === 0) continue;
            rows.push(line);
        }
        return rows;
    },

    /**
     * read a text file as an array of strings
     * (preserves whitespace)
     */
    readList: function (fname, env) {
        let text = this.read(fname, env);
        let textByLine = text.split('\n');
        return textByLine;
    },

    /**
     * read a text file as one long string
     */
    read: function (_fname, env = {}) {
        let fname = this.expandFname(_fname, env);
        let text = "";
        try {
            text = fs.readFileSync(fname).toString('utf-8');
        } catch (ex) {
            // do nothing
        }
        return text;
    },

    /**
     * read all the filenames and directory-names (excluding . and ..)
     */
    readDir: function (_dirname, theFilter = (fname => fname[0] !== '.'), env) {
        let dirname = this.expandFname(_dirname, env);
        return fs.readdirSync(dirname).filter(theFilter);
    },

    /**
     * read a text file as a JSON object
     */
    readJSON: function (fname, env) {
        let text = this.read(fname, env);
        let json = JSON.parse(text);
        return json;
    },
    /**
     * read a text file as a JSONC (JSON w/ comments) object
     * WARNING: Doesn't like http://urls.... (because of //)
     */
    readJSONC: function (fname, env) {
        let lines = this.readList(fname, env);
        for (let i = 0; i < lines.length; i++) {
            let jsonLine = lines[i];
            let index;
            for (index = jsonLine.indexOf('//');
                index > -1;
                index = jsonLine.indexOf('//', index + 1)) {
                let proto = jsonLine.indexOf('://', index - 1);
                if (proto === index - 1) {
                    continue;
                } else {
                    jsonLine = jsonLine.substring(0, index);
                    break;
                }
            }
            lines[i] = jsonLine;
        }
        let result = lines.join('\n');
        let json = JSON.parse(result || '{}');
        return json;
    },
    /**
     * write an array of strings to a text file
     */
    writeList: function (fname, list) {
        this.write(fname, list.join('\n'));
    },

    /**
     * write a string directly to a text file
     * create the fully-qualified directory if it doesn't exist
     */
    write: function (fname, str) {
        let lastSlash = fname.lastIndexOf('/');
        if (lastSlash > -1) {
            dirname = fname.substring(0, lastSlash);
            this.createDir(dirname);
        }
        let buffer = new Buffer.from(str);
        let fd = fs.openSync(fname, 'w');
        fs.writeSync(fd, buffer, 0, buffer.length, null);
        fs.closeSync(fd);
    },
    /**
      * create an empty file and all associated directories
      */
    create: function (fname) {
        this.write(fname, '');
    },

    /**
     * recursively create all associated directories
     */
    createDir: function (dirname) {
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true }, err => {
                if (err) throw err;
            });
        }
    },
    parsePath: function (pathString) {
        let paths = pathString.split(":");
        return paths;
    },
    findFname: function (paths = [""], fname, extensions = [""]) {
        let result = fname;
        for (let path of paths) {
            for (let ext of extensions) {
                if (path && !path.endsWith("/")) path += "/";
                let testName = path + fname + ext;
                if (fs.existsSync(testName)) {
                    result = testName;
                    break;
                }
            }
        }
        return result;
    },
    /**
     * expands filenames of the form
     * ${PATH):basename${EXT}
     * where
     *      PATH = any environment variable in 'env'
     *          of the form dir:dir:dir (colon-separated directories)
     *      EXT = any environment variable in 'env'
     *          of the form ext.ext.ext (dot-separated extensions)
     *      env = a hashtable of key:value pairs for replacement
     * examples:
     *     env={'INCLUDES': '/usr/include:/opt/include:/home/greg/include',
     *          'DOT_EXTS': '.h.ext.inc.macro'
     *      }
     *      afname = '${INCLUDES}:mylib$.${DOT_EXTS}
     *          expandFname will search 
     *              /usr/include/mylibs.h
     *              /usr/include/mylibs.ext
     *              /usr/include/mylibs.inc
     *              /usr/include/mylibs.macro
     *              /opt/include/mylibs.h
     *              /opt/include/mylibs.ext
     *              /opt/include/mylibs.inc
     *              /opt/include/mylibs.macro
     *              /home/greg/include/mylibs.h
     *              /home/greg/include/mylibs.ext
     *              /home/greg/include/mylibs.inc
     *              /home/greg/include/mylibs.macro
     *      and will return the first file it finds
     *      or 'afname' if it finds none of them
     */
    expandFname: function (afname, env = {}) {
        let fname = strings.replaceAll(afname, "~", "${HOME}");
        fname = strings.meta(fname, env);
        let colon = fname.lastIndexOf(':');
        if (colon === -1) return fname;
        let path = fname.substring(0, colon);
        let paths = this.parsePath(path);
        let basename = fname.substring(colon + 1);
        let dot = basename.indexOf('.');
        let extensions = [];
        if (dot !== -1 && dot !== 0) {
            let newBasename = basename.substring(0, dot);
            let exts = basename.substring(dot+1);
            exts = exts.split('.');
            for (let ext of exts) {
                extensions.push('.' + ext);
            }
            let result = this.findFname(paths, newBasename, extensions);
            return result ? result : afname;
        }
    }
}