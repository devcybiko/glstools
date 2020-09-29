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
     * read all the filenames and directory-names (excluding ., .., and hidden files beginning with .)
     */
    readDir: function (_dirname, theFilter = (dirname => dirname[0] !== '.'), env, isfullname=false) {
        let dirname = this.findFname(_dirname, env);
        if (!dirname) return null;
        let fnames = fs.readdirSync(dirname).filter(theFilter);
        if (isfullname) {
            let fullnames = []
            for(let fname of fnames) {
                fullnames.push(path.join(dirname, fname));
            }
            fnames = fullnames;
        }
        return fnames;

    },

    /**
     * read a text file as one long string
     * returns null if the file cannot be found
     */
    read: function (_fname, env = process.env) {
        let fname = this.findFname(_fname, env);
        if (fname === null) return null;

        let text = "";
        try {
            text = fs.readFileSync(fname).toString('utf-8');
        } catch (ex) {
            // do nothing
        }
        return text;
    },

    /**
     * write an array of strings to a text file
     * returns the name of the file written
     * returns null if there is an error
     */
    writeList: function (fname, list, env) {
        return this.write(fname, list.join('\n'), env);
    },

    /**
     * write an array of strings to a text file
     * returns the name of the file written
     * returns null if there is an error
     */
    writeJSON: function (fname, obj, env) {
        return this.write(fname, JSON.stringify(obj, null, 2), env);
    },

    /**
     * write a string directly to a text file
     * create the fully-qualified directory if it doesn't exist
     * returns the name of the file if successful
     * returns null if there is an error
     */
    write: function (_fname, str, env = process.env) {
        let fname = this.expandFname(_fname, env);
        if (fname === null) return null;

        let lastSlash = fname.lastIndexOf('/');
        if (lastSlash > -1) {
            dirname = fname.substring(0, lastSlash);
            this.createDir(dirname, env);
        }
        let buffer = new Buffer.from(str);
        let fd = fs.openSync(fname, 'w');
        fs.writeSync(fd, buffer, 0, buffer.length, null);
        fs.closeSync(fd);
        return fname;
    },

    /**
      * create an empty file and all associated directories
      * returns the created file or null on error
      */
    create: function (_fname, env) {
        return this.write(_fname, '', env);
    },

    /**
     * recursively create all associated directories
     */
    createDir: function (_dirname, env) {
        let dirname = this.expandFname(_dirname, env);
        if (dirname === null) return null;

        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true }, err => {
                if (err) throw err;
            });
        }
        return dirname;
    },

    parsePath: function (_pathString, env) {
        let pathString = this.expandFname(_pathString, env);
        if (pathString === null) return [];
        let paths = pathString.split(":");
        return paths;
    },

    expandFname: function (_fname, env) {
        let fname = strings.replaceAll(_fname, "~", "${HOME}");
        fname = strings.meta(fname, env);
        if (fname.includes("$") || fname.includes("{") || fname.includes("}")) {
            fname = null;
        }
        return fname;
    },

    searchFnamePaths: function (paths = [""], fname, extensions = [""]) {
        let result = null;
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
     *      or null if it cannot find one
     */

    findFname: function (_fname, env) {
        let fname = this.expandFname(_fname, env);
        if (fname === null) return null;

        let colon = fname.lastIndexOf(':');
        if (colon === -1) return fname;
        let path = fname.substring(0, colon);
        let paths = this.parsePath(path, null);

        let basename = fname.substring(colon + 1);

        let dot = basename.indexOf('.');
        let extensions = [];
        if (dot !== -1 || dot !== 0) { // we don't look for hidden files
            let newBasename = basename.substring(0, dot);
            let exts = basename.substring(dot + 1);
            exts = exts.split('.');
            for (let ext of exts) {
                extensions.push('.' + ext);
            }
            basename = newBasename;
        }
        let result = this.searchFnamePaths(paths, basename, extensions);
        return result
    }
}
